import { BaseStemmer } from '@nlpjs-neo/core';

class StemmerBn extends BaseStemmer {
  declare static dict: any;
  declare static suffixes: any;

  constructor(container) {
    super(container);
    this.name = 'stemmer-bn';
  }

  processSuffixes(word) {
    const maxSuffixes = word.length > 7 ? 6 : word.length - 2;
    for (let i = maxSuffixes; i >= 0; i -= 1) {
      const suffixes = StemmerBn.suffixes[i];
      for (let j = 0; j < suffixes.length; j += 1) {
        if (word.endsWith(suffixes[j])) {
          return word.slice(0, -suffixes[j].length);
        }
      }
    }
    return word;
  }

  innerStem() {
    let word = this.getCurrent();
    word = this.processSuffixes(word);
    word = StemmerBn.dict[word] || word;
    this.setCurrent(word);
  }
}

StemmerBn.suffixes = [
  ['য়', 'ও', 'র', 'ই', 'ি'],
  [
    'তি',
    'েই',
    'ের',
    'িত',
    'তা',
    'েও',
    'ীয়',
    'কে',
    'তে',
    'টি',
    'িক',
    'রা',
    'টা',
    'সহ',
    'রই',
  ],
  [
    'শীল',
    'তায়',
    'তাম',
    'বলী',
    'লেন',
    'টিও',
    'েরও',
    'টাও',
    'টিই',
    'ছেন',
    'ত্ব',
    'তার',
    'হীন',
    'রাও',
    'খোর',
    'তেও',
    'টাই',
    'কেই',
    'কেও',
    'টার',
    'ন্ত',
    'দের',
    'টির',
    'টায়',
    'য়ের',
    'য়েন',
  ],
  [
    'ভাবে',
    'টিতে',
    'টাতে',
    'টিকে',
    'ত্বই',
    'টারই',
    'দেরও',
    'টাকে',
    'চ্ছি',
    ' েরই',
    'গুলো',
    'মূলক',
    'গুলা',
    'কারী',
    'ছিলে',
    'টুকু',
    'গুলি',
  ],
  [
    'গুলোর',
    'কারীই',
    'ত্বকে',
    'কারীও',
    'টুকুর',
    'গুলোই',
    ' িদের',
    'টাতেই',
    'টুকুও',
    'ছিলাম',
    'কারীর',
    'টুকুই',
    'িতেছি',
    'ত্বের',
    'দেরকে',
    'গুলোয়',
    'টাকেই',
  ],
  [
    'কারীসহ',
    'কারীরা',
    'কারীকে',
    'দেরকেও',
    'দেরকেই',
    'চ্ছিলে',
    'গুলোতে',
    'টুকুরই',
    'গুলোকে',
    'গুলিতে',
    'টুকুতে',
  ],
  ['গুলোকেও', 'টুকুতেও', 'চ্ছিলাম', 'ত্বমূলক', 'কারীদের', 'গুলোতেও', 'কারীরাও'],
];

StemmerBn.dict = {
  এগি: 'যাওয়া',
  এগ: 'যাওয়া',
  গিয়ে: 'যাওয়া',
  খাই: 'খাওয়া',
  যা: 'যাওয়া',
  খা: 'খাওয়া',
  দে: 'দেওয়া',
  খাও: 'খাওয়া',
  যাও: 'যাওয়া',
  দেও: 'দেওয়া',
  খেয়: 'খাওয়া',
  চেয়: 'চাওয়া',
};

export default StemmerBn;
