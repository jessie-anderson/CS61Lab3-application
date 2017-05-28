import prompt from 'prompt';
import { ObjectID } from 'mongodb';
import { submit, retract, status } from './regex';
import handleError from './error';

const submitManuscript = (db, authorId, title, affiliation, RICode, authors, filename, promptFn) => {
  db.collection('codes').find({ code: RICode }, (err, code) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else if (code === null) {
      console.log('No codes match the RI code you specified.');
      promptFn(db);
    } else {
      db.collection('people').find({ type: 'editor' }).toArray((err2, editors) => {
        if (err2) {
          handleError(err2);
          promptFn(db);
        } else {
          const randIdx = Math.floor(Math.random() * editors.length);
          const newManuscript = {
            title,
            affiliation,
            primaryAuthor: new ObjectID(authorId),
            RICode,
            secondaryAuthors: authors,
            editor: editors[randIdx]._id,
            status: 'submitted',
            content: '10010101010',
            timestamp: new Date(Date.now()),
          };
          db.collection('manuscripts').insert(newManuscript);
        }
      });
    }
  });
};

const getAuthorStatus = (db, authorId, promptFn) => {
  db.collection('manuscripts').find({ primaryAuthor: new ObjectID(authorId) }).toArray((err, manuscripts) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else {
      const sumbittedManuscripts = manuscripts.filter((m) => { return m.status === 'submitted'; });
      const underReviewManuscripts = manuscripts.filter((m) => { return m.status === 'under review'; });
      const rejectedManuscripts = manuscripts.filter((m) => { return m.status === 'rejected'; });
      const acceptedManuscripts = manuscripts.filter((m) => { return m.status === 'accepted'; });
      const inTypesettingManuscripts = manuscripts.filter((m) => { return m.status === 'typesetting'; });
      const scheduledManuscripts = manuscripts.filter((m) => { return m.status === 'scheduled for publication'; });
      const publishedManuscripts = manuscripts.filter((m) => { return m.status === 'published'; });
      sumbittedManuscripts.forEach((m) => {
        console.log(`${m._id}: submitted`);
      });
      underReviewManuscripts.forEach((m) => {
        console.log(`${m._id}: under review`);
      });
      rejectedManuscripts.forEach((m) => {
        console.log(`${m._id}: rejected`);
      });
      acceptedManuscripts.forEach((m) => {
        console.log(`${m._id}: accepted`);
      });
      inTypesettingManuscripts.forEach((m) => {
        console.log(`${m._id}: in typesetting`);
      });
      scheduledManuscripts.forEach((m) => {
        console.log(`${m._id}: scheduled for publication`);
      });
      publishedManuscripts.forEach((m) => {
        console.log(`${m._id}: published`);
      });
      promptFn(db);
    }
  });
};

const retractManuscript = (db, authorId, manuscriptId, promptFn) => {
  db.collection('manuscripts').find({ _id: manuscriptId }, (err, manuscript) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else if (manuscript === null) {
      console.log('No matching manuscript found');
      promptFn(db);
    } else if (new ObjectID(authorId) !== manuscript.primaryAuthor) {
      console.log('You are not assigned to this manuscript.');
      promptFn(db);
    } else {
      prompt.get(['Are you sure?'], (err, result) => {
        if (err) {
          handleError(err);
        } else if (result['Are you sure?'].toLowerCase() !== 'yes') {
          console.log('ok, not retracting manuscript');
        } else {
          db.collection('reviews').remove({ manuscript: new ObjectID(manuscriptId) });
          db.collection('manuscripts').remove({ _id: new ObjectID(manuscriptId) });
        }
        promptFn(db);
      });
    }
  });
};

const handleAuthorInput = (db, authorId, input, promptFn) => {
  let values;
  if (input.match(submit) !== null) {
    values = submit.exec(input);
    const title = values[1];
    const affiliation = values[2];
    const RICode = parseInt(values[3], 10);
    const authors = values[4].trim().split(/s+/);
    const filename = values[values.length - 1];
    submitManuscript(db, authorId, title, affiliation, RICode, authors, filename, promptFn);
  } else if (input.match(retract) !== null) {
    values = retract.exec(input);
    retractManuscript(db, authorId, values[1], promptFn);
  } else if (input.match(status) !== null) {
    getAuthorStatus(db, authorId, promptFn);
  } else {
    console.log('invalid command for author');
    promptFn(db);
  }
};

export default handleAuthorInput;
