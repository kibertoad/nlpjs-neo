class ChunkMatch {
  declare end: any;
  declare pos: any;
  declare start: any;
  declare text: any;

  constructor(start, end, text, pos) {
    this.start = start;
    this.end = end;
    this.text = text;
    this.pos = pos;
  }

  disjoint(other) {
    return (
      (other.start < this.start && other.end <= this.start) ||
      (other.start >= this.end && other.end > this.end)
    );
  }
}

export default ChunkMatch;
