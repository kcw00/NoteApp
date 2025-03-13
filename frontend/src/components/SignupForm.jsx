import React, { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import noteContext from "../context/NoteContext"
import signupService from "../services/signup"

const SignupForm = () => {
    const navigate = useNavigate()
    const context = useContext(noteContext)
    const { button, setErrorMessage } = context

    const [newUser, setNewUser] = useState({
        name: "",
        username: "",
        password: "",
    });

    const onChange = (event) => {
        setNewUser({ ...newUser, [event.target.id]: event.target.value });
    }

    // Register event handler
    const handleRegister = async (event) => {
        event.preventDefault()
        try {
            const user = await signupService.signup({
                name: newUser.name,
                username: newUser.username,
                password: newUser.password
            })
            if (user)
            window.localStorage.setItem('loggedNoteappUser', user.token)
            navigate("/login")
        }
        catch (error) {
            setErrorMessage(error.message)
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    return (
        <div className="form-container">
            <h2>Signup section</h2>
            <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label htmlFor="text" className="form-label">
                        Name
                    </label>
                    <input
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                        type="text"
                        className="form-control"
                        id="name"
                        onChange={onChange}
                        value={newUser.name}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="text" className="form-label">
                        Username
                    </label>
                    <input
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                        type="text"
                        className="form-control"
                        id="username"
                        onChange={onChange}
                        value={newUser.username}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        style={{
                            backgroundColor: button === "light" ? "white" : "#1a2027",
                            color: button === "light" ? "black" : "white",
                        }}
                        type="new-password"
                        className="form-control"
                        id="password"
                        onChange={onChange}
                        value={newUser.password}
                        minLength={5}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default SignupForm