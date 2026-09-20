import { TrimTypesList } from './trim-types.js';

function runDiscard(
  srcEdge,
  srcOther,
  useMaxLength,
  intentEntities: any[] = []
) {
  let edge;
  let other;
  if (
    srcEdge.accuracy > srcOther.accuracy ||
    (srcEdge.accuracy === srcOther.accuracy && srcEdge.len > srcOther.len)
  ) {
    edge = srcEdge;
    other = srcOther;
  } else {
    edge = srcOther;
    other = srcEdge;
  }
  if (other.start <= edge.end && other.end >= edge.start) {
    if (other.accuracy < edge.accuracy) {
      other.discarded = true;
    } else if (
      (useMaxLength ||
        other.entity === edge.entity ||
        other.entity === 'number') &&
      other.len <= edge.len
    ) {
      // Entities have same priority
      if (
        other.start === edge.start &&
        other.end === edge.end &&
        other.type === edge.type &&
        other.entity === edge.entity &&
        other.option === edge.option
      ) {
        // same type and none of them is an enum or both are an enum
        other.discarded = true;
      } else if (
        other.start === edge.start &&
        other.end === edge.end &&
        other.entity === edge.entity &&
        other.type !== edge.type
      ) {
        if (edge.type === 'trim' && other.type !== 'trim') {
          edge.discarded = true;
        } else if (edge.type !== 'trim' && other.type === 'trim') {
          other.discarded = true;
        } else {
          other.discarded = true;
        }
      } else if (other.len < edge.len) {
        other.discarded = true;
      }
    } else if (
      (useMaxLength ||
        other.entity === edge.entity ||
        edge.entity === 'number') &&
      other.len > edge.len
    ) {
      edge.discarded = true;
    } else if (edge.type === 'enum' && other.type === 'enum') {
      const edgeIncludedInIntentEntities = intentEntities.includes(edge.entity);
      const otherIncludedInIntentEntities = intentEntities.includes(
        other.entity
      );
      if (edgeIncludedInIntentEntities && !otherIncludedInIntentEntities) {
        other.discarded = true;
      } else if (
        !edgeIncludedInIntentEntities &&
        otherIncludedInIntentEntities
      ) {
        edge.discarded = true;
      } else if (
        edge.len <= other.len &&
        other.utteranceText.includes(edge.utteranceText)
      ) {
        edge.discarded = true;
      } else if (
        edge.len > other.len &&
        edge.utteranceText.includes(other.utteranceText)
      ) {
        other.discarded = true;
      }
    }
  }
}

/**
 * Given an array of edges, detect the trim edges and find overlaps with
 * non-trim edges. When an overlap is detected, reduce the trim edged to
 * fit with the other edge. Only cases where it overlaps on beginning or
 * end are handled
 * @param {Object[]} edges Edges to be splitted
 * @returns {Object[]} Splitted edges.
 */
function splitEdges(edges) {
  for (let i = 0, l = edges.length; i < l; i += 1) {
    const edge = edges[i];
    if (edge.type === 'trim' && TrimTypesList.includes(edge.subtype)) {
      for (let j = 0; j < edges.length; j += 1) {
        const other = edges[j];
        if (
          i !== j &&
          other.start >= edge.start &&
          other.end <= edge.end &&
          other.type !== 'trim'
        ) {
          const edgeLen = edge.end - edge.start;
          const otherLen = other.end - other.start;
          if (edge.end === other.end) {
            // is at the end
            const text = edge.sourceText.substring(0, edgeLen - otherLen - 1);
            edge.sourceText = text;
            edge.utteranceText = text;
            edge.end = other.start - 1;
            edge.len = text.length;
          } else if (edge.start === other.start) {
            // is at the start
            const text = edge.sourceText.substring(otherLen + 1);
            edge.sourceText = text;
            edge.utteranceText = text;
            edge.start = other.end + 1;
            edge.len = text.length;
          }
        }
      }
    }
  }
  return edges;
}

function reduceEdges(edges, useMaxLength = true, intentEntities: any[] = []) {
  edges = splitEdges(edges);
  const edgeslen = edges.length;
  for (let i = 0; i < edgeslen; i += 1) {
    const edge = edges[i];
    if (edge.len === 0) {
      edge.discarded = true;
    }
    if (!edge.discarded) {
      for (let j = i + 1; j < edgeslen; j += 1) {
        const other = edges[j];
        if (!other.discarded) {
          runDiscard(edge, other, useMaxLength, intentEntities);
        }
        if (edge.discarded) {
          break;
        }
      }
    }
    if (!edge.discarded) {
      const knownEntityPos = intentEntities.indexOf(edge.entity);
      if (knownEntityPos !== -1) {
        intentEntities.splice(knownEntityPos, 1);
      }
    }
  }
  return edges.filter((x) => !x.discarded);
}

export default reduceEdges;
