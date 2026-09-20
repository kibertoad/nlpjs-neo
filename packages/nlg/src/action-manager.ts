import { Clonable } from '@nlpjs-neo/core';

/**
 * Action Manager.
 * It stores the actions that should be executed for a given intent.
 */
class ActionManager extends Clonable {
  declare actions: any;
  declare actionsMap: any;
  declare settings: any;

  /**
   * Constructor of the class
   */
  constructor(settings: any = {}, container?) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
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

  registerDefault() {}

  /**
   * Find the index of an action
   * @param {String} intent Name of the intent.
   * @param {String} action Name of the action.
   * @param {any[]} parameters list of parameters of the action.
   */
  posAction(intent, action, parameters) {
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
  findActions(intent) {
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
  async processActions(intent, input) {
    const actionList = this.findActions(intent);
    if (input && typeof input === 'object') {
      input.actions = actionList.map((x) => ({
        action: x.action,
        parameters: x.parameters,
      }));
    }
    let processedAnswer = input;

    for (const { fn, parameters } of actionList) {
      if (fn) {
        const newProcessedAnswer = await fn(
          processedAnswer,
          ...(parameters || [])
        );
        if (newProcessedAnswer) {
          if (typeof processedAnswer === 'object') {
            if (typeof newProcessedAnswer === 'object') {
              processedAnswer = newProcessedAnswer;
            } else {
              processedAnswer.answer = newProcessedAnswer;
            }
          } else {
            processedAnswer = newProcessedAnswer;
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
   * @param {any[]} parameters Parameters of the action
   * @param {function} [fn] Function of the action
   */
  addAction(intent, action, parameters, fn?) {
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
  removeAction(intent, action, parameters) {
    const index = this.posAction(intent, action, parameters);
    if (index > -1) {
      this.actions[intent].splice(index, 1);
    }
  }

  /**
   * Remove all the actions of a given intent.
   * @param {String} intent Name of the intent.
   */
  removeActions(intent) {
    delete this.actions[intent];
  }

  /**
   * Registers/Sets a function for a given action
   * @param {String} action Name of the action.
   * @param {function} [fn] Function of the action
   */
  registerActionInMap(action, fn) {
    this.actionsMap[action] = fn;
  }

  /**
   * Remove an action function from the actions map.
   * @param {String} action Name of the action.
   */
  removeActionFromMap(action) {
    delete this.actionsMap[action];
  }

  run(srcInput, settings?) {
    const input = srcInput;
    input.settings = input.settings || settings || this.settings;
    return this.processActions(srcInput.intent, input);
  }

  toJSON() {
    const result = {
      settings: { ...this.settings },
      actions: this.actions,
    };
    delete result.settings.container;
    return result;
  }

  fromJSON(json) {
    this.applySettings(this.settings, json.settings);
    this.actions = json.actions;
  }
}

export default ActionManager;
