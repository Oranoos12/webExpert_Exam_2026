const jwt = require('jsonwebtoken');
const { ValidationError, AuthenticationError } = require('../errors/error');
const User = require('../models/userModel');

// Zoekt de gebruiker met deze username en dit wachtwoord.
async function findByCredentials(username, password) {
    if (!username || !password) {
        throw new ValidationError('Username and password are required');
    }
    const user = await User.findOneByCredentials(username, password);
    if (!user) {
        throw new AuthenticationError('Cannot login with these credentials');
    }
    return user;
}

// Zoekt de gebruiker van een refresh token.
// We halen de gebruiker opnieuw uit de database: zo krijgt het nieuwe
// access token altijd de huidige rol, en een verwijderde user kan niet verder.
async function findByRefreshToken(refreshToken) {
    if (!refreshToken) {
        throw new AuthenticationError('A refresh token is required');
    }
    let data;
    try {
        data = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        throw new AuthenticationError('Invalid or expired refresh token');
    }
    const user = await User.findById(data._id);
    if (!user) {
        throw new AuthenticationError('User no longer exists');
    }
    return user;
}

module.exports = { findByCredentials, findByRefreshToken };