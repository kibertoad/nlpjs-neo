/** Types of the slot filling conversation state. */

/** Question to ask for a mandatory slot, by locale. */
export type SlotQuestions = Record<string, string>;

/** An entity an intent can ask for, mandatory or optional. */
export interface Slot {
  intent: string;
  entity: string;
  /** When mandatory, the conversation asks for it until it is filled. */
  mandatory: boolean;
  /** Question to ask for this slot, by locale. */
  locales: SlotQuestions;
}

/** Slots of every intent, by intent and then by entity. */
export type SlotsByIntent = Record<string, Record<string, Slot>>;

/** An entity found in an utterance. */
export interface RecognizedEntity {
  entity: string;
  utteranceText?: string;
  sourceText?: string;
  accuracy?: number;
  start?: number;
  end?: number;
  len?: number;
  /** Set when the whole utterance was taken as the answer to a slot question. */
  isSlotFillingFallback?: boolean;
  [key: string]: unknown;
}

/** The intent being filled, carried over from one utterance to the next. */
export interface SlotFillState {
  localeIso2?: string;
  intent: string;
  entities: RecognizedEntity[];
  answer?: string;
  srcAnswer?: string;
  /** Slot the last question asked for. */
  currentSlot?: string;
  /** Slot the previous question asked for. */
  latestSlot?: string;
}

/** The recognition result the slot manager reads and completes. */
export interface SlotFillingResult {
  intent?: string;
  utterance?: string;
  localeIso2?: string;
  answer?: string;
  /** Answer template, replaced by the question while slots are missing. */
  srcAnswer?: string;
  /** Entities found in the utterance; absent when recognition found none. */
  entities?: RecognizedEntity[];
  slotFill?: SlotFillState;
  [key: string]: unknown;
}

/** Conversation context, where the slot filling state lives between turns. */
export interface SlotFillingContext {
  slotFill?: SlotFillState;
  [key: string]: unknown;
}
