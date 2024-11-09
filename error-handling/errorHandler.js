const errorHandler = (err, req, res, next) => {
    res.status(500).json({
        message: "Wystąpił błąd serwera"
    })
}

module.exports = errorHandler;