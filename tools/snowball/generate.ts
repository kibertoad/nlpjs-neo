/**
 * Turns a Snowball program into a TypeScript stemmer.
 *
 * The stemmer is a class on `SnowballStemmer`, so it runs on the runtime of
 * `@nlpjs-neo/core`: a cursor over `current`, the grouping and among
 * primitives, and the slicing. What each command means is what the manual and
 * the reference compiler say; how it is written is chosen for the reader:
 * labelled blocks for the commands that can fail, the scans of `gopast` and
 * `goto` as calls, and the routines that only test a condition as a return.
 */
import type {
  AE,
  AmongEntry,
  Mode,
  Node,
  Program,
  RelOp,
  Routine,
} from './sbl.ts';

export interface GenerateOptions {
  /** Name of the class, as `StemmerEn`. */
  className: string;
  /** Name the stemmer registers under, as `stemmer-en`. */
  name: string;
  /** The `.sbl` file the program was read from, for the header. */
  source: string;
  /** Leave out `R1`, `R2` and `RV` when they are the ones of `SnowballStemmer`. */
  inheritRegions?: boolean;
}

type Signal = 1 | 0 | -1;

interface AmongTable {
  name: string;
  backward: boolean;
  rows: { s: string; i: number; result: number; guard?: string }[];
  /** Action of each result, from 1. */
  actions: Node[];
  /** Whether the lookup cannot fail, because the table holds the empty string. */
  alwaysMatches: boolean;
}

const REGIONS: Record<string, string> = { R1: 'p1', R2: 'p2', RV: 'pV' };

export function generate(program: Program, options: GenerateOptions): string {
  return new Generator(program, options).run();
}

function quote(s: string): string {
  // A string that holds an apostrophe and no double quote reads best in double quotes.
  if (
    s.includes("'") &&
    /^[\x20-\x7e]*$/.test(s) &&
    !s.includes('"') &&
    !s.includes('\\')
  ) {
    return `"${s}"`;
  }
  let out = "'";
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (ch === "'") {
      out += "\\'";
    } else if (ch === '\\') {
      out += '\\\\';
    } else if (code < 0x20 || code >= 0x7f) {
      for (let i = 0; i < ch.length; i++) {
        out += `\\u${ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')}`;
      }
    } else {
      out += ch;
    }
  }
  return `${out}'`;
}

const WIDTH = 80;
const NEWLINE = String.fromCharCode(10);

/**
 * A static field that holds an array, laid out as the formatter would: on one
 * line when it fits, else the numbers packed line by line or the rows one to a
 * line.
 */
function arrayField(head: string, items: string[], pack: boolean): string {
  const single = `  ${head} = [${items.join(', ')}];`;
  if (single.length <= WIDTH) {
    return single;
  }
  const lines: string[] = [];
  if (pack) {
    let line = '   ';
    for (const item of items) {
      const next = `${line} ${item},`;
      if (next.length > WIDTH && line.trim() !== '') {
        lines.push(line);
        line = `    ${item},`;
      } else {
        line = next;
      }
    }
    lines.push(line);
  } else {
    for (const item of items) {
      lines.push(`    ${item},`);
    }
  }
  return [`  ${head} = [`, ...lines, '  ];'].join(NEWLINE);
}

/**
 * A table written as the text `Among.table` reads, wrapped to the width, when
 * it can be: no guards, and no string that the text cannot hold.
 */
function amongText(table: AmongTable, className: string): string | undefined {
  const safe = /^[^\s,`$\\\p{Cc}]+$/u;
  if (table.rows.some((row) => row.guard || !safe.test(row.s))) {
    return undefined;
  }
  const head = `  static ${table.name} = Among.table<${className}>(\``;
  const lines: string[] = [];
  let line = '   ';
  for (const row of table.rows) {
    const entry = `${row.s},${row.i},${row.result}`;
    if (line.length + 1 + entry.length > WIDTH && line.trim() !== '') {
      lines.push(line);
      line = '   ';
    }
    line += ` ${entry}`;
  }
  lines.push(line);
  return [head, ...lines, '  `);'].join(NEWLINE);
}

function strip(node: unknown): unknown {
  return JSON.parse(
    JSON.stringify(node, (key, value) =>
      key === 'line' || key === 'among' || key === 'substring'
        ? undefined
        : value
    )
  );
}

type Wrapped = Node & { c: Node };
type Listed = Node & { items: Node[] };

class Generator {
  private readonly program: Program;
  private readonly options: GenerateOptions;
  private readonly routines = new Map<string, Routine>();
  private readonly signalMemo = new Map<string, Signal>();
  private readonly tables = new Map<Node, AmongTable>();
  private readonly tableList: AmongTable[] = [];

  // Emission state.
  private lines: string[] = [];
  private depth = 0;
  private labels = 0;
  private vars = 0;
  private fail: string[] = ['return false;'];
  private unreachable = false;
  /** Whether `among_var` is a variable of the routine rather than of one block. */
  private amongVarShared = false;
  private constAmong = new Set<Node>();

  constructor(program: Program, options: GenerateOptions) {
    this.program = program;
    this.options = options;
    for (const routine of program.routines) {
      this.routines.set(routine.name, routine);
    }
  }

  // ---- analysis ---------------------------------------------------------

  private signalOfRoutine(name: string): Signal {
    const known = this.signalMemo.get(name);
    if (known !== undefined) {
      return known;
    }
    // A call that comes back to a routine being worked out is not known.
    this.signalMemo.set(name, -1);
    const routine = this.routines.get(name);
    const signal = routine ? this.signal(routine.body) : -1;
    this.signalMemo.set(name, signal);
    return signal;
  }

  /** Whether a command always succeeds (1), always fails (0) or may do either (-1). */
  private signal(node: Node): Signal {
    switch (node.t) {
      case 'seq':
      case 'and': {
        let result: Signal = 1;
        for (const item of node.items) {
          const s = this.signal(item);
          if (s === 0) {
            return 0;
          }
          if (s === -1) {
            result = -1;
          }
        }
        return result;
      }
      case 'or': {
        let allFail = true;
        for (const item of node.items) {
          const s = this.signal(item);
          if (s === 1) {
            return 1;
          }
          if (s !== 0) {
            allFail = false;
          }
        }
        return allFail ? 0 : -1;
      }
      case 'not': {
        const s = this.signal(node.c);
        return s === 1 ? 0 : s === 0 ? 1 : -1;
      }
      case 'try':
      case 'do':
      case 'repeat':
        return 1;
      case 'test':
      case 'backwards':
      case 'reverse':
        return this.signal(node.c);
      case 'fail':
      case 'false':
        return 0;
      case 'goto':
      case 'gopast': {
        const s = this.signal(node.c);
        return s === 1 ? 1 : s === 0 ? 0 : -1;
      }
      case 'loop':
      case 'atleast': {
        const s = this.signal(node.c);
        return s === 1 ? 1 : -1;
      }
      case 'setlimit': {
        const first = this.signal(node.c1);
        if (first === 0) {
          return 0;
        }
        const second = this.signal(node.c2);
        return first === 1 ? second : second === 0 ? 0 : -1;
      }
      case 'true':
      case 'leftslice':
      case 'rightslice':
      case 'tolimit':
      case 'slicefrom':
      case 'insert':
      case 'attach':
      case 'sliceto':
      case 'assignto':
      case 'set':
      case 'unset':
      case 'assign':
      case 'plus':
      case 'minus':
      case 'times':
      case 'divide':
        return 1;
      case 'call':
        return this.signalOfRoutine(node.name);
      case 'substring':
        return node.among && this.amongOf(node.among).alwaysMatches ? 1 : -1;
      case 'among': {
        const table = this.amongOf(node);
        const lookupFails = !node.substring && !table.alwaysMatches;
        let all1 = true;
        let all0 = true;
        for (const entry of node.entries) {
          const s: Signal = entry.action ? this.signal(entry.action) : 1;
          if (s !== 1) {
            all1 = false;
          }
          if (s !== 0) {
            all0 = false;
          }
        }
        if (lookupFails) {
          return all0 ? 0 : -1;
        }
        return all1 ? 1 : all0 ? 0 : -1;
      }
      default:
        return -1;
    }
  }

  /** Whether a line of code fits the width the formatter keeps, at the current indent. */
  private fits(text: string): boolean {
    return '  '.repeat(this.depth).length + text.length <= WIDTH;
  }

  /** Whether a chain of commands may leave the cursor somewhere new, so it has to be kept. */
  private keepNeeded(nodes: Node[], depth = 0): boolean {
    return nodes.some((node) => this.keepNeededNode(node, depth));
  }

  private keepNeededNode(node: Node, depth: number): boolean {
    switch (node.t) {
      case 'assignto':
      case 'do':
      case 'leftslice':
      case 'rightslice':
      case 'assign':
      case 'plus':
      case 'minus':
      case 'times':
      case 'divide':
      case 'cmp':
      case 'sliceto':
      case 'booltest':
      case 'notbooltest':
      case 'set':
      case 'unset':
      case 'true':
      case 'false':
        return false;
      case 'attach':
        return node.mode === 'backward';
      case 'insert':
        return node.mode === 'forward';
      case 'call': {
        if (depth >= 100) {
          return true;
        }
        const routine = this.routines.get(node.name);
        return routine ? this.keepNeededNode(routine.body, depth + 1) : true;
      }
      case 'seq':
        return this.keepNeeded(node.items, depth);
      case 'loop':
      case 'fail':
        return this.keepNeededNode(node.c, depth);
      case 'backwards':
      case 'reverse':
      case 'test':
        return this.signal(node) !== 1;
      default:
        return true;
    }
  }

  /** Whether a command may leave the cursor somewhere new when it fails. */
  private keepNeededOnFail(node: Node, depth = 0): boolean {
    switch (node.t) {
      case 'assignto':
      case 'do':
      case 'assign':
      case 'plus':
      case 'minus':
      case 'times':
      case 'divide':
      case 'cmp':
      case 'sliceto':
      case 'booltest':
      case 'notbooltest':
      case 'set':
      case 'unset':
      case 'true':
      case 'false':
      case 'leftslice':
      case 'rightslice':
      case 'grouping':
      case 'lit':
      case 'str':
      case 'non':
      case 'hop':
      case 'next':
      case 'substring':
      case 'tomark':
      case 'repeat':
      case 'slicefrom':
      case 'tolimit':
      case 'attach':
      case 'insert':
      case 'goto':
      case 'try':
        return false;
      case 'gopast':
        return !this.repeatRestore(node.c);
      case 'call': {
        if (depth >= 100) {
          return true;
        }
        const routine = this.routines.get(node.name);
        return routine ? this.keepNeededNode(routine.body, depth + 1) : true;
      }
      case 'seq':
        return this.keepNeeded(node.items, depth);
      case 'loop':
      case 'fail':
        return this.keepNeededNode(node.c, depth);
      case 'backwards':
      case 'reverse':
      case 'test':
        return this.signal(node) !== 1;
      default:
        return true;
    }
  }

  private keepForOr(items: Node[]): boolean {
    return items.slice(0, -1).some((item) => this.keepNeededOnFail(item));
  }

  private keepForAnd(items: Node[]): boolean {
    return items.slice(0, -1).some((item) => this.keepNeededNode(item, 0));
  }

  /** Whether a repeated command must have the cursor put back after it fails. */
  private repeatRestore(node: Node): boolean {
    return this.repeatScore(node, 0) >= 2;
  }

  private repeatScore(node: Node, depth: number): number {
    switch (node.t) {
      case 'leftslice':
      case 'rightslice':
      case 'assign':
      case 'plus':
      case 'minus':
      case 'times':
      case 'divide':
      case 'cmp':
      case 'sliceto':
      case 'booltest':
      case 'notbooltest':
      case 'set':
      case 'unset':
      case 'true':
      case 'false':
        return 0;
      case 'call': {
        if (depth >= 100) {
          return 2;
        }
        const routine = this.routines.get(node.name);
        return routine ? this.repeatScore(routine.body, depth + 1) : 2;
      }
      case 'seq': {
        let score = 0;
        for (const item of node.items) {
          score += this.repeatScore(item, depth);
          if (score >= 2) {
            return score;
          }
        }
        return score;
      }
      case 'str':
      case 'lit':
      case 'next':
      case 'grouping':
      case 'non':
      case 'hop':
        return 1;
      default:
        return 2;
    }
  }

  // ---- among ------------------------------------------------------------

  private amongOf(node: Node): AmongTable {
    if (node.t !== 'among') {
      throw new Error('among expected');
    }
    let table = this.tables.get(node);
    if (table) {
      return table;
    }
    const backward = (node.substring ?? node).mode === 'backward';
    const actions: Node[] = [];
    const keys: string[] = [];
    const results: number[] = [];
    for (const entry of node.entries) {
      if (!entry.action) {
        results.push(-1);
        continue;
      }
      const key = JSON.stringify(strip(entry.action));
      let index = keys.indexOf(key);
      if (index < 0) {
        keys.push(key);
        actions.push(entry.action);
        index = keys.length - 1;
      }
      results.push(index + 1);
    }
    const reverse = (s: string) => Array.from(s).reverse().join('');
    const sorted = node.entries
      .map((entry: AmongEntry, at: number) => ({
        s: entry.s,
        key: backward ? reverse(entry.s) : entry.s,
        result: results[at],
        guard: entry.guard,
        i: -1,
      }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    for (let at = sorted.length - 1; at >= 0; at--) {
      for (let before = at - 1; before >= 0; before--) {
        if (
          sorted[before].key.length < sorted[at].key.length &&
          sorted[at].key.startsWith(sorted[before].key)
        ) {
          sorted[at].i = before;
          break;
        }
      }
    }
    table = {
      name: `a_${this.tableList.length}`,
      backward,
      rows: sorted.map(({ s, i, result, guard }) => ({ s, i, result, guard })),
      actions,
      alwaysMatches: node.entries.some(
        (entry) => entry.s === '' && !entry.guard
      ),
    };
    this.tables.set(node, table);
    this.tableList.push(table);
    return table;
  }

  // ---- emission helpers -------------------------------------------------

  private line(text: string): void {
    this.lines.push(`${'  '.repeat(this.depth)}${text}`);
  }

  private open(text: string): void {
    this.line(text);
    this.depth++;
  }

  private close(text = '}'): void {
    this.depth--;
    this.line(text);
  }

  private label(): string {
    return `lab${this.labels++}`;
  }

  private newVar(): string {
    return `v_${++this.vars}`;
  }

  private emitFail(): void {
    for (const statement of this.fail) {
      this.line(statement);
    }
    this.unreachable = true;
  }

  private ifFail(condition: string): void {
    this.open(`if (${condition}) {`);
    this.emitFail();
    this.close();
    this.unreachable = false;
  }

  private failIsReturn(): boolean {
    return this.fail.length === 1 && this.fail[0] === 'return false;';
  }

  private withFail<T>(statements: string[], run: () => T): T {
    const saved = this.fail;
    this.fail = statements;
    try {
      return run();
    } finally {
      this.fail = saved;
    }
  }

  /** A saved cursor: the statement that saves it and the one that puts it back. */
  private saveCursor(mode: Mode): { decl: string; restore: string } {
    const name = this.newVar();
    return mode === 'forward'
      ? {
          decl: `const ${name} = this.cursor;`,
          restore: `this.cursor = ${name};`,
        }
      : {
          decl: `const ${name} = this.limit - this.cursor;`,
          restore: `this.cursor = this.limit - ${name};`,
        };
  }

  private field(kind: 'I' | 'B' | 'S', name: string): string {
    return `this.${kind}_${name}`;
  }

  private ae(node: AE): string {
    switch (node.t) {
      case 'num':
        return String(node.v);
      case 'var':
        return this.field('I', node.name);
      case 'cursor':
        return 'this.cursor';
      case 'limit':
        return node.mode === 'forward' ? 'this.limit' : 'this.limit_backward';
      case 'size':
        return 'this.current.length';
      case 'maxint':
        return '2147483647';
      case 'minint':
        return '-2147483648';
      case 'sizeof':
        return `${this.field('S', node.name)}.length`;
      case 'neg':
        return `-${this.ae(node.a)}`;
      case 'bin': {
        const l = this.ae(node.l);
        const r = this.ae(node.r);
        return node.op === '/'
          ? `Math.trunc(${l} / ${r})`
          : `(${l} ${node.op} ${r})`;
      }
    }
  }

  /** An expression that stands alone, so it needs no parentheses of its own. */
  private aeTop(node: AE): string {
    if (node.t === 'bin' && node.op !== '/') {
      return `${this.ae(node.l)} ${node.op} ${this.ae(node.r)}`;
    }
    return this.ae(node);
  }

  private invert(op: RelOp): RelOp {
    return {
      '==': '!=',
      '!=': '==',
      '<': '>=',
      '>=': '<',
      '>': '<=',
      '<=': '>',
    }[op] as RelOp;
  }

  private groupingRange(name: string): {
    table: string;
    min: number;
    max: number;
  } {
    const grouping = this.program.groupings.find((g) => g.name === name);
    if (!grouping) {
      throw new Error(`grouping ${name} is not defined`);
    }
    return {
      table: `${this.options.className}.g_${name}`,
      min: grouping.chars[0] ?? 0,
      max: grouping.chars[grouping.chars.length - 1] ?? 0,
    };
  }

  /** The value of a string command, as the argument of eq_s and its like. */
  private stringArg(node: { s?: string; name?: string }): string {
    return node.s !== undefined ? quote(node.s) : this.field('S', node.name!);
  }

  // ---- commands ---------------------------------------------------------

  private genSeq(items: Node[], tail: boolean): void {
    for (let i = 0; i < items.length; i++) {
      const [first, second, third] = [items[i], items[i + 1], items[i + 2]];
      if (
        first.t === 'leftslice' &&
        second?.t === 'substring' &&
        third?.t === 'rightslice' &&
        this.sliceable(second)
      ) {
        // `[substring]` marks the slice around what the among matches.
        this.genSubstring(second, true);
        i += 2;
      } else {
        this.gen(first, tail && i === items.length - 1);
      }
      if (this.unreachable) {
        break;
      }
    }
  }

  /** Whether a `substring` looks its among up in a table, rather than being one string. */
  private sliceable(node: Node): boolean {
    return (
      node.t === 'substring' &&
      node.among?.t === 'among' &&
      node.among.entries.length > 1
    );
  }

  /** A test that a routine can end on, as `return this.eq_s('x');`. */
  private test(expression: string, negated: string, tail: boolean): void {
    if (tail && this.failIsReturn()) {
      this.line(`return ${expression};`);
      this.unreachable = true;
    } else {
      this.ifFail(negated);
    }
  }

  private gen(node: Node, tail = false): void {
    const b = node.mode === 'forward' ? '' : '_b';
    switch (node.t) {
      case 'seq':
        return this.genSeq(node.items, tail);
      case 'and':
        return this.genAnd(node);
      case 'or':
        return this.genOr(node, tail);
      case 'not':
        return this.genNot(node);
      case 'try':
        return this.genTry(node);
      case 'do':
        return this.genDo(node);
      case 'test':
      case 'reverse':
        return this.genTest(node);
      case 'fail':
        this.gen(node.c);
        if (!this.unreachable) {
          this.emitFail();
        }
        return;
      case 'goto':
      case 'gopast':
        return this.genGo(node);
      case 'repeat':
        return this.genRepeat(node, undefined);
      case 'loop':
        return this.genLoop(node);
      case 'atleast':
        return this.genAtleast(node);
      case 'backwards':
        this.line('this.limit_backward = this.cursor;');
        this.line('this.cursor = this.limit;');
        this.gen(node.c);
        this.line('this.cursor = this.limit_backward;');
        return;
      case 'setlimit':
        return this.genSetlimit(node);
      case 'next':
        this.ifFail(
          node.mode === 'forward'
            ? 'this.cursor >= this.limit'
            : 'this.cursor <= this.limit_backward'
        );
        this.line(
          node.mode === 'forward' ? 'this.cursor++;' : 'this.cursor--;'
        );
        return;
      case 'hop':
        return this.genHop(node);
      case 'tolimit':
        this.line(
          node.mode === 'forward'
            ? 'this.cursor = this.limit;'
            : 'this.cursor = this.limit_backward;'
        );
        return;
      case 'tomark': {
        this.ifFail(
          `this.cursor ${node.mode === 'forward' ? '>' : '<'} ${this.ae(node.ae)}`
        );
        this.line(`this.cursor = ${this.ae(node.ae)};`);
        return;
      }
      case 'true':
        return;
      case 'false':
        this.emitFail();
        return;
      case 'leftslice':
        this.line(
          node.mode === 'forward'
            ? 'this.bra = this.cursor;'
            : 'this.ket = this.cursor;'
        );
        return;
      case 'rightslice':
        this.line(
          node.mode === 'forward'
            ? 'this.ket = this.cursor;'
            : 'this.bra = this.cursor;'
        );
        return;
      case 'lit': {
        const call = `this.eq_s${b}(${quote(node.s)})`;
        return this.test(call, `!${call}`, tail);
      }
      case 'str': {
        const call = `this.eq_s${b}(${this.field('S', node.name)})`;
        return this.test(call, `!${call}`, tail);
      }
      case 'grouping':
      case 'non': {
        const { table, min, max } = this.groupingRange(node.name);
        const call = `this.${node.t === 'grouping' ? 'in' : 'out'}_grouping${b}(${table}, ${min}, ${max})`;
        return this.test(call, `!${call}`, tail);
      }
      case 'call':
        return this.genCall(node, tail);
      case 'slicefrom':
        this.line(
          node.s === ''
            ? 'this.slice_del();'
            : `this.slice_from(${this.stringArg(node)});`
        );
        return;
      case 'insert':
      case 'attach':
        return this.genInsert(node);
      case 'sliceto':
        this.line(`${this.field('S', node.name)} = this.slice_to();`);
        return;
      case 'assignto':
        this.line(
          `${this.field('S', node.name)} = this.current.slice(0, this.limit);`
        );
        return;
      case 'set':
      case 'unset':
        this.line(`${this.field('B', node.name)} = ${node.t === 'set'};`);
        return;
      case 'booltest':
        this.ifFail(`!${this.field('B', node.name)}`);
        return;
      case 'notbooltest':
        this.ifFail(this.field('B', node.name));
        return;
      case 'assign':
      case 'plus':
      case 'minus':
      case 'times':
      case 'divide':
        return this.genAssign(node);
      case 'cmp': {
        const l = this.aeTop(node.l);
        const r = this.aeTop(node.r);
        return this.test(
          `${l} ${node.op === '==' ? '===' : node.op === '!=' ? '!==' : node.op} ${r}`,
          `${l} ${this.invert(node.op) === '==' ? '===' : this.invert(node.op) === '!=' ? '!==' : this.invert(node.op)} ${r}`,
          tail
        );
      }
      case 'substring':
        return this.genSubstring(node);
      case 'among':
        return this.genAmong(node);
    }
  }

  private genAssign(node: Node & { name: string; ae: AE }): void {
    const target = this.field('I', node.name);
    const value = this.aeTop(node.ae);
    if (node.t === 'assign') {
      this.line(`${target} = ${value};`);
    } else if (node.t === 'plus') {
      this.line(
        node.ae.t === 'num' && node.ae.v === 1
          ? `${target}++;`
          : `${target} += ${value};`
      );
    } else if (node.t === 'minus') {
      this.line(
        node.ae.t === 'num' && node.ae.v === 1
          ? `${target}--;`
          : `${target} -= ${value};`
      );
    } else if (node.t === 'times') {
      this.line(`${target} *= ${value};`);
    } else {
      this.line(`${target} = Math.trunc(${target} / ${value});`);
    }
  }

  private genInsert(node: Node & { t: 'insert' | 'attach' }): void {
    let keep = node.t === 'attach';
    if (node.mode === 'backward') {
      keep = !keep;
    }
    const arg = this.stringArg(node);
    if (keep) {
      const name = this.newVar();
      this.line(`const ${name} = this.cursor;`);
      this.line(`this.insert(${name}, ${name}, ${arg});`);
      this.line(`this.cursor = ${name};`);
    } else {
      this.line(`this.insert(this.cursor, this.cursor, ${arg});`);
    }
  }

  private genHop(node: Node & { n: AE }): void {
    const forward = node.mode === 'forward';
    const sign = forward ? '+' : '-';
    if (node.n.t === 'num') {
      const n = node.n.v;
      this.ifFail(
        `this.cursor ${sign} ${n} ${forward ? '> this.limit' : '< this.limit_backward'}`
      );
      this.line(`this.cursor ${sign}= ${n};`);
      return;
    }
    const name = this.newVar();
    this.open('{');
    this.line(`const ${name} = this.cursor ${sign} ${this.ae(node.n)};`);
    this.ifFail(
      `${name} ${forward ? '> this.limit' : '< this.limit_backward'} || ${name} ${forward ? '<' : '>'} this.cursor`
    );
    this.line(`this.cursor = ${name};`);
    this.close();
  }

  private genCall(node: Node & { name: string }, tail: boolean): void {
    const method = this.methodOf(node.name);
    const signal = this.signalOfRoutine(node.name);
    if (tail && this.failIsReturn()) {
      this.line(`return this.${method}();`);
      this.unreachable = true;
    } else if (signal === 1) {
      this.line(`this.${method}();`);
    } else if (signal === 0) {
      this.line(`this.${method}();`);
      this.emitFail();
    } else {
      this.ifFail(`!this.${method}()`);
    }
  }

  private methodOf(name: string): string {
    if (this.program.names.get(name) === 'external' && name === 'stem') {
      return 'innerStem';
    }
    // A trailing underscore is dropped (Turkish has `mark_ymUs_`), unless
    // that would give two routines the same name.
    const bare = name.replace(/_+$/, '');
    return bare !== name && !this.routines.has(bare)
      ? `r_${bare}`
      : `r_${name}`;
  }

  private genAnd(node: Listed): void {
    const save = this.keepForAnd(node.items)
      ? this.saveCursor(node.mode)
      : undefined;
    if (save) {
      this.line(save.decl);
    }
    node.items.forEach((item, at) => {
      if (this.unreachable) {
        return;
      }
      this.gen(item);
      if (!this.unreachable && save && at < node.items.length - 1) {
        this.line(save.restore);
      }
    });
  }

  /**
   * A command that is one test with nothing to undo, as the expression that is
   * true when it succeeds and the one that is true when it fails.
   */
  private atom(node: Node): { yes: string; no: string } | undefined {
    const b = node.mode === 'forward' ? '' : '_b';
    const plain = (yes: string) => ({ yes, no: `!${yes}` });
    switch (node.t) {
      case 'lit':
        return plain(`this.eq_s${b}(${quote(node.s)})`);
      case 'str':
        return plain(`this.eq_s${b}(${this.field('S', node.name)})`);
      case 'grouping':
      case 'non': {
        const { table, min, max } = this.groupingRange(node.name);
        const io = node.t === 'grouping' ? 'in' : 'out';
        return plain(`this.${io}_grouping${b}(${table}, ${min}, ${max})`);
      }
      case 'booltest':
        return {
          yes: this.field('B', node.name),
          no: `!${this.field('B', node.name)}`,
        };
      case 'notbooltest':
        return {
          yes: `!${this.field('B', node.name)}`,
          no: this.field('B', node.name),
        };
      case 'cmp': {
        const l = this.aeTop(node.l);
        const r = this.aeTop(node.r);
        const show = (op: RelOp) =>
          op === '==' ? '===' : op === '!=' ? '!==' : op;
        return {
          yes: `${l} ${show(node.op)} ${r}`,
          no: `${l} ${show(this.invert(node.op))} ${r}`,
        };
      }
      case 'call':
        return this.signalOfRoutine(node.name) === -1 &&
          !this.keepNeededOnFail(node)
          ? plain(`this.${this.methodOf(node.name)}()`)
          : undefined;
      case 'among': {
        if (node.substring || node.entries.length < 2) {
          return undefined;
        }
        const table = this.amongOf(node);
        if (table.actions.length > 0 || table.alwaysMatches) {
          return undefined;
        }
        const call = `this.find_among${table.backward ? '_b' : ''}(${this.options.className}.${table.name})`;
        return { yes: `${call} !== 0`, no: `${call} === 0` };
      }
      default:
        return undefined;
    }
  }

  private genOr(node: Listed, tail: boolean): void {
    const atoms = node.items.map((item) => this.atom(item));
    const lead = atoms.slice(0, -1);
    if (lead.every((atom) => atom !== undefined)) {
      const failed = (lead as { yes: string; no: string }[])
        .map((atom) => atom.no)
        .join(' && ');
      const last = atoms[atoms.length - 1];
      if (last) {
        // Every alternative is one test that leaves the cursor alone when it fails.
        const all = atoms as { yes: string; no: string }[];
        const yes = all.map((atom) => atom.yes).join(' || ');
        const no = all.map((atom) => atom.no).join(' && ');
        if (this.fits(`if (${no}) {`)) {
          this.test(yes, no, tail);
          return;
        }
      } else if (this.fits(`if (${failed}) {`)) {
        // Tests that leave the cursor alone, then a command to try if none passes.
        this.open(`if (${failed}) {`);
        this.gen(node.items[node.items.length - 1]);
        this.close();
        this.unreachable = false;
        return;
      }
    }
    const save = this.keepForOr(node.items)
      ? this.saveCursor(node.mode)
      : undefined;
    const out = this.label();
    let endUnreachable = true;
    this.open(`${out}: {`);
    if (save) {
      this.line(save.decl);
    }
    const outer = this.fail;
    for (let at = 0; at < node.items.length - 1; at++) {
      const lab = this.label();
      this.fail = [`break ${lab};`];
      this.open(`${lab}: {`);
      this.gen(node.items[at]);
      if (!this.unreachable) {
        this.line(`break ${out};`);
        endUnreachable = false;
      }
      this.close();
      this.unreachable = false;
      if (save) {
        this.line(save.restore);
      }
    }
    this.fail = outer;
    this.gen(node.items[node.items.length - 1], tail);
    this.close();
    if (!endUnreachable) {
      this.unreachable = false;
    }
  }

  private genNot(node: Wrapped): void {
    // Not of one test: the failure is the test itself.
    const atom = this.atom(node.c);
    if (atom) {
      this.ifFail(atom.yes);
      return;
    }
    const save = this.keepNeededOnFail(node.c)
      ? this.saveCursor(node.mode)
      : undefined;
    if (save) {
      this.open('{');
      this.line(save.decl);
    }
    const lab = this.label();
    const outer = this.fail;
    this.fail = [`break ${lab};`];
    this.open(`${lab}: {`);
    this.gen(node.c);
    this.fail = outer;
    if (!this.unreachable) {
      this.emitFail();
    }
    this.close();
    this.unreachable = false;
    if (save) {
      this.line(save.restore);
      this.close();
    }
  }

  private genTry(node: Wrapped): void {
    const save = this.keepNeeded([node.c])
      ? this.saveCursor(node.mode)
      : undefined;
    const lab = this.label();
    if (save) {
      this.line(save.decl);
    }
    const outer = this.fail;
    this.fail = save ? [save.restore, `break ${lab};`] : [`break ${lab};`];
    this.open(`${lab}: {`);
    this.gen(node.c);
    this.close();
    this.fail = outer;
    this.unreachable = false;
  }

  private genDo(node: Wrapped): void {
    const save = this.keepNeeded([node.c])
      ? this.saveCursor(node.mode)
      : undefined;
    if (node.c.t === 'call' && save) {
      // A rule whose cursor has to be put back, run by the runtime.
      const direction = node.mode === 'forward' ? 'forward' : 'backward';
      this.line(`this.do_${direction}(this.${this.methodOf(node.c.name)});`);
      return;
    }
    if (save) {
      this.line(save.decl);
    }
    if (node.c.t === 'call') {
      this.line(`this.${this.methodOf(node.c.name)}();`);
    } else {
      const lab = this.label();
      const outer = this.fail;
      this.fail = [`break ${lab};`];
      this.open(`${lab}: {`);
      this.gen(node.c);
      this.close();
      this.fail = outer;
      this.unreachable = false;
    }
    if (save) {
      this.line(save.restore);
    }
  }

  private genTest(node: Wrapped): void {
    const save = this.keepNeeded([node.c])
      ? this.saveCursor(node.mode)
      : undefined;
    if (save) {
      this.line(save.decl);
    }
    this.gen(node.c);
    if (save && !this.unreachable) {
      this.line(save.restore);
    }
  }

  private genGo(node: Wrapped): void {
    const child = node.c;
    const b = child.mode === 'forward' ? '' : '_b';
    if (child.t === 'grouping' || child.t === 'non') {
      const { table, min, max } = this.groupingRange(child.name);
      const io = child.t === 'grouping' ? 'in' : 'out';
      this.ifFail(
        `!this.${node.t}_${io}_grouping${b}(${table}, ${min}, ${max})`
      );
      return;
    }
    const isGoto = node.t === 'goto';
    const go = this.label();
    const forward = node.mode === 'forward';
    this.open(`${go}: for (;;) {`);
    const save =
      isGoto || this.repeatRestore(child)
        ? this.saveCursor(node.mode)
        : undefined;
    if (save) {
      this.line(save.decl);
    }
    const lab = this.label();
    const outer = this.fail;
    this.fail = [`break ${lab};`];
    this.open(`${lab}: {`);
    this.gen(child);
    let endUnreachable = false;
    if (this.unreachable) {
      endUnreachable = true;
    } else {
      if (isGoto && save) {
        this.line(save.restore);
      }
      this.line(`break ${go};`);
    }
    this.unreachable = false;
    this.close();
    if (save) {
      this.line(save.restore);
    }
    this.fail = outer;
    this.ifFail(
      forward
        ? 'this.cursor >= this.limit'
        : 'this.cursor <= this.limit_backward'
    );
    this.line(forward ? 'this.cursor++;' : 'this.cursor--;');
    this.close();
    this.unreachable = endUnreachable;
  }

  private genRepeat(node: Wrapped, counter: string | undefined): void {
    const outer = this.fail;
    this.open('for (;;) {');
    const save = this.repeatRestore(node.c)
      ? this.saveCursor(node.mode)
      : undefined;
    if (save) {
      this.line(save.decl);
    }
    const lab = this.label();
    this.fail = [`break ${lab};`];
    this.open(`${lab}: {`);
    this.gen(node.c);
    if (!this.unreachable) {
      if (counter) {
        this.line(`${counter}--;`);
      }
      this.line('continue;');
    }
    this.close();
    this.unreachable = false;
    if (save) {
      this.line(save.restore);
    }
    this.line('break;');
    this.close();
    this.fail = outer;
    this.unreachable = false;
  }

  private genLoop(node: Wrapped & { n: AE }): void {
    const counter = this.newVar();
    this.open(
      `for (let ${counter} = ${this.ae(node.n)}; ${counter} > 0; ${counter}--) {`
    );
    this.gen(node.c);
    this.close();
    this.unreachable = false;
  }

  private genAtleast(node: Wrapped & { n: AE }): void {
    const counter = this.newVar();
    this.open('{');
    this.line(`let ${counter} = ${this.ae(node.n)};`);
    this.genRepeat(node, counter);
    this.ifFail(`${counter} > 0`);
    this.close();
  }

  private genSetlimit(node: Node & { c1: Node; c2: Node }): void {
    const forward = node.mode === 'forward';
    const name = this.newVar();
    const outer = this.fail;
    let restoreLimit: string;
    if (node.c1.t === 'tomark') {
      const target = this.ae(node.c1.ae);
      this.ifFail(
        `this.cursor ${node.c1.mode === 'forward' ? '>' : '<'} ${target}`
      );
      if (forward) {
        this.line(`let ${name} = this.limit;`);
        this.line(`this.limit = ${target};`);
        this.line(`${name} -= this.limit;`);
        restoreLimit = `this.limit += ${name};`;
      } else {
        this.line(`const ${name} = this.limit_backward;`);
        this.line(`this.limit_backward = ${target};`);
        restoreLimit = `this.limit_backward = ${name};`;
      }
    } else {
      const save = this.saveCursor(node.mode);
      this.line(save.decl);
      this.gen(node.c1);
      if (this.unreachable) {
        return;
      }
      if (forward) {
        this.line(`const ${name} = this.limit - this.cursor;`);
        this.line('this.limit = this.cursor;');
        restoreLimit = `this.limit += ${name};`;
      } else {
        this.line(`const ${name} = this.limit_backward;`);
        this.line('this.limit_backward = this.cursor;');
        restoreLimit = `this.limit_backward = ${name};`;
      }
      this.line(save.restore);
    }
    this.fail = [restoreLimit, ...outer];
    this.gen(node.c2);
    this.fail = outer;
    if (!this.unreachable) {
      this.line(restoreLimit);
    }
  }

  private genSubstring(node: Node, slice = false): void {
    const among = node.t === 'substring' ? node.among : undefined;
    if (!among || among.t !== 'among') {
      throw new Error(`substring without among at line ${node.line}`);
    }
    if (among.entries.length === 1) {
      const entry = among.entries[0];
      if (entry.guard) {
        throw new Error(
          `a guarded single among is not supported (line ${among.line})`
        );
      }
      if (entry.s !== '') {
        this.gen({
          t: 'lit',
          s: entry.s,
          mode: node.mode,
          line: node.line,
        } as Node);
      }
      return;
    }
    const table = this.amongOf(among);
    const b = table.backward ? '_b' : '';
    const lookup = slice ? 'find_slice' : 'find_among';
    const call = `this.${lookup}${b}(${this.options.className}.${table.name})`;
    if (table.actions.length === 0) {
      if (!table.alwaysMatches) {
        this.ifFail(`${call} === 0`);
      } else {
        this.line(`${call};`);
      }
      return;
    }
    this.line(
      `${this.constAmong.has(node) ? 'const ' : ''}among_var = ${call};`
    );
    if (!table.alwaysMatches) {
      this.ifFail('among_var === 0');
    }
  }

  private genAmong(node: Node & { t: 'among' }): void {
    if (node.entries.length === 1) {
      const entry = node.entries[0];
      if (entry.guard) {
        throw new Error(
          `a guarded single among is not supported (line ${node.line})`
        );
      }
      if (!node.substring && entry.s !== '') {
        this.gen({
          t: 'lit',
          s: entry.s,
          mode: node.mode,
          line: node.line,
        } as Node);
      }
      if (entry.action) {
        this.gen(entry.action);
      }
      return;
    }
    const table = this.amongOf(node);
    if (!node.substring) {
      const b = table.backward ? '_b' : '';
      const call = `this.find_among${b}(${this.options.className}.${table.name})`;
      if (table.actions.length === 0) {
        if (!table.alwaysMatches) {
          this.ifFail(`${call} === 0`);
        } else {
          this.line(`${call};`);
        }
        return;
      }
      this.line(
        `${this.constAmong.has(node) ? 'const ' : ''}among_var = ${call};`
      );
      if (!table.alwaysMatches) {
        this.ifFail('among_var === 0');
      }
    }
    if (table.actions.length === 0) {
      return;
    }
    this.open('switch (among_var) {');
    table.actions.forEach((action, at) => {
      const start = this.lines.length;
      this.depth++;
      this.unreachable = false;
      this.gen(action);
      if (!this.unreachable) {
        this.line('break;');
      }
      const body = this.lines.splice(start);
      this.depth--;
      // A case that declares something needs its own block, or the
      // declaration would be visible to the cases after it.
      const indent = '  '.repeat(this.depth + 1);
      const declares = body.some(
        (l) => l.startsWith(`${indent}const `) || l.startsWith(`${indent}let `)
      );
      this.line(declares ? `case ${at + 1}: {` : `case ${at + 1}:`);
      this.lines.push(...body);
      if (declares) {
        this.line('}');
      }
    });
    this.close();
    this.unreachable = false;
  }

  // ---- scopes of among_var ----------------------------------------------

  /** Decides which routines share one `among_var`, and which declare it where it is set. */
  private planAmongVars(routine: Routine): boolean {
    const uses: Node[] = [];
    const walk = (node: Node): void => {
      switch (node.t) {
        case 'seq':
        case 'or':
        case 'and': {
          node.items.forEach(walk);
          if (node.t === 'seq') {
            for (const item of node.items) {
              if (
                item.t === 'substring' &&
                item.among &&
                item.among.t === 'among' &&
                item.among.entries.length > 1 &&
                this.amongOf(item.among).actions.length > 0
              ) {
                uses.push(item);
              } else if (
                item.t === 'among' &&
                !item.substring &&
                item.entries.length > 1 &&
                this.amongOf(item).actions.length > 0
              ) {
                uses.push(item);
              }
            }
          }
          return;
        }
        case 'not':
        case 'try':
        case 'do':
        case 'test':
        case 'fail':
        case 'goto':
        case 'gopast':
        case 'repeat':
        case 'backwards':
        case 'reverse':
        case 'loop':
        case 'atleast':
          walk(node.c);
          return;
        case 'setlimit':
          walk(node.c1);
          walk(node.c2);
          return;
        case 'among':
          for (const entry of node.entries) {
            if (entry.action) {
              walk(entry.action);
            }
          }
          return;
        default:
      }
    };
    walk(routine.body);
    // Uses that are not direct children of a sequence still need the variable.
    let all = 0;
    const count = (node: Node): void => {
      switch (node.t) {
        case 'seq':
        case 'or':
        case 'and':
          node.items.forEach(count);
          return;
        case 'not':
        case 'try':
        case 'do':
        case 'test':
        case 'fail':
        case 'goto':
        case 'gopast':
        case 'repeat':
        case 'backwards':
        case 'reverse':
        case 'loop':
        case 'atleast':
          count(node.c);
          return;
        case 'setlimit':
          count(node.c1);
          count(node.c2);
          return;
        case 'substring':
          if (
            node.among &&
            node.among.t === 'among' &&
            node.among.entries.length > 1 &&
            this.amongOf(node.among).actions.length > 0
          ) {
            all++;
          }
          return;
        case 'among':
          if (
            !node.substring &&
            node.entries.length > 1 &&
            this.amongOf(node).actions.length > 0
          ) {
            all++;
          }
          for (const entry of node.entries) {
            if (entry.action) {
              count(entry.action);
            }
          }
          return;
        default:
      }
    };
    count(routine.body);
    this.constAmong = new Set();
    if (all === 1 && uses.length === 1) {
      const use = uses[0];
      // The `among` of a `substring` reads the variable the `substring` sets,
      // so both must sit in one block; `const` is fine when they are siblings.
      if (use.t === 'substring') {
        this.constAmong.add(use);
        this.constAmong.add(use.among!);
      } else {
        this.constAmong.add(use);
      }
      return false;
    }
    return all > 0;
  }

  // ---- routines and the class -------------------------------------------

  private isInherited(routine: Routine): boolean {
    if (!this.options.inheritRegions) {
      return false;
    }
    const variable = REGIONS[routine.name];
    if (!variable) {
      return false;
    }
    const body = routine.body;
    return (
      body.t === 'cmp' &&
      body.op === '<=' &&
      body.l.t === 'var' &&
      body.l.name === variable &&
      body.r.t === 'cursor'
    );
  }

  private genRoutine(routine: Routine): void {
    this.labels = 0;
    this.vars = 0;
    this.unreachable = false;
    this.fail = ['return false;'];
    const start = this.lines.length;
    const shared = this.planAmongVars(routine);
    const method = this.methodOf(routine.name);
    this.open(`${method}(): boolean {`);
    if (shared) {
      this.line('let among_var: number;');
    }
    this.gen(routine.body, true);
    if (!this.unreachable) {
      this.line('return true;');
    }
    this.close();
    this.tidy(start);
  }

  /** Drops the labels nothing jumps to, and the blocks that then hold nothing of their own. */
  private tidy(start: number): void {
    const routine = this.lines.slice(start);
    const used = new Set<string>();
    for (const line of routine) {
      for (const match of line.matchAll(/(?:break|continue) (lab\d+);/g)) {
        used.add(match[1]);
      }
    }
    let lines = routine.map((line) =>
      line.replace(
        /^(\s*)(lab\d+): (\{|for \(;;\) \{)$/,
        (all, indent, label, rest) =>
          used.has(label) ? all : `${indent}${rest}`
      )
    );
    for (let again = true; again;) {
      again = false;
      for (let at = 0; at < lines.length; at++) {
        const indent = lines[at].match(/^(\s*)\{$/)?.[1];
        if (indent === undefined) {
          continue;
        }
        let end = at + 1;
        while (end < lines.length && lines[end] !== `${indent}}`) {
          end++;
        }
        const inner = lines.slice(at + 1, end);
        const own = `${indent}  `;
        if (
          inner.some(
            (l) => l.startsWith(`${own}const `) || l.startsWith(`${own}let `)
          )
        ) {
          continue;
        }
        lines = [
          ...lines.slice(0, at),
          ...inner.map((l) => l.slice(2)),
          ...lines.slice(end + 1),
        ];
        again = true;
        break;
      }
    }
    this.lines.splice(start, this.lines.length - start, ...lines);
  }

  run(): string {
    const { className, name, source } = this.options;
    const names = [...this.program.names.entries()];
    const inherited = new Set(['I_p1', 'I_p2', 'I_pV']);
    const out: string[] = [];

    // Routines first, so the tables they need are known.
    this.lines = [];
    this.depth = 1;
    const emitted = this.program.routines.filter(
      (routine) => !this.isInherited(routine)
    );
    emitted.forEach((routine, at) => {
      if (at > 0) {
        this.lines.push('');
      }
      this.genRoutine(routine);
    });
    const routines = this.lines;

    const fields: string[] = [];
    const inits: string[] = [];
    for (const [variable, type] of names) {
      const prefix =
        type === 'integer'
          ? 'I'
          : type === 'boolean'
            ? 'B'
            : type === 'string'
              ? 'S'
              : '';
      if (!prefix) {
        continue;
      }
      const field = `${prefix}_${variable}`;
      const tsType =
        type === 'integer'
          ? 'number'
          : type === 'boolean'
            ? 'boolean'
            : 'string';
      const initial =
        type === 'integer' ? '0' : type === 'boolean' ? 'false' : "''";
      if (!inherited.has(field)) {
        fields.push(`  declare ${field}: ${tsType};`);
      }
      inits.push(`    this.${field} = ${initial};`);
    }

    const tables: string[] = [];
    for (const grouping of this.program.groupings) {
      const min = grouping.chars[0] ?? 0;
      const max = grouping.chars[grouping.chars.length - 1] ?? 0;
      const bytes: number[] = Array.from(
        { length: ((max - min) >> 3) + 1 },
        () => 0
      );
      for (const ch of grouping.chars) {
        bytes[(ch - min) >> 3] |= 1 << ((ch - min) & 7);
      }
      tables.push(
        arrayField(
          `static g_${grouping.name}: number[]`,
          bytes.map(String),
          true
        )
      );
    }
    for (const table of this.tableList) {
      const rows = table.rows.map((row) => {
        const guard = row.guard
          ? `, (stemmer) => stemmer.r_${row.guard}()`
          : '';
        return `new Among(${quote(row.s)}, ${row.i}, ${row.result}${guard})`;
      });
      tables.push(
        amongText(table, className) ??
          arrayField(`static ${table.name}: Among<${className}>[]`, rows, false)
      );
    }

    out.push(
      this.tableList.length > 0
        ? "import { Among, SnowballStemmer } from '@nlpjs-neo/core';"
        : "import { SnowballStemmer } from '@nlpjs-neo/core';"
    );
    out.push("import type { ContainerHolder } from '@nlpjs-neo/core';");
    out.push('');
    out.push('/**');
    out.push(
      ` * Stemmer written by tools/snowball from ${source}. Do not edit it by hand:`
    );
    out.push(' * change the Snowball program and generate it again.');
    out.push(' */');
    out.push(`class ${className} extends SnowballStemmer {`);
    if (fields.length > 0) {
      out.push(...fields, '');
    }
    out.push('  constructor(container?: ContainerHolder) {');
    out.push('    super(container);');
    out.push(`    this.name = '${name}';`);
    out.push(...inits);
    out.push('  }', '');
    out.push(...routines);
    if (tables.length > 0) {
      out.push('', tables.join('\n\n'));
    }
    out.push('}', '', `export default ${className};`, '');
    return out.join('\n');
  }
}
