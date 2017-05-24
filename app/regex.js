// register
export const registerEditor = /register\s+editor\s+(\w+)\s+(\w+)/;
export const registerAuthor = /register\s+author\s+(\w+)\s+(\w+)/;
export const registerReviewer = /register\s+reviewer\s+(\w+)\s+(\w+)/;

// common
export const login = /login\s+(\w+)/;
export const status = /status/;

// author
export const sumbit = /submit\s+(\w+)\s+(\w+)\s+(\d+)\s+(((\w+)\s+)+)\s+(\w+$)/;
export const retract = /retract\s+(\w+)/;

// reviewer
export const resign = /resign\s+(\w+)/;
export const reject = /reject\s+(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
export const accept = /accept\s+(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
