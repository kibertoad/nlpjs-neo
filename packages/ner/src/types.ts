import type {
  Locale,
  PipelineInput,
  SerializedInstance,
  Settings,
} from '@nlpjs-neo/core';
import type { TrimType } from './trim-types.js';

/**
 * Types of the entity extractors: the rules they are taught, the edges they
 * find in an utterance and the entities those edges reduce to.
 */

/** Name of an entity a rule extracts. */
export type EntityName = string;

/** How an entity is recognized. */
export type RuleType = 'enum' | 'regex' | 'trim';

/** Where a trim rule cuts, relative to the words it is anchored on. */
export type TrimTypeValue = (typeof TrimType)[keyof typeof TrimType];

/** A span of an utterance holding one word. */
export interface WordPosition {
  start: number;
  end: number;
  len?: number;
}

/** One named option of an enum rule, and the texts that resolve to it. */
export interface EnumRuleOption {
  option: string;
  texts: string[];
  /** Accuracy this option alone demands, overriding the extractor's. */
  threshold?: number;
}

/** How a trim rule is anchored and how strictly it matches. */
export interface TrimOptions {
  /** Matches the anchors without the surrounding spaces. */
  noSpaces?: boolean;
  caseSensitive?: boolean;
  /** For a between rule, takes the last left anchor rather than the first. */
  closest?: boolean;
  /** Matches that are thrown away rather than reported. */
  skip?: string[];
}

/** A trim rule anchored between two sets of words. */
export interface BetweenTrimRule {
  type: 'between';
  leftWords: string[];
  rightWords: string[];
  regex: RegExp;
  options: TrimOptions;
}

/** A trim rule anchored before or after a set of words. */
export interface PositionTrimRule {
  type: TrimTypeValue;
  words: string[];
  options: TrimOptions;
}

export type TrimRule = BetweenTrimRule | PositionTrimRule;

/** One condition of a rule: an option, a regular expression or a trim. */
export type RuleCondition = EnumRuleOption | RegExp | TrimRule;

/** Every way one entity may be recognized in one locale. */
export interface Rule {
  name: EntityName;
  type: RuleType;
  rules: RuleCondition[];
  /** Normalized texts of an enum rule mapped to the options they stand for. */
  dict?: Record<string, EnumRuleOption[]>;
  /** Normalized texts mapped back to the text as it was written. */
  inverseDict?: Record<string, string>;
}

/** Rules by entity name, per locale; `*` holds the ones taught for all. */
export type RulesByLocale = Record<Locale, Record<EntityName, Rule>>;

/**
 * A candidate entity found in an utterance. The extractors produce these, and
 * `reduceEdges` drops the ones an overlapping, better match wins over.
 */
export interface Edge {
  start: number;
  end: number;
  /** Length of `utteranceText`. */
  len?: number;
  accuracy: number;
  /** The text as the rule spells it, when the extractor reports one. */
  sourceText?: string;
  /** The text as the utterance spells it. */
  utteranceText?: string;
  entity?: EntityName;
  type?: RuleType;
  /** For an enum entity, the option its text resolved to. */
  option?: string;
  subtype?: TrimTypeValue;
  /** Edit distance to the text of the rule, for a fuzzy enum match. */
  levenshtein?: number;
  /** Set by `reduceEdges` on an edge another one wins over. */
  discarded?: boolean;
}

/** A substring of an utterance scored against the text of a rule. */
export interface SubstringMatch {
  start: number;
  end: number;
  len: number;
  levenshtein: number | undefined;
  accuracy: number;
}

/** Settings of a `Ner`. */
export interface NerSettings extends Settings {
  /** Lowest accuracy an enum match may have. Defaults to 0.8. */
  threshold?: number;
  /** Only extracts the entities the recognized intent is trained with. */
  considerOnlyIntentEntities?: boolean;
  /** Marker an entity carries in an utterance. Defaults to `@`. */
  entityPreffix?: string;
  entitySuffix?: string;
}

/** Object flowing through the extraction pipeline. */
export interface NerInput extends PipelineInput {
  settings?: NerSettings;
  /** Rules that apply to this utterance, chosen by `decideRules`. */
  nerRules?: Rule[];
  /** Entities the recognized intent is trained with. */
  intentEntities?: EntityName[];
  /** Restricts extraction to `intentEntities`. */
  nerLimitToEntities?: boolean;
  threshold?: number;
  /** Candidates while the extractors run. */
  edges?: Edge[];
  /** What the edges reduced to, once extraction is done. */
  entities?: Edge[];
  /** Entities a builtin extractor reports in the form its source gave them. */
  sourceEntities?: unknown[];
}

/** Contract of an extractor registered in a container. */
export interface Extractor {
  extract(input: NerInput): NerInput | Promise<NerInput>;
  run(input: NerInput): NerInput | Promise<NerInput>;
}

/** Exported extractor, as produced by `Ner.toJSON`. */
export interface NerJson extends SerializedInstance {
  settings: NerSettings;
  rules: RulesByLocale;
}
