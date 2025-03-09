import { useState, useRef } from 'react'

import NoteContext from './NoteContext'
import noteService from '../services/notes'
import loginService from '../services/login'

const NoteState = (props) => {
    const [notes, setNotes] = useState([])
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [loginVisible, setLoginVisible] = useState(false)

    // get all notes from the server
    const getNotes = () => {
        noteService
            .getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
                console.log(initialNotes)
            })
            .catch(error => {
                console.error('fail to fetch data', error)
                setNotes([])
            })
    }

    // get the logged user from the local storage
    const getLoggedUser = () => {
        const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            noteService.setToken(user.token)
        }
    }

    // Add a note to the server
    const noteFormRef = useRef()
    const addNote = (noteObject) => {
        noteFormRef.current.toggleVisibility()
        noteService
            .create(noteObject) // the obj is sent to the server using axios post method
            .then(returnedNote => {
                setNotes(notes.concat(returnedNote))
            })
            .catch(error => {
                if (error.response.status === 400) {
                    setErrorMessage(error.response.data.error)
                }
                setTimeout(() => {
                    setErrorMessage(null)
                }, 10000)
            })
    }
    // Changes the importance of a note
    const toggleImportanceOf = (id) => {
        const note = notes.find(n => n.id === id)
        const changedNote = { ...note, important: !note.important } // the important property gets the negation of its previous value in the original object

        noteService
            .update(id, changedNote)
            .then(returnedNote => {
                setNotes(notes.map(note => note.id === id ? returnedNote : note))
            })
            .catch((error) => { // If the request fails, the event handler registered with the catch method gets called.
                if (error.response.status === 404) {
                    setErrorMessage(
                        `Note '${note.content}' was already removed from server`
                    )
                    setNotes(notes.filter(n => n.id !== id))
                }
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
            })
    }
    // Deletes a note
    const deleteNoteOf = (id) => {
        const note = notes.find(n => n.id === id)
        const confirmDelete = window.confirm(`Delete ${note.content}?`)
        if (confirmDelete) {
            noteService
                .remove(id)
                .then(() => {
                    setNotes(notes.filter(n => n.id !== id))
                })
                .catch((error) => {
                    if (error.response.status === 404) {
                        setErrorMessage(
                            `Note '${note.content}' was already removed from server`
                        )
                        setNotes(notes.filter(n => n.id !== id))
                    }
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 5000)
                })
        }
    }

    // Login event handler
    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await loginService.login({
                username, password,
            })
            window.localStorage.setItem(
                'loggedNoteappUser', JSON.stringify(user)
            )
            noteService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setErrorMessage('Wrong credentials')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    // Logout event handler
    const handleLogout = () => {
        window.localStorage.removeItem('loggedNoteappUser')
        noteService.setToken(null)
        setUser(null)
    }

    // show all notes or only the important ones
    const notesToShow = showAll
        ? notes
        : notes.filter(note => note.important)

    return (
        <NoteContext.Provider
         value={{ 
            notes,
            showAll,
            errorMessage,
            username,
            password,
            user,
            loginVisible,
            setLoginVisible,
            setUsername,
            setPassword,
            getNotes,
            getLoggedUser,
            addNote,
            toggleImportanceOf,
            deleteNoteOf,
            handleLogin,
            handleLogout,
            notesToShow,
            setShowAll,
            noteFormRef
         }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState