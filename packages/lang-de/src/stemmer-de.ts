import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from german.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerDe extends SnowballStemmer {
  declare I_x: number;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-de';
    this.I_p1 = 0;
    this.I_p2 = 0;
    this.I_x = 0;
  }

  r_prelude(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab0: {
        lab1: {
          const v_3 = this.cursor;
          lab2: {
            this.bra = this.cursor;
            if (!this.eq_s('\u00DF')) {
              break lab2;
            }
            this.ket = this.cursor;
            this.slice_from('ss');
            break lab1;
          }
          this.cursor = v_3;
          if (this.cursor >= this.limit) {
            break lab0;
          }
          this.cursor++;
        }
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    for (;;) {
      const v_4 = this.cursor;
      lab3: {
        lab4: for (;;) {
          const v_5 = this.cursor;
          lab5: {
            if (!this.in_grouping(StemmerDe.g_v, 97, 252)) {
              break lab5;
            }
            this.bra = this.cursor;
            lab6: {
              const v_6 = this.cursor;
              lab7: {
                if (!this.eq_s('u')) {
                  break lab7;
                }
                this.ket = this.cursor;
                if (!this.in_grouping(StemmerDe.g_v, 97, 252)) {
                  break lab7;
                }
                this.slice_from('U');
                break lab6;
              }
              this.cursor = v_6;
              if (!this.eq_s('y')) {
                break lab5;
              }
              this.ket = this.cursor;
              if (!this.in_grouping(StemmerDe.g_v, 97, 252)) {
                break lab5;
              }
              this.slice_from('Y');
            }
            this.cursor = v_5;
            break lab4;
          }
          this.cursor = v_5;
          if (this.cursor >= this.limit) {
            break lab3;
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
    const v_1 = this.cursor;
    if (this.cursor + 3 > this.limit) {
      return false;
    }
    this.cursor += 3;
    this.I_x = this.cursor;
    this.cursor = v_1;
    if (!this.gopast_in_grouping(StemmerDe.g_v, 97, 252)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerDe.g_v, 97, 252)) {
      return false;
    }
    this.I_p1 = this.cursor;
    lab0: {
      if (this.I_p1 >= this.I_x) {
        break lab0;
      }
      this.I_p1 = this.I_x;
    }
    if (!this.gopast_in_grouping(StemmerDe.g_v, 97, 252)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerDe.g_v, 97, 252)) {
      return false;
    }
    this.I_p2 = this.cursor;
    return true;
  }

  r_postlude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerDe.a_0);
        switch (among_var) {
          case 1:
            this.slice_from('y');
            break;
          case 2:
            this.slice_from('u');
            break;
          case 3:
            this.slice_from('a');
            break;
          case 4:
            this.slice_from('o');
            break;
          case 5:
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

  r_standard_suffix(): boolean {
    let among_var: number;
    const v_1 = this.limit - this.cursor;
    lab0: {
      among_var = this.find_slice_b(StemmerDe.a_1);
      if (among_var === 0) {
        break lab0;
      }
      if (!this.r_R1()) {
        break lab0;
      }
      switch (among_var) {
        case 1:
          this.slice_del();
          break;
        case 2: {
          this.slice_del();
          const v_2 = this.limit - this.cursor;
          lab1: {
            this.ket = this.cursor;
            if (!this.eq_s_b('s')) {
              this.cursor = this.limit - v_2;
              break lab1;
            }
            this.bra = this.cursor;
            if (!this.eq_s_b('nis')) {
              this.cursor = this.limit - v_2;
              break lab1;
            }
            this.slice_del();
          }
          break;
        }
        case 3:
          if (!this.in_grouping_b(StemmerDe.g_s_ending, 98, 116)) {
            break lab0;
          }
          this.slice_del();
          break;
      }
    }
    this.cursor = this.limit - v_1;
    const v_3 = this.limit - this.cursor;
    lab2: {
      among_var = this.find_slice_b(StemmerDe.a_2);
      if (among_var === 0) {
        break lab2;
      }
      if (!this.r_R1()) {
        break lab2;
      }
      switch (among_var) {
        case 1:
          this.slice_del();
          break;
        case 2:
          if (!this.in_grouping_b(StemmerDe.g_st_ending, 98, 116)) {
            break lab2;
          }
          if (this.cursor - 3 < this.limit_backward) {
            break lab2;
          }
          this.cursor -= 3;
          this.slice_del();
          break;
      }
    }
    this.cursor = this.limit - v_3;
    const v_4 = this.limit - this.cursor;
    lab3: {
      among_var = this.find_slice_b(StemmerDe.a_4);
      if (among_var === 0) {
        break lab3;
      }
      if (!this.r_R2()) {
        break lab3;
      }
      switch (among_var) {
        case 1: {
          this.slice_del();
          const v_5 = this.limit - this.cursor;
          lab4: {
            this.ket = this.cursor;
            if (!this.eq_s_b('ig')) {
              this.cursor = this.limit - v_5;
              break lab4;
            }
            this.bra = this.cursor;
            if (this.eq_s_b('e')) {
              this.cursor = this.limit - v_5;
              break lab4;
            }
            if (!this.r_R2()) {
              this.cursor = this.limit - v_5;
              break lab4;
            }
            this.slice_del();
          }
          break;
        }
        case 2:
          if (this.eq_s_b('e')) {
            break lab3;
          }
          this.slice_del();
          break;
        case 3: {
          this.slice_del();
          const v_6 = this.limit - this.cursor;
          lab5: {
            this.ket = this.cursor;
            if (!this.eq_s_b('er') && !this.eq_s_b('en')) {
              this.cursor = this.limit - v_6;
              break lab5;
            }
            this.bra = this.cursor;
            if (!this.r_R1()) {
              this.cursor = this.limit - v_6;
              break lab5;
            }
            this.slice_del();
          }
          break;
        }
        case 4: {
          this.slice_del();
          const v_7 = this.limit - this.cursor;
          lab6: {
            among_var = this.find_slice_b(StemmerDe.a_3);
            if (among_var === 0) {
              this.cursor = this.limit - v_7;
              break lab6;
            }
            if (!this.r_R2()) {
              this.cursor = this.limit - v_7;
              break lab6;
            }
            switch (among_var) {
              case 1:
                this.slice_del();
                break;
            }
          }
          break;
        }
      }
    }
    this.cursor = this.limit - v_4;
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
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32, 8,
  ];

  static g_s_ending: number[] = [117, 30, 5];

  static g_st_ending: number[] = [117, 30, 4];

  static a_0: Among<StemmerDe>[] = [
    new Among('', -1, 5),
    new Among('U', 0, 2),
    new Among('Y', 0, 1),
    new Among('\u00E4', 0, 3),
    new Among('\u00F6', 0, 4),
    new Among('\u00FC', 0, 2),
  ];

  static a_1 = Among.table<StemmerDe>(`
    e,-1,2 em,-1,1 en,-1,2 ern,-1,1 er,-1,1 s,-1,3 es,5,2
  `);

  static a_2 = Among.table<StemmerDe>(`
    en,-1,1 er,-1,1 st,-1,2 est,2,1
  `);

  static a_3 = Among.table<StemmerDe>(`
    ig,-1,1 lich,-1,1
  `);

  static a_4 = Among.table<StemmerDe>(`
    end,-1,1 ig,-1,2 ung,-1,1 lich,-1,3 isch,-1,2 ik,-1,2 heit,-1,3 keit,-1,4
  `);
}

export default StemmerDe;
