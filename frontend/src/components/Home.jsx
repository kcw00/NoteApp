import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"


const Home = () => {
    const navigate = useNavigate()

    const handleStart = () => {
        navigate("/signup")
    }

    return (
        <div>
            <Navbar />
            <div>
                <main className="main-contents">
                    <h1 className="title">WELCOME TO NOTES</h1>
                    <p className="subtitle">------</p>
                    <button className="start-button" onClick={handleStart}>GET STARTED!</button>
                </main>
            </div>
        </div>
    )
}

export default Home