import { defaultContainer } from '@nlpjs-neo/core';
import type { Container, ContainerHolder } from '@nlpjs-neo/core';
import reduceEdges from './reduce-edges.js';
import type { Edge, Extractor, NerInput, Rule } from './types.js';

class ExtractorRegex implements Extractor {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container =
      (container as { container?: Container }).container ||
      (container as Container);
    this.name = 'extract-regex';
  }

  getRules(input: NerInput): Rule[] {
    const allRules = input.nerRules;
    if (!allRules) {
      return [];
    }
    return allRules;
  }

  /** Every match of one regular expression, as candidate entities. */
  getMatchs(utterance: string, regex: RegExp): Edge[] {
    const result: Edge[] = [];
    let matchFound;
    do {
      const match = regex instanceof RegExp ? regex.exec(utterance) : null;
      if (match) {
        if (match.length === 1) {
          result.push({
            start: match.index,
            end: regex.lastIndex - 1,
            accuracy: 1,
            sourceText: match[0],
          });
        } else {
          const index = utterance.indexOf(match[1]);
          result.push({
            start: index,
            end: index + match[1].length - 1,
            accuracy: 1,
            sourceText: match[1],
          });
        }
        matchFound = true;
      } else {
        matchFound = false;
      }
    } while (matchFound);
    return result;
  }

  extractFromRule(text: string, rule: Rule): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < rule.rules.length; i += 1) {
      const newEdges = this.getMatchs(text, rule.rules[i] as RegExp);
      for (let j = 0; j < newEdges.length; j += 1) {
        const edge = newEdges[j];
        edge.entity = rule.name;
        edge.type = rule.type;
        edge.utteranceText = text.substring(edge.start, edge.end + 1);
        edge.len = edge.utteranceText.length;
        edges.push(edge);
      }
    }
    return edges;
  }

  extract(srcInput: NerInput): NerInput {
    const input = srcInput;
    const rules = this.getRules(input);
    const edges: Edge[] = input.edges || [];
    for (let i = 0; i < rules.length; i += 1) {
      const newEdges = this.extractFromRule(
        input.text || input.utterance,
        rules[i]
      );
      for (let j = 0; j < newEdges.length; j += 1) {
        edges.push(newEdges[j]);
      }
    }
    edges.sort((a, b) => a.start - b.start);
    input.edges = reduceEdges(edges, false);
    return input;
  }

  run(srcInput: NerInput): NerInput | Promise<NerInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    const extractor =
      this.container.get<Extractor>(`extract-regex-${locale}`) || this;
    return extractor.extract(input);
  }
}

export default ExtractorRegex;
