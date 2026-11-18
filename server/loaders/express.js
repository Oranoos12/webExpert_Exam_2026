const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const securityRouter = require('../routes/security');
const teamRouter = require('../routes/team');
const matchRouter = require('../routes/match');
const playerRouter = require('../routes/player');
const { errorHandler, routeNotFound } = require('../middleware/error');

function loadExpress(corsOptions) {
    const app = express();

    app.use(helmet());                       // veilige HTTP-headers
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));              // elke request loggen in de terminal
    }
    app.use(cors(corsOptions));              // client op een andere poort toelaten
    app.use(express.json());                 // JSON body lezen -> req.body
    app.use(cookieParser());                 // cookies lezen -> req.cookies

    app.use('/security', securityRouter);
    app.use('/teams', teamRouter);
    app.use('/matches', matchRouter);
    app.use('/player', playerRouter);

    app.all('/{*splat}', routeNotFound);     // onbekende route -> 404
    app.use(errorHandler);                   // ALTIJD als laatste
    return app;
}

module.exports = loadExpress;