import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from norwegian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerNo extends SnowballStemmer {
  declare I_x: number;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-no';
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
    if (!this.goto_in_grouping(StemmerNo.g_v, 97, 248)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerNo.g_v, 97, 248)) {
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
    const among_var = this.find_slice_b(StemmerNo.a_0);
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
        if (!this.in_grouping_b(StemmerNo.g_s_ending, 98, 122)) {
          if (!this.eq_s_b('k')) {
            return false;
          }
          if (!this.out_grouping_b(StemmerNo.g_v, 97, 248)) {
            return false;
          }
        }
        this.slice_del();
        break;
      case 3:
        this.slice_from('er');
        break;
    }
    return true;
  }

  r_consonant_pair(): boolean {
    const v_1 = this.limit - this.cursor;
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_2 = this.limit_backward;
    this.limit_backward = this.I_p1;
    if (this.find_slice_b(StemmerNo.a_1) === 0) {
      this.limit_backward = v_2;
      return false;
    }
    this.limit_backward = v_2;
    this.cursor = this.limit - v_1;
    if (this.cursor <= this.limit_backward) {
      return false;
    }
    this.cursor--;
    this.bra = this.cursor;
    this.slice_del();
    return true;
  }

  r_other_suffix(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerNo.a_2);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
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
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 128,
  ];

  static g_s_ending: number[] = [119, 125, 149, 1];

  static a_0 = Among.table<StemmerNo>(`
    a,-1,1 e,-1,1 ede,1,1 ande,1,1 ende,1,1 ane,1,1 ene,1,1 hetene,6,1 erte,1,3
    en,-1,1 heten,9,1 ar,-1,1 er,-1,1 heter,12,1 s,-1,2 as,14,1 es,14,1
    edes,16,1 endes,16,1 enes,16,1 hetenes,19,1 ens,14,1 hetens,21,1 ers,14,1
    ets,14,1 et,-1,1 het,25,1 ert,-1,3 ast,-1,1
  `);

  static a_1 = Among.table<StemmerNo>(`
    dt,-1,-1 vt,-1,-1
  `);

  static a_2 = Among.table<StemmerNo>(`
    leg,-1,1 eleg,0,1 ig,-1,1 eig,2,1 lig,2,1 elig,4,1 els,-1,1 lov,-1,1
    elov,7,1 slov,7,1 hetslov,9,1
  `);
}

export default StemmerNo;
