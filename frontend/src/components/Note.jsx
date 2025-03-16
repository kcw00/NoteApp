import PropTypes from 'prop-types';

const Note = ({ note, toggleImportance, deleteNote }) => {
  const label = note.important ? 'make not important' : 'make important'
  return (
    <li className='note'>
      <span>{note.title}</span>
      <span>{note.content}</span>
      <button onClick={toggleImportance}>{label}</button>
      <button onClick={deleteNote}>delete</button>
    </li>
  )
}

Note.propTypes = {
  note: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    important: PropTypes.bool.isRequired,
  }).isRequired,
  toggleImportance: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired
}

export default Note