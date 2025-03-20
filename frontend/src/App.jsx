import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Notes from './components/Notes'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Home from './components/Home'

const App = () => {
  const loggedIn = useSelector(state => Boolean(state.auth.user?.userId))

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (only for logged-out users) */}
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/" /> : <LoginForm />}
        />
        <Route
          path="/signup"
          element={loggedIn ? <Navigate to="/" /> : <SignupForm />}
        />


        {/* Home Route (redirects to first note if logged in) */}
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/notes" /> : <Home />}
        />

        {/* Notes Page */}
        <Route
          path="/notes"
          element={loggedIn ? <Notes /> : <Navigate to="/" />}
        />
        <Route
          path="/notes/:id"
          element={loggedIn ? <Notes /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
