import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Footer from './components/Footer'
import Notification from './components/Notification'
import Notes from './components/Notes'
import NoteState from './context/noteState'
import Navbar from './components/Navbar'
import LoginForm from './components/LoginForm'


const App = () => {
  return (
    <NoteState>
      <BrowserRouter>
        <Navbar />
        <Notification />
        <div className='container'>
          <Routes>
            <Route path='/' element={<Notes />} />
            <Route path='/about' element={<h1>About</h1>} />
            <Route path='/login' element={<LoginForm />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </NoteState>
  )
}

export default App