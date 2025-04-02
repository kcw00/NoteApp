import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { addCollaboratorToNote, addCollaborator, fetchNote } from '../redux/notesSlice'
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
    console.log('NOTE ID: ', noteId)
    console.log('COLLABORATORS: ', collaborators)


    if (!Array.isArray(collaborators)) {
        console.error('Collaborators is not an array:', collaborators);
        return <div>Loading...</div>;  // or render a fallback message
    }

    useEffect(() => {
        // Fetch the list of users to choose from (for adding as collaborators)
        axios.get('/api/users')
            .then(response => {
                setUsers(response.data)
            })
            .catch(error => {
                console.error('Error fetching users:', error)
            })
        // Fetch the note to get the initial list of collaborators
        dispatch(fetchNote(noteId)).then((result) => {
            const fetchedNote = result.payload
            if (fetchedNote) {
                // Set the initial collaborators from the fetched note
                console.log('Fetched note:', fetchedNote)
                console.log('Fetched note collaborators:', fetchedNote.collaborators)
                dispatch(addCollaboratorToNote({
                    noteId: fetchedNote.id,
                    collaborators: fetchedNote.collaborators,
                }))
            }
        })

        // Listen for real-time updates on collaborator additions
        socket.on("collaboratorAdded", (updatedNote) => {
            if (updatedNote.id === noteId) {
                dispatch(addCollaboratorToNote({
                    noteId: updatedNote.id,
                    collaborators: updatedNote.collaborators,
                }))

            }
        })
    }, [noteId, dispatch])


    const handleAddCollaborator = async () => {
        try {
            const newCollaboratorId = await users.find(user => user.username === newCollaborator)?.id
            if (!newCollaboratorId) {
                console.error('User not found')
                return
            }

            // Log the collaborator object before dispatching to Redux
            console.log('Collaborator object:', {
                userId: newCollaboratorId,
                userType: newRole,
            })


            // Optimistic update via Redux
            dispatch(addCollaboratorToNote({
                noteId, collaborator: {
                    userId: newCollaboratorId,
                    username: newCollaborator,
                    userType: newRole,
                }
            }))

            // Make an API request to add the collaborator with the selected role
            await dispatch(addCollaborator(noteId, newCollaboratorId, newRole))

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
                <Modal.Body>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Enter Collaborator's Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={newCollaborator}
                            onChange={(e) => setNewCollaborator(e.target.value)}
                        />

                        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>

                    </Form.Group>
                    <Button variant="primary" onClick={handleAddCollaborator}>
                        Add Collaborator
                    </Button>
                    <ul>
                        {collaborators.map(collaborator => (
                            <li key={collaborator.userId}>
                                {collaborator.username} - {collaborator.userType}
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}

export default NoteCollaborators
