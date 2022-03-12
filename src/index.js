const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.emit('message', 'Welcome!')
    socket.on('sendMassage', (message) => {
        io.emit('message', message)
    })
})

server.listen(port, () => {
    console.log(`Server is started on port: ${port}`)
})
