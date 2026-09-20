import { NlgManager as NlgManagerBase } from '@nlpjs-neo/nlg';
import { Evaluator } from '@nlpjs-neo/evaluator';

class NlgManager extends NlgManagerBase {
  constructor(settings: any = {}, container?) {
    super(settings, container);
    this.container.register('Evaluator', Evaluator, true);
  }

  addAnswer(locale, intent, answer, opts?) {
    return this.add(locale, intent, answer, opts);
  }

  async findAnswer(locale, intent, context, settings?) {
    const answer = await this.find(locale, intent, context, settings);
    if (!answer.answer) {
      return undefined;
    }
    return {
      response: answer.answer,
    };
  }

  removeAnswer(locale, intent, answer, opts?) {
    return this.remove(locale, intent, answer, opts);
  }

  isValid(condition, context?) {
    const evaluator = this.container.get('Evaluator');
    if (evaluator) {
      return (
        !condition ||
        condition === '' ||
        evaluator.evaluate(condition, context) === true
      );
    }
    return true;
  }

  findAllAnswers(locale, intent, context) {
    if (typeof locale === 'string') {
      const input = {
        locale,
        intent,
        context,
      };
      const found = super.findAllAnswers(input);
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
