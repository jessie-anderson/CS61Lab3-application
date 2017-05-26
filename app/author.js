import { submit, retract, status } from './regex';

const submitManuscript = (db, authorId, title, affiliation, RICode, authors, filename) => {

};

const getStatus = (db, authorId) => {

};

const retractManuscript = (db, authorId, manuscriptId) => {

};

const handleAuthorInput = (db, input, authorId) => {
  let values;
  if (input.match(submit) !== null) {
    values = submit.exec(input);
    const title = values[1];
    const affiliation = values[2];
    const RICode = parseInt(values[3], 10);
    const authors = values[4].trim().split(/s+/);
    const filename = values[values.length - 1];
    submitManuscript(db, authorId, title, affiliation, RICode, authors, filename);
  } else if (input.match(retract) !== null) {
    values = retract.exec(input);
    retractManuscript(db, authorId, values[1]);
  } else if (input.match(status) !== null) {
    getStatus(db, authorId);
  } else {
    console.log('invalid command for author');
  }
};

export default handleAuthorInput;
