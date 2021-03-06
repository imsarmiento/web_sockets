const WebSocket = require("ws");
const clients = [];
const Message = require("./models/Message");

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();

    ws.on("message", (message) => {
      var now = new Date();
      Message.create({
        message,
        author: "Desde UI",
        ts: now.getTime(),
      })
        .then((result) => {
          console.log("Message saved");
        })
        .catch((result) => {
          console.log(result);
        });
      sendMessages();
    });
  });

  const sendMessages = () => {
    Message.findAll({ raw: true })
      .then((messages) => {
        //console.log(messages);
        messages = messages.map((element) => element["message"]);
        clients.forEach((client) => client.send(JSON.stringify(messages)));
      })
      .catch((error) => console.log(error));
  };
};

exports.wsConnection = wsConnection;
