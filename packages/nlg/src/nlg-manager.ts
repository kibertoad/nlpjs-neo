import { Clonable } from '@nlpjs-neo/core';
import type {
  AnswerPayload,
  Container,
  ContainerHolder,
  Locale,
  RegisteredPipeline,
  Settings,
} from '@nlpjs-neo/core';
import cloneData from './clone-data.js';
import deepEqual from './deep-equal.js';
import type {
  Answer,
  AnswerOptions,
  ConditionEvaluator,
  Intent,
  LegacyAnswer,
  NlgInput,
  NlgManagerJson,
  ResponsesByLocale,
  TemplateCompiler,
} from './types.js';

/**
 * Whether a value is an answer with its options around it, rather than the
 * answer itself. A structured answer is data of the caller's own shape, so
 * the only thing that can tell the two apart is the `answer` key the record
 * carries and the payload is documented not to.
 */
function isAnswerRecord(value: Answer | AnswerPayload): value is Answer {
  return typeof value === 'object' && value !== null && 'answer' in value;
}

/** One stored answer, copied whole so the corpus keeps its own. */
function detachAnswer(answer: Answer): Answer {
  return {
    ...answer,
    answer: cloneData(answer.answer),
    opts: cloneData(answer.opts),
  };
}

class NlgManager extends Clonable {
  declare pipelineFind: RegisteredPipeline | undefined;
  /** Every answer this was taught, by locale and then by intent. */
  declare responses: ResponsesByLocale;
  declare settings: Settings;

  constructor(settings: Settings = {}, container?: ContainerHolder) {
    super(
      {
        settings: {},
        container:
          settings.container ||
          (container &&
            ((container as { container?: Container }).container ||
              (container as Container))),
      },
      container as Container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = 'nlg-manager';
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.responses = {};
    this.applySettings(this, {
      pipelineFind: this.getPipeline(`${this.settings.tag}-find`),
    });
  }

  registerDefault(): void {
    this.container.registerConfiguration('nlg-manager', {}, false);
  }

  // `node-nlp` layers a positional (locale, intent, context) overload on top
  // of this, so the base signature has to tolerate the extra arguments.
  findAllAnswers(
    srcInput: NlgInput,
    ..._args: unknown[]
  ): NlgInput | LegacyAnswer[] {
    const input = srcInput;
    const stored = this.responses[input.locale]?.[input.intent];
    // Reading the corpus is the one place answers leave it, so it is the one
    // place they are detached: from here on the request owns its answers, and
    // neither the stages that render them nor the caller that is handed them
    // can reach what the intent was taught.
    input.answers = stored ? stored.map(detachAnswer) : [];
    return input;
  }

  /** Keeps the answers whose condition the context satisfies. */
  filterAnswers(srcInput: NlgInput): NlgInput {
    const input = srcInput;
    const { answers } = input;
    if (answers && answers.length) {
      const evaluator = this.container.get<ConditionEvaluator>('Evaluator');
      if (evaluator) {
        const context = input.context || {};
        const filtered: Answer[] = [];
        for (let i = 0; i < answers.length; i += 1) {
          const answer = answers[i];
          if (answer.opts) {
            const condition =
              typeof answer.opts === 'string'
                ? answer.opts
                : (answer.opts as AnswerOptions).condition;
            if (condition) {
              if (evaluator.evaluate(condition, context) === true) {
                filtered.push(answer);
              }
            } else {
              filtered.push(answer);
            }
          } else {
            filtered.push(answer);
          }
        }
        input.answers = filtered;
      }
    }
    return input;
  }

  chooseRandom(srcInput: NlgInput): NlgInput {
    const input = srcInput;
    const { answers } = input;
    if (answers && answers.length) {
      input.answer = answers[Math.floor(Math.random() * answers.length)].answer;
    }
    return input;
  }

  /**
   * Resolves the `(a|b)` alternatives of an answer and compiles whatever
   * template it carries. Takes either an answer or its bare payload, and
   * gives back the same form, which is also the form the template compiler
   * is handed.
   *
   * Rendering answers a new value and never writes to the one it was given.
   * What it renders is an answer the corpus was taught, and a rendered answer
   * is what one request chose: alternatives resolved and a context filled in
   * are not something the next request should inherit. Building the new value
   * before the compiler sees it also keeps a compiler that renders by
   * mutating from reaching anything but this request's copy.
   */
  renderText<T extends Answer | AnswerPayload>(
    srcText: T,
    context?: Record<string, unknown>
  ): T {
    if (!srcText) {
      return srcText;
    }
    let rendered: T;
    if (isAnswerRecord(srcText)) {
      const record: Answer = srcText;
      rendered = { ...record, answer: this.resolvePayload(record.answer) } as T;
    } else {
      rendered = this.resolvePayload(srcText) as T;
    }
    const template = this.container.get<TemplateCompiler>('Template');
    if (template && context) {
      return template.compile(rendered, context);
    }
    return rendered;
  }

  /**
   * Resolves the alternatives of an answer payload. A structured answer has
   * none to resolve: only the templates inside it apply.
   */
  protected resolvePayload(payload: AnswerPayload): AnswerPayload {
    return typeof payload === 'string'
      ? this.resolveAlternatives(payload)
      : payload;
  }

  /** Picks one of the options of every `(a|b)` of a text. */
  protected resolveAlternatives(srcText: string): string {
    let text = srcText;
    let matchFound;
    do {
      const match = /\((?:[^()]+)\|(?:[^()]+)\)/g.exec(text);
      if (match) {
        for (let i = 0; i < match.length; i += 1) {
          const source = match[i];
          const options = source.substring(1, source.length - 1).split('|');
          text = text.replace(
            source,
            options[Math.floor(Math.random() * options.length)]
          );
        }
        matchFound = true;
      } else {
        matchFound = false;
      }
    } while (matchFound);
    return text;
  }

  renderRandom(srcInput: NlgInput): NlgInput {
    const input = srcInput;
    const { answers, context } = input;
    for (let i = 0; i < answers.length; i += 1) {
      answers[i] = this.renderText(answers[i], context);
    }
    return input;
  }

  indexOfAnswer(
    locale: Locale,
    intent: Intent,
    answer?: AnswerPayload,
    opts?: string | AnswerOptions
  ): number {
    if (!this.responses[locale]) {
      return -1;
    }
    if (!this.responses[locale][intent]) {
      return -1;
    }
    const potential = this.responses[locale][intent];
    for (let i = 0; i < potential.length; i += 1) {
      const response = potential[i];
      if (
        deepEqual(response.answer, answer) &&
        deepEqual(response.opts, opts)
      ) {
        return i;
      }
    }
    return -1;
  }

  add(
    locale: Locale,
    intent: Intent,
    answer?: AnswerPayload,
    opts?: string | AnswerOptions
  ): Answer {
    const index = this.indexOfAnswer(locale, intent, answer, opts);
    if (index !== -1) {
      return this.responses[locale][intent][index];
    }
    if (!this.responses[locale]) {
      this.responses[locale] = {};
    }
    if (!this.responses[locale][intent]) {
      this.responses[locale][intent] = [];
    }
    // A copy, so that mutating the objects that declared the answer cannot
    // rewrite what the intent was taught.
    const obj = { answer: cloneData(answer), opts: cloneData(opts) };
    this.responses[locale][intent].push(obj);
    return obj;
  }

  remove(
    locale: Locale,
    intent: Intent,
    answer?: AnswerPayload,
    opts?: string | AnswerOptions
  ): void {
    const index = this.indexOfAnswer(locale, intent, answer, opts);
    if (index !== -1) {
      this.responses[locale][intent].splice(index, 1);
    }
  }

  defaultPipelineFind(input: NlgInput): NlgInput {
    let output = this.findAllAnswers(input) as NlgInput;
    output = this.filterAnswers(output);
    output = this.renderRandom(output);
    output = this.chooseRandom(output);
    return output;
  }

  find(
    locale: Locale,
    intent?: Intent,
    context?: Record<string, unknown>,
    settings?: Settings
  ): NlgInput | Promise<NlgInput> {
    const input: NlgInput = {
      locale,
      intent,
      context,
      settings: settings || this.settings,
    };
    if (this.pipelineFind) {
      return this.runPipeline(input, this.pipelineFind);
    }
    return this.defaultPipelineFind(input);
  }

  run(srcInput: NlgInput, settings?: Settings): NlgInput | Promise<NlgInput> {
    return this.find(
      srcInput.locale,
      srcInput.intent,
      srcInput.context,
      settings
    );
  }

  toJSON(): NlgManagerJson {
    const result: NlgManagerJson = {
      settings: { ...this.settings },
      responses: this.responses,
    };
    delete result.settings.container;
    return result;
  }

  fromJSON(json: NlgManagerJson): void {
    this.applySettings(this.settings, json.settings);
    this.responses = json.responses;
  }
}

export default NlgManager;
