import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authService from "../services/auth"
import noteService from "../services/notes"
import { socket } from "../socket/socket"


export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const user = await authService.login(credentials)
        window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user))
        // console.log('Login succeed:', user)
        socket.emit('loggedUser', user?.userId)
        noteService.setToken(user?.token)
        return user
    } catch (error) {
        return rejectWithValue("Invalid credentials")
    }
})

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    window.localStorage.removeItem("loggedNoteappUser")
    socket.emit('logoutUser')
    noteService.setToken(null)
    return null
})

export const signUpUser = createAsyncThunk("auth/signUpUser", async (newUser, { rejectWithValue }) => {
    try {
        const user = await authService.signup(newUser)
        window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user))
        return user
    } catch (error) {
        return rejectWithValue("Failed to create user")
    }
})

export const createCollabToken = createAsyncThunk("auth/createCollabToken", async (collabObj, { rejectWithValue }) => {
    try {
        const token = await authService.collabToken(collabObj)
        return token
    } catch (error) {
        return rejectWithValue("Failed to create collaboration token")
    }
})

const storedUser = window.localStorage.getItem("loggedNoteappUser")
const parsedUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: parsedUser,
        errorMessage: null,
        status: "idle",
        collabToken: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload
                noteService.setToken(action.payload.token)
                state.errorMessage = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.errorMessage = action.payload
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.collabToken = null
            })
            .addCase(signUpUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.errorMessage = null
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.errorMessage = action.payload
            })
            .addCase(createCollabToken.fulfilled, (state, action) => {
                state.collabToken = action.payload.token
                state.errorMessage = null
            })
            .addCase(createCollabToken.rejected, (state, action) => {
                state.errorMessage = action.payload
            })
    },
})



export default authSlice.reducer
