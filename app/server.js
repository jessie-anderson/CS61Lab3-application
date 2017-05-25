/* Jessie Anderson and Alma Wang
 * This file based on boilerplate provided in CS52
 * Boilerplate largely written by Tim Tregubov
 * Github for boilerplate source: https://github.com/dartmouth-cs52/express-babel-starter
 */

import express from 'express';
import prompt from 'prompt';
import { MongoClient } from 'mongodb';
import { login } from './regex';

// initialize
const app = express();
const currentUserType = 'none';
const currentUser = null;

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

app.set('view engine', 'ejs');
app.use(express.static('static'));
// enables static assets from folder static

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);

prompt.start();
prompt.get(['username'], (err, result) => {
  if (err) {
    console.log('an error occurred processing input:');
    console.log(err);
    process.exit();
  } else {
    const username = result.username.trim();
    prompt.get({ properties: { password: { hidden: true } } }, (err2, result2) => {
      if (err2) {
        console.log('an error occurred processing input:');
        console.log(err);
        process.exit();
      } else {
        const password = result2.password.trim();
        const mongoURI = `mongodb://${username}:${password}@cluster0-shard-00-00-ppp7l.mongodb.net:27017,cluster0-shard-00-01-ppp7l.mongodb.net:27017,cluster0-shard-00-02-ppp7l.mongodb.net:27017/Team13DB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;
        MongoClient.connect(mongoURI, (err, db) => {
          if (err) {
            console.log('Error connecting to the database:');
            console.log(err);
            process.exit();
          } else {
            console.log('Connection to database successful!');
            prompt.start();
            promptFn();
          }
        });
      }
    });
  }
});
