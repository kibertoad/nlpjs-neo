import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from dutch.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerNl extends SnowballStemmer {
  declare B_e_found: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-nl';
    this.B_e_found = false;
    this.I_p1 = 0;
    this.I_p2 = 0;
  }

  r_prelude(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerNl.a_0);
        switch (among_var) {
          case 1:
            this.slice_from('a');
            break;
          case 2:
            this.slice_from('e');
            break;
          case 3:
            this.slice_from('i');
            break;
          case 4:
            this.slice_from('o');
            break;
          case 5:
            this.slice_from('u');
            break;
          case 6:
            if (this.cursor >= this.limit) {
              break lab0;
            }
            this.cursor++;
            break;
        }
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    const v_3 = this.cursor;
    lab1: {
      this.bra = this.cursor;
      if (!this.eq_s('y')) {
        this.cursor = v_3;
        break lab1;
      }
      this.ket = this.cursor;
      this.slice_from('Y');
    }
    for (;;) {
      const v_4 = this.cursor;
      lab2: {
        lab3: for (;;) {
          const v_5 = this.cursor;
          lab4: {
            if (!this.in_grouping(StemmerNl.g_v, 97, 232)) {
              break lab4;
            }
            this.bra = this.cursor;
            lab5: {
              const v_6 = this.cursor;
              lab6: {
                if (!this.eq_s('i')) {
                  break lab6;
                }
                this.ket = this.cursor;
                if (!this.in_grouping(StemmerNl.g_v, 97, 232)) {
                  break lab6;
                }
                this.slice_from('I');
                break lab5;
              }
              this.cursor = v_6;
              if (!this.eq_s('y')) {
                break lab4;
              }
              this.ket = this.cursor;
              this.slice_from('Y');
            }
            this.cursor = v_5;
            break lab3;
          }
          this.cursor = v_5;
          if (this.cursor >= this.limit) {
            break lab2;
          }
          this.cursor++;
        }
        continue;
      }
      this.cursor = v_4;
      break;
    }
    return true;
  }

  r_mark_regions(): boolean {
    this.I_p1 = this.limit;
    this.I_p2 = this.limit;
    if (!this.gopast_in_grouping(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    this.I_p1 = this.cursor;
    lab0: {
      if (this.I_p1 >= 3) {
        break lab0;
      }
      this.I_p1 = 3;
    }
    if (!this.gopast_in_grouping(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    this.I_p2 = this.cursor;
    return true;
  }

  r_postlude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerNl.a_1);
        switch (among_var) {
          case 1:
            this.slice_from('y');
            break;
          case 2:
            this.slice_from('i');
            break;
          case 3:
            if (this.cursor >= this.limit) {
              break lab0;
            }
            this.cursor++;
            break;
        }
        continue;
      }
      this.cursor = v_1;
      break;
    }
    return true;
  }

  r_undouble(): boolean {
    const v_1 = this.limit - this.cursor;
    if (this.find_among_b(StemmerNl.a_2) === 0) {
      return false;
    }
    this.cursor = this.limit - v_1;
    this.ket = this.cursor;
    if (this.cursor <= this.limit_backward) {
      return false;
    }
    this.cursor--;
    this.bra = this.cursor;
    this.slice_del();
    return true;
  }

  r_e_ending(): boolean {
    this.B_e_found = false;
    this.ket = this.cursor;
    if (!this.eq_s_b('e')) {
      return false;
    }
    this.bra = this.cursor;
    if (!this.r_R1()) {
      return false;
    }
    const v_1 = this.limit - this.cursor;
    if (!this.out_grouping_b(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    this.cursor = this.limit - v_1;
    this.slice_del();
    this.B_e_found = true;
    return this.r_undouble();
  }

  r_en_ending(): boolean {
    if (!this.r_R1()) {
      return false;
    }
    const v_1 = this.limit - this.cursor;
    if (!this.out_grouping_b(StemmerNl.g_v, 97, 232)) {
      return false;
    }
    this.cursor = this.limit - v_1;
    if (this.eq_s_b('gem')) {
      return false;
    }
    this.slice_del();
    return this.r_undouble();
  }

  r_standard_suffix(): boolean {
    let among_var: number;
    const v_1 = this.limit - this.cursor;
    lab0: {
      among_var = this.find_slice_b(StemmerNl.a_3);
      if (among_var === 0) {
        break lab0;
      }
      switch (among_var) {
        case 1:
          if (!this.r_R1()) {
            break lab0;
          }
          this.slice_from('heid');
          break;
        case 2:
          if (!this.r_en_ending()) {
            break lab0;
          }
          break;
        case 3:
          if (!this.r_R1()) {
            break lab0;
          }
          if (!this.out_grouping_b(StemmerNl.g_v_j, 97, 232)) {
            break lab0;
          }
          this.slice_del();
          break;
      }
    }
    this.cursor = this.limit - v_1;
    this.do_backward(this.r_e_ending);
    const v_3 = this.limit - this.cursor;
    lab1: {
      this.ket = this.cursor;
      if (!this.eq_s_b('heid')) {
        break lab1;
      }
      this.bra = this.cursor;
      if (!this.r_R2()) {
        break lab1;
      }
      if (this.eq_s_b('c')) {
        break lab1;
      }
      this.slice_del();
      this.ket = this.cursor;
      if (!this.eq_s_b('en')) {
        break lab1;
      }
      this.bra = this.cursor;
      if (!this.r_en_ending()) {
        break lab1;
      }
    }
    this.cursor = this.limit - v_3;
    const v_4 = this.limit - this.cursor;
    lab2: {
      among_var = this.find_slice_b(StemmerNl.a_4);
      if (among_var === 0) {
        break lab2;
      }
      switch (among_var) {
        case 1:
          if (!this.r_R2()) {
            break lab2;
          }
          this.slice_del();
          lab3: {
            const v_5 = this.limit - this.cursor;
            lab4: {
              this.ket = this.cursor;
              if (!this.eq_s_b('ig')) {
                break lab4;
              }
              this.bra = this.cursor;
              if (!this.r_R2()) {
                break lab4;
              }
              if (this.eq_s_b('e')) {
                break lab4;
              }
              this.slice_del();
              break lab3;
            }
            this.cursor = this.limit - v_5;
            if (!this.r_undouble()) {
              break lab2;
            }
          }
          break;
        case 2:
          if (!this.r_R2()) {
            break lab2;
          }
          if (this.eq_s_b('e')) {
            break lab2;
          }
          this.slice_del();
          break;
        case 3:
          if (!this.r_R2()) {
            break lab2;
          }
          this.slice_del();
          if (!this.r_e_ending()) {
            break lab2;
          }
          break;
        case 4:
          if (!this.r_R2()) {
            break lab2;
          }
          this.slice_del();
          break;
        case 5:
          if (!this.r_R2()) {
            break lab2;
          }
          if (!this.B_e_found) {
            break lab2;
          }
          this.slice_del();
          break;
      }
    }
    this.cursor = this.limit - v_4;
    const v_6 = this.limit - this.cursor;
    lab5: {
      if (!this.out_grouping_b(StemmerNl.g_v_I, 73, 232)) {
        break lab5;
      }
      const v_7 = this.limit - this.cursor;
      if (this.find_among_b(StemmerNl.a_5) === 0) {
        break lab5;
      }
      if (!this.out_grouping_b(StemmerNl.g_v, 97, 232)) {
        break lab5;
      }
      this.cursor = this.limit - v_7;
      this.ket = this.cursor;
      if (this.cursor <= this.limit_backward) {
        break lab5;
      }
      this.cursor--;
      this.bra = this.cursor;
      this.slice_del();
    }
    this.cursor = this.limit - v_6;
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_prelude);
    this.do_forward(this.r_mark_regions);
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.r_standard_suffix();
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128,
  ];

  static g_v_I: number[] = [
    1, 0, 0, 17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128,
  ];

  static g_v_j: number[] = [
    17, 67, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128,
  ];

  static a_0: Among<StemmerNl>[] = [
    new Among('', -1, 6),
    new Among('\u00E1', 0, 1),
    new Among('\u00E4', 0, 1),
    new Among('\u00E9', 0, 2),
    new Among('\u00EB', 0, 2),
    new Among('\u00ED', 0, 3),
    new Among('\u00EF', 0, 3),
    new Among('\u00F3', 0, 4),
    new Among('\u00F6', 0, 4),
    new Among('\u00FA', 0, 5),
    new Among('\u00FC', 0, 5),
  ];

  static a_1: Among<StemmerNl>[] = [
    new Among('', -1, 3),
    new Among('I', 0, 2),
    new Among('Y', 0, 1),
  ];

  static a_2 = Among.table<StemmerNl>(`
    dd,-1,-1 kk,-1,-1 tt,-1,-1
  `);

  static a_3 = Among.table<StemmerNl>(`
    ene,-1,2 se,-1,3 en,-1,2 heden,2,1 s,-1,3
  `);

  static a_4 = Among.table<StemmerNl>(`
    end,-1,1 ig,-1,2 ing,-1,1 lijk,-1,3 baar,-1,4 bar,-1,5
  `);

  static a_5 = Among.table<StemmerNl>(`
    aa,-1,-1 ee,-1,-1 oo,-1,-1 uu,-1,-1
  `);
}

export default StemmerNl;
