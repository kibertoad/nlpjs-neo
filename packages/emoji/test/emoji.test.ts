import { removeEmojis } from '../src/index.js';

describe('removeEmojis', () => {
  it('should return input if is falsy', () => {
    const actual = removeEmojis(null);
    expect(actual).toEqual(null);
  });
  it('should parse emojis and replace them', () => {
    const actual = removeEmojis('I ❤️  ☕️! -  😯⭐️😍  ::: test : : 👍+');
    const expected =
      'I :heart:  :coffee:! -  :hushed::star::heart_eyes:  ::: test : : :thumbsup:+';
    expect(actual).toEqual(expected);
  });

  it('Should leave unknown emoji', () => {
    const actual = removeEmojis('I ⭐️ :another_one: 🦢');
    const expected = 'I :star: :another_one: 🦢';
    expect(actual).toEqual(expected);
  });

  it('Should parse a complex emoji', () => {
    const actual = removeEmojis('I love 👩‍❤️‍💋‍👩');
    const expected = 'I love :woman-kiss-woman:';
    expect(actual).toEqual(expected);
  });

  it('Should parse flags', () => {
    const actual = removeEmojis('The flags of 🇲🇽 and 🇲🇦 are not the same');
    const expected = 'The flags of :flag-mx: and :flag-ma: are not the same';
    expect(actual).toEqual(expected);
  });
});
