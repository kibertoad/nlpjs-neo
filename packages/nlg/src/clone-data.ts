/**
 * Copies the data an answer is made of, so that the corpus and whoever holds
 * an answer never share one object. Text and the other primitives are
 * immutable and are handed back as they are.
 *
 * Copying on the way in means a caller that keeps mutating the object it
 * declared cannot reach the stored answer; copying on the way out means a
 * caller that mutates the answer it was given cannot reach it either. Both
 * matter, because an answer is read once per request and lives as long as the
 * model does.
 *
 * `structuredClone` copies cycles and dates faithfully, and refuses anything
 * that could not have been persisted with the model in the first place, which
 * is why answers are copied when they are declared rather than only when they
 * are delivered: data the corpus cannot hold is rejected where it was
 * written, not deep inside a later request.
 */
function cloneData<T>(value: T): T {
  return typeof value === 'object' && value !== null
    ? structuredClone(value)
    : value;
}

export default cloneData;
