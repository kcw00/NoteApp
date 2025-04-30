import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Notes from './components/Note/Notes'
import LoginForm from './components/Auth/LoginForm'
import SignupForm from './components/Auth/SignupForm'
import Home from './components/Home/Home'



const App = () => {
  const loggedIn = useSelector(state => Boolean(state.auth.user?.userId))
  const theme = useSelector((state) => state.ui.mode)



  return (
    <div className={theme === "dark" ? "dark-mode" : ""}>
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
    </div>
  )
}

export default App
