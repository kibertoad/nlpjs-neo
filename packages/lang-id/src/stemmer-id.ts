import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from indonesian.sbl of Snowball at commit 411550d. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerId extends SnowballStemmer {
  declare I_measure: number;
  declare I_prefix: number;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-id';
    this.I_measure = 0;
    this.I_prefix = 0;
  }

  r_remove_particle(): boolean {
    const among_var = this.find_slice_b(StemmerId.a_0);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        this.I_measure--;
        break;
    }
    return true;
  }

  r_remove_possessive_pronoun(): boolean {
    const among_var = this.find_slice_b(StemmerId.a_1);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        this.I_measure--;
        break;
    }
    return true;
  }

  r_remove_suffix(): boolean {
    const among_var = this.find_slice_b(StemmerId.a_2);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        lab0: {
          const v_1 = this.limit - this.cursor;
          lab1: {
            if (this.I_prefix === 3) {
              break lab1;
            }
            if (this.I_prefix === 2) {
              break lab1;
            }
            if (!this.eq_s_b('k')) {
              break lab1;
            }
            this.bra = this.cursor;
            break lab0;
          }
          this.cursor = this.limit - v_1;
          if (this.I_prefix === 1) {
            return false;
          }
        }
        break;
      case 2:
        if (this.I_prefix > 2) {
          return false;
        }
        if (this.eq_s_b('s')) {
          return false;
        }
        break;
    }
    this.slice_del();
    this.I_measure--;
    return true;
  }

  r_remove_first_order_prefix(): boolean {
    const among_var = this.find_slice(StemmerId.a_3);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        this.I_prefix = 1;
        this.I_measure--;
        break;
      case 2:
        lab0: {
          const v_1 = this.cursor;
          lab1: {
            if (!this.eq_s('y')) {
              break lab1;
            }
            const v_2 = this.cursor;
            if (!this.in_grouping(StemmerId.g_vowel, 97, 117)) {
              break lab1;
            }
            this.cursor = v_2;
            this.ket = this.cursor;
            this.slice_from('s');
            this.I_prefix = 1;
            this.I_measure--;
            break lab0;
          }
          this.cursor = v_1;
          this.slice_del();
          this.I_prefix = 1;
          this.I_measure--;
        }
        break;
      case 3:
        this.slice_del();
        this.I_prefix = 3;
        this.I_measure--;
        break;
      case 4:
        lab2: {
          const v_3 = this.cursor;
          lab3: {
            if (!this.eq_s('y')) {
              break lab3;
            }
            const v_4 = this.cursor;
            if (!this.in_grouping(StemmerId.g_vowel, 97, 117)) {
              break lab3;
            }
            this.cursor = v_4;
            this.ket = this.cursor;
            this.slice_from('s');
            this.I_prefix = 3;
            this.I_measure--;
            break lab2;
          }
          this.cursor = v_3;
          this.slice_del();
          this.I_prefix = 3;
          this.I_measure--;
        }
        break;
      case 5:
        this.I_prefix = 1;
        this.I_measure--;
        lab4: {
          const v_5 = this.cursor;
          lab5: {
            const v_6 = this.cursor;
            if (!this.in_grouping(StemmerId.g_vowel, 97, 117)) {
              break lab5;
            }
            this.cursor = v_6;
            this.slice_from('p');
            break lab4;
          }
          this.cursor = v_5;
          this.slice_del();
        }
        break;
      case 6:
        this.I_prefix = 3;
        this.I_measure--;
        lab6: {
          const v_7 = this.cursor;
          lab7: {
            const v_8 = this.cursor;
            if (!this.in_grouping(StemmerId.g_vowel, 97, 117)) {
              break lab7;
            }
            this.cursor = v_8;
            this.slice_from('p');
            break lab6;
          }
          this.cursor = v_7;
          this.slice_del();
        }
        break;
    }
    return true;
  }

  r_remove_second_order_prefix(): boolean {
    this.bra = this.cursor;
    const among_var = this.find_among(StemmerId.a_4);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        lab0: {
          const v_1 = this.cursor;
          lab1: {
            if (!this.eq_s('r')) {
              break lab1;
            }
            this.ket = this.cursor;
            this.I_prefix = 2;
            break lab0;
          }
          this.cursor = v_1;
          lab2: {
            if (!this.eq_s('l')) {
              break lab2;
            }
            this.ket = this.cursor;
            if (!this.eq_s('ajar')) {
              break lab2;
            }
            break lab0;
          }
          this.cursor = v_1;
          this.ket = this.cursor;
          this.I_prefix = 2;
        }
        break;
      case 2:
        lab3: {
          const v_2 = this.cursor;
          lab4: {
            if (!this.eq_s('r')) {
              break lab4;
            }
            this.ket = this.cursor;
            break lab3;
          }
          this.cursor = v_2;
          lab5: {
            if (!this.eq_s('l')) {
              break lab5;
            }
            this.ket = this.cursor;
            if (!this.eq_s('ajar')) {
              break lab5;
            }
            break lab3;
          }
          this.cursor = v_2;
          this.ket = this.cursor;
          if (!this.out_grouping(StemmerId.g_vowel, 97, 117)) {
            return false;
          }
          if (!this.eq_s('er')) {
            return false;
          }
        }
        this.I_prefix = 4;
        break;
    }
    this.I_measure--;
    this.slice_del();
    return true;
  }

  innerStem(): boolean {
    this.I_measure = 0;
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab1: {
        if (!this.gopast_in_grouping(StemmerId.g_vowel, 97, 117)) {
          break lab1;
        }
        this.I_measure++;
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    if (this.I_measure <= 2) {
      return false;
    }
    this.I_prefix = 0;
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_remove_particle);
    if (this.I_measure <= 2) {
      return false;
    }
    this.do_backward(this.r_remove_possessive_pronoun);
    this.cursor = this.limit_backward;
    if (this.I_measure <= 2) {
      return false;
    }
    lab2: {
      const v_5 = this.cursor;
      lab3: {
        const v_6 = this.cursor;
        if (!this.r_remove_first_order_prefix()) {
          break lab3;
        }
        const v_7 = this.cursor;
        lab4: {
          const v_8 = this.cursor;
          if (this.I_measure <= 2) {
            break lab4;
          }
          this.limit_backward = this.cursor;
          this.cursor = this.limit;
          if (!this.r_remove_suffix()) {
            break lab4;
          }
          this.cursor = this.limit_backward;
          this.cursor = v_8;
          if (this.I_measure <= 2) {
            break lab4;
          }
          if (!this.r_remove_second_order_prefix()) {
            break lab4;
          }
        }
        this.cursor = v_7;
        this.cursor = v_6;
        break lab2;
      }
      this.cursor = v_5;
      this.do_forward(this.r_remove_second_order_prefix);
      const v_10 = this.cursor;
      lab5: {
        if (this.I_measure <= 2) {
          break lab5;
        }
        this.limit_backward = this.cursor;
        this.cursor = this.limit;
        if (!this.r_remove_suffix()) {
          break lab5;
        }
        this.cursor = this.limit_backward;
      }
      this.cursor = v_10;
    }
    return true;
  }

  static g_vowel: number[] = [17, 65, 16];

  static a_0 = Among.table<StemmerId>(`
    kah,-1,1 lah,-1,1 pun,-1,1
  `);

  static a_1 = Among.table<StemmerId>(`
    nya,-1,1 ku,-1,1 mu,-1,1
  `);

  static a_2 = Among.table<StemmerId>(`
    i,-1,2 an,-1,1
  `);

  static a_3 = Among.table<StemmerId>(`
    di,-1,1 ke,-1,3 me,-1,1 mem,2,5 men,2,2 meng,4,1 pem,-1,6 pen,-1,4 peng,7,3
    ter,-1,1
  `);

  static a_4 = Among.table<StemmerId>(`
    be,-1,2 pe,-1,1
  `);
}

export default StemmerId;
