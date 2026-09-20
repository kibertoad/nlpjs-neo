import type { AnyNode, Program } from 'acorn';

/**
 * Types of the expression evaluator: what it is handed, what it walks and what
 * it answers.
 */

/**
 * Value an expression evaluates to. The evaluator is an interpreter: what a
 * source string produces is known only to whoever wrote that string, so this
 * is the documented boundary where a value leaves the type system. `unknown`
 * would put a cast on every arithmetic and every call the walkers make.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- interpreted value
export type EvaluatedValue = any;

/** Variables an expression is evaluated against. */
export type EvaluationContext = Record<string, EvaluatedValue>;

/**
 * The sentinel an evaluator answers when it will not evaluate a node: an
 * object identified by reference, so no value a program produces can be
 * mistaken for it.
 */
export type FailResult = Record<string, never>;

/** A node of the parsed program, as the walkers dispatch on it. */
export type EvaluatorNode = AnyNode;

/** The parsed program, the shape both walkers start from. */
export type ParsedProgram = Program;

/**
 * The container a compiler is registered in. This package does not depend on
 * `core`, so only what the compiler reaches for is described here.
 */
export interface CompilerContainer {
  get<T = unknown>(name: string): T | undefined;
  /** Only reached by a `run` step, so a container without one still works. */
  runPipeline?(
    pipeline: unknown,
    input: unknown,
    srcObject?: unknown,
    depth?: number
  ): Promise<unknown>;
}

/** Either a container, or an object that carries one. */
export type CompilerContainerHolder =
  | CompilerContainer
  | { container: CompilerContainer };

/** The logging contract the compiler uses, which `console` also satisfies. */
export interface CompilerLogger {
  info(...args: unknown[]): void;
}
