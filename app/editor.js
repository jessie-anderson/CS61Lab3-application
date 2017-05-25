import { assign, editorReject, editorAccept, typeset, schedule, publish, createIssue } from './regex';

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

function assignManu(db, idPerson, idManu, idReviewer) {
  // check manuscript belongs to editor
  // correct next status
  // Not already assigned
  // match RICodes

}

function rejectManu(db, idPerson, idManu) {
  // check manuscript belogns to editor
  // check correct next status
  // check three reviews exist for this manuscript
}

function acceptManu(db, iPerson, idManu) {
  // check manuscript belogns to editor
  // check correct next status
  // check three reviews exist for this manuscript
}

function typesetManu(db, idPerson, idManu, numPages) {
  // check manuscript belogns to editor
  // check correct next status
}

function scheduleManu(db, idPerson, idManu, issueYear, issuePPN) {
  // check manuscript belogns to editor
  // check correct next status
  // check page maximum not exceeded
  // add manuscript with default next page
}

function scheduleManuOrder(db, idPerson, idManu, issueYear, issuePPN, order, pageNumber) {
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
