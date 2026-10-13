import BoundedCache from './bounded-cache.js';

/**
 * The syntax of a template: a string is parsed once into blocks, and the
 * blocks are what a render walks.
 */

/** A run of text, printed as it is. */
export interface LiteralBlock {
  type: 'literal';
  text: string;
}

/** A `{{ expression }}`, replaced by what the expression evaluates to. */
export interface ExpressionBlock {
  type: 'expression';
  /** The tag as it was written, kept as the text of an expression with no value. */
  text: string;
  value: string;
}

/** A `{{#expression}} ... {{/#}}` section, repeated for each item of the value. */
export interface SectionBlock {
  type: 'section';
  value: string;
  blocks: Block[];
}

export type Block = LiteralBlock | ExpressionBlock | SectionBlock;

/** A whole string, parsed. */
export interface TemplateProgram {
  blocks: Block[];
}

const sectionOpen = '#';
const sectionClose = '/#';

/**
 * How many parsed strings are kept. Templates come from a finite set of
 * answers in the usual case, but `Session.say` compiles whatever text it is
 * handed, so the cache is bounded rather than trusted to stay small.
 */
const maxCachedPrograms = 1000;

const programs = new BoundedCache<string, TemplateProgram>(maxCachedPrograms);

/** The blocks of `str`, read left to right. */
export function parseTemplate(str: string): TemplateProgram {
  // A fresh regexp per call: the shared one would carry its `lastIndex` over.
  const pattern = /{{([\s\S]*?)}}/g;
  const program: TemplateProgram = { blocks: [] };
  // Where the next block goes: the program itself, or the innermost section
  // still waiting for its close tag. `open` holds the ones left behind.
  let blocks = program.blocks;
  const open: Block[][] = [];
  let lastIndex = 0;
  let match = pattern.exec(str);
  while (match !== null) {
    const literal = str.slice(lastIndex, match.index);
    if (literal) {
      blocks.push({ type: 'literal', text: literal });
    }
    const expression = match[1].trim();
    if (expression.startsWith(sectionClose)) {
      // A close with nothing open closes nothing, and is dropped.
      const parent = open.pop();
      if (parent !== undefined) {
        blocks = parent;
      }
    } else if (expression.startsWith(sectionOpen)) {
      const section: SectionBlock = {
        type: 'section',
        value: expression.slice(sectionOpen.length),
        blocks: [],
      };
      blocks.push(section);
      open.push(blocks);
      blocks = section.blocks;
    } else {
      blocks.push({
        type: 'expression',
        text: match[0],
        value: expression,
      });
    }
    lastIndex = match.index + match[0].length;
    match = pattern.exec(str);
  }
  // A section left open keeps the rest of the string as its content.
  const tail = str.slice(lastIndex);
  if (tail) {
    blocks.push({ type: 'literal', text: tail });
  }
  return program;
}

/** The blocks of `str`, parsed the first time it is seen and then remembered. */
function getProgram(str: string): TemplateProgram {
  const cached = programs.get(str);
  if (cached !== undefined) {
    return cached;
  }
  const program = parseTemplate(str);
  programs.set(str, program);
  return program;
}

export default getProgram;
