import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    creator: null, // Store the user who created the note
    collaborators: [], // Store the list of collaborators with their IDs and types
    presence: {}, // Track presence (who is editing what)
  },
  reducers: {
    setCreator: (state, action) => {
      state.creator = action.payload
    },
    setCollaborators: (state, action) => {
      state.collaborators = action.payload;
    },
    addCollaborator: (state, action) => {
      state.collaborators.push(action.payload)
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(collaborator => collaborator.id !== action.payload)
    },
    setPresence: (state, action) => {
      state.presence = action.payload // Update user presence (e.g., typing, cursor)
    },
    // Action to update user type of a specific collaborator
    updateCollaboratorType: (state, action) => {
      const { id, userType } = action.payload
      const collaborator = state.collaborators.find(c => c.id === id);
      if (collaborator) {
        collaborator.userType = userType // Update user type (editor or viewer)
      }
    },
  },
})

export const { setCreator, setCollaborators, addCollaborator, removeCollaborator, setPresence, updateCollaboratorType } = userSlice.actions

export default userSlice.reducer
