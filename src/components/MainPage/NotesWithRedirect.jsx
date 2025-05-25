import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Notes from './Notes'

// A wrapper component that redirects to the active note
const NotesWithRedirect = () => {
  const navigate = useNavigate()
  const activeNoteId = useSelector(state => state.notes.activeNoteId)
  const notes = useSelector(state => state.notes.entities)
  const isLoading = Object.keys(notes).length === 0

  useEffect(() => {
    // Only redirect if we have an active note and we're on the base /notes path
    if (activeNoteId && !isLoading) {
      navigate(`/notes/${activeNoteId}`, { replace: true })
    }
  }, [activeNoteId, navigate, isLoading])

  // Show loading state or null while redirecting
  if (isLoading) {
    return <div>Loading...</div>
  }

  return <Notes />
}

export default NotesWithRedirect
