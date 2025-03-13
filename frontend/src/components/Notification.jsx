
import { useContext } from 'react'
import noteContext from '../context/NoteContext'

const Notification = () => {
  const { errorMessage } = useContext(noteContext)
  if (errorMessage === null) {
    return null
  }

  return (
    <div data-variant="Danger" style={{ width: '100%', height: '100%', padding: 16, background: '#F8D7DA', borderRadius: 6, border: '1px #EA868F solid', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex' }}>
      <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex' }}>
        <div style={{ width: 16, height: 16, position: 'relative' }}>
          <div style={{ width: 16, height: 14, left: 0, top: 1, position: 'absolute', background: '#58151C' }} />
        </div>
        <div style={{ position: 'relative', color: '#58151C', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>{errorMessage}</div>
      </div>
      <div style={{ width: 16, height: 16, position: 'relative' }}>
        <div style={{ width: 12, height: 12, left: 2, top: 2, position: 'absolute', background: '#58151C' }} />
      </div>
    </div>
  )
}

export default Notification
