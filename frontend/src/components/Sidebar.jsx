import { useContext, useState, useEffect } from "react"
import noteContext from "../context/NoteContext"
import { Link } from "react-router-dom"

const Sidebar = () => {
    const context = useContext(noteContext)
    const { handleLogout, user, notes, isSidebarOpen, toggleSidebar,
        createNote, resizeSidebar, isResizing, stopResizing, startResizing, sidebarWidth } = context

    const favorites = notes.filter(note => note.important)
    const others = notes.filter(note => !note.important)

    const [newNote, setNewNote] = useState({ title: '', content: '' })


    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", resizeSidebar)
            document.removeEventListener("mouseup", stopResizing)
        }
    }, [resizeSidebar, stopResizing])

    const addNote = (event) => {
        event.preventDefault()
        createNote({
            ...newNote,
            important: false,
            user: user
        })

        setNewNote({ title: '', content: '' })
    }

    return (
        <nav className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
            style={{ width: isSidebarOpen ? `${sidebarWidth}px` : "", transition: isResizing ? "none" : "width 0.2s ease" }}>
            <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
                <div className="sidebar-header">
                    <p> {user?.username}'s Notes</p>
                    <button className="fav-button ms-auto" onClick={toggleSidebar}>{isSidebarOpen ? "<<" : ""}</button>
                    <button onClick={addNote}>{"+"}</button>
                </div>
                <div className="sidebar-section d-flex flex-column py-3">
                    <h3>Favorites</h3>
                    {favorites.map(note => (
                        <button key={note.id} className="note-button">
                            {note.title}
                        </button>
                    ))}
                </div>
                <div className="sidebar-section d-flex flex-column py-3">
                    <h3>Others</h3>
                    {others.map(note => (
                        <button key={note.id} className="note-button">
                            {note.title}
                        </button>
                    ))}
                </div>
                <div className="sidebar-footer text-end p-3 mt-auto">
                    <Link
                        className="btn btn-outline-danger"
                        to="/"
                        role="button"
                        onClick={handleLogout}>
                        Sign out
                    </Link>
                </div>
                {/* Resizer Bar (only show when open) */}
                {isSidebarOpen && (
                    <div
                        className="resizer"
                        onMouseDown={startResizing}
                    ></div>
                )}
            </div>
        </nav>
    )

}

export default Sidebar