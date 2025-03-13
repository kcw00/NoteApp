import React from "react"
import { useContext } from "react"
import { useEffect } from "react"

import { Link, useLocation } from "react-router-dom"
import noteContext from "../context/NoteContext"

const Navbar = () => {
  let location = useLocation()
  useEffect(() => {}, [location])
  const context = useContext(noteContext)
  const { button, changeMode, handleLogout } = context


  return (
    <div>
      <nav className={`navbar navbar-expand-lg navbar-${button} bg-${button}`}>
        <div className="container-fluid">
          <a className="navbar-brand bold" href="/">
            NOTES
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/about" ? "active" : ""
                  }`}
                  to="/about"
                >
                  About
                </Link>
              </li>
            </ul>
            <div className="form-check form-switch mx-1">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                onClick={changeMode}
              />
              <label
                className="form-check-label"
                htmlFor="flexSwitchCheckDefault"
              >
                {button} mode
              </label>
            </div>
            {!window.localStorage.getItem("loggedNoteappUser") ? (
              <form className="d-flex" role="search">
                <Link
                  className="button button-primary mx-2"
                  to="/login"
                  role="button"
                >
                  LogIn
                </Link>
                <Link
                  className="button button-primary mx-2"
                  to="/signup"
                  role="button"
                >
                  Signup
                </Link>
              </form>
            ) : (
              <Link 
                className="button button-primary mx-2"
                to="/"
                role="button"
                onClick={handleLogout}>
                Sign out
              </Link>
            )}
          </div>
        </div>
      </nav>{" "}
    </div>
  );
};

export default Navbar