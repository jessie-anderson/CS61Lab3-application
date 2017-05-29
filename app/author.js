import prompt from 'prompt';
import { submit, retract, status, registerAuthor } from './regex';
import handleError from './error';

const register = (db, fname, lname, email, address, promptFn) => {
  db.collection('counters').findOneAndUpdate({ _id: 'people' }, { $inc: { seq: 1 } }, { returnOriginal: false }, (err, counter) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else {
      db.collection('people').insertOne({ _id: counter.value.seq, fname, lname, email, address, type: 'author' }, (err, newAuthor) => {
        if (err) {
          handleError(err);
        } else {
          console.log(`You successfully registered as an author! Your system ID is ${counter.value.seq}.`);
        }
        promptFn(db);
      });
    }
  });
};

const submitManuscript = (db, authorId, title, affiliation, RICode, authors, filename, promptFn) => {
  db.collection('ricodes').find({ code: RICode }, (err, code) => {
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
          db.collection('counters').findOneAndUpdate({ _id: 'manuscripts' }, { $inc: { seq: 1 } }, { returnOriginal: false }, (err, counter) => {
            if (err) {
              handleError(err);
              promptFn(db);
            } else {
              const newManuscript = {
                _id: counter.value.seq,
                title,
                affiliation,
                primaryAuthor: authorId,
                RICode,
                secondaryAuthors: authors,
                editor: editors[randIdx]._id,
                status: 'submitted',
                content: '10010101010',
                timestamp: new Date(Date.now()),
              };
              db.collection('manuscripts').insertOne(newManuscript, (err) => {
                if (err) {
                  handleError(err);
                } else {
                  console.log(`Successfully submitted manuscript with system id ${newManuscript._id}`);
                }
                promptFn(db);
              });
            }
          });
        }
      });
    }
  });
};

const getAuthorStatus = (db, authorId, promptFn) => {
  db.collection('manuscripts').find({ primaryAuthor: authorId }).toArray((err, manuscripts) => {
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
  db.collection('manuscripts').findOne({ _id: manuscriptId }, { fields: { primaryAuthor: 1 } }, (err, manuscript) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else if (manuscript === null) {
      console.log('No matching manuscript found');
      promptFn(db);
    } else if (authorId !== manuscript.primaryAuthor) {
      console.log(`authorId: ${authorId}, primaryAuthor: ${manuscript.primaryAuthor}`);
      console.log('You are not assigned to this manuscript.');
      promptFn(db);
    } else {
      prompt.get(['Are you sure?'], (err, result) => {
        if (err) {
          handleError(err);
        } else if (result['Are you sure?'].toLowerCase() !== 'yes') {
          console.log('ok, not retracting manuscript');
        } else {
          db.collection('reviews').remove({ manuscript: manuscriptId });
          db.collection('manuscripts').remove({ _id: manuscriptId });
        }
        promptFn(db);
      });
    }
  });
};

const handleAuthorInput = (db, authorId, input, promptFn) => {
  if (input.match(submit) !== null) {
    const values = submit.exec(input);
    const title = values[1];
    const affiliation = values[2];
    const RICode = parseInt(values[3], 10);
    const authors = values[4].trim().split(' ');
    const filename = values[values.length - 1];
    submitManuscript(db, authorId, title, affiliation, RICode, authors, filename, promptFn);
  } else if (input.match(retract) !== null) {
    const values = retract.exec(input);
    retractManuscript(db, authorId, parseInt(values[1], 10), promptFn);
  } else if (input.match(status) !== null) {
    getAuthorStatus(db, authorId, promptFn);
  } else if (input.match(registerAuthor)) {
    const values = registerAuthor.exec(input);
    register(db, values[1], values[2], values[3], values[4], promptFn);
  } else {
    console.log('invalid command for author');
    promptFn(db);
  }
};

export default handleAuthorInput;
