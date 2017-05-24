import express from 'express';
import prompt from 'prompt';
import { login } from './regex';

// initialize
const app = express();
const currentUserType = 'none';
const currentUser = null;

app.set('view engine', 'ejs');
app.use(express.static('static'));
// enables static assets from folder static

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);

const promptFn = () => {
  prompt.get(['command'], (err, result) => {
    if (result.command === 'exit') {
      console.log('Bye!');
      process.exit();
    } else if (currentUserType === 'none' || currentUser === null) {
      if (result.command.match(login) !== null) {
        console.log('login found!');
      } else if (result.command === 'logout') {
        console.log('logout found!');
      } else {
        console.log('invalid command');
      }
      promptFn();
    } else {
      promptFn();
    }
  });
};

prompt.start();
promptFn();
