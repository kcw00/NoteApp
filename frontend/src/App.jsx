import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Footer from './components/Footer'
import Notification from './components/Notification'
import Notes from './components/Notes'
import NoteState from './context/noteState'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Home from './components/Home'


const App = () => {
  return (
    <NoteState>
      <BrowserRouter>
        <Notification />
        <div>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/notes' element={<Notes />} />
            <Route path='/about' element={<h1>About</h1>} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/signup' element={<SignupForm />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </NoteState>
  )
}

export default App