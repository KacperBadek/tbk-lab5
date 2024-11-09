const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: 'Content Not Found',
    })
}
module.exports = notFoundHandler