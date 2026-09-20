import type {
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  ChainExpression,
  ConditionalExpression,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  IfStatement,
  Literal,
  LogicalExpression,
  MemberExpression,
  ObjectExpression,
  Pattern,
  ReturnStatement,
  TaggedTemplateExpression,
  TemplateElement,
  TemplateLiteral,
  ThisExpression,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
} from 'acorn';
import parse from './parse.js';
import createScopedFunction from './scoped-function.js';
import type {
  CompilerContainer,
  CompilerContainerHolder,
  CompilerLogger,
  EvaluatedValue,
  EvaluationContext,
  EvaluatorNode,
  FailResult,
} from './types.js';

/**
 * Walks a parsed program and executes it, awaiting every step, so a pipeline
 * written in JavaScript can call the asynchronous services of a container.
 *
 * It mirrors `Evaluator` node for node; what differs is that every walker is
 * asynchronous, that a bare call is given the pipeline input as its argument,
 * and that an identifier may resolve to a service of the container.
 */
class JavascriptCompiler {
  declare container: CompilerContainer;
  /** Context the last `evaluate` ran against, when one was not passed in. */
  declare context: EvaluationContext | undefined;
  declare failResult: FailResult;
  declare name: string;

  constructor(container: CompilerContainerHolder) {
    this.container =
      (container as { container?: CompilerContainer }).container ||
      (container as CompilerContainer);
    this.name = 'javascript';
    this.failResult = {};
  }

  compile(pipeline: string[]): string {
    const header = '(async () => {\n';
    const footer = '\n})();';
    const code = pipeline.join('\n');
    return header + code + footer;
  }

  log(msg: unknown): void {
    const logger: CompilerLogger =
      this.container.get<CompilerLogger>('logger') || console;
    logger.info(msg);
  }

  walkLiteral(node: Literal, _context?: EvaluationContext): EvaluatedValue {
    return node.value;
  }

  async walkUnary(
    node: UnaryExpression,
    context?: EvaluationContext
  ): Promise<EvaluatedValue> {
    switch (node.operator) {
      case '+':
        return +(await this.walk(node.argument as EvaluatorNode, context));
      case '-':
        return -(await this.walk(node.argument as EvaluatorNode, context));
      case '~':
        /* oxlint-disable no-bitwise */
        return ~(await this.walk(node.argument as EvaluatorNode, context));
      case '!':
        return !(await this.walk(node.argument as EvaluatorNode, context));
      default:
        return this.failResult;
    }
  }

  async walkArray(
    node: ArrayExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const result: EvaluatedValue[] = [];
    for (let i = 0, l = node.elements.length; i < l; i += 1) {
      const x = await this.walk(node.elements[i] as EvaluatorNode, context);
      if (x === this.failResult) {
        return this.failResult;
      }
      result.push(x);
    }
    return result;
  }

  async walkObject(
    node: ObjectExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const result: Record<string, EvaluatedValue> = {};
    for (let i = 0, l = node.properties.length; i < l; i += 1) {
      const prop = node.properties[i] as {
        key: { value?: string; name?: string };
        value: EvaluatorNode;
      };
      const value = await this.walk(prop.value, context);
      if (value === this.failResult) {
        return this.failResult;
      }
      result[prop.key.value || prop.key.name] = value;
    }
    return result;
  }

  async walkBinary(
    node: BinaryExpression | LogicalExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const left = await this.walk(node.left as EvaluatorNode, context);
    if (left === this.failResult) {
      return this.failResult;
    }
    if (node.operator === '&&' && !left) {
      return false;
    }
    if (node.operator === '||' && left) {
      return true;
    }
    if (node.operator === '??' && left !== null && left !== undefined) {
      return left;
    }
    const right = await this.walk(node.right as EvaluatorNode, context);
    if (right === this.failResult) {
      return this.failResult;
    }
    switch (node.operator) {
      case '==':
        /* oxlint-disable eqeqeq */
        return left == right;
      case '===':
        return left === right;
      case '!=':
        /* oxlint-disable eqeqeq */
        return left != right;
      case '!==':
        return left !== right;
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '|':
        /* oxlint-disable no-bitwise */
        return left | right;
      case '&':
        /* oxlint-disable no-bitwise */
        return left & right;
      case '^':
        /* oxlint-disable no-bitwise */
        return left ^ right;
      case '||':
        return left || right;
      case '&&':
        return left && right;
      case '??':
        return left ?? right;
      default:
        return this.failResult;
    }
  }

  async walkIdentifier(
    node: Identifier,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    if ({}.hasOwnProperty.call(context, node.name)) {
      return context[node.name];
    }
    if (context.input && {}.hasOwnProperty.call(context.input, node.name)) {
      return context.input[node.name];
    }
    if (context.globalFuncs && context.globalFuncs[node.name]) {
      const result = context.globalFuncs[node.name];
      node.name = `globalFuncs.${node.name}`;
      return result;
    }
    if (context.this && context.this.container) {
      const item = context.this.container.get(node.name);
      if (item) {
        return item;
      }
    }
    return undefined;
  }

  async walkThis(
    node: ThisExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    if ({}.hasOwnProperty.call(context, 'this')) {
      // oxlint-disable-next-line
      return context['this'];
    }
    return undefined;
  }

  async walkCall(
    node: CallExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    let callee;
    if (
      node.callee &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'run'
    ) {
      if (context && context.this && context.this.container) {
        callee = context.this.container.runPipeline.bind(
          context.this.container
        );
      } else {
        return this.failResult;
      }
    } else {
      callee = await this.walk(node.callee, context);
      if (node.optional && (callee === null || callee === undefined)) {
        return undefined;
      }
      if (callee === this.failResult || typeof callee !== 'function') {
        return this.failResult;
      }
    }
    // A method call is invoked on the object it was read from.
    const member = node.callee as Partial<MemberExpression>;
    let ctx = member.object
      ? await this.walk(member.object as EvaluatorNode, context)
      : {};
    if (ctx === this.failResult) {
      ctx = null;
    }
    const args: EvaluatedValue[] = [];
    for (let i = 0, l = node.arguments.length; i < l; i += 1) {
      const x = await this.walk(node.arguments[i] as EvaluatorNode, context);
      if (x === this.failResult) {
        return this.failResult;
      }
      args.push(x);
    }
    if (args.length === 0) {
      args.push(context.input);
    }
    if (
      node.callee &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'run'
    ) {
      if (args.length === 1) {
        args.push(context.input);
      }
      if (args.length === 2) {
        args.push(context.this);
      }
    }
    return callee.apply(ctx, args);
  }

  async walkMember(
    node: MemberExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const obj = await this.walk(node.object as EvaluatorNode, context);
    if (obj === this.failResult || typeof obj === 'function') {
      return this.failResult;
    }
    if (node.optional && (obj === null || obj === undefined)) {
      return undefined;
    }
    if (
      node.property.type === 'Identifier' &&
      node.object.type !== 'ObjectExpression'
    ) {
      return obj[(node.property as Identifier).name];
    }
    const prop = await this.walk(node.property as EvaluatorNode, context);
    if (prop === this.failResult) {
      return this.failResult;
    }
    return obj ? obj[prop] : undefined;
  }

  /**
   * An optional chain -- `a?.b`, `a?.[b]`, `a?.()` -- is wrapped in a
   * `ChainExpression` whose links carry `optional`. Only a link marked
   * `optional` short-circuits here; a plain link that follows one, as the `.c`
   * of `a?.b.c`, still reads a member of `undefined` and throws, which is what
   * the walker does for any other member of a missing object.
   */
  async walkChain(
    node: ChainExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    return this.walk(node.expression as EvaluatorNode, context);
  }

  async walkConditional(
    node: ConditionalExpression | IfStatement,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const value = await this.walk(node.test as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    if (value) {
      return this.walk(node.consequent as EvaluatorNode, context);
    }
    if (!node.alternate) {
      return undefined;
    }
    return this.walk(node.alternate as EvaluatorNode, context);
  }

  async walkExpression(
    node: ExpressionStatement,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const value = await this.walk(node.expression as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    return value;
  }

  async walkReturn(
    node: ReturnStatement,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    return this.walk(node.argument, context);
  }

  async walkFunction(
    node: FunctionExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const newContext: EvaluationContext = {};
    const keys = Object.keys(context).filter((x) => x !== 'this');
    keys.forEach((element) => {
      newContext[element] = context[element];
    });
    node.params.forEach((key: Pattern) => {
      if (key.type === 'Identifier') {
        newContext[key.name] = null;
      }
    });
    const bodies = node.body.body;
    for (let i = 0, l = bodies.length; i < l; i += 1) {
      if (
        (await this.walk(bodies[i] as EvaluatorNode, newContext)) ===
        this.failResult
      ) {
        return this.failResult;
      }
    }
    return createScopedFunction(node, context, ['this']);
  }

  async walkTemplateLiteral(
    node: TemplateLiteral,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    let str = '';
    for (let i = 0; i < node.expressions.length; i += 1) {
      str += await this.walk(node.quasis[i] as EvaluatorNode, context);
      str += await this.walk(node.expressions[i] as EvaluatorNode, context);
    }
    return str;
  }

  walkTemplateElement(
    node: TemplateElement,
    _context?: EvaluationContext
  ): EvaluatedValue {
    return node.value.cooked;
  }

  async walkTaggedTemplate(
    node: TaggedTemplateExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const tag = await this.walk(node.tag as EvaluatorNode, context);
    const { quasi } = node;
    const strings: EvaluatedValue[] = [];
    for (let i = 0; i < quasi.quasis.length; i += 1) {
      const q = quasi.quasis[i];
      const value = await this.walk(q, context);
      strings.push(value);
    }
    const values: EvaluatedValue[] = [];
    for (let i = 0; i < quasi.expressions.length; i += 1) {
      const q = quasi.expressions[i];
      const value = await this.walk(q, context);
      values.push(value);
    }
    // oxlint-disable-next-line
    return tag.apply(null, [strings].concat(values));
  }

  async walkUpdateExpression(
    node: UpdateExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    let value = await this.walk(node.argument as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    switch (node.operator) {
      case '++':
        value += 1;
        return this.walkSet(node.argument as EvaluatorNode, context, value);
      case '--':
        value -= 1;
        return this.walkSet(node.argument as EvaluatorNode, context, value);
      default:
        return this.failResult;
    }
  }

  async walkVariableDeclaration(
    node: VariableDeclaration,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    let value;
    for (let i = 0; i < node.declarations.length; i += 1) {
      const declaration = node.declarations[i];
      value = declaration.init
        ? await this.walk(declaration.init as EvaluatorNode, context)
        : undefined;
      if (value === this.failResult) {
        return this.failResult;
      }
      await this.walkSet(declaration.id as EvaluatorNode, context, value);
    }
    return value;
  }

  async walkAssignmentExpression(
    node: AssignmentExpression,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    const value = await this.walk(node.right as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    let leftValue = await this.walk(node.left as EvaluatorNode, context);
    if (leftValue === this.failResult) {
      leftValue = 0;
    }
    switch (node.operator) {
      case '=':
        await this.walkSet(node.left as EvaluatorNode, context, value);
        return value;
      case '+=':
        leftValue += value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '-=':
        leftValue -= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '*=':
        leftValue *= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '/=':
        leftValue /= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '%=':
        leftValue %= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '|=':
        // oxlint-disable-next-line
        leftValue |= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '&=':
        // oxlint-disable-next-line
        leftValue &= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      case '^=':
        // oxlint-disable-next-line
        leftValue ^= value;
        await this.walkSet(node.left as EvaluatorNode, context, leftValue);
        return leftValue;
      default:
        return this.failResult;
    }
  }

  async walkBlock(
    node: BlockStatement,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    if (Array.isArray(node.body)) {
      let result;
      for (let i = 0; i < node.body.length; i += 1) {
        result = await this.walk(node.body[i] as EvaluatorNode, context);
      }
      return result;
    }
    return this.walk(node.body as EvaluatorNode, context);
  }

  async walk(
    node: EvaluatorNode,
    context: EvaluationContext
  ): Promise<EvaluatedValue> {
    switch (node.type) {
      case 'Literal':
        return this.walkLiteral(node, context);
      case 'UnaryExpression':
        return this.walkUnary(node, context);
      case 'ArrayExpression':
        return this.walkArray(node, context);
      case 'ObjectExpression':
        return this.walkObject(node, context);
      case 'BinaryExpression':
      case 'LogicalExpression':
        return this.walkBinary(node, context);
      case 'Identifier':
        return this.walkIdentifier(node, context);
      case 'ThisExpression':
        return this.walkThis(node, context);
      case 'CallExpression':
        return this.walkCall(node, context);
      case 'MemberExpression':
        return this.walkMember(node, context);
      case 'ChainExpression':
        return this.walkChain(node, context);
      case 'ConditionalExpression':
        return this.walkConditional(node, context);
      case 'ExpressionStatement':
        return this.walkExpression(node, context);
      case 'ReturnStatement':
        return this.walkReturn(node, context);
      case 'FunctionExpression':
        return this.walkFunction(node, context);
      case 'TemplateLiteral':
        return this.walkTemplateLiteral(node, context);
      case 'TemplateElement':
        return this.walkTemplateElement(node, context);
      case 'TaggedTemplateExpression':
        return this.walkTaggedTemplate(node, context);
      case 'UpdateExpression':
        return this.walkUpdateExpression(node, context);
      case 'AssignmentExpression':
        return this.walkAssignmentExpression(node, context);
      case 'IfStatement':
        return this.walkConditional(node, context);
      case 'BlockStatement':
        return this.walkBlock(node, context);
      case 'VariableDeclaration':
        return this.walkVariableDeclaration(node, context);
      default:
        return this.failResult;
    }
  }

  walkSetIdentifier(
    node: Identifier,
    context: EvaluationContext,
    value: EvaluatedValue
  ): EvaluatedValue {
    const newContext = context;
    if ({}.hasOwnProperty.call(context, node.name)) {
      context[node.name] = value;
    } else if (
      context.input &&
      {}.hasOwnProperty.call(context.input, node.name)
    ) {
      context.input[node.name] = value;
    } else {
      newContext[node.name] = value;
    }
    return value;
  }

  async walkSetMember(
    node: MemberExpression,
    context: EvaluationContext,
    value: EvaluatedValue
  ): Promise<EvaluatedValue> {
    const obj = await this.walk(node.object as EvaluatorNode, context);
    if (obj === this.failResult || typeof obj === 'function') {
      return this.failResult;
    }
    if (node.property.type === 'Identifier') {
      obj[node.property.name] = value;
      return value;
    }
    const prop = await this.walk(node.property as EvaluatorNode, context);
    if (prop === this.failResult) {
      return this.failResult;
    }
    if (!obj) {
      return this.failResult;
    }
    obj[prop] = value;
    return value;
  }

  async walkSet(
    node: EvaluatorNode,
    context: EvaluationContext,
    value: EvaluatedValue
  ): Promise<EvaluatedValue> {
    switch (node.type) {
      case 'Identifier':
        return this.walkSetIdentifier(node, context, value);
      case 'MemberExpression':
        return this.walkSetMember(node, context, value);
      default:
        return this.failResult;
    }
  }

  async evaluateAll(
    str: string,
    context?: EvaluationContext
  ): Promise<EvaluatedValue[]> {
    const result: EvaluatedValue[] = [];
    const newContext = context || this.context;
    const compiled = parse(str);
    for (let i = 0; i < compiled.body.length; i += 1) {
      const statement = compiled.body[i] as { expression?: EvaluatorNode };
      let expression = (statement.expression ||
        compiled.body[i]) as EvaluatorNode;
      // `compile` wraps a pipeline in an async arrow so that it can await;
      // the body of that wrapper is what is actually executed.
      const call = expression as {
        callee?: { type: string; body: EvaluatorNode };
      };
      if (call.callee && call.callee.type === 'ArrowFunctionExpression') {
        expression = call.callee.body;
      }
      const value = await this.walk(expression, newContext);
      result.push(value === this.failResult ? undefined : value);
    }
    return result;
  }

  async evaluate(
    str: string,
    context?: EvaluationContext
  ): Promise<EvaluatedValue> {
    const result = await this.evaluateAll(str, context);
    if (!result || result.length === 0) {
      return undefined;
    }
    return result[result.length - 1];
  }

  async execute(
    compiled: string,
    srcInput: unknown,
    srcObject?: unknown
  ): Promise<void> {
    const context: EvaluationContext = {
      this: srcObject,
      input: srcInput,
    };
    await this.evaluate(compiled, context);
  }
}

export default JavascriptCompiler;
