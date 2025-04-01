const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')
const { ObjectId } = require('mongodb')
const { getIo } = require('../socket')

notesRouter.use(userExtractor)

// get all notes for a user
notesRouter.get('/:userId', async (request, response) => {
  const { userId } = request.params
  console.log('userId:', userId)
  const creator = new ObjectId(userId)
  const notes = await Note.find({ creator })
  console.log('notes:', notes)
  response.json(notes)
})

// get a single note
notesRouter.get('/:noteId', async (request, response) => {
  const note = await Note.findById(request.params.id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response) => {
  const body = request.body

  const note = new Note({
    title: body.title,
    content: body.content,
    important: body.important === undefined ? false : body.important,
    creator: request.user._id,
    collaborators: body.collaborators || [],
    id: body.id
  })

  const savedNote = await note.save()
  getIo().emit('noteAdded', savedNote)

  response.status(201).json(savedNote)
})

notesRouter.delete('/:noteId', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (!note) {
    return response.status(404).json({ error: 'Note not found' })
  }

  const user = await User.findById(note.user)
  user.notes = user.notes.filter(n => n.toString() !== note.id.toString()) // remove note from user
  await user.save()

  await Note.findByIdAndDelete(request.params.id)
  getIo().emit('noteDeleted', request.params.id)
  response.status(204).end()
})

notesRouter.put('/:noteId', async (request, response) => {
  const { noteId } = request.params
  const { title, content, important } = request.body
  const userId = request.user.id

  const isCreator = await Note.exists({ _id: noteId, creator: userId })
  const isEditor = await Note.exists({ _id: noteId, 'collaborators.userId': userId, 'collaborators.userType': 'editor' })

  if (!isCreator && !isEditor) {
    return response.status(403).json({ error: 'You do not have permission to edit this note' })
  }

  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    { title, content, important },
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedNote) {
    return response.status(404).end()
  }
  response.json(updatedNote)
})

notesRouter.put('/:noteId/collaborators', async (request, response) => {
  const { noteId } = request.params
  const { collaboratorId, userType } = request.body

  // Check if the collaborator exists
  const collaborator = await User.findById(collaboratorId)
  if (!collaborator) {
    return response.status(404).json({ error: 'Collaborator not found' })
  }

  // Check if noteId is valid
  if (!ObjectId.isValid(noteId)) {
    return response.status(400).json({ error: 'Invalid noteId: ' + noteId })
  }


  const note = await Note.findById(noteId)
  console.log('Found note:', note)
  if (!note) {
    return response.status(404).json({ error: 'Note not found' })
  }

  // Check if the user is already a collaborator
  const existingCollaborator = note.collaborators.find(c => c.user.toString() === collaboratorId)
  if (existingCollaborator) {
    return response.status(400).json({ error: 'User is already a collaborator' })
  }

  // Check if the user is the creator of the note
  const isCreator = note.creator.toString() === request.user._id.toString()
  if (!isCreator) {
    return response.status(403).json({ error: 'You do not have permission to add collaborators' })
  }

  // Check if the userType is valid
  const validUserTypes = ['editor', 'viewer']
  if (!validUserTypes.includes(userType)) {
    return response.status(400).json({ error: 'Invalid userType' })
  }

  // Add the collaborator
  note.collaborators.push({
    userId: collaboratorId,
    username: collaborator.username,
    name: collaborator.name,
    userType
  })
  try {
    const updatedNote = await note.save()
    // Notify clients about the collaborator addition
    getIo().emit('collaboratorAdded', { noteId, collaboratorId, userType })
    response.status(200).json(updatedNote)
  } catch (error) {
    response.status(400).json({ error: 'Failed to add collaborator' })
  }
})

module.exports = notesRouter