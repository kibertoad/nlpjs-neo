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
} from 'acorn';
import parse from './parse.js';
import createScopedFunction from './scoped-function.js';
import type {
  EvaluatedValue,
  EvaluationContext,
  EvaluatorNode,
  FailResult,
} from './types.js';

/**
 * Walks a parsed expression and evaluates it against a context.
 *
 * A node the evaluator will not evaluate answers `failResult`, an object
 * identified by reference, so no value a program produces is mistaken for a
 * refusal.
 */
class Evaluator {
  /** Context the last `evaluate` ran against, when one was not passed in. */
  declare context: EvaluationContext | undefined;
  declare defaultContext: EvaluationContext;
  declare failResult: FailResult;

  constructor(context?: EvaluationContext) {
    this.defaultContext = context || {};
    this.failResult = {};
  }

  walkLiteral(node: Literal, _context?: EvaluationContext): EvaluatedValue {
    return node.value;
  }

  walkUnary(
    node: UnaryExpression,
    context?: EvaluationContext
  ): EvaluatedValue {
    switch (node.operator) {
      case '+':
        return +this.walk(node.argument, context);
      case '-':
        return -this.walk(node.argument, context);
      case '~':
        /* oxlint-disable no-bitwise */
        return ~this.walk(node.argument, context);
      case '!':
        return !this.walk(node.argument, context);
      default:
        return this.failResult;
    }
  }

  walkArray(node: ArrayExpression, context: EvaluationContext): EvaluatedValue {
    const result: EvaluatedValue[] = [];
    for (let i = 0, l = node.elements.length; i < l; i += 1) {
      const x = this.walk(node.elements[i], context);
      if (x === this.failResult) {
        return this.failResult;
      }
      result.push(x);
    }
    return result;
  }

  walkObject(
    node: ObjectExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const result: Record<string, EvaluatedValue> = {};
    for (let i = 0, l = node.properties.length; i < l; i += 1) {
      const prop = node.properties[i] as {
        key: { value?: string; name?: string };
        value: EvaluatorNode;
      };
      const value = this.walk(prop.value, context);
      if (value === this.failResult) {
        return this.failResult;
      }
      result[prop.key.value || prop.key.name] = value;
    }
    return result;
  }

  walkBinary(
    node: BinaryExpression | LogicalExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const left = this.walk(node.left, context);
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
    const right = this.walk(node.right, context);
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

  walkIdentifier(node: Identifier, context: EvaluationContext): EvaluatedValue {
    if ({}.hasOwnProperty.call(context, node.name)) {
      return context[node.name];
    }
    return undefined;
  }

  walkThis(node: ThisExpression, context: EvaluationContext): EvaluatedValue {
    if ({}.hasOwnProperty.call(context, 'this')) {
      // oxlint-disable-next-line
      return context['this'];
    }
    return undefined;
  }

  walkCall(node: CallExpression, context: EvaluationContext): EvaluatedValue {
    const callee = this.walk(node.callee as EvaluatorNode, context);
    if (node.optional && (callee === null || callee === undefined)) {
      return undefined;
    }
    if (callee === this.failResult || typeof callee !== 'function') {
      return this.failResult;
    }
    // A method call is invoked on the object it was read from.
    const member = node.callee as Partial<MemberExpression>;
    let ctx = member.object
      ? this.walk(member.object as EvaluatorNode, context)
      : this.failResult;
    if (ctx === this.failResult) {
      ctx = null;
    }
    const args: EvaluatedValue[] = [];
    for (let i = 0, l = node.arguments.length; i < l; i += 1) {
      const x = this.walk(node.arguments[i] as EvaluatorNode, context);
      if (x === this.failResult) {
        return this.failResult;
      }
      args.push(x);
    }
    return callee.apply(ctx, args);
  }

  walkMember(
    node: MemberExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const obj = this.walk(node.object as EvaluatorNode, context);
    if (obj === this.failResult || typeof obj === 'function') {
      return this.failResult;
    }
    if (node.optional && (obj === null || obj === undefined)) {
      return undefined;
    }
    if (
      !node.computed &&
      node.property.type === 'Identifier' &&
      node.object.type !== 'ObjectExpression'
    ) {
      return obj[(node.property as Identifier).name];
    }
    const prop = this.walk(node.property as EvaluatorNode, context);
    if (prop === this.failResult) {
      return this.failResult;
    }
    return obj ? obj[prop] : this.failResult;
  }

  /**
   * An optional chain -- `a?.b`, `a?.[b]`, `a?.()` -- is wrapped in a
   * `ChainExpression` whose links carry `optional`. Only a link marked
   * `optional` short-circuits here; a plain link that follows one, as the `.c`
   * of `a?.b.c`, still reads a member of `undefined` and throws, which is what
   * the walker does for any other member of a missing object.
   */
  walkChain(node: ChainExpression, context: EvaluationContext): EvaluatedValue {
    return this.walk(node.expression as EvaluatorNode, context);
  }

  walkConditional(
    node: ConditionalExpression | IfStatement,
    context: EvaluationContext
  ): EvaluatedValue {
    const value = this.walk(node.test, context);
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

  walkExpression(
    node: ExpressionStatement,
    context: EvaluationContext
  ): EvaluatedValue {
    const value = this.walk(node.expression as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    return value;
  }

  walkReturn(
    node: ReturnStatement,
    context: EvaluationContext
  ): EvaluatedValue {
    return this.walk(node.argument as EvaluatorNode, context);
  }

  walkFunction(
    node: FunctionExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const newContext: EvaluationContext = {};
    const keys = Object.keys(context);
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
      if (this.walk(bodies[i], newContext) === this.failResult) {
        return this.failResult;
      }
    }
    return createScopedFunction(node, context);
  }

  walkTemplateLiteral(
    node: TemplateLiteral,
    context: EvaluationContext
  ): string {
    let str = '';
    for (let i = 0; i < node.expressions.length; i += 1) {
      str += this.walk(node.quasis[i], context);
      str += this.walk(node.expressions[i], context);
    }
    return str;
  }

  walkTemplateElement(
    node: TemplateElement,
    _context?: EvaluationContext
  ): EvaluatedValue {
    return node.value.cooked;
  }

  walkTaggedTemplate(
    node: TaggedTemplateExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const tag = this.walk(node.tag, context);
    const { quasi } = node;
    const strings = quasi.quasis.map((q) => this.walk(q, context));
    const values = quasi.expressions.map((e) => this.walk(e, context));
    // oxlint-disable-next-line
    return tag.apply(null, [strings].concat(values));
  }

  walkUpdateExpression(
    node: UpdateExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    let value = this.walk(node.argument as EvaluatorNode, context);
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

  walkAssignmentExpression(
    node: AssignmentExpression,
    context: EvaluationContext
  ): EvaluatedValue {
    const value = this.walk(node.right as EvaluatorNode, context);
    if (value === this.failResult) {
      return this.failResult;
    }
    const left = node.left as EvaluatorNode;
    let leftValue = this.walk(left, context);
    if (leftValue === this.failResult) {
      leftValue = 0;
    }
    switch (node.operator) {
      case '=':
        this.walkSet(left, context, value);
        return value;
      case '+=':
        leftValue += value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '-=':
        leftValue -= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '*=':
        leftValue *= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '/=':
        leftValue /= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '%=':
        leftValue %= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '|=':
        // oxlint-disable-next-line
        leftValue |= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '&=':
        // oxlint-disable-next-line
        leftValue &= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      case '^=':
        // oxlint-disable-next-line
        leftValue ^= value;
        this.walkSet(left, context, leftValue);
        return leftValue;
      default:
        return this.failResult;
    }
  }

  walkBlock(node: BlockStatement, context: EvaluationContext): EvaluatedValue {
    if (Array.isArray(node.body)) {
      let result: EvaluatedValue;
      for (let i = 0; i < node.body.length; i += 1) {
        result = this.walk(node.body[i] as EvaluatorNode, context);
      }
      return result;
    }
    return this.walk(node.body as EvaluatorNode, context);
  }

  walk(node: EvaluatorNode, context: EvaluationContext): EvaluatedValue {
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
    newContext[node.name] = value;
    return value;
  }

  walkSetMember(
    node: MemberExpression,
    context: EvaluationContext,
    value: EvaluatedValue
  ): EvaluatedValue {
    const obj = this.walk(node.object as EvaluatorNode, context);
    if (obj === this.failResult || typeof obj === 'function') {
      return this.failResult;
    }
    if (!node.computed && node.property.type === 'Identifier') {
      obj[node.property.name] = value;
      return value;
    }
    const prop = this.walk(node.property as EvaluatorNode, context);
    if (prop === this.failResult) {
      return this.failResult;
    }
    if (!obj) {
      return this.failResult;
    }
    obj[prop] = value;
    return value;
  }

  walkSet(
    node: EvaluatorNode,
    context: EvaluationContext,
    value: EvaluatedValue
  ): EvaluatedValue {
    switch (node.type) {
      case 'Identifier':
        return this.walkSetIdentifier(node, context, value);
      case 'MemberExpression':
        return this.walkSetMember(node, context, value);
      default:
        return this.failResult;
    }
  }

  evaluateAll(str: string, context?: EvaluationContext): EvaluatedValue[] {
    const result: EvaluatedValue[] = [];
    const newContext = context || this.context;
    const compiled = parse(str);
    for (let i = 0; i < compiled.body.length; i += 1) {
      const statement = compiled.body[i] as Partial<ExpressionStatement>;
      const expression = (statement.expression ||
        compiled.body[i]) as EvaluatorNode;
      const value = this.walk(expression, newContext);
      result.push(value === this.failResult ? undefined : value);
    }
    return result;
  }

  evaluate(str: string, context?: EvaluationContext): EvaluatedValue {
    const result = this.evaluateAll(str, context);
    if (!result || result.length === 0) {
      return undefined;
    }
    return result[result.length - 1];
  }
}

export default Evaluator;
