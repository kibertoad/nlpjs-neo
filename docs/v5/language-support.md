# Language Support

## Supported languages

Native Support means that the tokenizer and stemmer are included in javascript in NLP.js.

Microsoft Builtins mean that the Builtin Entity extraction is supported directly in javascript, while the ones supported by Duckling requires the deployment of a Duckling instance.

Languages not included in this list can be still supported, but without stemming, only tokenizing. That means less precision, but most of the time this can be good enough. As an example you can use it for fantasy languages (during unit testing you'll find tests in klingon from Star Trek).

| Locale | Language              | Native Support | Microsoft Builtins | Duckling Builtins | Sentiment |
|--------|-----------------------|----------------|--------------------|-------------------|-----------|
| af     | Afrikaans             |                |                    |         X         |           |
| sq     | Albanian              |                |                    |                   |           |
| ar     | Arabic                |        X       |                    |         X         |     X     |
| an     | Aragonese             |                |                    |                   |           |
| hy     | Armenian              |        X       |                    |                   |     X     |
| ast    | Asturian              |                |                    |                   |           |
| az     | Azerbaijani           |                |                    |                   |           |
| ba     | Bashkir               |                |                    |                   |           |
| eu     | Basque                |        X       |                    |                   |     X     |
| bar    | Bavarian              |                |                    |                   |           |
| be     | Belarusian            |                |                    |                   |           |
| bn     | Bengali               |        X       |                    |         X         |     X     |
| bpy    | Bishnupriya Manipuri  |                |                    |                   |           |
| bs     | Bosnian               |                |                    |                   |           |
| br     | Breton                |                |                    |                   |           |
| bg     | Bulgarian             |                |                    |         X         |           |
| my     | Burmese               |                |                    |         X         |           |
| ca     | Catalan               |        X       |                    |                   |     X     |
| ceb    | Cebuano               |                |                    |                   |           |
| ce     | Chechen               |                |                    |                   |           |
| zh     | Chinese (Simplified)  |        X       |          X         |         X         |           |
| zh     | Chinese (Traditional) |        X       |          X         |         X         |           |
| cv     | Chuvash               |                |                    |                   |           |
| hr     | Croatian              |                |                    |         X         |           |
| cs     | Czech                 |        X       |                    |                   |     X     |
| da     | Danish                |        X       |                    |         X         |     X     |
| nl     | Dutch                 |        X       |                    |         X         |     X     |
| en     | [English](../../packages/lang-en/README.md)             |        X       |          X         |         X         |     X     |
| et     | Estonian              |                |                    |         X         |           |
| fi     | Finnish               |        X       |                    |         X         |     X     |
| fr     | French                |        X       |          X         |         X         |     X     |
| gl     | Galician              |        X       |                    |                   |     X     |
| ka     | Georgian              |                |                    |         X         |           |
| de     | German                |        X       |                    |         X         |     X     |
| el     | Greek                 |        X       |                    |         X         |     X     |
| gu     | Gujarati              |                |                    |                   |           |
| ht     | Haitian               |                |                    |                   |           |
| he     | Hebrew                |                |                    |         X         |           |
| hi     | Hindi                 |        X       |                    |         X         |     X     |
| hu     | Hungarian             |        X       |                    |         X         |     X     |
| is     | Icelandic             |                |                    |         X         |           |
| io     | Ido                   |                |                    |                   |           |
| id     | [Indonesian](../../packages/lang-id/README.md)          |        X       |                    |         X         |     X     |
| ga     | Irish                 |        X       |                    |         X         |     X     |
| it     | [Italian](../../packages/lang-it/README.md)             |        X       |                    |         X         |     X     |
| ja     | Japanese              |        X       |          X         |         X         |           |
| jv     | Javanese              |                |                    |                   |           |
| kn     | Kannada               |                |                    |         X         |           |
| kk     | Kazakh                |                |                    |                   |           |
| ky     | Kirghiz               |                |                    |                   |           |
| ko     | Korean                |        X       |                    |         X         |     X     |
| la     | Latin                 |                |                    |                   |           |
| lv     | Latvian               |                |                    |                   |           |
| lt     | Lithuanian            |        X       |                    |                   |     X     |
| lmo    | Lombard               |                |                    |                   |           |
| nds    | Low Saxon             |                |                    |                   |           |
| lb     | Luxembourgish         |                |                    |                   |           |
| mk     | Macedonian            |                |                    |                   |           |
| mg     | Malagasy              |                |                    |                   |           |
| ms     | Malay                 |        X       |                    |                   |           |
| ml     | Malayalam             |                |                    |         X         |           |
| mr     | Marathi               |                |                    |                   |           |
| min    | Minangkabau           |                |                    |                   |           |
| mn     | Mongolian             |                |                    |         X         |           |
| ne     | Nepali                |        X       |                    |         X         |     X     |
| new    | Newar                 |                |                    |                   |           |
| nb     | Norwegian (Bokmål)    |        X       |                    |         X         |     X     |
| nn     | Norwegian (Nynorsk)   |                |                    |                   |           |
| oc     | Occitan               |                |                    |                   |           |
| fa     | Persian (Farsi)       |        X       |                    |                   |     X     |
| pms    | Piedmontese           |                |                    |                   |           |
| pl     | Polish                |        X       |                    |         X         |     X     |
| pt     | Portuguese            |        X       |          X         |         X         |     X     |
| pa     | Punjabi               |                |                    |                   |           |
| ro     | Romanian              |        X       |                    |         X         |     X     |
| ru     | Russian               |        X       |                    |         X         |     X     |
| sco    | Scots                 |                |                    |                   |           |
| sr     | Serbian               |        X       |                    |                   |     X     |
| hbs    | Serbo-Croatian        |                |                    |                   |           |
| scn    | Sicilian              |                |                    |                   |           |
| sk     | Slovak                |                |                    |         X         |           |
| sl     | Slovenian             |        X       |                    |                   |     X     |
| az     | South Azerbaijani     |                |                    |                   |           |
| es     | [Spanish](../../packages/lang-es/README.md)             |        X       |          X         |         X         |     X     |
| su     | Sundanese             |                |                    |                   |           |
| sw     | Swahili               |                |                    |         X         |           |
| sv     | Swedish               |        X       |                    |         X         |     X     |
| tl     | Tagalog               |        X       |                    |                   |     X     |
| tg     | Tajik                 |                |                    |                   |           |
| ta     | Tamil                 |        X       |                    |         X         |     X     |
| tt     | Tatar                 |                |                    |                   |           |
| te     | Telugu                |                |                    |                   |           |
| th     | Thai                  |        X       |                    |         X         |     X     |
| tr     | Turkish               |        X       |                    |         X         |     X     |
| uk     | Ukrainian             |        X       |                    |         X         |     X     |
| ur     | Urdu                  |                |                    |                   |           |
| uz     | Uzbek                 |                |                    |                   |           |
| vi     | Vietnamese            |                |                    |         X         |           |
| vo     | Volapük               |                |                    |                   |           |
| war    | Waray-Waray           |                |                    |                   |           |
| cy     | Welsh                 |                |                    |                   |           |
| fy     | West Frisian          |                |                    |                   |           |
| pa     | Western Punjabi       |                |                    |                   |           |
| yo     | Yoruba                |                |                    |                   |           |

## Using a language

Each natively supported locale is a package, `@nlpjs-neo/lang-<locale>`, exporting a plugin
class named `Lang<Locale>`. `node-nlp-neo` depends on `@nlpjs-neo/lang-all`, so it already
has all of them; with the smaller packages you install and mount the ones you need:

```bash
pnpm add @nlpjs-neo/lang-ko
```

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { LangKo } from '@nlpjs-neo/lang-ko';

const container = await containerBootstrap();
container.use(LangKo);
```

From a `conf.json` the same plugin is named in the `use` list, for example
`"use": ["Basic", "LangEn", "ConsoleConnector"]`. Not every language package is resolvable
by name yet; when the name is not known by the loader, mount the class in code as above.


## Sentiment Analysis

| Language             | AFINN | Senticon | Pattern |
| :------------------- | :---: | :------: | :-----: |
| Arabic (ar)          |   X   |          |         |
| Armenian (hy)        |   X   |          |         |
| Basque (eu)          |       |    X     |         |
| Bengali (bn)         |   X   |          |         |
| Catalan (ca)         |       |    X     |         |
| Czech (cs)           |   X   |          |         |
| Danish (da)          |   X   |          |         |
| Dutch (nl)           |       |          |    X    |
| English (en)         |   X   |    X     |    X    |
| Finnish (fi)         |   X   |          |         |
| French (fr)          |       |          |    X    |
| Galician (gl)        |       |    X     |         |
| German (de)          |       |    X     |         |
| Greek (el)           |   X   |          |         |
| Hindi (hi)           |   X   |          |         |
| Hungarian (hu)       |   X   |          |         |
| Indonesian (id)      |   X   |          |         |
| Irish (ga)           |   X   |          |         |
| Italian (it)         |       |          |    X    |
| Korean (ko)          |   X   |          |         |
| Lithuanian (lt)      |   X   |          |         |
| Nepali (ne)          |   X   |          |         |
| Norwegian (no)       |   X   |          |         |
| Persian (Farsi) (fa) |   X   |          |         |
| Polish (pl)          |   X   |          |         |
| Portuguese (pt)      |   X   |          |         |
| Romanian (ro)        |   X   |          |         |
| Russian (ru)         |   X   |          |         |
| Serbian (sr)         |   X   |          |         |
| Slovenian (sl)       |   X   |          |         |
| Spanish (es)         |   X   |    X     |         |
| Swedish (sv)         |   X   |          |         |
| Tagalog (tl)         |   X   |          |         |
| Tamil (ta)           |   X   |          |         |
| Thai (th)            |   X   |          |         |
| Turkish (tr)         |   X   |          |         |
| Ukrainian (uk)       |   X   |          |         |

## Example with several languages

This example uses three languages, one of them Klingon, to show that the NLP works even for
a language without native support, because it uses the tokenizer but not the stemmers.

```javascript
import { NlpManager } from 'node-nlp-neo';

(async () => {
  const manager = new NlpManager({ languages: ['en', 'ko', 'kl'] });
  // Gives a name for the fantasy language
  manager.describeLanguage('kl', 'Klingon');
  // Train Klingon
  manager.addDocument('kl', 'nuqneH', 'hello');
  manager.addDocument('kl', 'maj po', 'hello');
  manager.addDocument('kl', 'maj choS', 'hello');
  manager.addDocument('kl', 'maj ram', 'hello');
  manager.addDocument('kl', `nuqDaq ghaH ngaQHa'moHwI'mey?`, 'keys');
  manager.addDocument('kl', `ngaQHa'moHwI'mey lujta' jIH`, 'keys');
  // Train Korean
  manager.addDocument('ko', '여보세요', 'greetings.hello');
  manager.addDocument('ko', '안녕하세요!', 'greetings.hello');
  manager.addDocument('ko', '여보!', 'greetings.hello');
  manager.addDocument('ko', '어이!', 'greetings.hello');
  manager.addDocument('ko', '좋은 아침', 'greetings.hello');
  manager.addDocument('ko', '안녕히 주무세요', 'greetings.hello');
  manager.addDocument('ko', '안녕', 'greetings.bye');
  manager.addDocument('ko', '친 공이 타자', 'greetings.bye');
  manager.addDocument('ko', '상대가 없어 남는 사람', 'greetings.bye');
  manager.addDocument('ko', '지엽적인 것', 'greetings.bye');
  manager.addDocument('en', 'goodbye for now', 'greetings.bye');
  manager.addDocument('en', 'bye bye take care', 'greetings.bye');
  manager.addDocument('en', 'okay see you later', 'greetings.bye');
  manager.addDocument('en', 'bye for now', 'greetings.bye');
  manager.addDocument('en', 'i must go', 'greetings.bye');
  manager.addDocument('en', 'hello', 'greetings.hello');
  manager.addDocument('en', 'hi', 'greetings.hello');
  manager.addDocument('en', 'howdy', 'greetings.hello');

  // Train also the NLG
  manager.addAnswer('en', 'greetings.bye', 'Till next time');
  manager.addAnswer('en', 'greetings.bye', 'see you soon!');
  manager.addAnswer('en', 'greetings.hello', 'Hey there!');
  manager.addAnswer('en', 'greetings.hello', 'Greetings!');

  // Train and save the model.
  await manager.train();
  manager.save();

  // English and Korean can be automatically detected
  manager.process('I have to go').then(console.log);
  manager.process('상대가 없어 남는 편').then(console.log);
  // For Klingon, as it cannot be automatically detected, 
  // you must provide the locale
  manager.process('kl', `ngaQHa'moHwI'mey nIH vay'`).then(console.log);
})();
```
