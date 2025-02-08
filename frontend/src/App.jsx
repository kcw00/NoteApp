import { useState, useEffect } from 'react'
import Note from './components/Note'
import Footer from './components/Footer'
import Notification from './components/Notification'
import noteService from './services/notes'
import loginService from './services/login'


const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

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


  const addNote = (event) => {
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    }

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

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const notesToShow = showAll ? notes : notes.filter(note => note.important)


  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="text"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input
        value={newNote}
        onChange={handleNoteChange}
      />
      <button type="submit">save</button>
    </form>
  )

  return (
    <>
      <h1>Notes</h1>

      <Notification message={errorMessage} />

      {
        user === null ?
          loginForm() :
          <div>
            <p>{user.name} logged-in
            <button onClick={handleLogout}>Logout</button>
            </p>
            {noteForm()}
          </div>
      }

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