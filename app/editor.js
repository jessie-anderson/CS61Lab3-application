const status = /status\s*/;
const assign = /assign\s+(\w+)\s+(\w+)\s*/;
const reject = /reject\s+(\w+)\s*/;
const accept = /accept\s+(\w+)\s*/;
const typeset = /typeset\s+(\w+)\s+(\d+)\s*/;
const schedule = /schedule\s+(\w+)\s+(\d+)\s+([1234])\s*/;
const publish = /publish\s+(\d+)\s+([1234])\s*/;
const create = /create\s+(\d+)\s+([1234])\s*/; // creates issue

function registerEditor(db, fname, lname) {
  db.collection('people').insert({
    fname,
    lname,
    type: 'editor',
  });
}

function getStatus(db, id) {
  const collection = db.collection('manuscripts');
  collection.find({ status: 'submitted' }).sort({ _id: 1 }).then((subResult) => {
    collection.find({ status: 'under review' }).sort({ _id: 1 }).then((revResult) => {
      collection.find({ status: 'rejected' }).sort({ _id: 1 }).then((rejResult) => {
        collection.find({ status: 'accepted' }).sort({ _id: 1 }).then((accResult) => {
          collection.find({ status: 'typesetting' }).sort({ _id: 1 }).then((typeResult) => {
            collection.find({ status: 'scheduled for publication' }).sort({ _id: 1 }).then((schedResult) => {
              collection.find({ status: 'published' }).sort({ _id: 1 }).then((pubResult) => {
                console.log();
              });
            });
          });
        });
      });
    });
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
  db.collections('manuscripts').updateOne();
  // check manuscript belogns to editor
  // check correct next status
}

function scheduleManu(db, idPerson, idManu, issueYear, issuePPN) {
  if (checkManuscript(db, idPerson, idManu, 'scheduled for publication') === false) { return; }
  db.collections('manuscripts').updateOne();
  // check manuscript belogns to editor
  // check correct next status
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

  // check issue doesn't already exist
}

function publishIssue(db, issueYear, issuePPN) {
  // check issue is not empty
  // check page max not exceeded
  // / check ordering of pages and page numbers
}
