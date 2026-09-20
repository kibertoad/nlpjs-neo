/** Where a trim rule cuts, relative to the words it is anchored on. */
const TrimType = {
  Between: 'between',
  After: 'after',
  AfterLast: 'afterLast',
  AfterFirst: 'afterFirst',
  Before: 'before',
  BeforeFirst: 'beforeFirst',
  BeforeLast: 'beforeLast',
};

const TrimTypesList: string[] = Object.values(TrimType);

export { TrimType, TrimTypesList };
