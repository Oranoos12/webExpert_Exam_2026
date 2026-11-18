const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorisationError } = require('../errors/error');

// Controleert of er een geldig access token in de cookie zit.
// Als dat zo is, staat de gebruiker daarna in req.requestingUser.
function authenticate(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        return next(new AuthenticationError('An access token is required for authentication'));
    }

    let user;
    try {
        user = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AuthenticationError('Access token expired'));
        }
        return next(new AuthenticationError('Invalid access token'));
    }

    req.requestingUser = user;
    next();
}

// Maakt een middleware die alleen de gegeven rollen doorlaat.
// Gebruik: authorize(['admin']) of authorize(['admin', 'player'])
function authorize(allowedRoles) {
    return function (req, res, next) {
        const user = req.requestingUser;
        if (!user || !user.role) {
            return next(new AuthenticationError('No user role found'));
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new AuthorisationError('Insufficient permissions'));
        }
        next();
    };
}

module.exports = { authenticate, authorize };