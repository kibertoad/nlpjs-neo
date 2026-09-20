import { NlgManager as NlgManagerBase } from '@nlpjs-neo/nlg';
import type {
  Answer,
  AnswerOptions,
  LegacyAnswer,
  NlgInput,
} from '@nlpjs-neo/nlg';
import type { ContainerHolder, Locale, Settings } from '@nlpjs-neo/core-loader';
import { Evaluator } from '@nlpjs-neo/evaluator';

/** Evaluates the condition of an answer against the context. */
interface ConditionEvaluator {
  evaluate(condition: unknown, context?: Record<string, unknown>): unknown;
}

class NlgManager extends NlgManagerBase {
  constructor(settings: Settings = {}, container?: ContainerHolder) {
    super(settings, container);
    this.container.register('Evaluator', Evaluator, true);
  }

  addAnswer(
    locale: Locale,
    intent: string,
    answer: string,
    opts?: string | AnswerOptions
  ): Answer {
    return this.add(locale, intent, answer, opts);
  }

  async findAnswer(
    locale: Locale,
    intent: string,
    context?: Record<string, unknown>,
    settings?: Settings
  ): Promise<{ response: string } | undefined> {
    const answer = await this.find(locale, intent, context, settings);
    if (!answer.answer) {
      return undefined;
    }
    return {
      response: answer.answer,
    };
  }

  removeAnswer(
    locale: Locale,
    intent: string,
    answer: string,
    opts?: string | AnswerOptions
  ): void {
    return this.remove(locale, intent, answer, opts);
  }

  isValid(condition?: unknown, context?: Record<string, unknown>): boolean {
    const evaluator = this.container.get<ConditionEvaluator>('Evaluator');
    if (evaluator) {
      return (
        !condition ||
        condition === '' ||
        evaluator.evaluate(condition, context) === true
      );
    }
    return true;
  }

  /**
   * Answers every answer of an intent. Called positionally, this is the
   * legacy form that answers `{ response, opts }`; called with an input, it
   * is the pipeline stage of the base class.
   */
  findAllAnswers(
    locale: Locale | NlgInput,
    intent?: string,
    context?: Record<string, unknown>
  ): NlgInput | LegacyAnswer[] {
    if (typeof locale === 'string') {
      const input: NlgInput = {
        locale,
        intent,
        context,
      };
      const found = super.findAllAnswers(input) as NlgInput;
      const filtered = super.filterAnswers(found);
      return filtered.answers.map((x) => ({
        response: x.answer,
        opts: x.opts,
      }));
    }
    return super.findAllAnswers(locale);
  }
}

export default NlgManager;
