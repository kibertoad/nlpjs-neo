# Examples

Runnable examples for the packages in this repository. They import the TypeScript sources of
the workspace directly (`../../packages/...`), so run them from a clone with a TypeScript
runner:

```bash
pnpm install
pnpm dlx tsx examples/12-similarity/01-levenshtein.js
```

In your own project the same code works with the published packages, and plain `node` runs
it: every example has the published import next to the workspace one, commented out. Swap
the relative import for `node-nlp-neo` or for the `@nlpjs-neo/*` package named in the
example.

[07-nlpjs-on-aws-lambda](./07-nlpjs-on-aws-lambda) is the exception: `sam build` only
packages what sits under the function's own directory, so those two functions depend on the
published `node-nlp-neo` and are deployed rather than run from a clone.

| Example | What it shows |
| ------- | ------------- |
| [01-container](./01-container) | The IoC container: registering plugins, settings and pipelines by hand |
| [02-qna-classic](./02-qna-classic) | `NlpManager` trained in code, saving the model to a file and loading it back |
| [03-qna-pipelines](./03-qna-pipelines) | The same bot driven by `conf.json`, `corpus.json` and `pipelines.md` |
| [06-huge-ner](./06-huge-ner) | NER over a large entity list (every airport), with the threshold set for dictionary matching |
| [07-nlpjs-on-aws-lambda](./07-nlpjs-on-aws-lambda) | Deploying a bot as an AWS Lambda function, with the model in `/tmp` or in DynamoDB |
| [08-neural-network](./08-neural-network) | `NeuralNetwork` on its own: training, export and import, logging, parameters |
| [09-logger](./09-logger) | The default loggers and how to register your own |
| [10-remove-emojis](./10-remove-emojis) | `removeEmojis` from `@nlpjs-neo/emoji` |
| [11-console-connector](./11-console-connector) | Talking to a bot from the terminal, with and without the NLP |
| [12-similarity](./12-similarity) | Levenshtein distance, normalized similarity and spell checking |
| [13-languages](./13-languages) | Normalizer, tokenizer, stopwords, stemmer and sentiment, per language |
| [15-nlu](./15-nlu) | `NluNeural`, `BrainNLU`, `DomainManager` and `NluManager` |
| [17-ner-nlg](./17-ner-nlg) | Entities feeding the answers of the NLG |
| [18-ner-builtin-ms](./18-ner-builtin-ms) | Builtin entity extraction with Microsoft Recognizers |
| [19-ner-trim-entities](./19-ner-trim-entities) | Trim entities: after, before, between and the rest |
| [90-benchmark](./90-benchmark) | Accuracy of the classifier over an English and a Spanish corpus |

The documentation these examples go with is in [`docs/v5`](../docs/v5/README.md).
