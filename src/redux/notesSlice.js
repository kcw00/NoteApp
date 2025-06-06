import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import notesService from "../services/notes"
import { socket } from "../socket/socket"

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
        // socket.emit("updateNote", { id, changes }) // Notify other clients
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

// Fetch shared notes
export const fetchSharedNotes = createAsyncThunk("notes/fetchSharedNotes", async (userId, { rejectWithValue }) => {
    try {
        const sharedNotes = await notesService.getSharedNotes(userId)
        socket.emit("fetchSharedNotes", sharedNotes) // Notify other clients
        return sharedNotes
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to fetch shared notes")
    }
})

// Delete note
export const deleteNote = createAsyncThunk("notes/deleteNote", async ({ id, userId }, { rejectWithValue }) => {
    try {
        await notesService.remove(id, userId)
        // console.log("delete note id:", id)
        socket.emit("deleteNote", { id, userId }) // Notify other clients
        return id
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to delete note")
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
        socket.emit("removeCollaborator", { noteId, collaboratorId }) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to remove collaborator")
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
            if (action.payload === null) {
                return
            } else {
                state.activeUsers = action.payload
            }
        },
        setCollaborators: (state, action) => {
            const { noteId, collaborator } = action.payload
            const note = state.entities[noteId]
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
            // Properly merge the shared notes into entities and collaborators
            sharedNotes.forEach(note => {
                // Add the note to entities
                state.entities[note.id] = note;

                // Ensure collaborators are being stored correctly
                state.collaborators = {
                    ...state.collaborators, // Preserve existing collaborators
                    [note.id]: Array.isArray(note.collaborators) ? note.collaborators : [],
                };
            });
        },
        titleUpdated: (state, action) => {
            const { noteId, title } = action.payload
            if (state.entities[noteId]) {
                state.entities[noteId].title = title
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
            .addCase(clearErrorMessage.fulfilled, (state) => {
                state.errorMessage = null
            })
    },
})

export const { noteAddedRealtime, titleUpdated, noteUpdatedRealtime, noteDeletedRealtime, setActiveNote, resetErrorMessage, setActiveUsers, setCollaborators, collaboratorRemoved, setSharedNotes } = notesSlice.actions


export default notesSlice.reducer
