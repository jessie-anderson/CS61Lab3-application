var db = db.getSiblingDB('Team13DB');

// load data
const people = JSON.parse(cat('./people.json'));
const RICodes = JSON.parse(cat('./ricodes.json'));
const manuscripts = JSON.parse(cat('./manuscripts.json'));
const issues = JSON.parse(cat('./issues.json'));
const reviews = JSON.parse(cat('./reviews.json'));


// drop if already exits
db.people.drop();
db.ricodes.drop();
db.issues.drop();
db.manuscripts.drop();
db.reviews.drop();
db.counters.drop();

// insert data that doesn't need objectIds from other collections
db.people.insertMany(people);
db.ricodes.insertMany(RICodes);
db.issues.insertMany(issues);
db.manuscripts.insertMany(manuscripts);
db.reviews.insertMany(reviews);

const maxPersonId = db.people.find({}).sort({ _id: -1 })[0]._id;
const maxManuscriptId = db.manuscripts.find({}).sort({ _id: -1 })[0]._id;
db.counters.insertMany([{ _id: 'people', seq: maxPersonId }, { _id: 'manuscripts', seq: maxManuscriptId }]);
