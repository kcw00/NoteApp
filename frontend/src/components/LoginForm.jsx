import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import noteContext from '../context/NoteContext'

const LoginForm = () => {
    const {
        handleSubmit,
        setUsername,
        setPassword,
        username,
        password,
        button,
        handleLogin
    } = useContext(noteContext)

    const navigate = useNavigate()
    const login = () => {
        handleLogin()
        navigate('/')
    }
    return (
        <div className='container'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='username' className='form-label'>Username</label>
                    <input
                        id='username'
                        value={username}
                        name="Username"
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
                        className='form-control'
                        onChange={({ target }) => setPassword(target.value)}
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                    />
                </div>
                <button id="login-button" type="submit" onClick={login}>login</button>
            </form>
        </div >
    )
}


export default LoginForm