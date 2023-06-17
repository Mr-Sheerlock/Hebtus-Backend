const authController = require('./controllers/authenticationController');
const { WebSocketServer } = require('ws');
const { parse } = require('url');

const socketModel = require('./models/socketModel');

function onSocketError(err) {
  console.error(err);
}
const { server } = require('./server');
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (ws, req, client) => {
  //add conn to DB: connID, userID
  const connID = req.headers['sec-websocket-key'];
  console.log('connID is', connID);
  const userID = client._id;
  await socketModel.create({
    attendeeID: userID,
    socketID: connID,
  });
  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log(`Received message ${data} from user ${client}`);
  });
  ws.on('close', async () => {
    console.log('disconnected');
    await socketModel.deleteOne({ socketID: connID });
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
