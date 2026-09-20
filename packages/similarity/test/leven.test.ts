import { leven } from '../src/index.js';

describe('levenshtein', () => {
  test('Should return correct levenshtein distance', () => {
    expect(leven('potatoe', 'potatoe')).toEqual(0);
    expect(leven('', '123')).toEqual(3);
    expect(leven('123', '')).toEqual(3);
    expect(leven('a', 'b')).toEqual(1);
    expect(leven('ab', 'ac')).toEqual(1);
    expect(leven('abc', 'axc')).toEqual(1);
    expect(leven('xabxcdxxefxgx', '1ab2cd34ef5g6')).toEqual(6);
    expect(leven('xabxcdxxefxgx', 'abcdefg')).toEqual(6);
    expect(leven('javawasneat', 'scalaisgreat')).toEqual(7);
    expect(leven('example', 'samples')).toEqual(3);
    expect(leven('forward', 'drawrof')).toEqual(6);
    expect(leven('sturgeon', 'urgently')).toEqual(6);
    expect(leven('levenshtein', 'frankenstein')).toEqual(6);
    expect(leven('distance', 'difference')).toEqual(5);
    expect(leven('distance', 'eistancd')).toEqual(2);
    expect(leven('你好世界', '你好')).toEqual(2);
    expect(
      leven('因為我是中國人所以我會說中文', '因為我是英國人所以我會說英文')
    ).toEqual(2);
    expect(leven('mikailovitch', 'Mikhaïlovitch')).toEqual(3);
  });
  test('Should return correct levenshtein distance for long texts', () => {
    const text1 =
      'Morbi interdum ultricies neque varius condimentum. Donec volutpat turpis interdum metus ultricies vulputate. Duis ultricies rhoncus sapien, sit amet fermentum risus imperdiet vitae. Ut et lectus';
    const text2 =
      'Duis erat dolor, cursus in tincidunt a, lobortis in odio. Cras magna sem, pharetra et iaculis quis, faucibus quis tellus. Suspendisse dapibus sapien in justo cursus';
    expect(leven(text1, text2)).toEqual(143);
  });
  test('Should return the length of first string if the second is empty', () => {
    expect(leven('mikailovitch', '')).toEqual(12);
  });
  test('Should return the length of second string if the first is empty', () => {
    expect(leven('', 'mikailovitch')).toEqual(12);
  });
});
