import { handleError } from './error';
import { status, assign, editorAccept, editorReject, typeset, publish, createIssue } from './regex';
import { ObjectID } from 'mongodb';

function registerEditor(db, fname, lname) {
  db.collection('people').insert({
    fname,
    lname,
    type: 'editor',
  });
}

function getStatus(db, id, promptFn) {
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
}

// Checks manuscript belongs to the editor and the next status is valid
function checkManuscript(db, idPerson, idManu, nextStatus) {
  db.collections('manuscripts').find({ _id: idManu }).then((result) => {
    if (result.editor !== idPerson) {
      return false;
    }
    switch (nextStatus) {
      case 'submitted':
        if (result.status === 'under review') { return true; }
        console.log('ERROR: Manuscript cannot be set to submitted unless reviewer resigns');
        return false;
      case 'under review':
        if (result.status === 'under review' || result.status === 'submitted') { return true; }
        console.log('ERROR: Manuscript cannot be set to under review unless it is changed from submitted or currently under review');
        return false;
      case 'accepted':
        if (result.status === 'under review') {
          db.collections('reviews').find({ manuscript: idManu, dateCompleted: { $ne: null } }).count().then((count) => {
            if (count >= 3) { return true; }
            console.log('ERROR: Need at least 3 completed reviews to set manuscript to accepted');
            return false;
          });
        }
        console.log('ERROR: Manuscript cannot be set to accepted unless it is currently under review');
        return false;
      case 'rejected':
        if (result.status === 'under review') {
          db.collections('reviews').find({ manuscript: idManu, dateCompleted: { $ne: null } }).count().then((count) => {
            if (count >= 3) { return true; }
            console.log('ERROR: Need at least 3 completed reviews to set manuscript to rejected');
            return false;
          });
        }
        console.log('ERROR: Manuscript cannot be set to rejected unless it is currently under review');
        return false;
      case 'typesetting':
        if (result.status === 'accepted' || result.status === 'rejected') { return true; }
        console.log('ERROR: Manuscript cannot be typeset until it is accepted or rejected');
        return false;
      case 'scheduled for publication':
        if (result.status === 'typesetting') { return true; }
        console.log('ERROR: Manuscript cannot be scheduled for publication until it has been typeset');
        return false;
      case 'published':
        if (result.stateus === 'scheduled for publication') {
          return true;
        }
        console.log('ERROR: Manuscript cannnot be published until it has been scheduled for publication');
        return false;
      default:
        return false;
    }
  });
  return false;
}

function assignManu(db, idPerson, idManu, idReviewer) {
  if (checkManuscript(db, idPerson, idManu, 'under review') === false) { return; }
  db.collections('manuscripts').updateOne();
  // check manuscript belongs to editor
  // correct next status
  // Not already assigned
  // match RICodes
}

function rejectManu(db, idPerson, idManu) {
  if (checkManuscript(db, idPerson, idManu, 'rejected') === false) { return; }
  db.collections('manuscripts').updateOne();
  // check manuscript belogns to editor
  // check correct next status
  // check three reviews exist for this manuscript
}

function acceptManu(db, idPerson, idManu) {
  if (checkManuscript(db, idPerson, idManu, 'accepted') === false) { return; }
  db.collections('manuscripts').updateOne();
  // check manuscript belogns to editor
  // check correct next status
  // check three reviews exist for this manuscript
}

function typesetManu(db, idPerson, idManu, numPages) {
  if (checkManuscript(db, idPerson, idManu, 'typesetting') === false) { return; }
  db.collections('manuscripts').updateOne({ _id: idManu }, { $set: {
    status: 'typesetting',
    timestamp: new Date().toTimeStamp(),
    numPages,
  } });
}

function scheduleManu(db, idPerson, idManu, issueYear, issuePPN) {
  if (checkManuscript(db, idPerson, idManu, 'scheduled for publication') === false) { return; }
  db.collections('issues').findOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((issue) => {
    if (issue === null) {
      console.log('ERROR: Issue does not exist');
      return;
    }
    db.collections('manuscripts')
    .aggregate([{ $match: { year: issueYear, publicationPeriodNumber: issuePPN } }, { $group: { totalPages: { $sum: '$numPages' } } }])
    .then((result) => {
      db.collections('manuscripts').find({ _id: idManu }).sort({ orderInIssue: 1 }).then((man) => {
        if (result.totalPages + man.numPages > 100) {
          console.log('ERROR: Issue cannot contain more than 100 pages');
        } else {
          db.collections('manuscripts').find();
          db.collections('manuscripts').updateOne({ _id: idManu }, { $set: {
            status: 'scheduled for publication',
            timestamp: new Date().toTimeStamp(),
            issue: issue._id,
          } });
        }
      });
    });
  });


  // check page maximum not exceeded
  // add manuscript with default next page
}

function scheduleManuOrder(db, idPerson, idManu, issueYear, issuePPN, order, pageNumber) {
  if (checkManuscript(db, idPerson, idManu, 'scheduled for publication') === false) { return; }
  db.collections('manuscripts').updateOne();
  // check manuscript belogns to editor
  // check correct next status
  // check page maximum not exceeded
  // add manuscript with given page order and page number
  // check valid ordering and numbering
}

function createIssue(db, issueYear, issuePPN) {
  db.collections('issues').find({ year: issueYear, publicationPeriodNumber: issuePPN }).count((count) => {
    if (count !== 0) {
      console.log('The issue already exists');
    } else {
      db.collections('issues').insertOne({ year: issueYear, publicationPeriodNumber: issuePPN });
    }
  });
}

function publishIssue(db, issueYear, issuePPN) {
  // check issue is not empty
  // check page max not exceeded
  // / check ordering of pages and page numbers
}

const handleEditorInput = (db, editorId, input, promptFn) => {
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

export default handleEditorInput;
