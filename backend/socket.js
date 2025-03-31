const { Server } = require('socket.io')
const Note = require('./models/note')
const User = require('./models/user')

let io

const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    })

    io.on("connection", (socket) => {
        console.log('socket:', socket)
        console.log("User connected:", socket.id)

        socket.on("updateNote", async ({ id, note }) => {
            try {
                const updatedNote = await Note.findByIdAndUpdate(id, note, { new: true })
                io.emit("noteUpdated", updatedNote)
            } catch (error) {
                console.error("Error updating note:", error)
            }
        })

        // handle typing event
        socket.on("typing", ({ userId, noteId }) => {
            socket.broadcast.emit("typing", { userId, noteId })
        })

        // handle stop typing event
        socket.on("stopTyping", ({ userId, noteId }) => {
            socket.broadcast.emit("stopTyping", { userId, noteId })
        })

        socket.on('cursorPosition', ({ userId, noteId, position }) => {
            User.findById(userId)
                .then(user => {
                    if (user) {
                        socket.broadcast.emit('cursorUpdate', {
                            userId,
                            noteId,
                            position,
                            username: user.username,
                            userAvatar: user.avatar,
                        })
                    }
                })
                .catch(error => {
                    console.error("Error fetching user:", error)
                })
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