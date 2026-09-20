import { Tokenizer } from '@nlpjs-neo/core';
import type { ContainerHolder, Token } from '@nlpjs-neo/core';
import aspects from './thai-aspects.json' with { type: 'json' };

/**
 * One node of the prefix tree of known words: the characters that may follow,
 * and whether a word ends here.
 */
interface TrieNode {
  isLeaf?: boolean;
  [char: string]: TrieNode | boolean | undefined;
}

/** A known word found in the text, and where. */
interface ThaiToken {
  start: number;
  end: number;
  length: number;
  value: string;
  /** Set once nothing overlaps this token any more. */
  isSure?: boolean;
  /** Set on a token another one wins over. */
  isDiscarded?: boolean;
}

/** A partial match being followed through the prefix tree. */
interface TrieChain {
  node: TrieNode;
  value: string;
}

/**
 * Tokenizes Thai, which is written without spaces, by finding the known words
 * in a text and taking whatever lies between them as it is written.
 */
class TokenizerTh extends Tokenizer {
  /** Prefix tree of the known words; built on first use. */
  declare dict: TrieNode | undefined;

  constructor(container?: ContainerHolder, shouldTokenize?: boolean) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-th';
  }

  addToTree(aspect: string): void {
    let node = this.dict;
    for (let i = 0; i < aspect.length; i += 1) {
      const current = aspect[i];
      if (!node[current]) {
        node[current] = {};
      }
      node = node[current] as TrieNode;
    }
    node.isLeaf = true;
  }

  buildDictionary(): void {
    this.dict = {};
    for (let i = 0; i < aspects.length; i += 1) {
      this.addToTree(aspects[i]);
    }
  }

  /** The tokens that overlap a token, and so compete with it. */
  findCollisions(token: ThaiToken, tokens: ThaiToken[]): ThaiToken[] {
    const result: ThaiToken[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const current = tokens[i];
      if (
        (!current.isDiscarded && current.start !== token.start) ||
        current.length !== token.length
      ) {
        if (current.start <= token.end && current.end >= token.start) {
          result.push(current);
        }
      }
    }
    return result;
  }

  /** `true` when two overlapping tokens cover exactly this one's span. */
  perfectCompose(token: ThaiToken, collisions: ThaiToken[]): boolean {
    for (let i = 0; i < collisions.length; i += 1) {
      const a = collisions[i];
      if (a.start <= token.start) {
        for (let j = 1; j < collisions.length; j += 1) {
          const b = collisions[j];
          if (b.start === a.end + 1 && b.end === token.end) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /** `true` when another token contains this one, so this one is dropped. */
  isLate(token: ThaiToken, collisions: ThaiToken[], open = false): boolean {
    for (let i = 0; i < collisions.length; i += 1) {
      if (
        !open &&
        token.start > collisions[i].start &&
        token.end < collisions[i].end
      ) {
        return true;
      }
      if (
        open &&
        token.start >= collisions[i].start &&
        token.end <= collisions[i].end
      ) {
        return true;
      }
    }
    return false;
  }

  fullSure(tokens: ThaiToken[]): boolean {
    for (let i = 0; i < tokens.length; i += 1) {
      if (!tokens[i].isSure) {
        return false;
      }
    }
    return true;
  }

  /** Drops the overlapping candidates until only one reading is left. */
  reduceEdges(srcTokens: ThaiToken[]): ThaiToken[] {
    let tokens = srcTokens;
    let lastLength = 0;
    while (lastLength !== tokens.length && !this.fullSure(tokens)) {
      lastLength = tokens.length;
      for (let open = 0; open <= 1; open += 1) {
        for (let i = 0; i < tokens.length; i += 1) {
          const current = tokens[i];
          const collisions = this.findCollisions(current, tokens);
          if (collisions.length === 0) {
            current.isSure = true;
            current.isDiscarded = false;
          } else if (this.perfectCompose(current, collisions)) {
            current.isDiscarded = true;
          } else if (this.isLate(current, collisions, open === 1)) {
            current.isDiscarded = true;
          }
        }
        tokens = tokens.filter((x) => !x.isDiscarded);
      }
    }
    return tokens;
  }

  innerTokenize(str: string, _normalize?: boolean): Token[] {
    if (!this.dict) {
      this.buildDictionary();
    }
    const potentialTokens: ThaiToken[] = [];
    let currentChains: (TrieChain | undefined)[] = [];
    for (let i = 0; i < str.length; i += 1) {
      const chr = str[i];
      if (this.dict[chr]) {
        currentChains.push({ node: this.dict, value: '' });
      }
      for (let j = 0; j < currentChains.length; j += 1) {
        const chain = currentChains[j];
        const nextNode = chain.node[chr] as TrieNode | undefined;
        if (nextNode) {
          currentChains[j] = { node: nextNode, value: chain.value + chr };
        } else {
          currentChains[j] = undefined;
        }
        if (nextNode && nextNode.isLeaf) {
          potentialTokens.push({
            start: i - currentChains[j].value.length + 1,
            length: currentChains[j].value.length,
            end: i,
            value: currentChains[j].value,
          });
        }
      }
      currentChains = currentChains.filter((x) => x);
    }
    const edges = this.reduceEdges(potentialTokens);
    let index = 0;
    const result: Token[] = [];
    for (let i = 0; i < edges.length; i += 1) {
      const current = edges[i];
      if (current.start > index) {
        result.push(
          ...str.slice(index, current.start).split(/[\s,.!?;:([\]'"¡¿)/]+/)
        );
      }
      result.push(current.value);
      index = current.end + 1;
    }
    if (index < str.length) {
      result.push(...str.slice(index).split(/[\s,.!?;:([\]'"¡¿)/]+/));
    }
    return result;
  }
}

export default TokenizerTh;
