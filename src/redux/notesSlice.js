import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import notesService from "../services/notes"
import socket from "./socket"

// Fetch all notes (initial load)
export const fetchNotes = createAsyncThunk("notes/fetchNotes", async (userId, { rejectWithValue }) => {
    try {
        const notes = await notesService.getAll(userId)
        return notes
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch notes")
    }
})

// Add new note
export const addNote = createAsyncThunk("notes/addNote", async (note, { rejectWithValue }) => {
    try {
        const newNote = await notesService.create(note)
        return newNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to add note")
    }
})

// Update note
export const updateNote = createAsyncThunk("notes/updateNote", async ({ id, changes }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.update(id, changes)
        socket.emit("updateNote", updatedNote) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to update note")
    }
})

// Fetch a single note with collaborators
export const fetchNote = createAsyncThunk("notes/fetchNote", async (id, { rejectWithValue }) => {
    try {
        const note = await notesService.getNote(id)
        return note
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch note")
    }
})

// Add collaborator
export const addCollaborator = createAsyncThunk("notes/addCollaborator", async ({ noteId, collaboratorId, userType }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.addCollaborator(noteId, collaboratorId, userType)
        socket.emit("addCollaborator", { noteId, collaboratorId }) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to add collaborator")
    }
})

// Remove collaborator
export const removeCollaborator = createAsyncThunk("notes/removeCollaborator", async ({ noteId, collaboratorId }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.removeCollaborator(noteId, collaboratorId)
        socket.emit("collaboratorRemoved", updatedNote) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to remove collaborator")
    }
})

// Update collaborator role
export const updateCollaboratorRole = createAsyncThunk("notes/updateCollaboratorRole", async ({ noteId, collaboratorId, userType }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.updateCollaboratorRole(noteId, collaboratorId, userType)
        socket.emit("collaboratorRoleUpdated", updatedNote) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to update collaborator role")
    }
})

// Fetch shared notes
export const fetchSharedNotes = createAsyncThunk("notes/fetchSharedNotes", async (userId, { rejectWithValue }) => {
    try {
        const sharedNotes = await notesService.getSharedNotes(userId)
        socket.emit("sharedNotesFetched", sharedNotes) // Notify other clients
        return sharedNotes
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch shared notes")
    }
})


// Delete note
export const deleteNote = createAsyncThunk("notes/deleteNote", async ({ id, userId }, { rejectWithValue }) => {
    try {
        await notesService.remove(id, userId)
        console.log("Note deleted:", id)
        socket.emit("deleteNote", { id, userId }) // Notify other clients
        return id
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to delete note")
    }
})

export const clearErrorMessage = createAsyncThunk("notes/clearErrorMessage", async () => {
    return null
})

// Note slice
const notesSlice = createSlice({
    name: "notes",
    initialState: {
        entities: {},
        status: "idle",
        errorMessage: null,
        activeNoteId: null,
        activeUsers: [], // track active users
    },
    reducers: {
        // real-time updates from WebSocket
        noteAddedRealtime: (state, action) => {
            state.entities[action.payload.id] = action.payload
        },
        noteUpdatedRealtime: (state, action) => {
            state.entities[action.payload.id] = action.payload
        },
        noteDeletedRealtime: (state, action) => {
            delete state.entities[action.payload]
            if (state.activeNoteId === action.payload) {
                state.activeNoteId = null // clear active note if it's deleted
            }
        },
        setActiveNote: (state, action) => {
            state.activeNoteId = action.payload
        },
        resetErrorMessage: (state) => {
            state.errorMessage = null
        },
        setActiveUsers: (state, action) => {
            state.activeUsers = action.payload
        },
        setCollaborators: (state, action) => {
            const { noteId, collaborator } = action.payload

            const note = state.entities[noteId]

            // Check if the collaborator information is valid
            if (!collaborator.userId) {
                console.error("Invalid collaborator information:", collaborator.userId)
                return
            }

            note?.collaborators.push(collaborator)
        },
        collaboratorRemoved: (state, action) => {
            const { noteId, collaboratorId } = action.payload
            const note = state.entities[noteId]
            if (note?.collaborators) {
                note.collaborators = note.collaborators.filter(collab => collab.userId !== collaboratorId)
            }
        },
        setSharedNotes: (state, action) => {
            const sharedNotes = action.payload
            // Ensure sharedNotes is an array before using forEach
            if (Array.isArray(sharedNotes)) {
                sharedNotes.forEach(note => {
                    state.entities[note.id] = note
                })
            } else {
                console.error('Expected sharedNotes to be an array, but got:', sharedNotes)
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.fulfilled, (state, action) => {
                const notes = action.payload
                state.entities = notes.reduce((acc, note) => {
                    acc[note.id] = note
                    state.collaborators = {
                        ...state.collaborators, // Preserve existing collaborators
                        [note.id]: Array.isArray(note.collaborators) ? note.collaborators : [],
                    }
                    return acc
                }, {})
                state.status = "succeeded"
            })
            .addCase(fetchNotes.pending, (state) => {
                state.status = "loading"
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.status = "failed"
                state.errorMessage = action.payload
            })
            .addCase(addNote.fulfilled, (state, action) => {
                const note = action.payload
                state.entities[note.id] = note
                state.activeNoteId = note.id // set the newly added note as active
            })
            .addCase(updateNote.fulfilled, (state, action) => {
                const note = action.payload
                state.entities[note.id] = note
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                const deleteNoteId = action.payload
                delete state.entities[deleteNoteId]
                if (state.activeNoteId === deleteNoteId) {
                    state.activeNoteId = null // clear active note if it's deleted
                }
            })
            .addCase(addCollaborator.fulfilled, (state, action) => {
                const { noteId, collaborator } = action.payload
                const note = state.entities[noteId]
                note?.collaborators.push(collaborator)
            })
            .addCase(removeCollaborator.fulfilled, (state, action) => {
                const { noteId, collaboratorId } = action.payload
                const note = state.entities[noteId]
                if (note?.collaborators) {
                    note.collaborators = note.collaborators.filter(collab => collab.userId !== collaboratorId)
                }
            })
            .addCase(updateCollaboratorRole.fulfilled, (state, action) => {
                const { noteId, collaboratorId, userType } = action.payload
                const note = state.entities[noteId]
                if (note?.collaborators) {
                    const collaborator = note.collaborators.find(collab => collab.userId === collaboratorId)
                    if (collaborator) {
                        collaborator.userType = userType
                    }
                }
            })
            .addCase(clearErrorMessage.fulfilled, (state) => {
                state.errorMessage = null
            })
    },
})

export const { noteAddedRealtime, noteUpdatedRealtime, noteDeletedRealtime, setActiveNote, resetErrorMessage, setActiveUsers, setCollaborators, collaboratorRemoved, setSharedNotes } = notesSlice.actions


export default notesSlice.reducer
