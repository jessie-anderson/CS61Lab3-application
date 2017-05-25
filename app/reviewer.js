
const validateScores = (appropriateness, clarity, methodology, contribution) => {
  let a = true;
  let cl = true;
  let m = true;
  let co = true;

  if (appropriateness < 1 || appropriateness > 10) {
    console.log('Appropriateness must be between 1 and 10.');
    a = false;
  }
  if (clarity < 1 || clarity > 10) {
    console.log('Clarity must be between 1 and 10.');
    cl = false;
  }
  if (methodology < 1 || methodology > 10) {
    console.log('Methodology must be between 1 and 10.');
    m = false;
  }
  if (contribution < 1 || contribution > 10) {
    console.log('Contribution must be between 1 and 10.');
    co = false;
  }
  return a && cl && m && co;
};

export const acceptManuscript = (reviewerId, manuscriptId, appropriateness, clarity, methodology, contribution) => {
  if (!validateScores(appropriateness, clarity, methodology, contribution)) {
    console.log('Invalid scores; not submitting review.');
  } else {
    // submit review
  }
};

export const rejectManuscript = (reviewerId, manuscriptId, appropriateness, clarity, methodology, contribution) => {
  if (!validateScores(appropriateness, clarity, methodology, contribution)) {
    console.log('Invalid scores; not submitting review.');
  } else {
    // submit review
  }
};

export const resign = (reviewerId) => {

};

export const getStatus = (reviewerId) => {

};
