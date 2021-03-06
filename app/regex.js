// register
export const registerEditor = /register\s+editor\s+(\w+)\s+(\w+)/;
export const registerAuthor = /register\s+author\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/;
export const registerReviewer = /register\s+reviewer\s+(\w+)\s+(\w+)(( \d+)+)/;

// common
export const login = /login\s+(\w+)/;
export const status = /status\s*/;

// author
export const submit = /submit\s+(\w+)\s+(\w+)\s+(\d+)(( \w+)+)\s+(\w+$)/;
export const retract = /retract\s+(\d+)/;

// reviewer
export const resign = /resign\s+(\w+)/;
export const reviewerReject = /reject\s+(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
export const reviewerAccept = /accept\s+(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;

// editor
export const statusMan = /status\s+(\w+)\s*/;
export const assign = /assign\s+(\w+)\s+(\w+)\s*/;
export const editorReject = /reject\s+(\w+)\s*/;
export const editorAccept = /accept\s+(\w+)\s*/;
export const typeset = /typeset\s+(\w+)\s+(\d+)\s*/;
export const schedule = /schedule\s+(\w+)\s+(\d+)\s+([1234])\s*/;
export const scheduleOrder = /schedule\s+with\s+(\w+)\s+(\d+)\s+([1234])\s+(\d+)\s+(\d+)\s*/;
export const publish = /publish\s+(\d+)\s+([1234])\s*/;
export const createIssue = /create\s+(\d+)\s+([1234])\s*/; // creates issue
