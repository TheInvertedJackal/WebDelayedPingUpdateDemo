import express, { json } from 'express';
import fs from 'fs';
const app = express();
const port = 3000;
const savedMsgsFile = "./server-data/saved-msgs.json"

app.use(express.json());

let toUpdate = [];

let messageLogs = {
  title: "Messages",
  messages: []
}

const isDefined = (value) => {
  return value !== isNaN && value !== null && value !== undefined;
}

const saveMessageLogContents = () => {
  fs.writeFile(savedMsgsFile, JSON.stringify(messageLogs), (err) => {
    if(err){
      console.error("There was an error making the message log file.");
      console.error(err);
    }
  });
}

if(!fs.existsSync(savedMsgsFile)){
  saveMessageLogContents();
} else {
  fs.readFile(savedMsgsFile, (err, data) => {
    if(err){
      console.error("There was an error making the message log file.");
      console.error(err);
    } else {
      messageLogs = JSON.parse(data);
    }
  });
}

const saveFile = (msg) => {
  messageLogs.messages.push(msg);
  saveMessageLogContents();
}

const clearMessages = () => {
  messageLogs.messages = [];
  saveMessageLogContents();
}

app.get('/get-board', (req, res) => {
  toUpdate.push(res);
  console.log("Pinged!");
})

app.get('/get-board-full', (req, res) => {
  //res.body = {messageds: messageLogs.messages};
  res.status(200);
  res.send({messages: messageLogs.messages});
})

app.delete('/clear-posts', (req, res) => {
  clearMessages();
  let value = {clear: true};
  toUpdate.forEach(resUpdate => {
    resUpdate.status(200);
    resUpdate.send(value);
  });
  res.sendStatus(200);
});

app.post('/submit-post', (req, res) => {
  let message = req.body.msg;
  console.log(req.body);
  if(!isDefined(message)){
    res.sendStatus(404);
    return;
  }

  let value = {msg: message};
  saveFile(message);
  toUpdate.forEach(resUpdate => {
    if(!resUpdate.headersSent){
      try{
        resUpdate.send(value);
      } catch (err){
        console.log(err);
      }
    }
  });
  toUpdate = [];
  res.sendStatus(200);
})

app.use('/', express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
