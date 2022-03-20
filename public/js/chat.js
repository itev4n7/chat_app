const socket = io()

/** Elements */
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('[name="message"]')
const messageFormButton = messageForm.querySelector('#send-button')
const shareLocationButton = document.querySelector('#share-location')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

/** Templates */
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

/** Options */
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const newMessage = messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messages.offsetHeight
    const containerHeight = messages.scrollHeight

    const scrollOffset = messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset ) {
        messages.scrollTop = containerHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: 'at ' + moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: 'at ' + moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    messageFormButton.setAttribute('disabled', 'disabled')
    const message = messageFormInput.value
    socket.emit('sendMassage', message, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('The message was send.')
    })
})

shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported in you browser')
    }
    shareLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        let cords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('shareLocation', cords, () => {
            shareLocationButton.removeAttribute('disabled')
            console.log('Your location was shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})