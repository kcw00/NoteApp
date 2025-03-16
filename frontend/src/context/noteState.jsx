import { useState, useCallback } from 'react'

import NoteContext from './NoteContext'
import noteService from '../services/notes'
import loginService from '../services/login'

const NoteState = (props) => {
    const [notes, setNotes] = useState([])
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [loginVisible, setLoginVisible] = useState(false)
    const [button, setButton] = useState('light')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
            console.log('Retrieved user from localStorage:', user) 
            setUser(user)
            noteService.setToken(user.token)
        } else {
            console.log('No user found in localStorage')
        }
    }

    // Add a note to the server
    // const noteFormRef = useRef()
    // noteFormRef.current.toggleVisibility()
    const addNote = (noteObject) => {
        noteService
            .create(noteObject) // the obj is sent to the server using axios post method
            .then(returnedNote => {
                setNotes(notes.concat(returnedNote))
            })
            .catch(error => {
                if (error.response){
                if (error.response.status === 400) {
                    setErrorMessage(error.response.data.error)
                }} else if (error.request) {
                    setErrorMessage('Server is not responding')
                } else {
                    setErrorMessage(error.message)
                }
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
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
        if (event) event.preventDefault()

        try {
            const user = await loginService.login({
                username, password,
            })
            console.log('user from login:', user)
            window.localStorage.setItem(
                'loggedNoteappUser', JSON.stringify(user)
            )
            noteService.setToken(user.token)
            console.log('Token after login:', user.token)
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

    // change mode
    const changeMode = () => {
        if (button === 'light') {
            document.body.classList.add('dark-mode')
            setButton('dark')
        } else {
            document.body.classList.remove('dark-mode')
            setButton('light')
        }
    }

    // Sidebar toggle
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    // Sidebar resize
    const [sidebarWidth, setSidebarWidth] = useState(397); // default width 397px
    const [isResizing, setIsResizing] = useState(false);

    const resizeSidebar = useCallback((e) => {
        if (isResizing) {
          let newWidth = Math.max(300, Math.min(e.clientX, 600)) // Minimum: 300px, Maximum: 600px
          setSidebarWidth(newWidth)
        }
      }, [isResizing])
    
      // Function to stop resizing
      const stopResizing = useCallback(() => {
        setIsResizing(false)
        document.removeEventListener("mousemove", resizeSidebar)
        document.removeEventListener("mouseup", stopResizing)
      }, [resizeSidebar])
    
      // Function to start resizing
      const startResizing = (e) => {
        e.preventDefault()
        setIsResizing(true)
        document.addEventListener("mousemove", resizeSidebar)
        document.addEventListener("mouseup", stopResizing)
      }

    return (
        <NoteContext.Provider
         value={{ 
            notes,
            errorMessage,
            username,
            password,
            user,
            loginVisible,
            button,
            changeMode,
            setErrorMessage,
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
            // noteFormRef,
            setUser,
            toggleSidebar,
            isSidebarOpen,
            startResizing,
            stopResizing,
            resizeSidebar,
            sidebarWidth,
            isResizing
         }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState