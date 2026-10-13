import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from nepali.sbl of Snowball at commit 411550d. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerNe extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ne';
  }

  r_remove_category_1(): boolean {
    const among_var = this.find_slice_b(StemmerNe.a_0);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        if (!this.eq_s_b('\u090F') && !this.eq_s_b('\u0947')) {
          this.slice_del();
        }
        break;
    }
    return true;
  }

  r_remove_category_2(): boolean {
    const among_var = this.find_slice_b(StemmerNe.a_1);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        lab0: {
          lab1: {
            if (!this.eq_s_b('\u092F\u094C')) {
              break lab1;
            }
            break lab0;
          }
          lab2: {
            if (!this.eq_s_b('\u091B\u094C')) {
              break lab2;
            }
            break lab0;
          }
          lab3: {
            if (!this.eq_s_b('\u0928\u094C')) {
              break lab3;
            }
            break lab0;
          }
          if (!this.eq_s_b('\u0925\u0947')) {
            return false;
          }
        }
        this.slice_del();
        break;
      case 2:
        if (!this.eq_s_b('\u0924\u094D\u0930')) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_remove_category_3(): boolean {
    const among_var = this.find_slice_b(StemmerNe.a_2);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    return true;
  }

  innerStem(): boolean {
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_remove_category_1);
    for (;;) {
      const v_2 = this.limit - this.cursor;
      lab0: {
        this.do_backward(this.r_remove_category_2);
        if (!this.r_remove_category_3()) {
          break lab0;
        }
        continue;
      }
      this.cursor = this.limit - v_2;
      break;
    }
    this.cursor = this.limit_backward;
    return true;
  }

  static a_0 = Among.table<StemmerNe>(`
    लाइ,-1,1 लाई,-1,1 सँग,-1,1 संग,-1,1 मार्फत,-1,1 रत,-1,1 का,-1,2 मा,-1,1
    द्वारा,-1,1 कि,-1,2 पछि,-1,1 की,-1,2 ले,-1,1 कै,-1,2 सँगै,-1,1 मै,-1,1
    को,-1,2
  `);

  static a_1 = Among.table<StemmerNe>(`
    ँ,-1,1 ं,-1,1 ै,-1,2
  `);

  static a_2 = Among.table<StemmerNe>(`
    थिए,-1,1 छ,-1,1 इछ,1,1 एछ,1,1 िछ,1,1 ेछ,1,1 नेछ,5,1 हुनेछ,6,1 इन्छ,1,1
    िन्छ,1,1 हुन्छ,1,1 एका,-1,1 इएका,11,1 िएका,11,1 ेका,-1,1 नेका,14,1 दा,-1,1
    इदा,16,1 िदा,16,1 देखि,-1,1 माथि,-1,1 एकी,-1,1 इएकी,21,1 िएकी,21,1 ेकी,-1,1
    देखी,-1,1 थी,-1,1 दी,-1,1 छु,-1,1 एछु,28,1 ेछु,28,1 नेछु,30,1 नु,-1,1
    हरु,-1,1 हरू,-1,1 छे,-1,1 थे,-1,1 ने,-1,1 एकै,-1,1 ेकै,-1,1 नेकै,39,1
    दै,-1,1 इदै,41,1 िदै,41,1 एको,-1,1 इएको,44,1 िएको,44,1 ेको,-1,1 नेको,47,1
    दो,-1,1 इदो,49,1 िदो,49,1 यो,-1,1 इयो,52,1 भयो,52,1 ियो,52,1 थियो,55,1
    दियो,55,1 थ्यो,52,1 छौ,-1,1 इछौ,59,1 एछौ,59,1 िछौ,59,1 ेछौ,59,1 नेछौ,63,1
    यौ,-1,1 थियौ,65,1 छ्यौ,65,1 थ्यौ,65,1 छन्,-1,1 इछन्,69,1 एछन्,69,1 िछन्,69,1
    ेछन्,69,1 नेछन्,73,1 लान्,-1,1 छिन्,-1,1 थिन्,-1,1 पर्,-1,1 इस्,-1,1
    थिइस्,79,1 छस्,-1,1 इछस्,81,1 एछस्,81,1 िछस्,81,1 ेछस्,81,1 नेछस्,85,1
    िस्,-1,1 थिस्,87,1 छेस्,-1,1 होस्,-1,1
  `);
}

export default StemmerNe;
