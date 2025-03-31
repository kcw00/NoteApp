import { Modal, Button, TextInput, Group, Text, ActionIcon, Stack } from '@mantine/core'
import { FiUserPlus, FiUserX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { updateCollaboratorType, addCollaborator, removeCollaborator } from "../redux/userSlice" // Import the actions
import { useState } from 'react'

// Mock function to simulate adding a collaborator (use real logic here)
const addCollaboratorToList = (username, noteId) => {
    return { id: username, userType: "viewer", noteId } // Default type as 'viewer'
}

const ShareModal = ({ noteId }) => {
    const dispatch = useDispatch()
    const collaborators = useSelector((state) => state.user) // Get the list of collaborators from the Redux store
    const [open, setOpen] = useState(false)
    const [newCollaborator, setNewCollaborator] = useState("")
    const [collaboratorsList, setCollaboratorsList] = useState(collaborators || [])

    const handleAddCollaborator = () => {
        if (newCollaborator) {
            // Add the new collaborator
            const newCollaboratorObj = addCollaboratorToList(newCollaborator, noteId)
            dispatch(addCollaborator(newCollaboratorObj)) // Dispatch action to add collaborator
            setCollaboratorsList([...collaboratorsList, newCollaboratorObj])
            setNewCollaborator("")  // Clear the input field
        }
    }

    const handleRemoveCollaborator = (id) => {
        // Remove collaborator by ID
        dispatch(removeCollaborator(id)) // Dispatch action to remove collaborator
        setCollaboratorsList(collaboratorsList.filter(collaborator => collaborator.id !== id))
    }

    const handleChangeUserType = (id, userType) => {
        // Change the userType of the collaborator (promote/demote)
        dispatch(updateCollaboratorType({ id, userType }))
        setCollaboratorsList(collaboratorsList.map(collaborator => {
            if (collaborator.id === id) {
                collaborator.userType = userType
            }
            return collaborator
        }))
    }

    return (
        <div>
            <button onClick={() => setOpen(true)} variant="light" color="blue" leftIcon={<FiUserPlus />}>
                share
            </button>

            <Modal
                opened={open}
                onClose={() => setOpen(false)}
                title="Share"
                size="lg"
            >
                <Text align="center" mb="md">
                    Add collaborators to this note
                </Text>

                {/* Input for adding a new collaborator */}
                <TextInput
                    label="Enter username"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    placeholder="Username"
                    mb="md"
                />
                <Button fullWidth onClick={handleAddCollaborator} leftIcon={<FiUserPlus />} mb="md">
                    Add Collaborator
                </Button>

                {/* Display list of collaborators */}
                <Stack>
                    <Text weight={500}>Current Collaborators</Text>
                    {collaboratorsList.length > 0 ? (
                        collaboratorsList.map((collaborator) => (
                            <Group key={collaborator.id} position="apart">
                                <Text>
                                    {collaborator.id} - {collaborator.userType}
                                </Text>

                                <Group spacing="xs">
                                    {collaborator.userType !== "creator" && (
                                        <Button
                                            onClick={() => handleChangeUserType(collaborator.id, "editor")}
                                            variant="outline"
                                            size="xs"
                                            color="blue"
                                        >
                                            Promote to Editor
                                        </Button>
                                    )}
                                    {collaborator.userType !== "viewer" && (
                                        <Button
                                            onClick={() => handleChangeUserType(collaborator.id, "viewer")}
                                            variant="outline"
                                            size="xs"
                                            color="yellow"
                                        >
                                            Demote to Viewer
                                        </Button>
                                    )}

                                    <ActionIcon
                                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                                        color="red"
                                        variant="filled"
                                    >
                                        <FiUserX />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        ))
                    ) : (
                        <Text align="center" color="gray">
                            No collaborators added yet.
                        </Text>
                    )}
                </Stack>
            </Modal>
        </div>
    )
}

export default ShareModal
