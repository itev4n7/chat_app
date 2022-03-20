const generateObjectMessage = (username, text) => ({ username, text, createdAt: new Date().getTime() })
const generateObjectLocation = (username, url) => ({ username, url, createdAt: new Date().getTime() })
module.exports = {
    generateObjectMessage,
    generateObjectLocation
}