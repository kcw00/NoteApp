import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { setCollaborators, addCollaborator, collaboratorRemoved, removeCollaborator } from '../../redux/notesSlice'
import { createCollabToken } from '../../redux/authSlice'
import Notification from '../MainPage/Notification'
import './styles/modal.css'

const SharedModal = () => {
    const dispatch = useDispatch()

    const [newCollaboratorName, setNewCollaboratorName] = useState('')
    const [newRole, setNewRole] = useState('viewer')
    const [show, setShow] = useState(false)
    const [users, setUsers] = useState([])
    const [errorMessage, setErrorMessage] = useState(null)


    const theme = useSelector((state) => state.ui.mode)
    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])
    const user = useSelector(state => state.auth.user)

    const noteId = note?.id
    const collaborators = note?.collaborators || []


    // Get users from database
    useEffect(() => {
        axios.get('/api/users')
            .then((response) => {
                setUsers(response.data)
                console.log('Fetched users:', response.data)
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
                const errorMessage = 'User not found'
                setErrorMessage(errorMessage)

                // Set a timeout to clear the error message after 3 seconds
                setTimeout(() => {
                    setErrorMessage(null)
                }, 3000)

                console.error(errorMessage)
                return

            } else if (user.userType === 'viewer') {
                const errorMessage = 'Viewer cannot add a collaborator'
                setErrorMessage(errorMessage)

                // Set a timeout to clear the error message after 3 seconds
                setTimeout(() => {
                    setErrorMessage(null)
                }, 3000)

                console.error(errorMessage)
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

            dispatch(setCollaborators({ noteId: noteId, collaborator: collaboratorData }))

            // Make an API request to add the collaborator with the selected role
            dispatch(addCollaborator({
                noteId: noteId,
                collaboratorId: newCollaborator.id,
                userType: newRole
            }))
            
            // Generate a new collaboration token for creator or editor 
            dispatch(createCollabToken({
                noteId: activeNoteId,
                userId: user?.userId,
                permissions: 'write', // adding a collaborator can only be done by creator or editor
            }))

            // Reset the input fields
            setNewCollaboratorName('')
            setNewRole('viewer')
        } catch (error) {
            console.error('Error adding collaborator:', error)
        }
    }

    const handleDeleteCollaborator = async (collaborator) => {
        dispatch(collaboratorRemoved({ noteId: noteId, collaboratorId: collaborator.userId }))
        try {
            await dispatch(removeCollaborator({ noteId: noteId, collaboratorId: collaborator.userId }))
        } catch (error) {
            console.error('Error removing collaborator:', error)
        }
    }

    return (
        <div className='shared-modal'>
            <button onClick={() => setShow(true)}>
                share
            </button>

            <Modal show={show} onHide={() => setShow(false)} centered dialogClassName={theme === "dark" ? "dark-mode" : ""} >
                <Modal.Header closeButton>
                    <Modal.Title>Manage Collaborator</Modal.Title>

                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Enter Collaborator's Username</Form.Label>
                        <Notification errorMessage={errorMessage} />

                        <div className="collaborator-input-group">
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={newCollaboratorName}
                                onChange={(e) => setNewCollaboratorName(e.target.value)}
                                className="username-input"
                            />

                            <Form.Select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="role-select"
                            >
                                <option value="viewer">View Only</option>
                                <option value="editor">Can Edit</option>
                            </Form.Select>


                            <Button className='invite-button' onClick={handleAddCollaborator}>
                                invite
                            </Button>
                        </div>
                    </Form.Group>
                    <ul className='collaborator-list'>
                        {collaborators.map(collaborator => (
                            <li key={collaborator.userId || `${collaborator.username}-${collaborator.userType}`}>
                                {collaborator.username} - {collaborator.userType}
                                <button className="remove-collaborator-button" onClick={() => handleDeleteCollaborator(collaborator)}>
                                    remove
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

        </div >
    )
}

export default SharedModal
