import React from 'react'
import { useSelector } from 'react-redux'
import { Modal, Button } from 'react-bootstrap'
import './styles/modal.css'

const LogoutModal = ({ show, onConfirm, onClose }) => {

  const theme = useSelector((state) => state.ui.mode)

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName={theme === "dark" ? "dark-mode" :""}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to log out?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Log out
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LogoutModal
