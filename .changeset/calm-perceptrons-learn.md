---
'@nlpjs-neo/neural': major
---

Train the neural network with better defaults, which double its accuracy on
big corpora.

The defaults were tuned on a corpus of a few hundred utterances, and did not
settle on a bigger one: with 11,514 English utterances (the Amazon MASSIVE
corpus, 60 intents) the network stopped after 37 passes at 48% accuracy on the
2,974 test utterances, and 47% in Spanish. Now:

- `learningRate` is derived from the corpus when the settings do not give one:
  1 over the square root of the number of samples (0.06 for 250 utterances,
  0.009 for 11,514). The perceptrons learn one utterance at a time, so what a
  pass moves them grows with the corpus, and a rate that suits a small corpus
  never settles on a big one. It was 0.6.
- `momentum` is 0.9 (it was 0.5), and `deltaErrorThresh` is 0.00001 (it was
  0.000001), which stops the passes that only polish the last decimals.

Measured on the test utterances of MASSIVE, with the corpus cut to a number of
training utterances per intent (mean of 3 seeds), and the answer counted only
when its normalized score reaches the 0.5 threshold of `Nlp`:

| Training utterances per intent | Before | Now |
| --- | --- | --- |
| 3 | 31.9% | 33.1% |
| 10 | 50.4% | 50.0% |
| 50 | 63.6% | 68.8% |
| all (192) | 46.7% | 80.8% |

In Spanish the results are the same or better at every size. In English the
answers at 3 to 10 utterances per intent are within 0.7 points of what they
were (0.5 points better at 3, 0.7 and 0.4 lower at 5 and 10); the corpus of
250 utterances of this repository is 96.9% against 97.3%, one utterance of 256.
Without the threshold the best intent is right 82.2% of the time in English
(49.5% before) and 79.1% in Spanish (48.6% before), through `NluManager`, and
training takes 2.0 and 3.3 seconds where it took 4.9 and 7.9.

The tests of this repository keep passing. The ones that pinned exact weights,
scores, the number of passes or how many intents come back with a score were
rewritten to check what they mean instead: a sharper network gives a zero to
intents it is sure about, so fewer come back.

**Breaking.** A network that is trained again answers differently, so a corpus
scored against pinned numbers has to be rescored. Models exported with the old
defaults keep working: their weights are what they were, and a `learningRate`
in the settings is still used as it is.

`learningRate` now reads `'auto'` when it is not pinned, which is what makes it
derived, so the setting is one of a number and `'auto'` and never `undefined`.
The rate a training resolved is `NeuralNetwork#baseLearningRate`.
