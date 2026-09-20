import type {
  RecognizedEntity,
  Slot,
  SlotFillingContext,
  SlotFillingResult,
  SlotQuestions,
  SlotsByIntent,
} from './types.js';

/**
 * Class for a Slot Manager that takes care of the slot information.
 */
class SlotManager {
  declare intents: SlotsByIntent;
  declare isEmpty: boolean;

  /**
   * Constructor of the class.
   */
  constructor() {
    this.intents = {};
    this.isEmpty = true;
  }

  /**
   * Returns an slot given the intent and entity.
   * @param intent Name of the intent.
   * @param entity Name of the entity.
   * @returns Slot or undefined if not found.
   */
  getSlot(intent: string, entity: string): Slot | undefined {
    if (!this.intents[intent]) {
      return undefined;
    }
    return this.intents[intent][entity];
  }

  /**
   * Indicates if a given slot exists, given the intent and entity.
   * @param intent Name of the intent.
   * @param entity Name of the entity.
   * @returns True if the slot exists, false otherwise.
   */
  existsSlot(intent: string, entity: string): boolean {
    return this.getSlot(intent, entity) !== undefined;
  }

  /**
   * Adds a new slot for a given intent and entity.
   * @param intent Name of the intent.
   * @param entity Name of the entity.
   * @param mandatory Flag indicating if is mandatory or optional.
   * @param questions Question to ask when is mandatory, by locale.
   * @returns New slot instance.
   */
  addSlot(
    intent: string,
    entity: string,
    mandatory = false,
    questions?: SlotQuestions
  ): Slot {
    this.isEmpty = false;
    if (!this.intents[intent]) {
      this.intents[intent] = {};
    }
    this.intents[intent][entity] = {
      intent,
      entity,
      mandatory,
      locales: questions || {},
    };
    return this.intents[intent][entity];
  }

  /**
   * Adds/modifies the parameter of a slot for a given intent and entity.
   * Slot questions for same locales as already existing will be overwritten.
   * If the slot for the intent and entity does not exist it fill be created.
   * @param intent Name of the intent.
   * @param entity Name of the entity.
   * @param mandatory Flag indicating if is mandatory or optional.
   * @param questions Question to ask when is mandatory, by locale.
   * @returns New/Modified slot instance.
   */
  updateSlot(
    intent: string,
    entity: string,
    mandatory?: boolean,
    questions?: SlotQuestions
  ): Slot {
    if (!this.intents[intent] || !this.intents[intent][entity]) {
      return this.addSlot(intent, entity, mandatory, questions);
    }
    const slot = this.intents[intent][entity];
    if (mandatory !== undefined) {
      // Update mandatory flag only if provided
      slot.mandatory = mandatory;
    }
    slot.locales = Object.assign(slot.locales, questions);
    return this.intents[intent][entity];
  }

  /**
   * Remove an slot given the intent and the entity.
   * @param intent Name of the intent.
   * @param entity Name of the entity.
   */
  removeSlot(intent: string, entity: string): void {
    if (this.intents[intent]) {
      delete this.intents[intent][entity];
    }
  }

  /**
   * Add several entities if they don't exists.
   * @param intent Name of the intent.
   * @param entities List of entities.
   * @returns Array of resulting slots.
   */
  addBatch(intent: string, entities?: string[]): Slot[] {
    const result: Slot[] = [];
    if (entities && entities.length > 0) {
      entities.forEach((entity) => {
        let slot = this.getSlot(intent, entity);
        if (!slot) {
          slot = this.addSlot(intent, entity);
        }
        result.push(slot);
      });
    }
    return result;
  }

  /**
   * Given an intent, return the array of entity names of this intent.
   * @param intent Name of the intent.
   * @returns Array of entity names of the intent.
   */
  getIntentEntityNames(intent: string): string[] | undefined {
    if (!this.intents[intent]) {
      return undefined;
    }
    return Object.keys(this.intents[intent]);
  }

  /**
   * Given an intent return the information if the intent has entities defined
   *
   * @param intent Name of the intent.
   * @returns true if intent has defined entities, else false
   */
  hasIntentEntities(intent: string): boolean {
    const keys = this.getIntentEntityNames(intent);
    return keys ? keys.length > 0 : false;
  }

  /**
   * Clear the slot manager.
   */
  clear(): void {
    this.intents = {};
  }

  /**
   * Loads the slot manager content.
   * @param src Source content.
   */
  load(src?: SlotsByIntent): void {
    this.intents = src || {};
    this.isEmpty = Object.keys(this.intents).length === 0;
  }

  /**
   * Returns the slot manager content.
   * @returns Slot manager content.
   */
  save(): SlotsByIntent {
    return this.intents;
  }

  /**
   * Given an intent return the mandatory slots.
   * @param intent Name of the intent
   * @returns Object with the mandatory slots, by entity name.
   */
  getMandatorySlots(intent: string): Record<string, Slot> {
    const result: Record<string, Slot> = {};
    const intentSlots = this.intents[intent];
    if (intentSlots) {
      const keys = Object.keys(intentSlots);
      for (let i = 0, l = keys.length; i < l; i += 1) {
        const slot = intentSlots[keys[i]];
        if (slot.mandatory) {
          result[slot.entity] = slot;
        }
      }
    }
    return result;
  }

  cleanContextEntities(intent: string, srcContext: SlotFillingContext): void {
    const context = srcContext;
    if (context.slotFill) {
      return;
    }
    const mandatorySlots = this.getMandatorySlots(intent);
    const keys = Object.keys(mandatorySlots);
    if (keys.length === 0) {
      return;
    }
    keys.forEach((key) => {
      delete context[key];
    });
  }

  /**
   * Numbers the repeated entities of an utterance, so that the second
   * `city` of an utterance can fill the `city_1` slot.
   */
  generateEntityAliases(entities: RecognizedEntity[]): string[] {
    const aliases: string[] = [];
    const dict: Record<string, true[]> = {};
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      if (!dict[entity.entity]) {
        dict[entity.entity] = [];
      }
      aliases[i] = `${entity.entity}_${dict[entity.entity].length}`;
      dict[entity.entity].push(true);
    }
    return aliases;
  }

  /**
   * Fills what it can of the mandatory slots of the recognized intent and
   * asks for the first one still missing.
   * @returns Whether the conversation is waiting for a slot to be filled.
   */
  process(
    srcResult: SlotFillingResult,
    srcContext: SlotFillingContext,
    _utterance?: unknown,
    _arg3?: unknown
  ): boolean {
    const result = srcResult;
    const context = srcContext;
    this.cleanContextEntities(result.intent, context);
    if (context.slotFill) {
      // if we have slotFill values we set the context to be the same as before
      result.intent = context.slotFill.intent;
      result.answer = context.slotFill.answer;
      result.srcAnswer = context.slotFill.srcAnswer;
    }
    if (!result.intent || result.intent === 'None') {
      // No intent found, we repeat the answer from last time
      return false;
    }
    // Recognition may have found no entity at all.
    let entities = result.entities || [];
    if (context.slotFill && context.slotFill.intent === result.intent) {
      entities = [...context.slotFill.entities, ...entities];
      result.entities = entities;
    }
    const mandatorySlots = this.getMandatorySlots(result.intent);
    let keys = Object.keys(mandatorySlots);
    if (keys.length === 0) {
      // No mandatory entities defined, we repeat the answer from last time
      return false;
    }
    // The intent has slots to fill, so from here on the result carries the
    // entity list this manager completes.
    result.entities = entities;
    const aliases = this.generateEntityAliases(entities);
    for (let i = 0, l = entities.length; i < l; i += 1) {
      const entity = entities[i];
      // Remove existing mandatory entities to see what's left
      delete mandatorySlots[entity.entity];
      delete mandatorySlots[aliases[i]];
    }
    if (context.slotFill && mandatorySlots[context.slotFill.currentSlot]) {
      // Last time requested slot was not filled by current answer automatically,
      // so add whole utterance as answer for the requested slow
      // Do this because automatically parsed entities by builtins like "duration" are
      // added automatically, and we don't want to have duplicated entries in the list
      entities.push({
        entity: context.slotFill.currentSlot,
        utteranceText: result.utterance,
        sourceText: result.utterance,
        accuracy: 0.95,
        start: 0,
        end: result.utterance.length - 1,
        len: result.utterance.length,
        isSlotFillingFallback: true,
      });
      delete mandatorySlots[context.slotFill.currentSlot];
    }
    keys = Object.keys(mandatorySlots);
    if (context.slotFill && context.slotFill.currentSlot) {
      context.slotFill.latestSlot = context.slotFill.currentSlot;
    }
    if (!keys || keys.length === 0) {
      // All mandatory slots are filled, so we are done. No further questions needed
      delete result.srcAnswer;
      return true;
    }
    if (context.slotFill && context.slotFill.intent === result.intent) {
      result.localeIso2 = context.slotFill.localeIso2;
    }
    result.slotFill = {
      localeIso2: result.localeIso2,
      intent: result.intent,
      entities,
      answer: result.answer,
      srcAnswer: result.srcAnswer,
    };
    if (context.slotFill && context.slotFill.latestSlot) {
      result.slotFill.latestSlot = context.slotFill.latestSlot;
    }
    const currentSlot = mandatorySlots[keys[0]];
    result.slotFill.currentSlot = currentSlot.entity;
    result.srcAnswer = currentSlot.locales[result.localeIso2];
    context.slotFill = result.slotFill;
    return true;
  }
}

export default SlotManager;
