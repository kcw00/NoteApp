import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
    const response = await axios.post(baseUrl, credentials)
    console.log('Response from login:', response.data) // check if response.data is correct
    return response.data
}

const signup = async newObject => {
    const response = await axios.post(baseUrl, newObject)
    return response.json
}

export default { login, signup }