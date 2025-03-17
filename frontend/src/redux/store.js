import { configureStore } from "@reduxjs/toolkit"
import notesReducer from "./notesSlice"
import authReducer from "./authSlice"
import uiReducer from "./uiSlice"

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    auth: authReducer,
    ui: uiReducer,
  },
})