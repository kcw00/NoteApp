import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCollaborators, addCollaborator, removeCollaborator, updateCollaboratorRole } from '../redux/notesSlice'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import socket from '../redux/socket'
import axios from 'axios'

function NoteCollaborators() {
    const [newCollaboratorName, setNewCollaboratorName] = useState('')
    const [newRole, setNewRole] = useState('viewer')
    const [show, setShow] = useState(false)
    const [users, setUsers] = useState([])

    const dispatch = useDispatch()
    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])
    const noteId = note?.id
    const collaborators = note?.collaborators || []
    console.log('NOTE ID: ', noteId)
    console.log('COLLABORATORS: ', collaborators)



    // get users from database
    useEffect(() => {
        axios.get('/api/users')
            .then((response) => {
                setUsers(response.data)
            })
            .catch((error) => {
                console.error('Error fetching users:', error)
            })
    }, [])


    const handleAddCollaborator = async () => {
        try {
            // Find collaborator ID from the list of users
            const newCollaborator = await users.find(user => user.username === newCollaboratorName)

            if (!newCollaborator) {
                console.error('User not found')
                return
            }

            // Log the collaborator object before dispatching to Redux
            console.log('Collaborator object:', {
                userId: newCollaborator.id,
                userType: newRole,
            })

            const collaboratorData = {
                userId: newCollaborator.id,
                username: newCollaborator.username,
                userType: newRole,
            }

            // Optimistic update via Redux
            dispatch(setCollaborators({noteId: noteId, collaborator: collaboratorData}))

            // Make an API request to add the collaborator with the selected role
            dispatch(addCollaborator({noteId: noteId, collaboratorId: newCollaborator.id, userType: newRole}))


            // Reset the input fields
            setNewCollaboratorName('')
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
                            value={newCollaboratorName}
                            onChange={(e) => setNewCollaboratorName(e.target.value)}
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
                            <li key={collaborator.userId || `${collaborator.username}-${collaborator.userType}`}>
                                {collaborator.username} - {collaborator.userType}
                                <button onClick={() => dispatch(removeCollaborator({noteId: noteId, collaboratorId: collaborator.userId}))}>
                                    Remove
                                </button>
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
