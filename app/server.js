/* Jessie Anderson and Alma Wang
 * This file based on boilerplate provided in CS52
 * Boilerplate largely written by Tim Tregubov
 * Github for boilerplate source: https://github.com/dartmouth-cs52/express-babel-starter
 */

import prompt from 'prompt';
import { MongoClient } from 'mongodb';
import { login, registerReviewer, registerAuthor, registerEditor } from './regex';
import handleAuthorInput from './author';
import handleReviewerInput from './reviewer';
import handleEditorInput from './editor';
import handleError from './error';

const inputHandlers = {
  author: handleAuthorInput,
  reviewer: handleReviewerInput,
  editor: handleEditorInput,
};
let currentUserType = 'none';
let currentUserId = null;

const username = 'Team13';
const password = 'FjeyTVIlIUnnWtTY';
const mongoURI = `mongodb://${username}:${password}@cluster0-shard-00-00-ppp7l.mongodb.net:27017,cluster0-shard-00-01-ppp7l.mongodb.net:27017,cluster0-shard-00-02-ppp7l.mongodb.net:27017/Team13DB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;

const promptFn = (db, resignHappened) => {
  if (resignHappened) {
    currentUserType = 'none';
    currentUserId = null;
  }
  prompt.get({ name: 'command', description: 'COMMAND>' }, (err, result) => {
    if (result.command === 'exit') {
      console.log('Bye!');
      db.close();
      process.exit();
    } else if (currentUserType === 'none' || currentUserId === null) {
      if (result.command.match(login) !== null) {
        db.collection('people').findOne({ _id: parseInt(`${login.exec(result.command)[1]}`, 10) }, (err, person) => {
          if (err) {
            handleError(err);
            promptFn(db);
          } else if (person === null) {
            console.log('invalid login id');
            console.log(`attempted to find with id: ${login.exec(result.command)[1]}`);
            promptFn(db);
          } else {
            currentUserId = person._id;
            currentUserType = person.type;
            console.log(`Hello, ${person.type} ${person.fname} ${person.lname}!`);
            if (person.type === 'author') {
              console.log(`address: ${person.address}`);
            }
            inputHandlers[currentUserType](db, currentUserId, 'status', promptFn);
          }
        });
      } else if (result.command.match(registerEditor)) {
        inputHandlers.editor(db, null, result.command, promptFn);
      } else if (result.command.match(registerReviewer)) {
        inputHandlers.reviewer(db, null, result.command, promptFn);
      } else if (result.command.match(registerAuthor)) {
        inputHandlers.author(db, null, result.command, promptFn);
      } else {
        console.log('invalid command');
        promptFn(db);
      }
    } else if (result.command === 'logout') {
      console.log('Goodbye!');
      currentUserId = null;
      currentUserType = 'none';
      promptFn(db);
    } else {
      inputHandlers[currentUserType](db, currentUserId, result.command, promptFn);
    }
  });
};

prompt.message = ('Journal DB');
prompt.delimiter = ':';
prompt.start();
MongoClient.connect(mongoURI, (err, db) => {
  if (err) {
    console.log('Error connecting to the database:');
    console.log(err);
    process.exit();
  } else {
    console.log('Connection to database successful!');
    prompt.start();
    promptFn(db);
  }
});
