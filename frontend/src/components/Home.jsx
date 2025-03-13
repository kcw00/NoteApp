import { useNavigate } from "react-router-dom"
const Home = () => {
    const navigate = useNavigate()
    const handleStart = () => {
        navigate("/signup")
    }
    return (
        <main className="main-contents">
            <h1 className="title">WELCOME TO NOTES</h1>
            <p className="subtitle">Simple, Clean, and Fast Note app</p>
            <button className="start-button" onClick={handleStart}>GET STARTED!</button>
        </main>
    )
}

export default Home