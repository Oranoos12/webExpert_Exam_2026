// Eigen foutklassen. Elke klasse hoort bij één HTTP-statuscode
// (die koppeling gebeurt in middleware/error.js).

// 404 - iets bestaat niet (bv. een route die niet bestaat)
class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}

// 400 - de gebruiker stuurde foute gegevens
class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}

// 401 - niet ingelogd of ongeldig token
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
    }
}

// 403 - wel ingelogd, maar de rol mag dit niet
class AuthorisationError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = { NotFoundError, ValidationError, AuthenticationError, AuthorisationError };