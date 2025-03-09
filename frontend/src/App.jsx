import Footer from './components/Footer'
import Notification from './components/Notification'
import Notes from './components/Notes'
import NoteState from './context/noteState'



const App = () => {
  return (
    <NoteState>
      <div className='container'>
        <h1>Notes</h1>
        <Notification />
        <Notes />
        <Footer />
      </div>
    </NoteState>
  )
}

export default App