const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const Filter = require('bad-words')
const { generateObjectMessage, generateObjectLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateObjectMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateObjectMessage('Admin', `${user.username} has joined.`))
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback()
    })

    socket.on('sendMassage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed.')
        }
        io.to(user.room).emit('message', generateObjectMessage(user.username, message))
        callback()
    })

    socket.on('shareLocation', (cords, callback) => {
        const googleMapLocationLink = `https://www.google.com/maps?q=${cords.latitude},${cords.longitude}`
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateObjectLocation(user.username, googleMapLocationLink))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateObjectMessage('Admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is started on port: ${port}`)
})
