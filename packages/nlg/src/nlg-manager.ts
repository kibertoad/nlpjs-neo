import { Clonable } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  Locale,
  RegisteredPipeline,
  Settings,
} from '@nlpjs-neo/core';
import type {
  Answer,
  AnswerOptions,
  AnswerPayload,
  ConditionEvaluator,
  Intent,
  LegacyAnswer,
  NlgInput,
  NlgManagerJson,
  ResponsesByLocale,
  TemplateCompiler,
} from './types.js';

/** Text answers are the same when equal, structured ones when they hold the same data. */
function sameAnswer(a?: AnswerPayload, b?: AnswerPayload): boolean {
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
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
    if (this.responses[input.locale]) {
      input.answers = this.responses[input.locale][input.intent] || [];
    } else {
      input.answers = [];
    }
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
   * template it carries. Takes either an answer or its bare text, and gives
   * back the same form.
   */
  renderText<T extends Answer | AnswerPayload>(
    srcText: T,
    context?: Record<string, unknown>
  ): T {
    if (!srcText) {
      return srcText;
    }
    let text: AnswerPayload =
      (srcText as Answer).answer || (srcText as AnswerPayload);
    // Structured answers have no alternatives to resolve, only templates.
    if (typeof text === 'string') {
      text = this.resolveAlternatives(text);
    }
    if ((srcText as Answer).answer) {
      (srcText as Answer).answer = text;
    } else {
      srcText = text as T;
    }
    const template = this.container.get<TemplateCompiler>('Template');
    if (template && context) {
      return template.compile(srcText, context);
    }
    return srcText;
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
        sameAnswer(response.answer, answer) &&
        JSON.stringify(response.opts) === JSON.stringify(opts)
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
    const obj = { answer, opts };
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
