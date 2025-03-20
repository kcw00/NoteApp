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

// Note slice
const notesSlice = createSlice({
    name: "notes",
    initialState: {
        entities: {},
        ids: [],
        status: "idle",
        errorMessage: null,
        activeNoteId: null,
    },
    reducers: {
        // Handle real-time updates from WebSocket
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.entities = action.payload.reduce((acc, note) => {
                    acc[note.id] = note
                    return acc
                }, {})
                state.ids = action.payload.map(note => note.id)
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
                state.entities[action.payload.id] = action.payload
                state.ids.push(action.payload.id)
            })
            .addCase(updateNote.fulfilled, (state, action) => {
                state.entities[action.payload.id] = action.payload
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                delete state.entities[action.payload]
                state.ids = state.ids.filter(id => id !== action.payload)
            })
    },
})

// Listen for real-time WebSocket updates, only after the socket is connected
socket.on("connect", () => {
    console.log("Socket connected")

    socket.on("noteAdded", (note) => {
        store.dispatch(noteAddedRealtime(note))
    })

    socket.on("noteUpdated", (note) => {
        store.dispatch(noteUpdatedRealtime(note))
    })

    socket.on("noteDeleted", (id) => {
        store.dispatch(noteDeletedRealtime(id))
    })
})

export const { noteAddedRealtime, noteUpdatedRealtime, noteDeletedRealtime, setActiveNote } = notesSlice.actions


export default notesSlice.reducer
