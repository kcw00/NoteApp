const { Server } = require('socket.io')
const Note = require('./models/note')

let io

const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    })

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("updateNote", async ({ id, note }) => {
            try {
                const updatedNote = await Note.findByIdAndUpdate(id, note, { new: true })
                io.emit("noteUpdated", updatedNote)
            } catch (error) {
                console.error("Error updating note:", error)
            }
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })
    })

    return io
}

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}

module.exports = { initializeSocket, getIo }