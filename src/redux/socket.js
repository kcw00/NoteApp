import { io } from "socket.io-client"

const socket = io("/api", {
    transports: ["websocket"]
})

export default socket
