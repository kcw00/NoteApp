import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Notes from './Notes'
import notesService from '../../../services/notes'

// A wrapper component that redirects to the active note
const NotesWithRedirect = () => {
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  const activeNoteId = useSelector(state => state.notes.activeNoteId)
  const notes = useSelector(state => state.notes.entities)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedNotes, setHasCheckedNotes] = useState(false)

  useEffect(() => {
    const checkNotes = async () => {
      if (!user?.userId) return
      
      try {
        // Set up the token for the notes service
        notesService.setToken(user.token)
        
        // Wait for notes to be loaded
        if (Object.keys(notes).length === 0) {
          // If no notes in the store, wait a bit for the main notes fetch to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        setHasCheckedNotes(true)
        
        // If we have an active note, redirect to it
        if (activeNoteId) {
          navigate(`/notes/${activeNoteId}`, { replace: true })
        } else {
          // If no active note but we have notes, redirect to the first one
          const noteIds = Object.keys(notes)
          if (noteIds.length > 0) {
            navigate(`/notes/${noteIds[0]}`, { replace: true })
          }
        }
      } catch (error) {
        console.error('Error in NotesWithRedirect:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkNotes()
  }, [user, activeNoteId, notes, navigate])

  // Show loading state only if we're still checking notes
  if (isLoading || !hasCheckedNotes) {
    return <div>Loading your notes...</div>
  }

  // If we have no notes, the main Notes component will handle creating one
  return <Notes />
}

export default NotesWithRedirect
