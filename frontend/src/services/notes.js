import axios from 'axios'

const baseUrl = '/api/notes'

let token = null

// Set the token
const setToken = newToken => {
  token = `Bearer ${newToken}`
}

// Get all notes
const getAll = async userId => {
  const config = {
    headers: { Authorization: token },
  }
  const request = axios.get(`${baseUrl}/${userId}`, config)
  return request.then(response => response.data)
}

// Get a single note
const getNote = async id => {
  const config = {
    headers: { Authorization: token },
  }
  const request = axios.get(`${baseUrl}/${id}`, config)
  return request.then(response => response.data)
}

// Create a new note
const create = async newObject => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

// Remove a note
const remove = (id) => {
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.delete(`${baseUrl}/${id}`, config)
  return request.then(response => response.data)
}

// Update a note
const update = (id, newObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${id}`, newObject, config)
  return request.then(response => response.data)
}

// Add collaborator
const addCollaborator = async (noteId, collaboratorId, userType) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.put(`${baseUrl}/${noteId}/collaborators`, { collaboratorId, userType }, config)
  return response.data
}

// Remove collaborator
const removeCollaborator = async (noteId, collaboratorId) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.delete(`${baseUrl}/${noteId}/collaborators/${collaboratorId}`, config)
  return response.data
}

// Update collaborator role
const updateCollaboratorRole = async (noteId, collaboratorId, userType) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.put(`${baseUrl}//${noteId}/collaborators/${collaboratorId}/role`, { userType }, config)
  return response.data
}


export default { getAll, getNote, create, update, remove, setToken, addCollaborator, removeCollaborator, updateCollaboratorRole }
