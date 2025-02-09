import { useState, useEffect } from 'react'
import Note from './components/Note'
import Footer from './components/Footer'
import Notification from './components/Notification'
import noteService from './services/notes'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'



const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])


  const addNote = (noteObject) => {
    noteService
      .create(noteObject) // the obj is sent to the server using axios post method
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
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

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    noteService.setToken(null)
    setUser(null)
  }


  const notesToShow = showAll ? notes : notes.filter(note => note.important)


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


  const noteForm = () => (
    <Togglable buttonLabel='new note'>
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  return (
    <>
      <h1>Notes</h1>

      <Notification message={errorMessage} />

      {!user && loginForm()}
      {user && <div>
        <p>{user.name} logged in <button onClick={handleLogout}>Logout</button></p>
        noteForm()
      </div>}

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

      <Footer />
    </>
  )
}

export default App