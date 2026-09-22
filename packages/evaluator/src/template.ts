import compile from './compile.js';
import type { CompileOptions, TextCompileOptions } from './compile.js';
import type { EvaluatedValue, EvaluationContext } from './types.js';

/** Resolves the `{{ ... }}` expressions of anything a pipeline answers with. */
class Template {
  /**
   * The result keeps the shape it was given, unless `native: true` lets a
   * string answer a value of any type: see `compile`.
   */
  compile<T>(
    str: T,
    context?: EvaluationContext,
    options?: TextCompileOptions
  ): T;
  compile<TResult = unknown>(
    str: unknown,
    context: EvaluationContext | undefined,
    options: CompileOptions
  ): TResult;
  compile(
    str: unknown,
    context?: EvaluationContext,
    options: CompileOptions = {}
  ): EvaluatedValue {
    return compile(str, options)(context);
  }
}

export default Template;
