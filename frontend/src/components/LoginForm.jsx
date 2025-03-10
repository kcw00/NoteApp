import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import noteContext from '../context/NoteContext'

const LoginForm = () => {
    const {
        setUsername,
        setPassword,
        username,
        password,
        button,
        handleLogin
    } = useContext(noteContext)

    const navigate = useNavigate()
    const login = async (event) => {
        event.preventDefault()
        await handleLogin(event)
        navigate('/')
    }
    return (
        <div className='container'>
            <h2>Login</h2>
            <form onSubmit={login}>
                <div className='mb-3'>
                    <label htmlFor='text' className='form-label'>Username</label>
                    <input
                        id='username'
                        value={username}
                        name="Username"
                        type="text"
                        className='form-control'
                        onChange={({ target }) => setUsername(target.value)}
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                    />
                </div>
                <div className='mb-3'>
                    <label htmlFor='password' className='form-label'>Password</label>
                    <input
                        id='password'
                        value={password}
                        name="Password"
                        type="current-password"
                        className='form-control'
                        onChange={({ target }) => setPassword(target.value)}
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                    />
                </div>
                <button id="login-button" type="submit">login</button>
            </form>
        </div >
    )
}


export default LoginForm