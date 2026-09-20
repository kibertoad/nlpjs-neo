const array: any[] = [];
const charCodeCache: any[] = [];

/**
 * Calculates levenshtein distance
 * @param {string} left Left string
 * @param {string} right Right string
 * @returns {number} levenshtein distance of the two strings
 */
function leven(left, right) {
  if (left.length > right.length) {
    // oxlint-disable-next-line no-param-reassign
    [left, right] = [right, left];
  }
  let leftLength = left.length - 1;
  let rightLength = right.length - 1;
  while (
    leftLength > 0 &&
    left.charCodeAt(leftLength) === right.charCodeAt(rightLength)
  ) {
    leftLength -= 1;
    rightLength -= 1;
  }
  leftLength += 1;
  rightLength += 1;
  let start = 0;
  while (
    start < leftLength &&
    left.charCodeAt(start) === right.charCodeAt(start)
  ) {
    start += 1;
  }
  leftLength -= start;
  rightLength -= start;
  if (leftLength === 0) {
    return rightLength;
  }
  for (let i = 0; i < leftLength; i += 1) {
    charCodeCache[i] = left.charCodeAt(start + i);
    array[i] = i + 1;
  }
  let bCharCode;
  let result;
  let temp;
  let temp2;
  let j = 0;
  while (j < rightLength) {
    bCharCode = right.charCodeAt(start + j);
    temp = j;
    j += 1;
    result = j;
    for (let i = 0; i < leftLength; i += 1) {
      /* oxlint-disable */
      temp2 = (temp + (bCharCode !== charCodeCache[i])) | 0;
      /* oxlint-enable */
      temp = array[i];
      if (temp > result) {
        array[i] = temp2 > result ? result + 1 : temp2;
      } else {
        array[i] = temp2 > temp ? temp + 1 : temp2;
      }
      result = array[i];
    }
  }
  return result;
}

export default leven;
