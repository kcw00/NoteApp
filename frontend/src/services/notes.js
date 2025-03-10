import axios from 'axios'

const baseUrl = '/api/notes'

let token = null

// Set the token
const setToken = newToken => {
  token = `Bearer ${newToken}`
}

// Get all notes
const getAll = async () => {
  const config = {
    headers: { Authorization: token }, 
  }
  const request = axios.get(baseUrl, config)
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

export default { getAll, create, update, remove, setToken }
