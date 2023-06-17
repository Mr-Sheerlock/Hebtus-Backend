const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
const { WebSocketServer } = require('ws');
const { parse } = require('url');
const uuid = require('node-uuid');

// const test = require('./__test__/testutils/createConfirmedUser');
const app = require('./app');
//Load config
const authController = require('./controllers/authenticationController');

const socketModel = require('./models/socketModel');

function onSocketError(err) {
  console.error(err);
}
//Database connection

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE_DEPLOY;

const DBcheck =
  process.env.NODE_ENV === 'development' ? 'LOCAL DB' : 'DEPLOYED DB';
console.log('connecting to ', DBcheck);

mongoose
  .connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('DB is connected successfuly!');
    await socketModel.deleteMany();
  });

//Hosting the server
const server = app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});

const wss = new WebSocketServer({ noServer: true });
global.wssClients = wss.clients;
wss.on('connection', async (ws, req, client) => {
  //add conn to DB: connID, userID
  ws.id = uuid.v4();

  console.log('connID is', ws.id);
  const userID = client._id;
  await socketModel.create({
    attendeeID: userID,
    socketID: ws.id,
  });

  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log(`Received message ${data} from user ${client}`);
  });
  ws.on('close', async () => {
    console.log('disconnected');
    await socketModel.deleteOne({ socketID: ws.id });
  });
});

const authenticate = async (req, callback) => {
  const { query } = parse(req.url);
  // const pathname = parse(req.url);
  const token = query.split('=')[1];
  console.log('req params are', token);
  let user = null;
  try {
    user = await authController.getUserfromToken(token, req);
    console.log('user is', user);
  } catch (err) {
    callback('error', null);
    return;
  }
  callback(null, user);
  // Do some checks here to make sure the connection should be allowed
};

server.on('upgrade', (request, socket, head) => {
  socket.on('error', onSocketError);
  console.log('upgrade');
  // This function is not defined on purpose. Implement it with your own logic.
  authenticate(request, (err, client) => {
    console.log('callback');
    if (err || !client) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, client);
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  //shut down the server gracefully and then exit the process
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// exports.sendNotification = async (socketUID, message) => {
//   wss.clients.forEach(function each(client) {
//     if (client.id == socketUID && client.readyState === WebSocket.OPEN) {
//       client.send(
//         `${message.creatorID} is inviting you to ${message.eventName}`,
//         { binary: false }
//       );
//     }
//   });
// };
