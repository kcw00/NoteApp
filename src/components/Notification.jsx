import { useContext } from 'react'
import noteContext from '../context/NoteContext'

const Notification = () => {
  const { errorMessage } = useContext(noteContext)
  if (errorMessage === null) {
    return null
  }

  return (
    <div className='error'>
      {errorMessage}
    </div>
  )
}

export default Notification