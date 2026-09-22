import Evaluator from './evaluator.js';
import compile from './compile.js';
import Template from './template.js';
import JavascriptCompiler from './javascript-compiler.js';

export { Evaluator, compile, Template, JavascriptCompiler };
export type { CompileOptions, TextCompileOptions } from './compile.js';

// The node kinds the walkers take, so a consumer can name one without
// depending on `acorn` itself.
export type {
  Identifier,
  Literal,
  ThisExpression,
  UnaryExpression,
} from 'acorn';
export type {
  CompilerContainer,
  CompilerContainerHolder,
  CompilerLogger,
  EvaluatedValue,
  EvaluationContext,
  EvaluatorNode,
  FailResult,
  ParsedProgram,
} from './types.js';
