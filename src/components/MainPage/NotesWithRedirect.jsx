import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Notes from './Notes'
import { fetchNotes } from '../../reduxnotesSlice'

// A wrapper component that redirects to the active note
const NotesWithRedirect = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const activeNoteId = useSelector(state => state.notes.activeNoteId)
  const notes = useSelector(state => state.notes.entities)
  const status = useSelector(state => state.notes.status)
  const error = useSelector(state => state.notes.error)

  useEffect(() => {
    if (user?.userId && status === 'idle') {
      // If notes haven't been loaded yet, fetch them
      dispatch(fetchNotes(user.userId))
    } else if (status === 'succeeded' && activeNoteId) {
      // If notes are loaded and we have an active note, redirect to it
      navigate(`/notes/${activeNoteId}`, { replace: true })
    } else if (status === 'succeeded' && Object.keys(notes).length > 0) {
      // If notes are loaded but no active note, redirect to the first note
      const firstNoteId = Object.keys(notes)[0]
      navigate(`/notes/${firstNoteId}`, { replace: true })
    }
  }, [user, status, activeNoteId, notes, navigate, dispatch])

  // Show loading state while fetching notes
  if (status === 'loading' || status === 'idle') {
    return <div>Loading your notes...</div>
  }

  // Show error if notes failed to load
  if (status === 'failed') {
    return <div>Error loading notes: {error}</div>
  }

  // If we have no notes, the main Notes component will handle creating one
  return <Notes />
}

export default NotesWithRedirect
