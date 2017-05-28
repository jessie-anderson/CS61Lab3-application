# Node.JS Journal Database

## Credentials
The credentials of the database are:
USERID:Team13
PASSWORD:FjeyTVIlIUnnWtTY
DATABASE:Team13DB

The `server.js` file stores the credentials as constants and can be updated to reflect a different database.

## Notes about IDs
Due to the usage of the database where user login by id number and referencing manuscripts by id number, instead of using the default MongoDB ObjectID actual integers are set instead. This also enforces consistency when setting up our database.

The following IDs use integer IDs:
* people
* issues
* manuscripts

The following IDs use ObjectIDs:
* reviews


## Usage
After starting the application/connecting to the database the user must first either login or register:

* `login` <idPerson>
* `register author`
* `register reviewer`
*  `register editor`


### Editor Interface
The editor interface supports the following queries

* `status`
* `assign <idManuscript> <idReviewer>`
