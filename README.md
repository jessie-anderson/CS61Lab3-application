# Node.JS Journal Database

## Setup
The setup files for the basic database collections are included in the `./setup` folder.

To execute run the following:  
`mongo <monogo options> MMSetup.js`  
The database will be populated with the our Journal Database schema.

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
* issues

(issues uses integer IDs in our database setup for consistency, but since it is always referenced by year and publication period number new issues use ObjectIDs)

## Starting the application

To run the command line interface, first make sure Node.js and npm are installed on your computer. Run the command:  
`npm install`  
to install dependencies. Then run:  
`npm start`  
and the shell will start.

## Usage
After starting the application/connecting to the database the user must first either login or register:

* `register author <fname> <lname> <email> <address>` puts a new author in the database
* `register editor <fname> <lname>` puts a new editor in the database
* `register reviewer <fname> <lname> <affiliation> <RICode1> [<RICode2> <RICode3>]` puts a new reviewer in the database; `<RICode2>` and `<RICode3>` are optional parameters
* `login <idPerson>` prompts a password input, and on entering the correct password the user with the given ID is logged in. The password for all users in our dummy data is "p".
* `exit` stops the program


### Editor Interface
The editor interface supports the following queries

Commands:
* `status`

  lists idManuscript status ordered by status, then idManuscript in the order:
  'submitted' --> 'under review' --> 'rejected' --> 'accepted' --> 'typesetting' --> 'scheduled for publication' --> 'published'
* `status <idManuscript>`

  lists details of a particular manuscript, i.e.
  idManuscript, title, RICode Interest, status, timestamp, affiliation (of primary author at time of submission), number of pages, Issue year and publication period number, order in issue, pageNumber
* `assign <idManuscript> <idPerson of Reviewer>`

  creates and assigns a review of a given manuscript to a particular Reviewer. The two must have the same RICode for a review to be assigned. For our data manuscript 2 and reviewer 5 have matching RICodes.
* `accept <idManuscript>`

  sets the manuscript to the assigned status
* `reject <idManuscript>`

  sets the manuscript to the rejected status
* `typeset <idManuscript> <pp>`

  sets the manuscript to the 'typesetting' status with the number of pages `pp`
* `schedule <idManuscript> <Issue year> <Issue publication period number>`

  sets the manuscript to the 'scheduled for publication' status. The order in issue and pageNumber become the default next values.
* `schedule with <idManuscript> <Issue_year> <Issue publication period number> <order in issue> <page number>`

  sets the manuscript to the 'scheduled for publication' status. The order in issue and page number become the values specified by the command.

  Note: the user can reschedule the manuscript and reset the order and pageNumber with this command.
* `publish <Issue year> <Issue publication period number>`

  publishes a given issue and sets the status of manuscripts in the issues to 'published'. A published issue cannot be empty and must have a continuous issue ordering starting from 1.
* `create <Issue year> <Issue publication period number>`

  creates an unpublished issue with a given issue year and publication period number
* `logout`

  logs out of the Editor interface and back into the login screen

## Author

Commands:
* `submit <title> <Affiliation> <RICode> <filename> <author2> <author3> <author4>` submits a new manuscript. Note we changed the order of the input args so that filename was before the authors; made regular expression matching easier. There may be any number of secondary authors provided, or none at all.
* `status`
* `retract <manId>` retracts manuscript with given id from system

## Reviewer
* `resign <id>` removes reviewer from system
* `accept <manuscriptId> <appropriateness> <clarity> <methodology> <contribution>`
* `reject <manuscriptId> <appropriateness> <clarity> <methodology> <contribution>`

Note: for `accept` and `reject`, the fields   `<appropriateness> <clarity> <methodology> <contribution>` must be integers between 1 and 10.
