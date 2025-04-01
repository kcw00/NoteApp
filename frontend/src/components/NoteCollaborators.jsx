import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { addCollaboratorToNote } from '../redux/notesSlice'
import socket from '../redux/socket'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

function NoteCollaborators({ noteId }) {
    const [newCollaborator, setNewCollaborator] = useState('')
    const [newRole, setNewRole] = useState('viewer')
    const [users, setUsers] = useState([]) // List of users to choose from
    const [show, setShow] = useState(false)

    const dispatch = useDispatch()
    const collaborators = useSelector(state => state.notes.collaborators[noteId] || [])

    useEffect(() => {
        // Fetch the list of users to choose from (for adding as collaborators)
        axios.get('/api/users')
            .then(response => {
                setUsers(response.data)
            })
            .catch(error => {
                console.error('Error fetching users:', error)
            })

        // Listen for real-time updates on collaborator additions
        socket.on("collaboratorAdded", (updatedNote) => {
            if (updatedNote.id === noteId) {
                dispatch(addCollaboratorToNote({ noteId: updatedNote.id, collaborator: updatedNote.collaborators }))
            }
        })
    }, [noteId, dispatch])

    const handleAddCollaborator = async () => {
        try {
            // Make an API request to add the collaborator with the selected role
            const updatedNote = await axios.put(`/api/notes/${noteId}/collaborators`, {
                collaboratorId: newCollaborator,
                userType: newRole
            })

            // Optimistic update via Redux
            dispatch(addCollaboratorToNote({ noteId, collaborator: updatedNote.collaborators }))

            // Reset the input fields
            setNewCollaborator('')
            setNewRole('viewer')
        } catch (error) {
            console.error('Error adding collaborator:', error)
        }
    }

    return (
        <div>
            <button onClick={() => setShow(true)}>
                share
            </button>

            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Collaborator</Modal.Title>
                </Modal.Header>
                <select value={newCollaborator} onChange={(e) => setNewCollaborator(e.target.value)}>
                    <option value="">Select Collaborator</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>

                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                </select>

                <button onClick={handleAddCollaborator}>Add Collaborator</button>


                <h3>Current Collaborators:</h3>
                <ul>
                    {collaborators.map(collaborator => (
                        <li key={collaborator.userId}>
                            {collaborator.username} - {collaborator.role}
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    )
}

export default NoteCollaborators
