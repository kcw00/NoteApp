import axios from 'axios'

const login = async credentials => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, credentials)
    // console.log('Response from login:', response.data) // check if response.data is correct
    return response.data
}

const signup = async newObject => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, newObject)
    return response.json
}

const collabToken = async collabObj => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/collab`, collabObj)
    return response.data
}

export default { login, signup, collabToken }