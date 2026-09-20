import { Tokenizer } from '@nlpjs-neo/core';
import aspects from './thai-aspects.json' with { type: 'json' };

class TokenizerTh extends Tokenizer {
  declare dict: any;

  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-th';
  }

  addToTree(aspect) {
    let node = this.dict;
    for (let i = 0; i < aspect.length; i += 1) {
      const current = aspect[i];
      if (!node[current]) {
        node[current] = {};
      }
      node = node[current];
    }
    node.isLeaf = true;
  }

  buildDictionary() {
    this.dict = {};
    for (let i = 0; i < aspects.length; i += 1) {
      this.addToTree(aspects[i]);
    }
  }

  findCollisions(token, tokens) {
    const result: any[] = [];
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

  perfectCompose(token, collisions) {
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

  isLate(token, collisions, open = false) {
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

  fullSure(tokens) {
    for (let i = 0; i < tokens.length; i += 1) {
      if (!tokens[i].isSure) {
        return false;
      }
    }
    return true;
  }

  reduceEdges(srcTokens) {
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

  innerTokenize(str, _normalize?) {
    if (!this.dict) {
      this.buildDictionary();
    }
    const potentialTokens: any[] = [];
    let currentChains: any[] = [];
    for (let i = 0; i < str.length; i += 1) {
      const chr = str[i];
      if (this.dict[chr]) {
        currentChains.push({ node: this.dict, value: '' });
      }
      for (let j = 0; j < currentChains.length; j += 1) {
        const chain = currentChains[j];
        const nextNode = chain.node[chr];
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
    const result: any[] = [];
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
