import { io } from "socket.io-client"

export const socket = io("http://localhost:3001", {
    transports: ["websocket"]
})

socket.on("connect", () => {
    console.log("Socket.io connected")
})


export const ySocket = ({ noteId }) => {
    const socket = new WebSocket(`ws://localhost:3001/y-websocket/${noteId}`)
    socket.onopen = () => {
        console.log("Yjs WebSocket connected")
    }
}

