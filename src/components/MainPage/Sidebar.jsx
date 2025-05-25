import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from "react-router-dom"
import { addNote, setActiveNote } from "../../redux/notesSlice"
import { logoutUser } from "../../redux/authSlice"
import { setSidebarWidth, setIsResizing, toggleSidebar } from "../../redux/uiSlice"
import LogoutModal from "../Modal/LogoutModal"
import "./styles/sidebar.css"

const Sidebar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { sidebarWidth, isResizing, isSidebarOpen } = useSelector((state) => state.ui)

    const notes = useSelector(state => state.notes.entities)
    const notesArray = Object.values(notes)
    const user = useSelector(state => state.auth.user)
    const userId = user?.userId


    const [favorites, others, shared] = useMemo(() => {
        const favs = [], otherNotes = [], sharedNotes = []
        notesArray.forEach(note => {
            const isShared = note.collaborators?.length > 0
            const isCreator = note.creator === userId
            const isCollaborator = note.collaborators?.some(c => c.userId === userId)

            if (!isCreator && !isCollaborator) return

            if (isShared) {
                sharedNotes.push(note)
            } else if (!isShared && note.important) {
                favs.push(note)
            } else if (!isShared && !note.important) {
                otherNotes.push(note)
            }
        })
        return [favs, otherNotes, sharedNotes]
    }, [notesArray, user])


    const resizeSidebar = useCallback((e) => {
        if (isResizing) {
            let newWidth = Math.max(300, Math.min(e.clientX, 600)) // Minimum: 300px, Maximum: 600px
            dispatch(setSidebarWidth(newWidth))
        }
    }, [isResizing, dispatch])

    // Function to stop resizing
    const stopResizing = useCallback(() => {
        dispatch(setIsResizing(false))
        document.removeEventListener("mousemove", resizeSidebar)
        document.removeEventListener("mouseup", stopResizing)
    }, [dispatch, resizeSidebar])

    // Function to start resizing
    const startResizing = (e) => {
        e.preventDefault()
        dispatch(setIsResizing(true))
        document.addEventListener("mousemove", resizeSidebar)
        document.addEventListener("mouseup", stopResizing)
    }

    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", resizeSidebar)
            document.removeEventListener("mouseup", stopResizing)
        }
    }, [resizeSidebar, stopResizing])


    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = () => {
        dispatch(logoutUser({ userId: user.userId }))
        navigate('/')
    }

    const handleAddNote = async () => {
        const newNote = {
            title: "",
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: '',
                    },
                ],
            },
            important: false,
            creator: user?.userId,
            collaborators: [],
        }
        const note = await dispatch(addNote(newNote))
        //console.log('NEW NOTE:', note.payload)
        //console.log('NEW NOTE ID:', note.payload.id)
        dispatch(setActiveNote(note.payload.id))
        setTimeout(() => navigate(`/notes/${note.payload.id}`), 50) // Slight delay to allow state update
    }

    const handleNoteClick = (note) => {
        dispatch(setActiveNote(note.id))
        navigate(`/notes/${note.id}`)
    }


    return (
        <aside className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
            style={{ width: isSidebarOpen ? `${sidebarWidth}px` : "", transition: isResizing ? "none" : "all 0.4s ease" }}>
            <div className="sidebar" style={{ width: `${sidebarWidth}px`, transition: isResizing ? "none" : "all 0.4s ease" }}>
                <div className="sidebar-header">
                    <p> {user?.username}'s Notes</p>
                    <button className="fav-button ms-auto" onClick={handleToggleSidebar}>{isSidebarOpen ? "<<" : ""}</button>
                    <button onClick={handleAddNote}>{"+"}</button>
                </div>
                <div className="sidebar-section d-flex flex-column py-3">
                    <h3>Favorites</h3>
                    <div className="sidebar-list">
                        {favorites.map(note => (
                            <Link
                                key={note.id}
                                role="button"
                                className="favorites"
                                to={`/notes/${note.id}`}
                                onClick={() => handleNoteClick(note)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sticky" viewBox="0 0 16 16">
                                    <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z" />
                                </svg>
                                {" "}{note.title}
                            </Link>
                        ))}
                    </div>
                    <h3>Others</h3>
                    <div className="sidebar-list">
                        {others.map(note => (
                            <Link
                                key={note.id}
                                role="button"
                                className="others"
                                to={`/notes/${note.id}`}
                                onClick={() => handleNoteClick(note)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sticky" viewBox="0 0 16 16">
                                    <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z" />
                                </svg>
                                {" "}{note.title}
                            </Link>
                        ))}
                    </div>
                    {shared.length > 0 && (<>
                        <h3>Shared</h3>
                        <div className="sidebar-list">
                            {shared.map(note => (
                                <Link
                                    key={note.id}
                                    role="button"
                                    className="shared"
                                    to={`/notes/${note.id}`}
                                    onClick={() => handleNoteClick(note)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sticky" viewBox="0 0 16 16">
                                        <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293z" />
                                    </svg>
                                    {" "}{note.title} {'('}{note.collaborators.find(collab => collab.userId === user.userId)?.userType || 'creator'}{')'}
                                </Link>
                            ))}
                        </div>
                    </>
                    )}
                </div>
                <div className="sidebar-footer text-end p-3 mt-auto">
                    <button
                        className="btn btn-outline-danger"
                        to="/"
                        role="button"
                        onClick={() => setShowLogoutModal(true)}>
                        Log out
                    </button>
                </div>
                {/* Logout Modal */}
                <LogoutModal
                    show={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleLogout}
                />
                {/* Resizer Bar (only show when open) */}
                {isSidebarOpen && (
                    <div
                        className="resizer"
                        onMouseDown={startResizing}
                    ></div>
                )}
            </div>
        </aside>
    )

}

export default Sidebar