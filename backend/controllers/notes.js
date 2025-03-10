const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

notesRouter.use(userExtractor)

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({ user: request.user._id }).populate('user', { username: 1, name: 1 })
  response.json(notes)

})

notesRouter.get('/:id', async (request, response) => {
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
    content: body.content,
    important: body.important === undefined ? false : body.important,
    user: request.user._id
  })

  const savedNote = await note.save()

  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (!note) {
    return response.status(404).json({ error: 'Note not found' })
  }

  const user = await User.findById(note.user)
  user.notes = user.notes.filter(n => n.toString() !== note.id.toString()) // remove note from user
  await user.save()

  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  const { content, important } = request.body

  const updatedNote = await Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedNote) {
    return response.status(404).end()
  }
  response.json(updatedNote)
})

module.exports = notesRouter