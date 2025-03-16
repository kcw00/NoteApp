import PropTypes from 'prop-types'
import { useContext, useState, useEffect } from "react"
import noteContext from "../context/NoteContext"

const NoteEditor = ({ createNote, user }) => {

    const context = useContext(noteContext)
    const { toggleSidebar, isSidebarOpen, toggleImportanceOf, sidebarWidth } = context
    const [newNote, setNewNote] = useState({ title: '', content: '' })
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const handleChange = (event) => {
        setNewNote((prevNote) => {
            const updatedNote = {
                ...prevNote,
                [event.target.name]: event.target.value
            };
            console.log("Updated Note:", updatedNote); // debugging
            return updatedNote;
        });
    };


    const addNote = (event) => {
        event.preventDefault()
        createNote({
            ...newNote,
            important: false,
            user: user?.id
        })

        setNewNote({ title: '', content: '' })
    }
    return (
        <div className="note-container"
            style={{ width: isSidebarOpen ? `${windowWidth - sidebarWidth}px` : "100%" }}>
            <header className="note-header d-flex align-items-center p-3">
                {!isSidebarOpen ? <button onClick={toggleSidebar}>{">>"}</button> : ""}
                <button className="ms-auto favorite-button btn btn-secondary" onClick={toggleImportanceOf}>{"★"}</button>
                <button className="delete-button">delete</button>
            </header>
            <div>

            </div>
            <div className="formDiv">

                <form onSubmit={addNote}>
                    <input
                        name='title'
                        value={newNote.title}
                        onChange={handleChange}
                        placeholder='write note content here'
                        id='note-input'
                    />
                    <input
                        name='content'
                        value={newNote.content}
                        onChange={handleChange}
                        placeholder='write note content here'
                        id='note-input'
                    />
                    <button type="submit">save</button>
                </form>
            </div>
        </div>
    )
}

NoteEditor.propTypes = {
    createNote: PropTypes.func.isRequired,
}

export default NoteEditor