import { ObjectID } from 'mongodb';
import { status, resign, reviewerReject, reviewerAccept } from './regex';
import handleError from './error';

const validateScores = (appropriateness, clarity, methodology, contribution) => {
  let a = true;
  let cl = true;
  let m = true;
  let co = true;

  if (appropriateness < 1 || appropriateness > 10) {
    console.log('Appropriateness must be between 1 and 10.');
    a = false;
  }
  if (clarity < 1 || clarity > 10) {
    console.log('Clarity must be between 1 and 10.');
    cl = false;
  }
  if (methodology < 1 || methodology > 10) {
    console.log('Methodology must be between 1 and 10.');
    m = false;
  }
  if (contribution < 1 || contribution > 10) {
    console.log('Contribution must be between 1 and 10.');
    co = false;
  }
  return a && cl && m && co;
};

const reviewManuscript = (db, reviewerId, manuscriptId, appropriateness, clarity, methodology, contribution, recommendation, promptFn) => {
  if (!validateScores(appropriateness, clarity, methodology, contribution)) {
    console.log('Invalid scores; not submitting review.');
    promptFn(db);
  } else {
    const reviewQuery = {
      reviewer: new ObjectID(reviewerId),
      manuscript: new ObjectID(manuscriptId),
    };
    db.collection('reviews').findOne(reviewQuery, (err, manuscript) => {
      if (err) {
        handleError(err);
        promptFn(db);
      } else if (manuscript === null) {
        console.log('You are not assigned to this manuscript!');
        promptFn(db);
      } else if (manuscript.dateCompleted) {
        console.log('You have already reviewed this manuscript.');
        promptFn(db);
      } else {
        const newFields = {
          appropriateness,
          clarity,
          methodology,
          contribution,
          recommendation,
          dateCompleted: new Date(Date.now()),
        };
        db.collection('reviews').update(reviewQuery, { $set: newFields }, (err, res) => {
          if (err) {
            handleError(err);
          } else {
            console.log('Review successfully submitted!');
          }
          promptFn(db);
        });
      }
    });
  }
};

const reviewerResign = (db, reviewerId, promptFn) => {
  db.collection('reviews').remove({ reviewer: new ObjectID(reviewerId) });
  db.collection('people').remove({ _id: new ObjectID(reviewerId) });
  console.log('Thank you for your service!');
  promptFn(db, true);
};

const getReviewerStatus = (db, reviewerId, promptFn) => {
  db.collection('reviews').find({ reviewer: new ObjectID(reviewerId) }).toArray((err, reviews) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else {
      const manIds = reviews.map((r) => { return r.manuscript; });
      db.collection('manuscripts').find({ _id: { $in: manIds } }).toArray((err2, manuscripts) => {
        if (err2) {
          handleError(err2);
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
    }
  });
};

const handleReviewerInput = (db, reviewerId, input, promptFn) => {
  if (input.match(resign) !== null) {
    if (resign.exec(input)[1] !== reviewerId) {
      console.log(`${input.match(resign)[1]} is not your ID. Please enter your ID to resign`);
      promptFn(db);
    } else {
      reviewerResign(db, reviewerId, promptFn);
    }
  } else if (input.match(reviewerAccept) !== null) {
    const values = reviewerAccept.exec(input);
    reviewManuscript(db, reviewerId, values[1], parseInt(values[2], 10),
      parseInt(values[3], 10), parseInt(values[4], 10), parseInt(values[5], 10), 1, promptFn);
  } else if (input.match(reviewerReject) !== null) {
    const values = reviewerReject.exec(input);
    reviewManuscript(db, reviewerId, values[1], parseInt(values[2], 10),
      parseInt(values[3], 10), parseInt(values[4], 10), parseInt(values[5], 10), 0, promptFn);
  } else if (input.match(status) !== null) {
    getReviewerStatus(db, reviewerId, promptFn);
  } else {
    console.log('invalid command');
    promptFn(db);
  }
};

export default handleReviewerInput;
