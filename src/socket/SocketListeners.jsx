import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from './socket' // your configured socket.io-client instance
import {
  noteAddedRealtime,
  noteDeletedRealtime,
  setCollaborators,
  collaboratorRemoved,
  setActiveUsers,
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

    socket.on('collaboratorAdded', ({ noteId, collaborator }) => {
      console.log('[socket.io] collaboratorAdded event received', { noteId, collaborator })
      
      // Only process if we have the note in our state
      if (notes[noteId]) {
        console.log(`[socket.io] Updating note ${noteId} with new collaborator`, collaborator)
        
        dispatch(setCollaborators({ 
          noteId, 
          collaborator,
          isSocketUpdate: true  // This will prevent duplicate additions
        }))
      } else {
        console.warn(`[socket.io] Note ${noteId} not found in state, skipping collaborator addition`)
      }
    })

    socket.on('collaboratorRemoved', ({ noteId, collaboratorId }) => {
      console.log('[socket.io] collaboratorRemoved', noteId, collaboratorId)
      dispatch(collaboratorRemoved({ noteId, collaboratorId }))
    })


    return () => {
      socket.off('noteDeleted')
      socket.off('collaboratorAdded')
      socket.off('collaboratorRemoved')
    }
  }, [user, notes])

  useEffect(() => {
    // Set up socket listeners
    socket.on('activeUsers', (data) => {
      console.log('socket listen ----- Logged user:', data)
      dispatch(setActiveUsers(data))
    })
    return () => {
      socket.off('activeUsers')
    }
  }, [])
}