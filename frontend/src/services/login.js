import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
    try {
        const response = await axios.post(baseUrl, credentials)
        console.log('Response from login:', response.data) // Check what comes back
        return response.data
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error
    }
}

export default { login }