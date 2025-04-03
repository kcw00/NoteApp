import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarWidth: 397, // default width 397px
    isResizing: false,
    windowWidth: window.innerWidth, // track initial window width
    isSidebarOpen: true,
    mode: window.localStorage.getItem('theme') || 'light', // theme from local storage
  },
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
    toggleTheme: (state, action) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      window.localStorage.setItem('theme', state.mode)
    }
  }
})

export const { setSidebarWidth, setIsResizing, setWindowWidth, toggleSidebar, toggleTheme } = uiSlice.actions

export default uiSlice.reducer
