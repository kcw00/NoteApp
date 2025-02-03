// prints normal logs
const info = (...params) => {
    console.log(...params)
}
// prints error logs
const error = (...params) => {
    console.error(...params)
}

module.exports = {
    info, error
}