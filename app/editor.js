import handleError from './error';
import {
  status,
  assign,
  editorAccept,
  editorReject,
  typeset,
  schedule,
  publish,
  createIssue,
  registerEditor,
  statusMan,
  scheduleOrder,
} from './regex';

function register(db, fname, lname, promptFn) {
  db.collection('counters').findOneAndUpdate({ _id: 'people' }, { $inc: { seq: 1 } }, { returnOriginal: false }, (err, counter) => {
    if (err) {
      handleError(err);
      promptFn(db);
    } else {
      db.collection('people').insertOne({ _id: counter.value.seq, fname, lname, type: 'editor' }, (err) => {
        if (err) {
          handleError(err);
        } else {
          console.log(`You successfully registered as an editor! Your system ID is ${counter.value.seq}.`);
        }
        promptFn(db);
      });
    }
  });
}

function getStatus(db, id, promptFn) {
  db.collection('manuscripts').find({ editor: parseInt(id, 10) }).sort({ _id: 1 }).toArray((err, manuscripts) => {
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

function getManStatus(db, idPerson, idManu, promptFn) {
  db.collection('manuscripts').findOne({ _id: parseInt(idManu, 10), editor: parseInt(idPerson, 10) }).then((man) => {
    if (man === null) {
      console.log('ERROR: Manuscript not found for this editor');
      promptFn(db);
    } else {
      console.log(`
        title: ${man.title}
        primaryAuthor: ${man.primaryAuthor}
        secondaryAuthors: ${man.secondaryAuthors}
        RICode:${man.RICode}
        status: ${man.status}
        timestamp: ${man.timestamp}
        number of pages: ${man.numPages}
        order in issue:${man.orderInIssue}
        page number: ${man.pageNumber}`);
      promptFn(db);
    }
  });
}

// Checks manuscript belongs to the editor and the next status is valid
function checkManuscript(db, idPerson, idManu, nextStatus, callback) {
  db.collection('manuscripts').findOne({ _id: parseInt(idManu, 10) }).then((result) => {
    if (result.editor !== idPerson) {
      callback(false);
      return;
    }
    switch (nextStatus) {
      case 'submitted':
        if (result.status === 'under review') { callback(true); return; }
        console.log('ERROR: Manuscript cannot be set to submitted unless reviewer resigns');
        callback(false);
        break;
      case 'under review':
        if (result.status === 'under review' || result.status === 'submitted') { callback(true); return; }
        console.log('ERROR: Manuscript cannot be set to under review unless it is changed from submitted or currently under review');
        callback(false);
        break;
      case 'accepted':
        if (result.status === 'under review') {
          db.collection('reviews').find({ manuscript: parseInt(idManu, 10), dateCompleted: { $ne: null } }).count().then((count) => {
            if (count >= 3) { callback(true); return; }
            console.log('ERROR: Need at least 3 completed reviews to set manuscript to accepted');
            callback(false);
          });
          return;
        }
        console.log('ERROR: Manuscript cannot be set to accepted unless it is currently under review');
        callback(false);
        break;
      case 'rejected':
        if (result.status === 'under review') {
          db.collection('reviews').find({ manuscript: parseInt(idManu, 10), dateCompleted: { $ne: null } }).count().then((count) => {
            if (count >= 3) { callback(true); return; }
            console.log('ERROR: Need at least 3 completed reviews to set manuscript to rejected');
            callback(false);
          });
          return;
        }
        console.log('ERROR: Manuscript cannot be set to rejected unless it is currently under review');
        callback(false);
        break;
      case 'typesetting':
        if (result.status === 'accepted') { callback(true); return; }
        console.log('ERROR: Manuscript cannot be typeset until it is accepted or rejected');
        callback(false);
        break;
      case 'scheduled for publication':
        if (result.status === 'typesetting' || result.status === 'scheduled for publication') {
          if (result.numPages > 100) {
            console.log('ERROR: Issue cannot exceed 100 pages');
            callback(false);
            return;
          } else {
            callback(true);
            return;
          }
        }
        console.log('ERROR: Manuscript cannot be scheduled for publication until it has been typeset');
        callback(false);
        break;
      case 'published':
        if (result.status === 'scheduled for publication') {
          callback(true);
          return;
        }
        console.log('ERROR: Manuscript cannnot be published until it has been scheduled for publication');
        callback(false);
        break;
      default:
        callback(false);
    }
  });
}

function checkIssue(db, year, publicationPeriodNumber, callback) {
  db.collection('issues').findOne({ year, publicationPeriodNumber }).then((issue) => {
    if (issue === null) {
      console.log('ERROR: Issue does not exist');
      callback(false);
      return;
    } else if (issue.printDate !== undefined) {
      console.log(issue);
      console.log(issue.printDate);
      console.log('ERROR: Issue already published');
      callback(false);
      return;
    }
    db.collection('manuscripts').find({ issue: issue._id }).sort({ orderInIssue: 1 })
    .toArray()
    .then((mans) => {
      const pages = mans.reduce((prev, cur) => {
        if (prev === null) { return null; }
        if (prev.pageNumber > cur.pageNumber) {
          console.log('ERROR: Page numbers not in monotonically increasing order');
          return null;
        } else if (parseInt(cur.pageNumber, 10) !== prev.totalPages + 1) {
          console.log('ERROR: Issue page numbering cannot skip pages');
          return null;
        } else if (parseInt(cur.orderInIssue, 10) !== prev.orderInIssue + 1) {
          console.log('ERROR: Manuscripts in issue cannot skip order');
          return null;
        } else {
          return { pageNumber: cur.pageNumber, orderInIssue: cur.orderInIssue, totalPages: parseInt(prev.totalPages, 10) + parseInt(cur.numPages, 10) };
        }
      }, { pageNumber: 0, orderInIssue: 0, totalPages: 0 });
      if (pages === null) {
        callback(false);
      } else if (pages.totalPages === 0) {
        console.log('ERROR: Cannot publish an empty issue');
        callback(false);
      } else if (pages.totalPages > 100) {
        console.log('ERROR: Issue cannot exceed over 100 pages');
        callback(false);
      } else { callback(true); }
    });
  });
}

function assignManu(db, idPerson, idManu, idReviewer, promptFn) {
  checkManuscript(db, idPerson, idManu, 'under review', (check) => {
    if (!check) { promptFn(db); return; }
    db.collection('reviews').findOne({ manuscript: parseInt(idManu, 10), reviewer: parseInt(idReviewer, 10) }).then((review) => {
      if (review !== null) {
        console.log('ERROR: Review already assigned for given Manuscript and Reviewer');
        promptFn(db);
        return;
      }
      db.collection('people').findOne({ _id: parseInt(idReviewer, 10) }).then((reviewer) => {
        if (reviewer === null || reviewer.type !== 'reviewer') {
          console.log('ERROR: Reviewer does not exist');
          promptFn(db);
          return;
        }
        db.collection('manuscripts').findOne({ _id: parseInt(idManu, 10) }).then((man) => {
          if (reviewer.interests === null || reviewer.interests.indexOf(man.RICode) === -1) {
            console.log('ERROR: RI Codes of manuscript and reviewer do not match');
            promptFn(db);
          } else {
            db.collection('reviews').insertOne({
              manuscript: parseInt(idManu, 10),
              reviewer: parseInt(idReviewer, 10),
            }).then((result) => {
              db.collection('manuscripts').updateOne({ _id: parseInt(idManu, 10) }, { $set: { status: 'under review', timestamp: new Date().toString() } });
              console.log('Review assigned!');
              promptFn(db);
            });
          }
        });
      });
    });
  });
}

function rejectManu(db, idPerson, idManu, promptFn) {
  checkManuscript(db, idPerson, idManu, 'rejected', (check) => {
    if (!check) { promptFn(db); return; }
    db.collection('manuscripts').update({ _id: parseInt(idManu, 10) }, { $set: {
      status: 'rejected',
      timestamp: new Date().toString(),
    } }).then((result) => {
      console.log('Manuscript rejected!');
      promptFn(db);
    });
  });
}

function acceptManu(db, idPerson, idManu, promptFn) {
  checkManuscript(db, idPerson, idManu, 'accepted', (check) => {
    if (!check) { promptFn(db); } else {
      console.log('true');
      db.collection('manuscripts').update({ _id: parseInt(idManu, 10) }, { $set: {
        status: 'accepted',
        timestamp: new Date().toString(),
      } }).then((result) => {
        console.log('Manuscript accepted!');
        promptFn(db);
      });
    }
  });
}

function typesetManu(db, idPerson, idManu, numPages, promptFn) {
  checkManuscript(db, idPerson, idManu, 'typesetting', (check) => {
    if (!check) { promptFn(db); return; }
    if (numPages <= 0) {
      console.log('ERROR: number of pages must be at least 1');
    } else {
      db.collection('manuscripts').updateOne({ _id: parseInt(idManu, 10) }, { $set: {
        status: 'typesetting',
        timestamp: new Date().toString(),
        numPages,
      } }).then((result) => {
        promptFn(db);
      });
    }
  });
}

function scheduleManu(db, idPerson, idManu, issueYear, issuePPN, promptFn) {
  checkManuscript(db, idPerson, idManu, 'scheduled for publication', (check) => {
    if (!check) { promptFn(db); return; }
    db.collection('issues').findOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((issue) => {
      if (issue === null) {
        console.log('ERROR: Issue does not exist');
        promptFn(db);
        return;
      } else if (issue.printDate !== undefined) {
        console.log('ERROR: Issue already published');
        promptFn(db);
        return;
      }
      db.collection('manuscripts').find({ issue: issue._id }).sort({ orderInIssue: -1 }).toArray()
    .then((result) => {
      if (result === null || result.length === null || result.length === 0) {
        db.collection('manuscripts').updateOne({ _id: parseInt(idManu, 10) }, { $set: {
          status: 'scheduled for publication',
          timestamp: new Date().toString(),
          issue: issue._id,
          orderInIssue: 1,
          pageNumber: 1,
        } }).then((done) => {
          console.log('Manuscript scheduled!');
          promptFn(db);
        });
      } else {
        db.collection('manuscripts')
        .findOne({ _id: parseInt(idManu, 10) })
        .then((man) => {
          const totalPages = result.reduce((prev, cur) => {
            return parseInt(prev, 10) + parseInt(cur.numPages, 10);
          }, 0);
          if (totalPages + parseInt(man.numPages, 10) > 100) {
            console.log('ERROR: Issue cannot contain more than 100 pages');
            promptFn(db);
          } else {
            db.collection('manuscripts').updateOne({ _id: parseInt(idManu, 10) }, { $set: {
              status: 'scheduled for publication',
              timestamp: new Date().toString(),
              issue: issue._id,
              orderInIssue: result[0].orderInIssue + 1,
              pageNumber: totalPages + 1,
            } }).then((done) => {
              console.log('Manuscript scheduled!');
              promptFn(db);
            });
          }
        });
      }
    });
    });
  });
}

function scheduleManuOrder(db, idPerson, idManu, issueYear, issuePPN, orderInIssue, pageNumber, promptFn) {
  checkManuscript(db, idPerson, idManu, 'scheduled for publication', (check) => {
    if (!check) { promptFn(db); return; }
    db.collection('issues').findOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((issue) => {
      if (issue === null) {
        console.log('ERROR: Issue does not exist');
        promptFn(db);
        return;
      }
      db.collection('manuscripts').updateOne({ _id: parseInt(idManu, 10) }, { $set: {
        status: 'scheduled for publication',
        timestamp: new Date().toString(),
        issue: issue._id,
        orderInIssue,
        pageNumber,
      } }).then((done) => {
        console.log('Manuscript scheduled!');
        promptFn(db);
      });
    });
  });
}

function create(db, issueYear, issuePPN, promptFn) {
  db.collection('issues').findOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((issue) => {
    if (issue !== null) {
      console.log('ERROR: The issue already exists');
      promptFn(db);
    } else {
      db.collection('issues').insertOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((result) => {
        console.log('Issue created!');
        promptFn(db);
      });
    }
  });
}

function publishIssue(db, issueYear, issuePPN, promptFn) {
  checkIssue(db, issueYear, issuePPN, (check) => {
    if (!check) {
      promptFn(db);
      return;
    }
    db.collection('issues').findOne({ year: issueYear, publicationPeriodNumber: issuePPN }).then((issue) => {
      db.collection('manuscripts').update({ issue: issue._id }, { $set: {
        status: 'published',
        timestamp: new Date().toString(),
      } }).then((result) => {
        db.collection('issues').update({ year: issueYear, publicationPeriodNumber: issuePPN }, { $set: { printDate: new Date().toString() } })
        .then((issueResult) => {
          console.log('Issue published!');
          promptFn(db);
        });
      });
    });
  });
}

const handleEditorInput = (db, editorId, input, promptFn) => {
  if (input.match(assign) !== null) {
    const values = assign.exec(input);
    assignManu(db, editorId, values[1], values[2], promptFn);
  } else if (input.match(statusMan) !== null) {
    const values = statusMan.exec(input);
    getManStatus(db, editorId, values[1], promptFn);
  } else if (input.match(editorAccept) !== null) {
    const values = editorAccept.exec(input);
    acceptManu(db, editorId, values[1], promptFn);
  } else if (input.match(editorReject) !== null) {
    const values = editorReject.exec(input);
    rejectManu(db, editorId, values[1], promptFn);
  } else if (input.match(typeset)) {
    const values = typeset.exec(input);
    typesetManu(db, editorId, values[1], values[2], promptFn);
  } else if (input.match(schedule)) {
    const values = schedule.exec(input);
    scheduleManu(db, editorId, values[1], values[2], values[3], promptFn);
  } else if (input.match(scheduleOrder)) {
    const values = scheduleOrder.exec(input);
    scheduleManuOrder(db, editorId, values[1], values[2], values[3], values[4], values[5], promptFn);
  } else if (input.match(publish)) {
    const values = publish.exec(input);
    publishIssue(db, values[1], values[2], promptFn);
  } else if (input.match(createIssue)) {
    const values = createIssue.exec(input);
    create(db, values[1], values[2], promptFn);
  } else if (input.match(status) !== null) {
    getStatus(db, editorId, promptFn);
  } else if (input.match(registerEditor)) {
    const values = registerEditor.exec(input);
    register(db, values[1], values[2], promptFn);
  } else {
    console.log('invalid command for editor');
    promptFn(db);
  }
};

export default handleEditorInput;
