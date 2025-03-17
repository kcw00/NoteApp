import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authService from "../services/auth"
import noteService from "../services/notes"


export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const user = await authService.login(credentials)
        window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user))
        noteService.setToken(user?.token)
        return user
    } catch (error) {
        return rejectWithValue("Invalid credentials")
    }
})

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    window.localStorage.removeItem("loggedNoteappUser")
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

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: JSON.parse(window.localStorage.getItem("loggedNoteappUser")) || null,
        errorMessage: null,
        status: "idle",
    },
    reducers: {},
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
            })
            .addCase(signUpUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.errorMessage = null
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.errorMessage = action.payload
            })
    },
})

export default authSlice.reducer
