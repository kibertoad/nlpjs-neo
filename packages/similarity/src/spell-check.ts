import similarity from './similarity.js';

class SpellCheck {
  declare features: any;
  declare featuresByLength: any;
  declare featuresList: any;
  declare minLength: any;
  declare settings: any;

  constructor(settings?) {
    this.settings = settings || {};
    this.minLength = this.settings.minLength || 4;
    if (this.settings.features) {
      this.setFeatures(this.settings.features);
    } else {
      this.features = {};
      this.featuresByLength = {};
    }
  }

  setFeatures(features) {
    this.features = features;
    this.featuresByLength = {};
    this.featuresList = Object.keys(this.features);
    for (let i = 0; i < this.featuresList.length; i += 1) {
      const feature = this.featuresList[i];
      const { length } = feature;
      if (!this.featuresByLength[length]) {
        this.featuresByLength[length] = [];
      }
      this.featuresByLength[length].push(feature);
    }
  }

  checkToken(token, distance) {
    if (this.features[token]) {
      return token;
    }
    if (token.length < this.minLength) {
      return token;
    }
    let best;
    let distanceBest = Infinity;
    for (
      let i = token.length - distance - 1;
      i < token.length + distance;
      i += 1
    ) {
      const currentFeatures = this.featuresByLength[i + 1];
      if (currentFeatures) {
        for (let j = 0; j < currentFeatures.length; j += 1) {
          const feature = currentFeatures[j];
          const similar = similarity(token, feature);
          if (similar <= distance) {
            if (similar < distanceBest) {
              best = feature;
              distanceBest = similar;
            } else if (similar === distanceBest && best) {
              const la = Math.abs(best.length - token.length);
              const lb = Math.abs(feature.length - token.length);
              if (
                la > lb ||
                (la === lb && this.features[feature] > this.features[best])
              ) {
                best = feature;
                distanceBest = similar;
              }
            }
          }
        }
      }
    }
    return best || token;
  }

  check(tokens, distance = 1) {
    if (!Array.isArray(tokens)) {
      const keys = Object.keys(tokens);
      const processed = this.check(keys, distance);
      const obj: any = {};
      for (let i = 0; i < processed.length; i += 1) {
        obj[processed[i]] = tokens[keys[i]];
      }
      return obj;
    }
    const result: any[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      result.push(this.checkToken(tokens[i], distance));
    }
    return result;
  }
}

export default SpellCheck;
