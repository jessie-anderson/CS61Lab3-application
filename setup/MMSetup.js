//db = db.getSiblingDB('Team13DB');

// load data
var people = JSON.parse(cat('./people.json'));
var RICodes = JSON.parse(cat('./ricodes.json'));
var manuscripts = JSON.parse(cat('./manuscripts.json'));
var issues = JSON.parse(cat('./issues.json'));
var reviews = JSON.parse(cat('./reviews.json'));


// drop if already exits
db.people.drop();
db.ricodes.drop();
db.issues.drop();
db.manuscripts.drop();
db.reviews.drop();

// insert data that doesn't need objectIds from other collections
db.people.insertMany(people);
db.ricodes.insertMany(RICodes);
db.issues.insertMany(issues);
db.manuscripts.insertMany(manuscripts);
db.reviews.insertMany(reviews);
