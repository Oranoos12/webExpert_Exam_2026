const jwt = require('jsonwebtoken');
const ms = require('ms');
const securityService = require('../services/securityService');

// De refresh-cookie wordt alleen meegestuurd naar /security/... (o.a. /security/refresh).
const REFRESH_COOKIE_PATH = '/security';

// Maakt een access token (kort geldig, 30 min) en zet het in een cookie.
function setAccessCookie(res, payload) {
    const expiration = process.env.JWT_ACCESS_EXPIRATION;
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: expiration, algorithm: 'HS256' });
    res.cookie('accessToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: ms(expiration)
    });
}

// Maakt een refresh token (lang geldig, 1 week) en zet het in een cookie.
function setRefreshCookie(res, payload) {
    const expiration = process.env.JWT_REFRESH_EXPIRATION;
    const token = jwt.sign({ _id: payload._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: expiration, algorithm: 'HS256' });
    res.cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        path: REFRESH_COOKIE_PATH,
        maxAge: ms(expiration)
    });
}

// Wat we over de gebruiker in het access token zetten.
function createPayload(user) {
    return { _id: user._id.toString(), username: user.username, role: user.role };
}

// POST /security/login
async function login(req, res, next) {
    try {
        const body = req.body || {};
        const user = await securityService.findByCredentials(body.username, body.password);
        const payload = createPayload(user);
        setAccessCookie(res, payload);
        setRefreshCookie(res, payload);
        res.status(200).json(payload);
    } catch (err) {
        next(err);
    }
}

// POST /security/refresh -> nieuw access token met het refresh token
async function refresh(req, res, next) {
    try {
        const user = await securityService.findByRefreshToken(req.cookies.refreshToken);
        const payload = createPayload(user);
        setAccessCookie(res, payload);
        res.status(200).json(payload);
    } catch (err) {
        next(err);
    }
}

// POST /security/logout -> beide cookies verwijderen
async function logout(req, res, next) {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: REFRESH_COOKIE_PATH });
        res.status(200).json({});
    } catch (err) {
        next(err);
    }
}

// POST /security/login/check -> wie is er ingelogd?
async function checkLogin(req, res, next) {
    try {
        const user = req.requestingUser;
        res.status(200).json({ _id: user._id, username: user.username, role: user.role });
    } catch (err) {
        next(err);
    }
}

module.exports = { login, refresh, logout, checkLogin };