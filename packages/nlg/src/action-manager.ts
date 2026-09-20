import { Clonable } from '@nlpjs-neo/core';
import type {
  Container,
  ContainerHolder,
  RegisteredPipeline,
  Settings,
} from '@nlpjs-neo/core';
import type {
  ActionFunction,
  ActionManagerJson,
  ActionsByIntent,
  BoundAction,
  Intent,
  NlgInput,
} from './types.js';

/**
 * Action Manager.
 * It stores the actions that should be executed for a given intent.
 */
class ActionManager extends Clonable {
  /** Actions per intent, as they are stored and exported. */
  declare actions: ActionsByIntent;
  /** Function registered for an action name, when one was. */
  declare actionsMap: Record<string, ActionFunction>;
  declare pipelineFind: RegisteredPipeline | undefined;
  declare settings: Settings;

  /**
   * Constructor of the class
   */
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
      this.settings.tag = 'action-manager';
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.actions = {};
    this.actionsMap = {};
    this.applySettings(this, {
      pipelineFind: this.getPipeline(`${this.settings.tag}-find`),
    });
  }

  registerDefault(): void {}

  /**
   * Find the index of an action
   * @param {String} intent Name of the intent.
   * @param {String} action Name of the action.
   * @param {unknown[]} parameters list of parameters of the action.
   */
  posAction(intent: Intent, action: string, parameters: unknown[]): number {
    if (!this.actions[intent]) {
      return -1;
    }
    const actions = this.actions[intent];
    for (let i = 0; i < actions.length; i += 1) {
      if (
        actions[i].action === action &&
        JSON.stringify(actions[i].parameters) === JSON.stringify(parameters)
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Return an array of actions for the intent.
   * @param {String} intent Name of the intent.
   * @returns {Object[]} Actions for this intent.
   */
  findActions(intent: Intent): BoundAction[] {
    const dehydratedActions = this.actions[intent] || [];

    return dehydratedActions.map((actionBundle) => ({
      ...actionBundle,
      fn: this.actionsMap[actionBundle.action],
    }));
  }

  /**
   * Returns a processed answer after execute a list of given actions.
   * @param {String} intent Name of the intent.
   * @param {String|Object} input original answer data structure
   */
  async processActions(
    intent: Intent,
    input: NlgInput | string
  ): Promise<NlgInput | string> {
    const actionList = this.findActions(intent);
    if (input && typeof input === 'object') {
      input.actions = actionList.map((x) => ({
        action: x.action,
        parameters: x.parameters,
      }));
    }
    let processedAnswer: NlgInput | string = input;

    for (const { fn, parameters } of actionList) {
      if (fn) {
        // A previous action may have answered with a bare string, which is
        // then what the next one is handed.
        const newProcessedAnswer = await fn(
          processedAnswer as NlgInput,
          ...(parameters || [])
        );
        if (newProcessedAnswer) {
          if (typeof processedAnswer === 'object') {
            if (typeof newProcessedAnswer === 'object') {
              processedAnswer = newProcessedAnswer as NlgInput;
            } else {
              processedAnswer.answer = newProcessedAnswer as string;
            }
          } else {
            processedAnswer = newProcessedAnswer as string;
          }
        }
      }
    }

    return processedAnswer;
  }

  /**
   * Add an action to a given intent.
   * @param {String} intent Name of the intent.
   * @param {String} action Action to be executed
   * @param {unknown[]} parameters Parameters of the action
   * @param {function} [fn] Function of the action
   */
  addAction(
    intent: Intent,
    action: string,
    parameters: unknown[],
    fn?: ActionFunction
  ): void {
    if (this.posAction(intent, action, parameters) === -1) {
      if (!this.actions[intent]) {
        this.actions[intent] = [];
      }
      this.actions[intent].push({ action, parameters });
      if (fn) {
        this.actionsMap[action] = fn;
      }
    }
  }

  /**
   * Remove an action.
   * @param {String} intent Name of the intent
   * @param {String} action Name of the action
   * @param {Object[]} parameters Parameters of the action.
   */
  removeAction(intent: Intent, action: string, parameters: unknown[]): void {
    const index = this.posAction(intent, action, parameters);
    if (index > -1) {
      this.actions[intent].splice(index, 1);
    }
  }

  /**
   * Remove all the actions of a given intent.
   * @param {String} intent Name of the intent.
   */
  removeActions(intent: Intent): void {
    delete this.actions[intent];
  }

  /**
   * Registers/Sets a function for a given action
   * @param {String} action Name of the action.
   * @param {function} [fn] Function of the action
   */
  registerActionInMap(action: string, fn: ActionFunction): void {
    this.actionsMap[action] = fn;
  }

  /**
   * Remove an action function from the actions map.
   * @param {String} action Name of the action.
   */
  removeActionFromMap(action: string): void {
    delete this.actionsMap[action];
  }

  run(srcInput: NlgInput, settings?: Settings): Promise<NlgInput | string> {
    const input = srcInput;
    input.settings = input.settings || settings || this.settings;
    return this.processActions(srcInput.intent, input);
  }

  toJSON(): ActionManagerJson {
    const result: ActionManagerJson = {
      settings: { ...this.settings },
      actions: this.actions,
    };
    delete result.settings.container;
    return result;
  }

  fromJSON(json: ActionManagerJson): void {
    this.applySettings(this.settings, json.settings);
    this.actions = json.actions;
  }
}

export default ActionManager;
