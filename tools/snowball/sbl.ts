/**
 * Reads a Snowball program (`.sbl`) into a tree.
 *
 * The language is described in https://snowballstem.org/compiler/snowman.html.
 * This reader follows the reference compiler (`analyser.c`) where the manual
 * leaves room, so a program means here what it means there.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type Mode = 'forward' | 'backward';

/** An arithmetic expression. */
export type AE =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'cursor' }
  | { t: 'limit'; mode: Mode }
  | { t: 'size' }
  | { t: 'maxint' }
  | { t: 'minint' }
  | { t: 'sizeof'; name: string }
  | { t: 'neg'; a: AE }
  | { t: 'bin'; op: '+' | '-' | '*' | '/'; l: AE; r: AE };

export type RelOp = '==' | '!=' | '<' | '<=' | '>' | '>=';

/** A command. `mode` is the direction the command reads the string in. */
export type Node = { mode: Mode; line: number } & (
  | { t: 'seq'; items: Node[] }
  | { t: 'or'; items: Node[] }
  | { t: 'and'; items: Node[] }
  | {
      t:
        | 'not'
        | 'try'
        | 'do'
        | 'test'
        | 'fail'
        | 'goto'
        | 'gopast'
        | 'repeat'
        | 'backwards'
        | 'reverse';
      c: Node;
    }
  | { t: 'loop' | 'atleast'; n: AE; c: Node }
  | { t: 'hop'; n: AE }
  | { t: 'next' | 'tolimit' | 'true' | 'false' | 'leftslice' | 'rightslice' }
  | { t: 'tomark'; ae: AE }
  | { t: 'setlimit'; c1: Node; c2: Node }
  | { t: 'lit'; s: string }
  | { t: 'str'; name: string }
  | { t: 'grouping' | 'non'; name: string }
  | { t: 'call'; name: string }
  | { t: 'slicefrom'; s?: string; name?: string }
  | { t: 'insert' | 'attach'; s?: string; name?: string }
  | { t: 'sliceto' | 'assignto'; name: string }
  | { t: 'set' | 'unset' | 'booltest' | 'notbooltest'; name: string }
  | {
      t: 'assign' | 'plus' | 'minus' | 'times' | 'divide';
      name: string;
      ae: AE;
    }
  | { t: 'cmp'; op: RelOp; l: AE; r: AE }
  | { t: 'substring'; among?: Node }
  | { t: 'among'; entries: AmongEntry[]; substring?: Node }
);

/** A command without the fields every command has. */
type Body<N> = N extends unknown ? Omit<N, 'mode' | 'line'> : never;

/** One line of an `among`: a string, the routine that gates it, and its action. */
export interface AmongEntry {
  s: string;
  /** Routine that has to succeed for the string to count as a match. */
  guard?: string;
  /** Action to run, or undefined when the string has none. */
  action?: Node;
}

export type NameType =
  | 'string'
  | 'integer'
  | 'boolean'
  | 'routine'
  | 'external'
  | 'grouping';

export interface Routine {
  name: string;
  mode: Mode;
  body: Node;
}

export interface Grouping {
  name: string;
  /** Characters of the grouping, as code units. */
  chars: number[];
}

export interface Program {
  file: string;
  names: Map<string, NameType>;
  routines: Routine[];
  groupings: Grouping[];
}

type Token =
  | { k: 'name'; v: string; line: number }
  | { k: 'num'; v: number; line: number }
  | { k: 'str'; v: string; line: number }
  | { k: 'sym'; v: string; line: number }
  | { k: 'eof'; line: number };

const KEYWORDS = new Set([
  'as',
  'do',
  'or',
  'and',
  'for',
  'get',
  'hex',
  'hop',
  'len',
  'non',
  'not',
  'set',
  'try',
  'fail',
  'goto',
  'loop',
  'next',
  'size',
  'test',
  'true',
  'among',
  'false',
  'lenof',
  'limit',
  'unset',
  'atmark',
  'attach',
  'cursor',
  'define',
  'delete',
  'gopast',
  'insert',
  'maxint',
  'minint',
  'repeat',
  'sizeof',
  'tomark',
  'atleast',
  'atlimit',
  'decimal',
  'reverse',
  'setmark',
  'strings',
  'tolimit',
  'booleans',
  'integers',
  'routines',
  'setlimit',
  'backwards',
  'externals',
  'groupings',
  'stringdef',
  'substring',
  'backwardmode',
  'stringescapes',
]);

const SYMBOLS = [
  '<-',
  '<=',
  '<+',
  '->',
  '=>',
  '==',
  '!=',
  '>=',
  '+=',
  '-=',
  '*=',
  '/=',
  '(',
  ')',
  '[',
  ']',
  '$',
  '?',
  '+',
  '-',
  '*',
  '/',
  '=',
  '<',
  '>',
];

const dropLine = (key: string, value: unknown) =>
  key === 'line' || key === 'among' || key === 'substring' ? undefined : value;

class Lexer {
  private pos = 0;
  private line = 1;
  private start = '{';
  private end = '}';
  private readonly macros = new Map<string, string>();
  private uplus: 'unset' | 'unicode' | 'defined' = 'unset';
  private held: Token | undefined;
  private readonly stack: {
    src: string;
    pos: number;
    line: number;
    file: string;
  }[] = [];

  private src: string;
  private file: string;

  /** Character set of the numbers of `hex` and `decimal` stringdefs, when it is not Unicode. */
  private readonly charset: string | undefined;

  constructor(src: string, file: string, charset?: string) {
    this.src = src;
    this.file = file;
    this.charset = charset;
  }

  private fail(message: string): never {
    throw new Error(`${this.file}:${this.line}: ${message}`);
  }

  hold(token: Token): void {
    this.held = token;
  }

  peek(): Token {
    const token = this.next();
    this.held = token;
    return token;
  }

  next(): Token {
    if (this.held) {
      const token = this.held;
      this.held = undefined;
      return token;
    }
    for (;;) {
      const token = this.raw();
      if (token.k === 'eof' && this.stack.length > 0) {
        const outer = this.stack.pop()!;
        this.src = outer.src;
        this.pos = outer.pos;
        this.line = outer.line;
        this.file = outer.file;
        continue;
      }
      if (token.k === 'name') {
        // Directives that only the reader handles.
        if (token.v === 'stringescapes') {
          const open = this.realChar();
          const close = this.realChar();
          this.start = open;
          this.end = close;
          continue;
        }
        if (token.v === 'stringdef') {
          this.stringdef();
          continue;
        }
        if (token.v === 'get') {
          const file = this.next();
          if (file.k !== 'str') {
            this.fail('string omitted after get');
          }
          const path = resolve(dirname(this.file), file.v);
          this.stack.push({
            src: this.src,
            pos: this.pos,
            line: this.line,
            file: this.file,
          });
          this.src = readFileSync(path, 'utf8');
          this.pos = 0;
          this.line = 1;
          this.file = path;
          continue;
        }
      }
      return token;
    }
  }

  private realChar(): string {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      if (this.src[this.pos] === '\n') {
        this.line++;
      }
      this.pos++;
    }
    return this.src[this.pos++];
  }

  /** The character that a number of a `hex` or `decimal` stringdef stands for. */
  private character(code: number): string {
    return this.charset === undefined
      ? String.fromCharCode(code)
      : new TextDecoder(this.charset).decode(Uint8Array.of(code));
  }

  private stringdef(): void {
    // The name is the run of characters up to the next space.
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      if (this.src[this.pos] === '\n') {
        this.line++;
      }
      this.pos++;
    }
    const from = this.pos;
    while (this.pos < this.src.length && !/\s/.test(this.src[this.pos])) {
      this.pos++;
    }
    const name = this.src.slice(from, this.pos);
    let token = this.next();
    let base = 0;
    if (token.k === 'name' && token.v === 'hex') {
      base = 16;
      token = this.next();
    } else if (token.k === 'name' && token.v === 'decimal') {
      base = 10;
      token = this.next();
    }
    if (token.k !== 'str') {
      this.fail('string omitted after stringdef');
    }
    let value = token.v;
    if (base > 0) {
      value = value
        .split(' ')
        .filter(Boolean)
        .map((n) => this.character(parseInt(n, base)))
        .join('');
    }
    this.macros.set(name, value);
    if (/^U\+/.test(name)) {
      this.uplus = 'defined';
    }
  }

  private raw(): Token {
    for (;;) {
      if (this.pos >= this.src.length) {
        return { k: 'eof', line: this.line };
      }
      const ch = this.src[this.pos];
      if (ch === '\n') {
        this.line++;
        this.pos++;
        continue;
      }
      if (/\s/.test(ch)) {
        this.pos++;
        continue;
      }
      if (ch === '/' && this.src[this.pos + 1] === '/') {
        while (this.pos < this.src.length && this.src[this.pos] !== '\n') {
          this.pos++;
        }
        continue;
      }
      if (ch === '/' && this.src[this.pos + 1] === '*') {
        const close = this.src.indexOf('*/', this.pos + 2);
        if (close < 0) {
          this.fail('/* comment not terminated');
        }
        for (let i = this.pos; i < close; i++) {
          if (this.src[i] === '\n') {
            this.line++;
          }
        }
        this.pos = close + 2;
        continue;
      }
      break;
    }
    const line = this.line;
    const ch = this.src[this.pos];
    if (/[A-Za-z]/.test(ch)) {
      const from = this.pos;
      while (
        this.pos < this.src.length &&
        /[A-Za-z0-9_]/.test(this.src[this.pos])
      ) {
        this.pos++;
      }
      return { k: 'name', v: this.src.slice(from, this.pos), line };
    }
    if (/[0-9]/.test(ch)) {
      const from = this.pos;
      while (this.pos < this.src.length && /[0-9]/.test(this.src[this.pos])) {
        this.pos++;
      }
      return { k: 'num', v: Number(this.src.slice(from, this.pos)), line };
    }
    if (ch === "'") {
      this.pos++;
      return { k: 'str', v: this.literal(), line };
    }
    for (const symbol of SYMBOLS) {
      if (this.src.startsWith(symbol, this.pos)) {
        this.pos += symbol.length;
        return { k: 'sym', v: symbol, line };
      }
    }
    this.fail(`'${ch}' unknown`);
  }

  private literal(): string {
    let out = '';
    for (;;) {
      if (this.pos >= this.src.length || this.src[this.pos] === '\n') {
        this.fail('string literal not terminated');
      }
      const ch = this.src[this.pos++];
      if (ch === this.start) {
        const close = this.src.indexOf(this.end, this.pos);
        if (close < 0) {
          this.fail('string literal not terminated');
        }
        const name = this.src.slice(this.pos, close);
        this.pos = close + 1;
        const macro = this.macros.get(name);
        if (macro !== undefined) {
          out += macro;
        } else if (name === "'" || name === this.start) {
          out += name;
        } else if (/^U\+[0-9A-Fa-f]+$/.test(name) && this.uplus !== 'defined') {
          out += String.fromCodePoint(parseInt(name.slice(2), 16));
        } else {
          this.fail(`string macro '${name}' undeclared`);
        }
      } else if (ch === "'") {
        return out;
      } else {
        out += ch;
      }
    }
  }
}

/** Reads a program and everything it `get`s. */
export function parseProgram(
  file: string,
  options: { charset?: string } = {}
): Program {
  return new Parser(
    new Lexer(readFileSync(file, 'utf8'), file, options.charset),
    file
  ).program();
}

/** Reads a program from text. */
export function parseSource(
  source: string,
  file = 'input.sbl',
  options: { charset?: string } = {}
): Program {
  return new Parser(new Lexer(source, file, options.charset), file).program();
}

class Parser {
  private readonly names = new Map<string, NameType>();
  private readonly routines: Routine[] = [];
  private readonly groupings: Grouping[] = [];
  private readonly groupingChars = new Map<string, number[]>();
  private mode: Mode = 'forward';
  private inBackwardMode = false;
  /** The `substring` that the next `among` belongs to. */
  private pendingSubstring: Node | undefined;

  private readonly lex: Lexer;
  private readonly file: string;

  constructor(lex: Lexer, file: string) {
    this.lex = lex;
    this.file = file;
  }

  private fail(token: Token, message: string): never {
    throw new Error(`${this.file}:${token.line}: ${message}`);
  }

  private sym(value: string): boolean {
    const token = this.lex.next();
    if (token.k === 'sym' && token.v === value) {
      return true;
    }
    this.lex.hold(token);
    return false;
  }

  private word(value: string): boolean {
    const token = this.lex.next();
    if (token.k === 'name' && token.v === value) {
      return true;
    }
    this.lex.hold(token);
    return false;
  }

  private expectSym(value: string): void {
    const token = this.lex.next();
    if (token.k !== 'sym' || token.v !== value) {
      this.fail(token, `expected '${value}'`);
    }
  }

  private expectName(): string {
    const token = this.lex.next();
    if (token.k !== 'name') {
      this.fail(token, 'name expected');
    }
    return token.v;
  }

  program(): Program {
    for (;;) {
      const token = this.lex.next();
      if (token.k === 'eof') {
        break;
      }
      if (token.k !== 'name') {
        this.fail(token, 'unexpected token');
      }
      switch (token.v) {
        case 'strings':
          this.declareNames('string');
          break;
        case 'booleans':
          this.declareNames('boolean');
          break;
        case 'integers':
          this.declareNames('integer');
          break;
        case 'routines':
          this.declareNames('routine');
          break;
        case 'externals':
          this.declareNames('external');
          break;
        case 'groupings':
          this.declareNames('grouping');
          break;
        case 'define':
          this.define();
          break;
        case 'backwardmode': {
          this.expectSym('(');
          this.inBackwardMode = true;
          this.body(')');
          this.inBackwardMode = false;
          break;
        }
        default:
          this.fail(token, `unexpected '${token.v}'`);
      }
    }
    return {
      file: this.file,
      names: this.names,
      routines: this.routines,
      groupings: this.groupings,
    };
  }

  private body(terminator: string): void {
    for (;;) {
      const token = this.lex.next();
      if (token.k === 'sym' && token.v === terminator) {
        return;
      }
      if (token.k === 'name' && token.v === 'define') {
        this.define();
      } else {
        this.fail(token, `unexpected token in backwardmode`);
      }
    }
  }

  private declareNames(type: NameType): void {
    this.expectSym('(');
    for (;;) {
      const token = this.lex.next();
      if (token.k === 'sym' && token.v === ')') {
        return;
      }
      if (token.k !== 'name') {
        this.fail(token, 'name expected');
      }
      this.names.set(token.v, type);
    }
  }

  private define(): void {
    const name = this.expectName();
    const type = this.names.get(name);
    if (type === 'grouping') {
      this.defineGrouping(name);
      return;
    }
    if (type !== 'routine' && type !== 'external') {
      throw new Error(
        `${this.file}: '${name}' is not declared as a routine or a grouping`
      );
    }
    if (!this.word('as')) {
      throw new Error(`${this.file}: 'as' expected after define ${name}`);
    }
    this.mode = this.inBackwardMode ? 'backward' : 'forward';
    const body = this.command();
    this.routines.push({ name, mode: this.mode, body });
  }

  private defineGrouping(name: string): void {
    let chars: number[] = [];
    let style: '+' | '-' = '+';
    for (let first = true; ; first = false) {
      const token = this.lex.next();
      let group: number[];
      if (token.k === 'str') {
        group = Array.from(token.v, (c) => c.charCodeAt(0));
      } else if (token.k === 'name' && this.names.get(token.v) === 'grouping') {
        group = this.groupingChars.get(token.v) ?? [];
      } else {
        this.fail(token, 'string or grouping expected');
      }
      if (style === '+') {
        chars = chars.concat(group);
      } else {
        chars = chars.filter((c) => !group.includes(c));
      }
      const op = this.lex.next();
      if (op.k === 'sym' && (op.v === '+' || op.v === '-')) {
        style = op.v;
        continue;
      }
      this.lex.hold(op);
      void first;
      break;
    }
    chars = [...new Set(chars)].sort((a, b) => a - b);
    this.groupingChars.set(name, chars);
    this.groupings.push({ name, chars });
  }

  // ---- commands ---------------------------------------------------------

  private node(n: Body<Node>, line = 0): Node {
    return { ...n, mode: this.mode, line } as Node;
  }

  /** A parenthesised list, with `or` and `and` chaining left to right. */
  private list(line: number): Node {
    const items: Node[] = [];
    for (;;) {
      if (this.sym(')')) {
        break;
      }
      const peek = this.lex.peek();
      if (peek.k === 'eof') {
        this.fail(peek, "missing ')'");
      }
      let q = this.command();
      for (;;) {
        if (this.word('or')) {
          const alternatives = [q];
          do {
            alternatives.push(this.command());
          } while (this.word('or'));
          q = this.node({ t: 'or', items: alternatives }, line);
        } else if (this.word('and')) {
          const all = [q];
          do {
            all.push(this.command());
          } while (this.word('and'));
          q = this.node({ t: 'and', items: all }, line);
        } else {
          break;
        }
      }
      items.push(q);
    }
    if (items.length === 1) {
      return items[0];
    }
    return this.node({ t: 'seq', items }, line);
  }

  private command(): Node {
    const token = this.lex.next();
    const line = token.line;
    if (token.k === 'sym') {
      switch (token.v) {
        case '(':
          return this.list(line);
        case '[':
          return this.node({ t: 'leftslice' }, line);
        case ']':
          return this.node({ t: 'rightslice' }, line);
        case '$':
          return this.dollar(line);
        case '?':
          return this.node({ t: 'true' }, line);
        case '<-':
          return this.stringCommand('slicefrom', line);
        case '<+':
          return this.stringCommand('insert', line);
        case '->':
          return this.node({ t: 'sliceto', name: this.expectName() }, line);
        case '=>':
          return this.node({ t: 'assignto', name: this.expectName() }, line);
        default:
          this.fail(token, `unexpected '${token.v}'`);
      }
    }
    if (token.k === 'str') {
      return this.node({ t: 'lit', s: token.v }, line);
    }
    if (token.k !== 'name') {
      this.fail(token, 'command expected');
    }
    switch (token.v) {
      case 'not':
      case 'try':
      case 'do':
      case 'test':
      case 'fail':
      case 'goto':
      case 'gopast':
      case 'repeat':
        return this.node({ t: token.v, c: this.command() }, line);
      case 'backwards': {
        const mode = this.mode;
        this.mode = 'backward';
        const inner = this.command();
        this.mode = mode;
        return this.node({ t: 'backwards', c: inner }, line);
      }
      case 'reverse': {
        const mode = this.mode;
        this.mode = mode === 'forward' ? 'backward' : 'forward';
        const inner = this.command();
        this.mode = mode;
        return this.node({ t: 'reverse', c: inner }, line);
      }
      case 'loop':
      case 'atleast': {
        const n = this.ae();
        return this.node({ t: token.v, n, c: this.command() }, line);
      }
      case 'hop':
        return this.node({ t: 'hop', n: this.ae() }, line);
      case 'next':
        return this.node({ t: 'next' }, line);
      case 'tolimit':
        return this.node({ t: 'tolimit' }, line);
      case 'true':
        return this.node({ t: 'true' }, line);
      case 'false':
        return this.node({ t: 'false' }, line);
      case 'delete':
        return this.node({ t: 'slicefrom', s: '' }, line);
      case 'insert':
      case 'attach':
        return this.stringCommand(token.v, line);
      case 'tomark':
        return this.node({ t: 'tomark', ae: this.ae() }, line);
      case 'atmark':
        return this.node(
          { t: 'cmp', op: '==', l: { t: 'cursor' }, r: this.ae() },
          line
        );
      case 'atlimit':
        return this.node(
          this.mode === 'forward'
            ? {
                t: 'cmp',
                op: '>=',
                l: { t: 'cursor' },
                r: { t: 'limit', mode: this.mode },
              }
            : {
                t: 'cmp',
                op: '<=',
                l: { t: 'cursor' },
                r: { t: 'limit', mode: this.mode },
              },
          line
        );
      case 'setmark': {
        const name = this.expectName();
        return this.node({ t: 'assign', name, ae: { t: 'cursor' } }, line);
      }
      case 'setlimit': {
        const c1 = this.command();
        if (!this.word('for')) {
          this.fail(token, "'for' expected after setlimit");
        }
        return this.node({ t: 'setlimit', c1, c2: this.command() }, line);
      }
      case 'set':
      case 'unset':
        return this.node({ t: token.v, name: this.expectName() }, line);
      case 'non': {
        this.sym('-');
        return this.node({ t: 'non', name: this.expectName() }, line);
      }
      case 'substring': {
        const node = this.node({ t: 'substring' }, line);
        this.pendingSubstring = node;
        return node;
      }
      case 'among':
        return this.among(line);
      default: {
        if (KEYWORDS.has(token.v)) {
          this.fail(token, `unexpected '${token.v}'`);
        }
        const type = this.names.get(token.v);
        switch (type) {
          case 'boolean':
            return this.node({ t: 'booltest', name: token.v }, line);
          case 'string':
            return this.node({ t: 'str', name: token.v }, line);
          case 'grouping':
            return this.node({ t: 'grouping', name: token.v }, line);
          case 'routine':
          case 'external':
            return this.node({ t: 'call', name: token.v }, line);
          case 'integer':
            this.fail(token, `integer name '${token.v}' misplaced`);
          default:
            this.fail(token, `'${token.v}' undeclared`);
        }
      }
    }
  }

  private stringCommand(
    kind: 'slicefrom' | 'insert' | 'attach',
    line: number
  ): Node {
    const token = this.lex.next();
    if (token.k === 'str') {
      return this.node({ t: kind, s: token.v } as Body<Node>, line);
    }
    if (token.k === 'name' && this.names.get(token.v) === 'string') {
      return this.node({ t: kind, name: token.v } as Body<Node>, line);
    }
    this.fail(token, 'string omitted');
  }

  private dollar(line: number): Node {
    const token = this.lex.next();
    if (token.k === 'sym' && token.v === '(') {
      const l = this.ae();
      const op = this.lex.next();
      if (
        op.k !== 'sym' ||
        !['==', '!=', '<', '<=', '>', '>='].includes(op.v)
      ) {
        this.fail(op, 'relational operator expected');
      }
      const r = this.ae();
      this.expectSym(')');
      return this.node({ t: 'cmp', op: op.v as RelOp, l, r }, line);
    }
    if (token.k !== 'name') {
      this.fail(token, 'integer test expression expected');
    }
    if (this.names.get(token.v) === 'string') {
      this.fail(token, `$ on the string '${token.v}' is not supported`);
    }
    const op = this.lex.next();
    if (op.k !== 'sym') {
      this.fail(op, 'operator expected');
    }
    const rel: Record<string, RelOp> = {
      '==': '==',
      '!=': '!=',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
    };
    if (rel[op.v]) {
      return this.node(
        {
          t: 'cmp',
          op: rel[op.v],
          l: { t: 'var', name: token.v },
          r: this.ae(),
        },
        line
      );
    }
    const assign: Record<
      string,
      'assign' | 'plus' | 'minus' | 'times' | 'divide'
    > = {
      '=': 'assign',
      '+=': 'plus',
      '-=': 'minus',
      '*=': 'times',
      '/=': 'divide',
    };
    if (!assign[op.v]) {
      this.fail(op, `unexpected '${op.v}'`);
    }
    return this.node({ t: assign[op.v], name: token.v, ae: this.ae() }, line);
  }

  // ---- arithmetic -------------------------------------------------------

  private ae(): AE {
    let left = this.term();
    for (;;) {
      if (this.sym('+')) {
        left = { t: 'bin', op: '+', l: left, r: this.term() };
      } else if (this.sym('-')) {
        left = { t: 'bin', op: '-', l: left, r: this.term() };
      } else {
        return left;
      }
    }
  }

  private term(): AE {
    let left = this.factor();
    for (;;) {
      if (this.sym('*')) {
        left = { t: 'bin', op: '*', l: left, r: this.factor() };
      } else if (this.sym('/')) {
        left = { t: 'bin', op: '/', l: left, r: this.factor() };
      } else {
        return left;
      }
    }
  }

  private factor(): AE {
    const token = this.lex.next();
    if (token.k === 'num') {
      return { t: 'num', v: token.v };
    }
    if (token.k === 'sym') {
      if (token.v === '-') {
        return { t: 'neg', a: this.factor() };
      }
      if (token.v === '(') {
        const inner = this.ae();
        this.expectSym(')');
        return inner;
      }
    }
    if (token.k === 'name') {
      switch (token.v) {
        case 'cursor':
          return { t: 'cursor' };
        case 'limit':
          return { t: 'limit', mode: this.mode };
        case 'size':
        case 'len':
          return { t: 'size' };
        case 'maxint':
          return { t: 'maxint' };
        case 'minint':
          return { t: 'minint' };
        case 'sizeof':
        case 'lenof':
          return { t: 'sizeof', name: this.expectName() };
        default:
          if (this.names.get(token.v) === 'integer') {
            return { t: 'var', name: token.v };
          }
      }
    }
    this.fail(token, 'arithmetic expression expected');
  }

  // ---- among ------------------------------------------------------------

  private among(line: number): Node {
    const substring = this.pendingSubstring;
    this.pendingSubstring = undefined;
    this.expectSym('(');
    const entries: AmongEntry[] = [];
    let pending: AmongEntry[] = [];
    let starter: Node | undefined;
    for (;;) {
      const token = this.lex.next();
      if (token.k === 'sym' && token.v === ')') {
        break;
      }
      if (token.k === 'str') {
        const entry: AmongEntry = { s: token.v };
        const next = this.lex.next();
        if (next.k === 'name' && this.names.get(next.v) === 'routine') {
          entry.guard = next.v;
        } else {
          this.lex.hold(next);
        }
        entries.push(entry);
        pending.push(entry);
      } else if (token.k === 'sym' && token.v === '(') {
        if (entries.length === 0) {
          // A starter, the legacy way to put code between `substring` and the among.
          starter = this.list(token.line);
          continue;
        }
        const action = this.list(token.line);
        const empty = action.t === 'seq' && action.items.length === 0;
        if (!empty) {
          for (const entry of pending) {
            entry.action = action;
          }
        }
        pending = [];
      } else {
        this.fail(token, 'unexpected token in among(...)');
      }
    }
    // A string that comes twice does the same thing both times, or the program is wrong.
    const seen = new Map<string, AmongEntry>();
    const unique = entries.filter((entry) => {
      const first = seen.get(entry.s);
      if (!first) {
        seen.set(entry.s, entry);
        return true;
      }
      const same = (a?: Node, b?: Node) =>
        a === b ||
        (a && b && JSON.stringify(a, dropLine) === JSON.stringify(b, dropLine));
      if (first.guard !== entry.guard || !same(first.action, entry.action)) {
        throw new Error(
          `${this.file}:${line}: among(...) has repeated string '${entry.s}' with another action`
        );
      }
      return false;
    });
    const node = this.node({ t: 'among', entries: unique, substring }, line);
    if (substring && substring.t === 'substring') {
      substring.among = node;
    }
    if (starter) {
      // `among ( (starter) 'x' ... )` is `substring (starter) among ( 'x' ... )`.
      if (substring) {
        return this.node({ t: 'seq', items: [starter, node] }, line);
      }
      const own = this.node({ t: 'substring', among: node }, line);
      if (node.t === 'among') {
        node.substring = own;
      }
      return this.node({ t: 'seq', items: [own, starter, node] }, line);
    }
    return node;
  }
}
