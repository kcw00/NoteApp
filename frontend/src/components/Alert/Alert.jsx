import { useEffect } from 'react'
import './Alert.css'

const Alert = ({ message, onClose }) => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            onClose()
        }, 5000)

        return () => clearTimeout(timeout)
    }, [onClose])

    return (
        <div className="custom-alert-overlay">
            <div className="custom-alert">
                <p>{message}</p>
            </div>
        </div>
    )
}

export default Alert