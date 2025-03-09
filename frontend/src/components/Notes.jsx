import { useContext, useEffect } from "react"
import Note from "./Note"
import NoteForm from "./NoteForm"
import Togglable from "./Togglable"
import noteContext from "../context/NoteContext"
import LoginForm from "./LoginForm"

const Notes = () => {
    const { getNotes, showAll, setShowAll, user, handleLogout, addNote, notesToShow,
        toggleImportanceOf, deleteNoteOf, getLoggedUser, loginVisible, setLoginVisible,
        setUsername, setPassword, handleLogin, username, password, noteFormRef } = useContext(noteContext)

    useEffect(() => {
        getNotes()
    }, [])

    useEffect(() => {
        getLoggedUser()
    }, [])

    const loginForm = () => {
        const hideWhenVisible = { display: loginVisible ? 'none' : '' }
        const showWhenVisible = { display: loginVisible ? '' : 'none' }

        return (
            <div>
                <div style={hideWhenVisible}>
                    <button onClick={() => setLoginVisible(true)}>log in</button>
                </div>
                <div style={showWhenVisible}>
                    <LoginForm
                        username={username}
                        password={password}
                        handleUsernameChange={({ target }) => setUsername(target.value)}
                        handlePasswordChange={({ target }) => setPassword(target.value)}
                        handleSubmit={handleLogin}
                    />
                    <button onClick={() => setLoginVisible(false)}>cancel</button>
                </div>
            </div>
        )
    }


    const noteForm = () => {
        return (
            <Togglable buttonLabel='new note' ref={noteFormRef}>
                <NoteForm createNote={addNote} />
            </Togglable>
        )
    }


    return (
        <div>
            {!user && loginForm()}
            {user && <div>
                <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>
                <div>
                    <button onClick={() => setShowAll(!showAll)}>
                        show {showAll ? 'important' : 'all'}
                    </button>
                </div>
                <ul>
                    {notesToShow.map((note, id) =>
                        <Note
                            key={id}
                            note={note}
                            toggleImportance={() => toggleImportanceOf(note.id)}
                            deleteNote={() => deleteNoteOf(note.id)}
                        />
                    )}
                </ul>
                {noteForm()}</div>
            }
        </div>
    )
}

export default Notes