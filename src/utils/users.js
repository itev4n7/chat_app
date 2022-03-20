const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!username || !room) {
        return { error: 'Username and room are required!' }
    }
    /** Validation of user*/
    const isExisting = users.find(user => user.room === room && user.username === username)
    if (isExisting) {
        return { error: 'Username is in use!' }
    }
    /** Storing user*/
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}