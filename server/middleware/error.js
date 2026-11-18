const { NotFoundError, ValidationError, AuthenticationError, AuthorisationError } = require('../errors/error');

// Error-handling middleware: heeft 4 parameters (err, req, res, next).
// Express roept deze functie op wanneer ergens next(err) gebeurt.
function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message || 'Something went wrong';

    if (err instanceof NotFoundError) {
        status = 404;
    } else if (err instanceof ValidationError) {
        status = 400;
    } else if (err instanceof AuthenticationError) {
        status = 401;
    } else if (err instanceof AuthorisationError) {
        status = 403;
    }

    res.status(status).json({ error: { message: message, status: status } });
}

// Wordt gebruikt voor elke route die niet bestaat.
function routeNotFound(req, res, next) {
    next(new NotFoundError(`Route not found: ${req.originalUrl}`));
}

module.exports = { errorHandler, routeNotFound };