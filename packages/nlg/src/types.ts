import type {
  Locale,
  PipelineInput,
  SerializedInstance,
  Settings,
} from '@nlpjs-neo/core';

/**
 * Types of the answer generation packages: the answers an intent may be
 * answered with, and the actions that run alongside them.
 */

/** Name of an intent an answer or an action belongs to. */
export type Intent = string;

/** When an answer applies, beyond the intent it answers. */
export interface AnswerOptions {
  /**
   * What the context must satisfy for the answer to be offered. It is handed
   * to whatever evaluator the container holds, so what counts as a condition
   * is that evaluator's to decide; the one this package ships reads it as an
   * expression.
   */
  condition?: unknown;
  [key: string]: unknown;
}

/**
 * An answer that is data rather than text, such as a card or a list of
 * buttons. It is handed back as declared, after its strings have gone through
 * the templates, and it must not carry an `answer` key of its own.
 */
export type StructuredAnswer = Record<string, unknown>;

/** What an answer says: text, or structured data. */
export type AnswerPayload = string | StructuredAnswer;

/** One answer of an intent, and the condition under which it is offered. */
export interface Answer {
  answer: AnswerPayload;
  /** A condition expression, or the options carrying one. */
  opts?: string | AnswerOptions;
}

/**
 * Answer in the shape the `node-nlp` compatibility layer reports. Its
 * `NlgManager` overrides `findAllAnswers` with a positional form that answers
 * these rather than the input, so the base states both.
 */
export interface LegacyAnswer {
  response: AnswerPayload;
  opts?: string | AnswerOptions;
}

/** Answers per intent, per locale. */
export type ResponsesByLocale = Record<Locale, Record<Intent, Answer[]>>;

/** Object flowing through the answer pipeline. */
export interface NlgInput extends PipelineInput {
  intent?: Intent;
  /** Conversation state the conditions and the templates are evaluated on. */
  context?: Record<string, unknown>;
  /** Candidates while the pipeline runs. */
  answers?: Answer[];
  /** The answer that was chosen, once it has. */
  answer?: AnswerPayload;
  /** Actions the answer triggers, filled in by the action manager. */
  actions?: ActionReference[];
}

/** Evaluates the condition of an answer against the context. */
export interface ConditionEvaluator {
  evaluate(condition: unknown, context: Record<string, unknown>): unknown;
}

/** Compiles the templates an answer carries against the context. */
export interface TemplateCompiler {
  compile<T>(text: T, context: Record<string, unknown>): T;
}

/** Exported answers, as produced by `NlgManager.toJSON`. */
export interface NlgManagerJson extends SerializedInstance {
  settings: Settings;
  responses: ResponsesByLocale;
}

/** An action of an intent, as it is stored and exported. */
export interface ActionReference {
  action: string;
  parameters: unknown[];
}

/** What an action does when its intent is answered. */
export type ActionFunction = (
  input: NlgInput,
  ...parameters: unknown[]
) => unknown | Promise<unknown>;

/** An action of an intent with the function registered for it, when there is one. */
export interface BoundAction extends ActionReference {
  fn?: ActionFunction;
}

/** Actions per intent. */
export type ActionsByIntent = Record<Intent, ActionReference[]>;

/** Exported actions, as produced by `ActionManager.toJSON`. */
export interface ActionManagerJson extends SerializedInstance {
  settings: Settings;
  actions: ActionsByIntent;
}
