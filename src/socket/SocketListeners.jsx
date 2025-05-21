import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from './socket' // your configured socket.io-client instance
import {
  noteAddedRealtime,
  noteDeletedRealtime,
  setCollaborators,
  collaboratorRemoved,
} from '../redux/notesSlice'
import axios from 'axios'

export const useSocketListeners = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const notes = useSelector(state => state.notes.entities)

  useEffect(() => {
    if (!user) return

    socket.on('noteDeleted', ({ id }) => {
      console.log('[socket.io] noteDeleted', id)
      dispatch(noteDeletedRealtime(id))
    })

    socket.on('collaboratorAdded', async ({ noteId, collaborator }) => {
      console.log('[socket.io] collaboratorAdded', noteId, collaborator)
      const note = notes[noteId]
      console.log('[socket.io] collaboratorAdded note:', note)
      if (!note) {
        // Note doesn't exist locally — fetch and store
        try {
          const fetchedNote = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notes/${noteId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })
          console.log('[socket.io] fetched note:', fetchedNote)
          dispatch(noteAddedRealtime(fetchedNote)) // Add the note to the local state
          console.log('[socket.io] add note:', fetchedNote)
        } catch (err) {
          console.error('[socket.io] Failed to fetch shared note', err)
        }
      }

      dispatch(setCollaborators({ noteId, collaborator }))
    })

    socket.on('collaboratorRemoved', ({ noteId, collaboratorId }) => {
      console.log('[socket.io] collaboratorRemoved', noteId, collaboratorId)
      dispatch(collaboratorRemoved({ noteId, collaboratorId }))
    })

    // Set up socket listeners
    socket.on('activeUsers', (data) => {
      console.log('socket listen ----- Logged user:', data)
      dispatch(setActiveUsers(data))
    })

    return () => {
      socket.off('noteDeleted')
      socket.off('collaboratorAdded')
      socket.off('collaboratorRemoved')
      socket.off('activeUsers')
    }
  }, [user, notes])
}