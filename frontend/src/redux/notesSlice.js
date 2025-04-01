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
        socket.emit("noteAdded", newNote) // Notify other clients
        return newNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to add note")
    }
})

// Update note
export const updateNote = createAsyncThunk("notes/updateNote", async ({ id, changes }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.update(id, changes)
        socket.emit("noteUpdated", updatedNote) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to update note")
    }
})

// Add collaborator
export const addCollaborator = createAsyncThunk("notes/addCollaborator", async ({ noteId, collaboratorId, userType }, { rejectWithValue }) => {
    try {
        const updatedNote = await notesService.addCollaborator(noteId, collaboratorId, userType)
        socket.emit("collaboratorAdded", updatedNote) // Notify other clients
        return updatedNote
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to add collaborator")
    }
})

// Delete note
export const deleteNote = createAsyncThunk("notes/deleteNote", async (id, { rejectWithValue }) => {
    try {
        await notesService.remove(id)
        socket.emit("noteDeleted", id) // Notify other clients
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
        ids: [],
        status: "idle",
        errorMessage: null,
        activeNoteId: null,
        activeUsers: [], // track active users
        collaborators: [], // track collaborators for each note
    },
    reducers: {
        // real-time updates from WebSocket
        noteAddedRealtime: (state, action) => {
            state.entities[action.payload.id] = action.payload
            state.ids.push(action.payload.id)
        },
        noteUpdatedRealtime: (state, action) => {
            state.entities[action.payload.id] = action.payload
        },
        noteDeletedRealtime: (state, action) => {
            delete state.entities[action.payload]
            state.ids = state.ids.filter(id => id !== action.payload)
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
        addCollaboratorToNote: (state, action) => {
            const { noteId, collaborator } = action.payload
            if (!state.collaborators[noteId]) {
                state.collaborators[noteId] = []
            }
            state.collaborators[noteId].push(collaborator)
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.fulfilled, (state, action) => {
                const notes = action.payload
                state.entities = notes.reduce((acc, note) => {
                    acc[note.id] = note
                    return acc
                }, {})
                state.ids = notes.map(note => note.id)
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
                state.ids.push(note.id)
                state.activeNoteId = note.id // set the newly added note as active
            })
            .addCase(updateNote.fulfilled, (state, action) => {
                const note = action.payload
                state.entities[note.id] = note
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                const deleteNoteId = action.payload
                delete state.entities[deleteNoteId]
                state.ids = state.ids.filter(id => id !== deleteNoteId)
                if (state.activeNoteId === deleteNoteId) {
                    state.activeNoteId = null // clear active note if it's deleted
                }
            })
    },
})

// Listen for real-time WebSocket updates, only after the socket is connected
socket.on("connect", () => {
    console.log("Socket connected")

    socket.on("noteAdded", (note) => {
        if (note.userId === currentUserId) {
            store.dispatch(noteAddedRealtime(note))
        }
    })

    socket.on("noteUpdated", (note) => {
        if (note.userId === currentUserId) {
            store.dispatch(noteUpdatedRealtime(note))
        }
    })

    socket.on("noteDeleted", (id) => {
        store.dispatch(noteDeletedRealtime(id))

    })

    socket.on("activeUsers", (users) => {
        store.dispatch(setActiveUsers(users))
    })

})

export const { noteAddedRealtime, noteUpdatedRealtime, noteDeletedRealtime, setActiveNote, resetErrorMessage, setActiveUsers, addCollaboratorToNote } = notesSlice.actions


export default notesSlice.reducer
