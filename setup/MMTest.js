print("Manuscripts of each type:")
print("Submitted")
print(JSON.stringify(db.manuscripts.findOne({"status": "submitted"})));
print("\nUnder Review")
var underReview = db.manuscripts.findOne({"status": "under review"});
print(JSON.stringify(underReview));
print("\nRejected")
var rejected = db.manuscripts.findOne({"status":"rejected"});
print(JSON.stringify(rejected));
var review = db.reviews.findOne({"manuscript": rejected._id});
print("\nA review for this manuscript");
print(JSON.stringify(review));
print("\nreviewer for this review");
var reviewer = db.people.findOne({"_id":review.reviewer});
print(JSON.stringify(reviewer));
print("\nAccepted")
print(JSON.stringify(db.manuscripts.findOne({"status": "accepted"})));
var typesetting = db.manuscripts.findOne({"status": "typesetting"})
print("\nTypesetting")
print(JSON.stringify(typesetting));
print("\nThe editor for this manuscript");
print(JSON.stringify(db.people.findOne({"_id":typesetting.editor})));
print("\nScheduled for publication")
print(JSON.stringify(db.manuscripts.findOne({"status": "scheduled for publication"})));
print("\nPublished")
var published = db.manuscripts.findOne({"status":"published"});
print(JSON.stringify(published));
print("\nIssue for this manuscripts");
print(JSON.stringify(db.issues.findOne({"_id":published.issue})));
