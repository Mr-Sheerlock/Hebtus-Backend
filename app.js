const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authenticationRouter = require('./routes/authenticationRoute');
const eventRouter = require('./routes/eventRoute');
const creatorRouter = require('./routes/creatorRoute');
const passportRouter = require('./routes/passportRoute');
const bookingRouter = require('./routes/bookingRoute');
const promoCodeRouter = require('./routes/promoCodeRoute');
const notificationRouter = require('./routes/notificationRoute');
const ticketRouter = require('./routes/ticketRoute');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const cookieParser = require('cookie-parser');

const app = express();

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE_DEPLOY;

const mongoStoreOptions = {
  mongoUrl: DBstring,
};

const mongoStore = MongoStore.create(mongoStoreOptions);

app.enable('trust proxy');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    name: process.env.SESSION_NAME,
    cookie: {
      httpOnly: true,
      secure: false,
      // sameSite: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
    store: mongoStore,
    resave: false,
    unset: 'destroy',
  })
);
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', (req, res, next) => {
  console.log('hello from Major App Middleware');
  next();
});

app.use('/api/v1/events', eventRouter);
app.use('/api/v1/oauth', passportRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/creators/events', creatorRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/promocodes', promoCodeRouter);
app.use('/api/v1', authenticationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
