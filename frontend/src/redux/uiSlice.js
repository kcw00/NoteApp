import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarWidth: 397, // default width 397px
  isResizing: false,
  windowWidth: window.innerWidth, // track initial window width
  isSidebarOpen: true,
  button: 'light',
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarWidth: (state, action) => {
      state.sidebarWidth = action.payload
    },
    setIsResizing: (state, action) => {
      state.isResizing = action.payload
    },
    setWindowWidth: (state, action) => {
      state.windowWidth = action.payload
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    setButton: (state, action) => {
      state.button = action.payload === 'light' ? 'dark' : 'light'
    },
  }
})

export const { setSidebarWidth, setIsResizing, setWindowWidth, toggleSidebar, setButton } = sidebarSlice.actions

export default sidebarSlice.reducer
