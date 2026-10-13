import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from turkish.sbl of Snowball at commit 411550d. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerTr extends SnowballStemmer {
  declare B_continue_stemming_noun_suffixes: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-tr';
    this.B_continue_stemming_noun_suffixes = false;
  }

  r_check_vowel_harmony(): boolean {
    const v_1 = this.limit - this.cursor;
    if (!this.goto_in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
      return false;
    }
    lab0: {
      const v_2 = this.limit - this.cursor;
      lab1: {
        if (!this.eq_s_b('a')) {
          break lab1;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel1, 97, 305)) {
          break lab1;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab2: {
        if (!this.eq_s_b('e')) {
          break lab2;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel2, 101, 252)) {
          break lab2;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab3: {
        if (!this.eq_s_b('\u0131')) {
          break lab3;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel3, 97, 305)) {
          break lab3;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab4: {
        if (!this.eq_s_b('i')) {
          break lab4;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel4, 101, 105)) {
          break lab4;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab5: {
        if (!this.eq_s_b('o')) {
          break lab5;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel5, 111, 117)) {
          break lab5;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab6: {
        if (!this.eq_s_b('\u00F6')) {
          break lab6;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel6, 246, 252)) {
          break lab6;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      lab7: {
        if (!this.eq_s_b('u')) {
          break lab7;
        }
        if (!this.goto_in_grouping_b(StemmerTr.g_vowel5, 111, 117)) {
          break lab7;
        }
        break lab0;
      }
      this.cursor = this.limit - v_2;
      if (!this.eq_s_b('\u00FC')) {
        return false;
      }
      if (!this.goto_in_grouping_b(StemmerTr.g_vowel6, 246, 252)) {
        return false;
      }
    }
    this.cursor = this.limit - v_1;
    return true;
  }

  r_mark_suffix_with_optional_n_consonant(): boolean {
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.eq_s_b('n')) {
          break lab1;
        }
        const v_2 = this.limit - this.cursor;
        if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
          break lab1;
        }
        this.cursor = this.limit - v_2;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (this.eq_s_b('n')) {
        return false;
      }
      const v_3 = this.limit - this.cursor;
      if (this.cursor <= this.limit_backward) {
        return false;
      }
      this.cursor--;
      if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
        return false;
      }
      this.cursor = this.limit - v_3;
    }
    return true;
  }

  r_mark_suffix_with_optional_s_consonant(): boolean {
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.eq_s_b('s')) {
          break lab1;
        }
        const v_2 = this.limit - this.cursor;
        if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
          break lab1;
        }
        this.cursor = this.limit - v_2;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (this.eq_s_b('s')) {
        return false;
      }
      const v_3 = this.limit - this.cursor;
      if (this.cursor <= this.limit_backward) {
        return false;
      }
      this.cursor--;
      if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
        return false;
      }
      this.cursor = this.limit - v_3;
    }
    return true;
  }

  r_mark_suffix_with_optional_y_consonant(): boolean {
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.eq_s_b('y')) {
          break lab1;
        }
        const v_2 = this.limit - this.cursor;
        if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
          break lab1;
        }
        this.cursor = this.limit - v_2;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (this.eq_s_b('y')) {
        return false;
      }
      const v_3 = this.limit - this.cursor;
      if (this.cursor <= this.limit_backward) {
        return false;
      }
      this.cursor--;
      if (!this.in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
        return false;
      }
      this.cursor = this.limit - v_3;
    }
    return true;
  }

  r_mark_suffix_with_optional_U_vowel(): boolean {
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.in_grouping_b(StemmerTr.g_U, 105, 305)) {
          break lab1;
        }
        const v_2 = this.limit - this.cursor;
        if (!this.out_grouping_b(StemmerTr.g_vowel, 97, 305)) {
          break lab1;
        }
        this.cursor = this.limit - v_2;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (this.in_grouping_b(StemmerTr.g_U, 105, 305)) {
        return false;
      }
      const v_3 = this.limit - this.cursor;
      if (this.cursor <= this.limit_backward) {
        return false;
      }
      this.cursor--;
      if (!this.out_grouping_b(StemmerTr.g_vowel, 97, 305)) {
        return false;
      }
      this.cursor = this.limit - v_3;
    }
    return true;
  }

  r_mark_possessives(): boolean {
    if (this.find_among_b(StemmerTr.a_0) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_U_vowel();
  }

  r_mark_sU(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (!this.in_grouping_b(StemmerTr.g_U, 105, 305)) {
      return false;
    }
    return this.r_mark_suffix_with_optional_s_consonant();
  }

  r_mark_lArI(): boolean {
    if (this.find_among_b(StemmerTr.a_1) === 0) {
      return false;
    }
    return true;
  }

  r_mark_yU(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (!this.in_grouping_b(StemmerTr.g_U, 105, 305)) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_nU(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_2) === 0) {
      return false;
    }
    return true;
  }

  r_mark_nUn(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_3) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_n_consonant();
  }

  r_mark_yA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_4) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_nA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_5) === 0) {
      return false;
    }
    return true;
  }

  r_mark_DA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_6) === 0) {
      return false;
    }
    return true;
  }

  r_mark_ndA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_7) === 0) {
      return false;
    }
    return true;
  }

  r_mark_DAn(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_8) === 0) {
      return false;
    }
    return true;
  }

  r_mark_ndAn(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_9) === 0) {
      return false;
    }
    return true;
  }

  r_mark_ylA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_10) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_ki(): boolean {
    return this.eq_s_b('ki');
  }

  r_mark_ncA(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_11) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_n_consonant();
  }

  r_mark_yUm(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_12) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_sUn(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_13) === 0) {
      return false;
    }
    return true;
  }

  r_mark_yUz(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_14) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_sUnUz(): boolean {
    if (this.find_among_b(StemmerTr.a_15) === 0) {
      return false;
    }
    return true;
  }

  r_mark_lAr(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_16) === 0) {
      return false;
    }
    return true;
  }

  r_mark_nUz(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_17) === 0) {
      return false;
    }
    return true;
  }

  r_mark_DUr(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_18) === 0) {
      return false;
    }
    return true;
  }

  r_mark_cAsInA(): boolean {
    if (this.find_among_b(StemmerTr.a_19) === 0) {
      return false;
    }
    return true;
  }

  r_mark_yDU(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_20) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_ysA(): boolean {
    if (this.find_among_b(StemmerTr.a_21) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_ymUs(): boolean {
    if (!this.r_check_vowel_harmony()) {
      return false;
    }
    if (this.find_among_b(StemmerTr.a_22) === 0) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_mark_yken(): boolean {
    if (!this.eq_s_b('ken')) {
      return false;
    }
    return this.r_mark_suffix_with_optional_y_consonant();
  }

  r_stem_nominal_verb_suffixes(): boolean {
    this.ket = this.cursor;
    this.B_continue_stemming_noun_suffixes = true;
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        lab2: {
          const v_2 = this.limit - this.cursor;
          lab3: {
            if (!this.r_mark_ymUs()) {
              break lab3;
            }
            break lab2;
          }
          this.cursor = this.limit - v_2;
          lab4: {
            if (!this.r_mark_yDU()) {
              break lab4;
            }
            break lab2;
          }
          this.cursor = this.limit - v_2;
          lab5: {
            if (!this.r_mark_ysA()) {
              break lab5;
            }
            break lab2;
          }
          this.cursor = this.limit - v_2;
          if (!this.r_mark_yken()) {
            break lab1;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab6: {
        if (!this.r_mark_cAsInA()) {
          break lab6;
        }
        lab7: {
          const v_3 = this.limit - this.cursor;
          lab8: {
            if (!this.r_mark_sUnUz()) {
              break lab8;
            }
            break lab7;
          }
          this.cursor = this.limit - v_3;
          lab9: {
            if (!this.r_mark_lAr()) {
              break lab9;
            }
            break lab7;
          }
          this.cursor = this.limit - v_3;
          lab10: {
            if (!this.r_mark_yUm()) {
              break lab10;
            }
            break lab7;
          }
          this.cursor = this.limit - v_3;
          lab11: {
            if (!this.r_mark_sUn()) {
              break lab11;
            }
            break lab7;
          }
          this.cursor = this.limit - v_3;
          lab12: {
            if (!this.r_mark_yUz()) {
              break lab12;
            }
            break lab7;
          }
          this.cursor = this.limit - v_3;
        }
        if (!this.r_mark_ymUs()) {
          break lab6;
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab13: {
        if (!this.r_mark_lAr()) {
          break lab13;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_4 = this.limit - this.cursor;
        lab14: {
          this.ket = this.cursor;
          lab15: {
            const v_5 = this.limit - this.cursor;
            lab16: {
              if (!this.r_mark_DUr()) {
                break lab16;
              }
              break lab15;
            }
            this.cursor = this.limit - v_5;
            lab17: {
              if (!this.r_mark_yDU()) {
                break lab17;
              }
              break lab15;
            }
            this.cursor = this.limit - v_5;
            lab18: {
              if (!this.r_mark_ysA()) {
                break lab18;
              }
              break lab15;
            }
            this.cursor = this.limit - v_5;
            if (!this.r_mark_ymUs()) {
              this.cursor = this.limit - v_4;
              break lab14;
            }
          }
        }
        this.B_continue_stemming_noun_suffixes = false;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab19: {
        if (!this.r_mark_nUz()) {
          break lab19;
        }
        lab20: {
          const v_6 = this.limit - this.cursor;
          lab21: {
            if (!this.r_mark_yDU()) {
              break lab21;
            }
            break lab20;
          }
          this.cursor = this.limit - v_6;
          if (!this.r_mark_ysA()) {
            break lab19;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab22: {
        lab23: {
          const v_7 = this.limit - this.cursor;
          lab24: {
            if (!this.r_mark_sUnUz()) {
              break lab24;
            }
            break lab23;
          }
          this.cursor = this.limit - v_7;
          lab25: {
            if (!this.r_mark_yUz()) {
              break lab25;
            }
            break lab23;
          }
          this.cursor = this.limit - v_7;
          lab26: {
            if (!this.r_mark_sUn()) {
              break lab26;
            }
            break lab23;
          }
          this.cursor = this.limit - v_7;
          if (!this.r_mark_yUm()) {
            break lab22;
          }
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_8 = this.limit - this.cursor;
        lab27: {
          this.ket = this.cursor;
          if (!this.r_mark_ymUs()) {
            this.cursor = this.limit - v_8;
            break lab27;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (!this.r_mark_DUr()) {
        return false;
      }
      this.bra = this.cursor;
      this.slice_del();
      const v_9 = this.limit - this.cursor;
      lab28: {
        this.ket = this.cursor;
        lab29: {
          const v_10 = this.limit - this.cursor;
          lab30: {
            if (!this.r_mark_sUnUz()) {
              break lab30;
            }
            break lab29;
          }
          this.cursor = this.limit - v_10;
          lab31: {
            if (!this.r_mark_lAr()) {
              break lab31;
            }
            break lab29;
          }
          this.cursor = this.limit - v_10;
          lab32: {
            if (!this.r_mark_yUm()) {
              break lab32;
            }
            break lab29;
          }
          this.cursor = this.limit - v_10;
          lab33: {
            if (!this.r_mark_sUn()) {
              break lab33;
            }
            break lab29;
          }
          this.cursor = this.limit - v_10;
          lab34: {
            if (!this.r_mark_yUz()) {
              break lab34;
            }
            break lab29;
          }
          this.cursor = this.limit - v_10;
        }
        if (!this.r_mark_ymUs()) {
          this.cursor = this.limit - v_9;
          break lab28;
        }
      }
    }
    this.bra = this.cursor;
    this.slice_del();
    return true;
  }

  r_stem_suffix_chain_before_ki(): boolean {
    this.ket = this.cursor;
    if (!this.r_mark_ki()) {
      return false;
    }
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.r_mark_DA()) {
          break lab1;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab2: {
          this.ket = this.cursor;
          lab3: {
            const v_3 = this.limit - this.cursor;
            lab4: {
              if (!this.r_mark_lAr()) {
                break lab4;
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_4 = this.limit - this.cursor;
              lab5: {
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_4;
                  break lab5;
                }
              }
              break lab3;
            }
            this.cursor = this.limit - v_3;
            if (!this.r_mark_possessives()) {
              this.cursor = this.limit - v_2;
              break lab2;
            }
            this.bra = this.cursor;
            this.slice_del();
            const v_5 = this.limit - this.cursor;
            lab6: {
              this.ket = this.cursor;
              if (!this.r_mark_lAr()) {
                this.cursor = this.limit - v_5;
                break lab6;
              }
              this.bra = this.cursor;
              this.slice_del();
              if (!this.r_stem_suffix_chain_before_ki()) {
                this.cursor = this.limit - v_5;
                break lab6;
              }
            }
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab7: {
        if (!this.r_mark_nUn()) {
          break lab7;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_6 = this.limit - this.cursor;
        lab8: {
          this.ket = this.cursor;
          lab9: {
            const v_7 = this.limit - this.cursor;
            lab10: {
              if (!this.r_mark_lArI()) {
                break lab10;
              }
              this.bra = this.cursor;
              this.slice_del();
              break lab9;
            }
            this.cursor = this.limit - v_7;
            lab11: {
              this.ket = this.cursor;
              lab12: {
                const v_8 = this.limit - this.cursor;
                lab13: {
                  if (!this.r_mark_possessives()) {
                    break lab13;
                  }
                  break lab12;
                }
                this.cursor = this.limit - v_8;
                if (!this.r_mark_sU()) {
                  break lab11;
                }
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_9 = this.limit - this.cursor;
              lab14: {
                this.ket = this.cursor;
                if (!this.r_mark_lAr()) {
                  this.cursor = this.limit - v_9;
                  break lab14;
                }
                this.bra = this.cursor;
                this.slice_del();
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_9;
                  break lab14;
                }
              }
              break lab9;
            }
            this.cursor = this.limit - v_7;
            if (!this.r_stem_suffix_chain_before_ki()) {
              this.cursor = this.limit - v_6;
              break lab8;
            }
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (!this.r_mark_ndA()) {
        return false;
      }
      lab15: {
        const v_10 = this.limit - this.cursor;
        lab16: {
          if (!this.r_mark_lArI()) {
            break lab16;
          }
          this.bra = this.cursor;
          this.slice_del();
          break lab15;
        }
        this.cursor = this.limit - v_10;
        lab17: {
          if (!this.r_mark_sU()) {
            break lab17;
          }
          this.bra = this.cursor;
          this.slice_del();
          const v_11 = this.limit - this.cursor;
          lab18: {
            this.ket = this.cursor;
            if (!this.r_mark_lAr()) {
              this.cursor = this.limit - v_11;
              break lab18;
            }
            this.bra = this.cursor;
            this.slice_del();
            if (!this.r_stem_suffix_chain_before_ki()) {
              this.cursor = this.limit - v_11;
              break lab18;
            }
          }
          break lab15;
        }
        this.cursor = this.limit - v_10;
        return this.r_stem_suffix_chain_before_ki();
      }
    }
    return true;
  }

  r_stem_noun_suffixes(): boolean {
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        this.ket = this.cursor;
        if (!this.r_mark_lAr()) {
          break lab1;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab2: {
          if (!this.r_stem_suffix_chain_before_ki()) {
            this.cursor = this.limit - v_2;
            break lab2;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab3: {
        this.ket = this.cursor;
        if (!this.r_mark_ncA()) {
          break lab3;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_3 = this.limit - this.cursor;
        lab4: {
          lab5: {
            const v_4 = this.limit - this.cursor;
            lab6: {
              this.ket = this.cursor;
              if (!this.r_mark_lArI()) {
                break lab6;
              }
              this.bra = this.cursor;
              this.slice_del();
              break lab5;
            }
            this.cursor = this.limit - v_4;
            lab7: {
              this.ket = this.cursor;
              lab8: {
                const v_5 = this.limit - this.cursor;
                lab9: {
                  if (!this.r_mark_possessives()) {
                    break lab9;
                  }
                  break lab8;
                }
                this.cursor = this.limit - v_5;
                if (!this.r_mark_sU()) {
                  break lab7;
                }
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_6 = this.limit - this.cursor;
              lab10: {
                this.ket = this.cursor;
                if (!this.r_mark_lAr()) {
                  this.cursor = this.limit - v_6;
                  break lab10;
                }
                this.bra = this.cursor;
                this.slice_del();
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_6;
                  break lab10;
                }
              }
              break lab5;
            }
            this.cursor = this.limit - v_4;
            this.ket = this.cursor;
            if (!this.r_mark_lAr()) {
              this.cursor = this.limit - v_3;
              break lab4;
            }
            this.bra = this.cursor;
            this.slice_del();
            if (!this.r_stem_suffix_chain_before_ki()) {
              this.cursor = this.limit - v_3;
              break lab4;
            }
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab11: {
        this.ket = this.cursor;
        lab12: {
          const v_7 = this.limit - this.cursor;
          lab13: {
            if (!this.r_mark_ndA()) {
              break lab13;
            }
            break lab12;
          }
          this.cursor = this.limit - v_7;
          if (!this.r_mark_nA()) {
            break lab11;
          }
        }
        lab14: {
          const v_8 = this.limit - this.cursor;
          lab15: {
            if (!this.r_mark_lArI()) {
              break lab15;
            }
            this.bra = this.cursor;
            this.slice_del();
            break lab14;
          }
          this.cursor = this.limit - v_8;
          lab16: {
            if (!this.r_mark_sU()) {
              break lab16;
            }
            this.bra = this.cursor;
            this.slice_del();
            const v_9 = this.limit - this.cursor;
            lab17: {
              this.ket = this.cursor;
              if (!this.r_mark_lAr()) {
                this.cursor = this.limit - v_9;
                break lab17;
              }
              this.bra = this.cursor;
              this.slice_del();
              if (!this.r_stem_suffix_chain_before_ki()) {
                this.cursor = this.limit - v_9;
                break lab17;
              }
            }
            break lab14;
          }
          this.cursor = this.limit - v_8;
          if (!this.r_stem_suffix_chain_before_ki()) {
            break lab11;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab18: {
        this.ket = this.cursor;
        lab19: {
          const v_10 = this.limit - this.cursor;
          lab20: {
            if (!this.r_mark_ndAn()) {
              break lab20;
            }
            break lab19;
          }
          this.cursor = this.limit - v_10;
          if (!this.r_mark_nU()) {
            break lab18;
          }
        }
        lab21: {
          const v_11 = this.limit - this.cursor;
          lab22: {
            if (!this.r_mark_sU()) {
              break lab22;
            }
            this.bra = this.cursor;
            this.slice_del();
            const v_12 = this.limit - this.cursor;
            lab23: {
              this.ket = this.cursor;
              if (!this.r_mark_lAr()) {
                this.cursor = this.limit - v_12;
                break lab23;
              }
              this.bra = this.cursor;
              this.slice_del();
              if (!this.r_stem_suffix_chain_before_ki()) {
                this.cursor = this.limit - v_12;
                break lab23;
              }
            }
            break lab21;
          }
          this.cursor = this.limit - v_11;
          if (!this.r_mark_lArI()) {
            break lab18;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab24: {
        this.ket = this.cursor;
        if (!this.r_mark_DAn()) {
          break lab24;
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_13 = this.limit - this.cursor;
        lab25: {
          this.ket = this.cursor;
          lab26: {
            const v_14 = this.limit - this.cursor;
            lab27: {
              if (!this.r_mark_possessives()) {
                break lab27;
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_15 = this.limit - this.cursor;
              lab28: {
                this.ket = this.cursor;
                if (!this.r_mark_lAr()) {
                  this.cursor = this.limit - v_15;
                  break lab28;
                }
                this.bra = this.cursor;
                this.slice_del();
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_15;
                  break lab28;
                }
              }
              break lab26;
            }
            this.cursor = this.limit - v_14;
            lab29: {
              if (!this.r_mark_lAr()) {
                break lab29;
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_16 = this.limit - this.cursor;
              lab30: {
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_16;
                  break lab30;
                }
              }
              break lab26;
            }
            this.cursor = this.limit - v_14;
            if (!this.r_stem_suffix_chain_before_ki()) {
              this.cursor = this.limit - v_13;
              break lab25;
            }
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab31: {
        this.ket = this.cursor;
        lab32: {
          const v_17 = this.limit - this.cursor;
          lab33: {
            if (!this.r_mark_nUn()) {
              break lab33;
            }
            break lab32;
          }
          this.cursor = this.limit - v_17;
          if (!this.r_mark_ylA()) {
            break lab31;
          }
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_18 = this.limit - this.cursor;
        lab34: {
          lab35: {
            const v_19 = this.limit - this.cursor;
            lab36: {
              this.ket = this.cursor;
              if (!this.r_mark_lAr()) {
                break lab36;
              }
              this.bra = this.cursor;
              this.slice_del();
              if (!this.r_stem_suffix_chain_before_ki()) {
                break lab36;
              }
              break lab35;
            }
            this.cursor = this.limit - v_19;
            lab37: {
              this.ket = this.cursor;
              lab38: {
                const v_20 = this.limit - this.cursor;
                lab39: {
                  if (!this.r_mark_possessives()) {
                    break lab39;
                  }
                  break lab38;
                }
                this.cursor = this.limit - v_20;
                if (!this.r_mark_sU()) {
                  break lab37;
                }
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_21 = this.limit - this.cursor;
              lab40: {
                this.ket = this.cursor;
                if (!this.r_mark_lAr()) {
                  this.cursor = this.limit - v_21;
                  break lab40;
                }
                this.bra = this.cursor;
                this.slice_del();
                if (!this.r_stem_suffix_chain_before_ki()) {
                  this.cursor = this.limit - v_21;
                  break lab40;
                }
              }
              break lab35;
            }
            this.cursor = this.limit - v_19;
            if (!this.r_stem_suffix_chain_before_ki()) {
              this.cursor = this.limit - v_18;
              break lab34;
            }
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab41: {
        this.ket = this.cursor;
        if (!this.r_mark_lArI()) {
          break lab41;
        }
        this.bra = this.cursor;
        this.slice_del();
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab42: {
        if (!this.r_stem_suffix_chain_before_ki()) {
          break lab42;
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab43: {
        this.ket = this.cursor;
        lab44: {
          const v_22 = this.limit - this.cursor;
          lab45: {
            if (!this.r_mark_DA()) {
              break lab45;
            }
            break lab44;
          }
          this.cursor = this.limit - v_22;
          lab46: {
            if (!this.r_mark_yU()) {
              break lab46;
            }
            break lab44;
          }
          this.cursor = this.limit - v_22;
          if (!this.r_mark_yA()) {
            break lab43;
          }
        }
        this.bra = this.cursor;
        this.slice_del();
        const v_23 = this.limit - this.cursor;
        lab47: {
          this.ket = this.cursor;
          lab48: {
            const v_24 = this.limit - this.cursor;
            lab49: {
              if (!this.r_mark_possessives()) {
                break lab49;
              }
              this.bra = this.cursor;
              this.slice_del();
              const v_25 = this.limit - this.cursor;
              lab50: {
                this.ket = this.cursor;
                if (!this.r_mark_lAr()) {
                  this.cursor = this.limit - v_25;
                  break lab50;
                }
              }
              break lab48;
            }
            this.cursor = this.limit - v_24;
            if (!this.r_mark_lAr()) {
              this.cursor = this.limit - v_23;
              break lab47;
            }
          }
          this.bra = this.cursor;
          this.slice_del();
          this.ket = this.cursor;
          if (!this.r_stem_suffix_chain_before_ki()) {
            this.cursor = this.limit - v_23;
            break lab47;
          }
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      this.ket = this.cursor;
      lab51: {
        const v_26 = this.limit - this.cursor;
        lab52: {
          if (!this.r_mark_possessives()) {
            break lab52;
          }
          break lab51;
        }
        this.cursor = this.limit - v_26;
        if (!this.r_mark_sU()) {
          return false;
        }
      }
      this.bra = this.cursor;
      this.slice_del();
      const v_27 = this.limit - this.cursor;
      lab53: {
        this.ket = this.cursor;
        if (!this.r_mark_lAr()) {
          this.cursor = this.limit - v_27;
          break lab53;
        }
        this.bra = this.cursor;
        this.slice_del();
        if (!this.r_stem_suffix_chain_before_ki()) {
          this.cursor = this.limit - v_27;
          break lab53;
        }
      }
    }
    return true;
  }

  r_post_process_last_consonants(): boolean {
    const among_var = this.find_slice_b(StemmerTr.a_23);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('p');
        break;
      case 2:
        this.slice_from('\u00E7');
        break;
      case 3:
        this.slice_from('t');
        break;
      case 4:
        this.slice_from('k');
        break;
    }
    return true;
  }

  r_append_U_to_stems_ending_with_d_or_g(): boolean {
    this.ket = this.cursor;
    this.bra = this.cursor;
    if (!this.eq_s_b('d') && !this.eq_s_b('g')) {
      return false;
    }
    if (!this.goto_in_grouping_b(StemmerTr.g_vowel, 97, 305)) {
      return false;
    }
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        if (!this.eq_s_b('a') && !this.eq_s_b('\u0131')) {
          break lab1;
        }
        this.slice_from('\u0131');
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab2: {
        if (!this.eq_s_b('e') && !this.eq_s_b('i')) {
          break lab2;
        }
        this.slice_from('i');
        break lab0;
      }
      this.cursor = this.limit - v_1;
      lab3: {
        if (!this.eq_s_b('o') && !this.eq_s_b('u')) {
          break lab3;
        }
        this.slice_from('u');
        break lab0;
      }
      this.cursor = this.limit - v_1;
      if (!this.eq_s_b('\u00F6') && !this.eq_s_b('\u00FC')) {
        return false;
      }
      this.slice_from('\u00FC');
    }
    return true;
  }

  r_is_reserved_word(): boolean {
    if (!this.eq_s_b('ad')) {
      return false;
    }
    const v_1 = this.limit - this.cursor;
    lab0: {
      if (!this.eq_s_b('soy')) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
    }
    return this.cursor <= this.limit_backward;
  }

  r_remove_proper_noun_suffix(): boolean {
    const v_1 = this.cursor;
    lab0: {
      this.bra = this.cursor;
      lab1: for (;;) {
        const v_2 = this.cursor;
        lab2: {
          if (this.eq_s("'")) {
            break lab2;
          }
          this.cursor = v_2;
          break lab1;
        }
        this.cursor = v_2;
        if (this.cursor >= this.limit) {
          break lab0;
        }
        this.cursor++;
      }
      this.ket = this.cursor;
      this.slice_del();
    }
    this.cursor = v_1;
    const v_3 = this.cursor;
    lab3: {
      if (this.cursor + 2 > this.limit) {
        break lab3;
      }
      this.cursor += 2;
      lab4: for (;;) {
        const v_4 = this.cursor;
        lab5: {
          if (!this.eq_s("'")) {
            break lab5;
          }
          this.cursor = v_4;
          break lab4;
        }
        this.cursor = v_4;
        if (this.cursor >= this.limit) {
          break lab3;
        }
        this.cursor++;
      }
      this.bra = this.cursor;
      this.cursor = this.limit;
      this.ket = this.cursor;
      this.slice_del();
    }
    this.cursor = v_3;
    return true;
  }

  r_more_than_one_syllable_word(): boolean {
    const v_1 = this.cursor;
    for (let v_2 = 2; v_2 > 0; v_2--) {
      if (!this.gopast_in_grouping(StemmerTr.g_vowel, 97, 305)) {
        return false;
      }
    }
    this.cursor = v_1;
    return true;
  }

  r_postlude(): boolean {
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    {
      const v_1 = this.limit - this.cursor;
      lab0: {
        if (!this.r_is_reserved_word()) {
          break lab0;
        }
        return false;
      }
      this.cursor = this.limit - v_1;
    }
    this.do_backward(this.r_append_U_to_stems_ending_with_d_or_g);
    this.do_backward(this.r_post_process_last_consonants);
    this.cursor = this.limit_backward;
    return true;
  }

  innerStem(): boolean {
    this.r_remove_proper_noun_suffix();
    if (!this.r_more_than_one_syllable_word()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_stem_nominal_verb_suffixes);
    if (!this.B_continue_stemming_noun_suffixes) {
      return false;
    }
    this.do_backward(this.r_stem_noun_suffixes);
    this.cursor = this.limit_backward;
    return this.r_postlude();
  }

  static g_vowel: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 8, 0, 0, 0, 0,
    0, 0, 1,
  ];

  static g_U: number[] = [
    1, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0,
    1,
  ];

  static g_vowel1: number[] = [
    1, 64, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1,
  ];

  static g_vowel2: number[] = [
    17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 130,
  ];

  static g_vowel3: number[] = [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1,
  ];

  static g_vowel4: number[] = [17];

  static g_vowel5: number[] = [65];

  static g_vowel6: number[] = [65];

  static a_0 = Among.table<StemmerTr>(`
    m,-1,-1 n,-1,-1 miz,-1,-1 niz,-1,-1 muz,-1,-1 nuz,-1,-1 müz,-1,-1 nüz,-1,-1
    mız,-1,-1 nız,-1,-1
  `);

  static a_1 = Among.table<StemmerTr>(`
    leri,-1,-1 ları,-1,-1
  `);

  static a_2 = Among.table<StemmerTr>(`
    ni,-1,-1 nu,-1,-1 nü,-1,-1 nı,-1,-1
  `);

  static a_3 = Among.table<StemmerTr>(`
    in,-1,-1 un,-1,-1 ün,-1,-1 ın,-1,-1
  `);

  static a_4 = Among.table<StemmerTr>(`
    a,-1,-1 e,-1,-1
  `);

  static a_5 = Among.table<StemmerTr>(`
    na,-1,-1 ne,-1,-1
  `);

  static a_6 = Among.table<StemmerTr>(`
    da,-1,-1 ta,-1,-1 de,-1,-1 te,-1,-1
  `);

  static a_7 = Among.table<StemmerTr>(`
    nda,-1,-1 nde,-1,-1
  `);

  static a_8 = Among.table<StemmerTr>(`
    dan,-1,-1 tan,-1,-1 den,-1,-1 ten,-1,-1
  `);

  static a_9 = Among.table<StemmerTr>(`
    ndan,-1,-1 nden,-1,-1
  `);

  static a_10 = Among.table<StemmerTr>(`
    la,-1,-1 le,-1,-1
  `);

  static a_11 = Among.table<StemmerTr>(`
    ca,-1,-1 ce,-1,-1
  `);

  static a_12 = Among.table<StemmerTr>(`
    im,-1,-1 um,-1,-1 üm,-1,-1 ım,-1,-1
  `);

  static a_13 = Among.table<StemmerTr>(`
    sin,-1,-1 sun,-1,-1 sün,-1,-1 sın,-1,-1
  `);

  static a_14 = Among.table<StemmerTr>(`
    iz,-1,-1 uz,-1,-1 üz,-1,-1 ız,-1,-1
  `);

  static a_15 = Among.table<StemmerTr>(`
    siniz,-1,-1 sunuz,-1,-1 sünüz,-1,-1 sınız,-1,-1
  `);

  static a_16 = Among.table<StemmerTr>(`
    lar,-1,-1 ler,-1,-1
  `);

  static a_17 = Among.table<StemmerTr>(`
    niz,-1,-1 nuz,-1,-1 nüz,-1,-1 nız,-1,-1
  `);

  static a_18 = Among.table<StemmerTr>(`
    dir,-1,-1 tir,-1,-1 dur,-1,-1 tur,-1,-1 dür,-1,-1 tür,-1,-1 dır,-1,-1
    tır,-1,-1
  `);

  static a_19 = Among.table<StemmerTr>(`
    casına,-1,-1 cesine,-1,-1
  `);

  static a_20 = Among.table<StemmerTr>(`
    di,-1,-1 ti,-1,-1 dik,-1,-1 tik,-1,-1 duk,-1,-1 tuk,-1,-1 dük,-1,-1
    tük,-1,-1 dık,-1,-1 tık,-1,-1 dim,-1,-1 tim,-1,-1 dum,-1,-1 tum,-1,-1
    düm,-1,-1 tüm,-1,-1 dım,-1,-1 tım,-1,-1 din,-1,-1 tin,-1,-1 dun,-1,-1
    tun,-1,-1 dün,-1,-1 tün,-1,-1 dın,-1,-1 tın,-1,-1 du,-1,-1 tu,-1,-1 dü,-1,-1
    tü,-1,-1 dı,-1,-1 tı,-1,-1
  `);

  static a_21 = Among.table<StemmerTr>(`
    sa,-1,-1 se,-1,-1 sak,-1,-1 sek,-1,-1 sam,-1,-1 sem,-1,-1 san,-1,-1
    sen,-1,-1
  `);

  static a_22 = Among.table<StemmerTr>(`
    miş,-1,-1 muş,-1,-1 müş,-1,-1 mış,-1,-1
  `);

  static a_23 = Among.table<StemmerTr>(`
    b,-1,1 c,-1,2 d,-1,3 ğ,-1,4
  `);
}

export default StemmerTr;
