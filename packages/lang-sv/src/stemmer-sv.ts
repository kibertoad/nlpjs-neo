import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from swedish.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerSv extends SnowballStemmer {
  declare I_x: number;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-sv';
    this.I_p1 = 0;
    this.I_x = 0;
  }

  r_mark_regions(): boolean {
    this.I_p1 = this.limit;
    const v_1 = this.cursor;
    if (this.cursor + 3 > this.limit) {
      return false;
    }
    this.cursor += 3;
    this.I_x = this.cursor;
    this.cursor = v_1;
    if (!this.goto_in_grouping(StemmerSv.g_v, 97, 246)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerSv.g_v, 97, 246)) {
      return false;
    }
    this.I_p1 = this.cursor;
    lab0: {
      if (this.I_p1 >= this.I_x) {
        break lab0;
      }
      this.I_p1 = this.I_x;
    }
    return true;
  }

  r_main_suffix(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerSv.a_0);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        if (!this.in_grouping_b(StemmerSv.g_s_ending, 98, 121)) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_consonant_pair(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const v_2 = this.limit - this.cursor;
    if (this.find_among_b(StemmerSv.a_1) === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.cursor = this.limit - v_2;
    this.ket = this.cursor;
    if (this.cursor <= this.limit_backward) {
      this.limit_backward = v_1;
      return false;
    }
    this.cursor--;
    this.bra = this.cursor;
    this.slice_del();
    this.limit_backward = v_1;
    return true;
  }

  r_other_suffix(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerSv.a_2);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        this.slice_from('l\u00F6s');
        break;
      case 3:
        this.slice_from('full');
        break;
    }
    this.limit_backward = v_1;
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_mark_regions);
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_main_suffix);
    this.do_backward(this.r_consonant_pair);
    this.do_backward(this.r_other_suffix);
    this.cursor = this.limit_backward;
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 32,
  ];

  static g_s_ending: number[] = [119, 127, 149];

  static a_0 = Among.table<StemmerSv>(`
    a,-1,1 arna,0,1 erna,0,1 heterna,2,1 orna,0,1 ad,-1,1 e,-1,1 ade,6,1
    ande,6,1 arne,6,1 are,6,1 aste,6,1 en,-1,1 anden,12,1 aren,12,1 heten,12,1
    ern,-1,1 ar,-1,1 er,-1,1 heter,18,1 or,-1,1 s,-1,2 as,21,1 arnas,22,1
    ernas,22,1 ornas,22,1 es,21,1 ades,26,1 andes,26,1 ens,21,1 arens,29,1
    hetens,29,1 erns,21,1 at,-1,1 andet,-1,1 het,-1,1 ast,-1,1
  `);

  static a_1 = Among.table<StemmerSv>(`
    dd,-1,-1 gd,-1,-1 nn,-1,-1 dt,-1,-1 gt,-1,-1 kt,-1,-1 tt,-1,-1
  `);

  static a_2 = Among.table<StemmerSv>(`
    ig,-1,1 lig,0,1 els,-1,1 fullt,-1,3 löst,-1,2
  `);
}

export default StemmerSv;
