import {
  regexEmail,
  regexURL,
  regexIPv4,
  regexIPv6,
  regexHexColor,
  regexTime,
  regexPhone,
  regexHashtag,
  regexNumber,
  regexDate,
} from './common-regex.js';
import type { BuiltinEdge } from './types.js';

/** Every match of one expression, as entities of the given name and kind. */
function recognize(
  text: string,
  regex: RegExp,
  entityName?: string,
  typeName?: string
): BuiltinEdge[] {
  let match = regex.exec(text);
  const result: BuiltinEdge[] = [];
  while (match !== null) {
    const utteranceText = match[0];
    const obj: BuiltinEdge = {
      start: match.index,
      end: match.index + utteranceText.length - 1,
      len: utteranceText.length,
      accuracy: 0.95,
      sourceText: utteranceText,
      utteranceText,
      entity: entityName,
      resolution: { value: utteranceText },
    };
    if (typeName) {
      obj.resolution.type = typeName;
    }
    result.push(obj);
    match = regex.exec(text);
  }
  return result;
}

const recognizeEmail = (text: string) => recognize(text, regexEmail, 'email');
const recognizeURL = (text: string) => recognize(text, regexURL, 'url');
const recognizeIPv4 = (text: string) =>
  recognize(text, regexIPv4, 'ip', 'ipv4');
const recognizeIPv6 = (text: string) =>
  recognize(text, regexIPv6, 'ip', 'ipv6');
const recognizeHexColor = (text: string) =>
  recognize(text, regexHexColor, 'color', 'hexcolor');
const recognizeTime = (text: string) => recognize(text, regexTime);
const recognizePhoneNumber = (text: string) =>
  recognize(text, regexPhone, 'phonenumber');
const recognizeIpAddress = (text: string) => {
  const ipv4 = recognizeIPv4(text);
  const ipv6 = recognizeIPv6(text);
  const result = [...ipv4, ...ipv6];
  return result;
};
const recognizeHashtag = (text: string) =>
  recognize(text, regexHashtag, 'hashtag');
const recognizeNumber = (text: string) => {
  const numbers = recognize(text, regexNumber, 'number');
  for (let i = 0; i < numbers.length; i += 1) {
    const number = numbers[i];
    number.resolution.value = parseFloat(number.resolution.value as string);
    number.resolution.type = Number.isInteger(number.resolution.value)
      ? 'integer'
      : 'float';
    console.log(numbers[i]);
  }
  return numbers;
};

function toDate(s: string): Date | undefined {
  let day: number;
  let month: number;
  let year: number;
  if (s.indexOf('-') === -1) {
    year = parseInt(s.slice(6, 10), 10);
    month = parseInt(s.slice(3, 5), 10) - 1;
    day = parseInt(s.slice(0, 2), 10);
  } else {
    year = parseInt(s.slice(0, 4), 10);
    month = parseInt(s.slice(5, 7), 10) - 1;
    day = parseInt(s.slice(8, 10), 10);
  }
  const date = new Date(year, month, day, 0, 0, 0, 0);
  if (date.getDate() === day && date.getMonth() === month) {
    return date;
  }
  return undefined;
}

const recognizeDate = (text: string) => {
  let match = regexDate.exec(text);
  const result: BuiltinEdge[] = [];
  while (match !== null) {
    const utteranceText = match[0];
    const date = toDate(utteranceText);
    if (date) {
      const obj = {
        start: match.index,
        end: match.index + utteranceText.length - 1,
        len: utteranceText.length,
        accuracy: 0.95,
        sourceText: utteranceText,
        utteranceText,
        entity: 'date',
        resolution: { value: date },
      };
      result.push(obj);
    }
    match = regexDate.exec(text);
  }
  return result;
};

const recognizers = {
  recognize,
  recognizeEmail,
  recognizeURL,
  recognizeIPv4,
  recognizeIPv6,
  recognizeHexColor,
  recognizeTime,
  recognizePhoneNumber,
  recognizeIpAddress,
  recognizeHashtag,
  recognizeNumber,
  recognizeDate,
};

export default recognizers;
export {
  recognize,
  recognizeEmail,
  recognizeURL,
  recognizeIPv4,
  recognizeIPv6,
  recognizeHexColor,
  recognizeTime,
  recognizePhoneNumber,
  recognizeIpAddress,
  recognizeHashtag,
  recognizeNumber,
  recognizeDate,
};
