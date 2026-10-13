import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from arabic.sbl of Snowball 2.2.0 with our changes (tools/snowball/edits.ts). Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerAr extends SnowballStemmer {
  declare B_is_noun: boolean;
  declare B_is_verb: boolean;
  declare B_is_defined: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ar';
    this.B_is_noun = false;
    this.B_is_verb = false;
    this.B_is_defined = false;
  }

  r_Normalize_pre(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab1: {
        lab2: {
          const v_3 = this.cursor;
          lab3: {
            const among_var = this.find_slice(StemmerAr.a_0);
            if (among_var === 0) {
              break lab3;
            }
            switch (among_var) {
              case 1:
                this.slice_del();
                break;
              case 2:
                this.slice_from('0');
                break;
              case 3:
                this.slice_from('1');
                break;
              case 4:
                this.slice_from('2');
                break;
              case 5:
                this.slice_from('3');
                break;
              case 6:
                this.slice_from('4');
                break;
              case 7:
                this.slice_from('5');
                break;
              case 8:
                this.slice_from('6');
                break;
              case 9:
                this.slice_from('7');
                break;
              case 10:
                this.slice_from('8');
                break;
              case 11:
                this.slice_from('9');
                break;
              case 12:
                this.slice_from('\u0621');
                break;
              case 13:
                this.slice_from('\u0623');
                break;
              case 14:
                this.slice_from('\u0625');
                break;
              case 15:
                this.slice_from('\u0626');
                break;
              case 16:
                this.slice_from('\u0622');
                break;
              case 17:
                this.slice_from('\u0624');
                break;
              case 18:
                this.slice_from('\u0627');
                break;
              case 19:
                this.slice_from('\u0628');
                break;
              case 20:
                this.slice_from('\u0629');
                break;
              case 21:
                this.slice_from('\u062A');
                break;
              case 22:
                this.slice_from('\u062B');
                break;
              case 23:
                this.slice_from('\u062C');
                break;
              case 24:
                this.slice_from('\u062D');
                break;
              case 25:
                this.slice_from('\u062E');
                break;
              case 26:
                this.slice_from('\u062F');
                break;
              case 27:
                this.slice_from('\u0630');
                break;
              case 28:
                this.slice_from('\u0631');
                break;
              case 29:
                this.slice_from('\u0632');
                break;
              case 30:
                this.slice_from('\u0633');
                break;
              case 31:
                this.slice_from('\u0634');
                break;
              case 32:
                this.slice_from('\u0635');
                break;
              case 33:
                this.slice_from('\u0636');
                break;
              case 34:
                this.slice_from('\u0637');
                break;
              case 35:
                this.slice_from('\u0638');
                break;
              case 36:
                this.slice_from('\u0639');
                break;
              case 37:
                this.slice_from('\u063A');
                break;
              case 38:
                this.slice_from('\u0641');
                break;
              case 39:
                this.slice_from('\u0642');
                break;
              case 40:
                this.slice_from('\u0643');
                break;
              case 41:
                this.slice_from('\u0644');
                break;
              case 42:
                this.slice_from('\u0645');
                break;
              case 43:
                this.slice_from('\u0646');
                break;
              case 44:
                this.slice_from('\u0647');
                break;
              case 45:
                this.slice_from('\u0648');
                break;
              case 46:
                this.slice_from('\u0649');
                break;
              case 47:
                this.slice_from('\u064A');
                break;
              case 48:
                this.slice_from('\u0644\u0627');
                break;
              case 49:
                this.slice_from('\u0644\u0623');
                break;
              case 50:
                this.slice_from('\u0644\u0625');
                break;
              case 51:
                this.slice_from('\u0644\u0622');
                break;
            }
            break lab2;
          }
          this.cursor = v_3;
          if (this.cursor >= this.limit) {
            break lab1;
          }
          this.cursor++;
        }
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    return true;
  }

  r_Normalize_post(): boolean {
    let among_var: number;
    const v_1 = this.cursor;
    lab0: {
      this.limit_backward = this.cursor;
      this.cursor = this.limit;
      among_var = this.find_slice_b(StemmerAr.a_1);
      if (among_var === 0) {
        break lab0;
      }
      switch (among_var) {
        case 1:
          this.slice_from('\u0621');
          break;
      }
      this.cursor = this.limit_backward;
    }
    this.cursor = v_1;
    const v_2 = this.cursor;
    for (;;) {
      const v_3 = this.cursor;
      lab2: {
        lab3: {
          const v_4 = this.cursor;
          lab4: {
            among_var = this.find_slice(StemmerAr.a_2);
            if (among_var === 0) {
              break lab4;
            }
            switch (among_var) {
              case 1:
                this.slice_from('\u0627');
                break;
              case 2:
                this.slice_from('\u0648');
                break;
              case 3:
                this.slice_from('\u064A');
                break;
            }
            break lab3;
          }
          this.cursor = v_4;
          if (this.cursor >= this.limit) {
            break lab2;
          }
          this.cursor++;
        }
        continue;
      }
      this.cursor = v_3;
      break;
    }
    this.cursor = v_2;
    return true;
  }

  r_Checks1(): boolean {
    const among_var = this.find_slice(StemmerAr.a_3);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 4) {
          return false;
        }
        this.B_is_noun = true;
        this.B_is_verb = false;
        this.B_is_defined = true;
        break;
      case 2:
        if (this.current.length <= 3) {
          return false;
        }
        this.B_is_noun = true;
        this.B_is_verb = false;
        this.B_is_defined = true;
        break;
    }
    return true;
  }

  r_Prefix_Step1(): boolean {
    const among_var = this.find_slice(StemmerAr.a_4);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0623');
        break;
      case 2:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0622');
        break;
      case 3:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0627');
        break;
      case 4:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0625');
        break;
    }
    return true;
  }

  r_Prefix_Step2(): boolean {
    const among_var = this.find_slice(StemmerAr.a_5);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 3) {
          return false;
        }
        if (this.eq_s('\u0627')) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Prefix_Step3a_Noun(): boolean {
    const among_var = this.find_slice(StemmerAr.a_6);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 5) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Prefix_Step3b_Noun(): boolean {
    const among_var = this.find_slice(StemmerAr.a_7);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0628');
        break;
      case 3:
        if (this.current.length <= 3) {
          return false;
        }
        this.slice_from('\u0643');
        break;
    }
    return true;
  }

  r_Prefix_Step3_Verb(): boolean {
    const among_var = this.find_slice(StemmerAr.a_8);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_from('\u064A');
        break;
      case 2:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_from('\u062A');
        break;
      case 3:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_from('\u0646');
        break;
      case 4:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_from('\u0623');
        break;
    }
    return true;
  }

  r_Prefix_Step4_Verb(): boolean {
    const among_var = this.find_slice(StemmerAr.a_9);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 4) {
          return false;
        }
        this.B_is_verb = true;
        this.B_is_noun = false;
        this.slice_from('\u0627\u0633\u062A');
        break;
    }
    return true;
  }

  r_Suffix_Noun_Step1a(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_10);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length < 4) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length < 5) {
          return false;
        }
        this.slice_del();
        break;
      case 3:
        if (this.current.length < 6) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_Noun_Step1b(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u0646')) {
      return false;
    }
    this.bra = this.cursor;
    if (this.current.length <= 5) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_Suffix_Noun_Step2a(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_11);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length <= 4) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_Noun_Step2b(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u0627\u062A')) {
      return false;
    }
    this.bra = this.cursor;
    if (this.current.length < 5) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_Suffix_Noun_Step2c1(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u062A')) {
      return false;
    }
    this.bra = this.cursor;
    if (this.current.length < 4) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_Suffix_Noun_Step2c2(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u0629')) {
      return false;
    }
    this.bra = this.cursor;
    if (this.current.length < 4) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_Suffix_Noun_Step3(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u064A')) {
      return false;
    }
    this.bra = this.cursor;
    if (this.current.length < 3) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_Suffix_Verb_Step1(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_12);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length < 4) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length < 5) {
          return false;
        }
        this.slice_del();
        break;
      case 3:
        if (this.current.length < 6) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_Verb_Step2a(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_13);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length < 4) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length < 5) {
          return false;
        }
        this.slice_del();
        break;
      case 3:
        if (this.current.length <= 5) {
          return false;
        }
        this.slice_del();
        break;
      case 4:
        if (this.current.length < 6) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_Verb_Step2b(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_14);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length < 5) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_Verb_Step2c(): boolean {
    const among_var = this.find_slice_b(StemmerAr.a_15);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.current.length < 4) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (this.current.length < 6) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_Suffix_All_alef_maqsura(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('\u0649')) {
      return false;
    }
    this.bra = this.cursor;
    this.slice_from('\u064A');
    return true;
  }

  innerStem(): boolean {
    this.B_is_noun = true;
    this.B_is_verb = true;
    this.B_is_defined = false;
    this.do_forward(this.r_Checks1);
    this.r_Normalize_pre();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const v_2 = this.limit - this.cursor;
    lab0: {
      lab1: {
        const v_3 = this.limit - this.cursor;
        lab2: {
          if (!this.B_is_verb) {
            break lab2;
          }
          lab3: {
            const v_4 = this.limit - this.cursor;
            lab4: {
              {
                let v_5 = 1;
                for (;;) {
                  const v_6 = this.limit - this.cursor;
                  lab5: {
                    if (!this.r_Suffix_Verb_Step1()) {
                      break lab5;
                    }
                    v_5--;
                    continue;
                  }
                  this.cursor = this.limit - v_6;
                  break;
                }
                if (v_5 > 0) {
                  break lab4;
                }
              }
              lab6: {
                const v_7 = this.limit - this.cursor;
                lab7: {
                  if (!this.r_Suffix_Verb_Step2a()) {
                    break lab7;
                  }
                  break lab6;
                }
                this.cursor = this.limit - v_7;
                lab8: {
                  if (!this.r_Suffix_Verb_Step2c()) {
                    break lab8;
                  }
                  break lab6;
                }
                this.cursor = this.limit - v_7;
                if (this.cursor <= this.limit_backward) {
                  break lab4;
                }
                this.cursor--;
              }
              break lab3;
            }
            this.cursor = this.limit - v_4;
            lab9: {
              if (!this.r_Suffix_Verb_Step2b()) {
                break lab9;
              }
              break lab3;
            }
            this.cursor = this.limit - v_4;
            if (!this.r_Suffix_Verb_Step2a()) {
              break lab2;
            }
          }
          break lab1;
        }
        this.cursor = this.limit - v_3;
        lab10: {
          if (!this.B_is_noun) {
            break lab10;
          }
          const v_8 = this.limit - this.cursor;
          lab11: {
            lab12: {
              const v_9 = this.limit - this.cursor;
              lab13: {
                if (!this.r_Suffix_Noun_Step2c2()) {
                  break lab13;
                }
                break lab12;
              }
              this.cursor = this.limit - v_9;
              lab14: {
                if (this.B_is_defined) {
                  break lab14;
                }
                if (!this.r_Suffix_Noun_Step1a()) {
                  break lab14;
                }
                lab15: {
                  const v_10 = this.limit - this.cursor;
                  lab16: {
                    if (!this.r_Suffix_Noun_Step2a()) {
                      break lab16;
                    }
                    break lab15;
                  }
                  this.cursor = this.limit - v_10;
                  lab17: {
                    if (!this.r_Suffix_Noun_Step2b()) {
                      break lab17;
                    }
                    break lab15;
                  }
                  this.cursor = this.limit - v_10;
                  lab18: {
                    if (!this.r_Suffix_Noun_Step2c1()) {
                      break lab18;
                    }
                    break lab15;
                  }
                  this.cursor = this.limit - v_10;
                  if (this.cursor <= this.limit_backward) {
                    break lab14;
                  }
                  this.cursor--;
                }
                break lab12;
              }
              this.cursor = this.limit - v_9;
              lab19: {
                if (!this.r_Suffix_Noun_Step1b()) {
                  break lab19;
                }
                lab20: {
                  const v_11 = this.limit - this.cursor;
                  lab21: {
                    if (!this.r_Suffix_Noun_Step2a()) {
                      break lab21;
                    }
                    break lab20;
                  }
                  this.cursor = this.limit - v_11;
                  lab22: {
                    if (!this.r_Suffix_Noun_Step2b()) {
                      break lab22;
                    }
                    break lab20;
                  }
                  this.cursor = this.limit - v_11;
                  if (!this.r_Suffix_Noun_Step2c1()) {
                    break lab19;
                  }
                }
                break lab12;
              }
              this.cursor = this.limit - v_9;
              lab23: {
                if (this.B_is_defined) {
                  break lab23;
                }
                if (!this.r_Suffix_Noun_Step2a()) {
                  break lab23;
                }
                break lab12;
              }
              this.cursor = this.limit - v_9;
              if (!this.r_Suffix_Noun_Step2b()) {
                this.cursor = this.limit - v_8;
                break lab11;
              }
            }
          }
          if (!this.r_Suffix_Noun_Step3()) {
            break lab10;
          }
          break lab1;
        }
        this.cursor = this.limit - v_3;
        if (!this.r_Suffix_All_alef_maqsura()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_2;
    this.cursor = this.limit_backward;
    const v_12 = this.cursor;
    lab24: {
      const v_13 = this.cursor;
      lab25: {
        if (!this.r_Prefix_Step1()) {
          this.cursor = v_13;
          break lab25;
        }
      }
      const v_14 = this.cursor;
      lab26: {
        if (!this.r_Prefix_Step2()) {
          this.cursor = v_14;
          break lab26;
        }
      }
      lab27: {
        const v_15 = this.cursor;
        lab28: {
          if (!this.r_Prefix_Step3a_Noun()) {
            break lab28;
          }
          break lab27;
        }
        this.cursor = v_15;
        lab29: {
          if (!this.B_is_noun) {
            break lab29;
          }
          if (!this.r_Prefix_Step3b_Noun()) {
            break lab29;
          }
          break lab27;
        }
        this.cursor = v_15;
        if (!this.B_is_verb) {
          break lab24;
        }
        const v_16 = this.cursor;
        lab30: {
          if (!this.r_Prefix_Step3_Verb()) {
            this.cursor = v_16;
            break lab30;
          }
        }
        if (!this.r_Prefix_Step4_Verb()) {
          break lab24;
        }
      }
    }
    this.cursor = v_12;
    this.r_Normalize_post();
    return true;
  }

  static a_0: Among<StemmerAr>[] = [
    new Among('!', -1, 1),
    new Among('%', -1, 1),
    new Among("'", -1, 1),
    new Among('*', -1, 1),
    new Among(',', -1, 1),
    new Among('.', -1, 1),
    new Among('/', -1, 1),
    new Among(':', -1, 1),
    new Among(';', -1, 1),
    new Among('?', -1, 1),
    new Among('\\', -1, 1),
    new Among('\u060C', -1, 1),
    new Among('\u061B', -1, 1),
    new Among('\u061F', -1, 1),
    new Among('\u0640', -1, 1),
    new Among('\u064B', -1, 1),
    new Among('\u064C', -1, 1),
    new Among('\u064D', -1, 1),
    new Among('\u064E', -1, 1),
    new Among('\u064F', -1, 1),
    new Among('\u0650', -1, 1),
    new Among('\u0651', -1, 1),
    new Among('\u0652', -1, 1),
    new Among('\u0660', -1, 2),
    new Among('\u0661', -1, 3),
    new Among('\u0662', -1, 4),
    new Among('\u0663', -1, 5),
    new Among('\u0664', -1, 6),
    new Among('\u0665', -1, 7),
    new Among('\u0666', -1, 8),
    new Among('\u0667', -1, 9),
    new Among('\u0668', -1, 10),
    new Among('\u0669', -1, 11),
    new Among('\u066A', -1, 1),
    new Among('\u066B', -1, 1),
    new Among('\u066C', -1, 1),
    new Among('\uFE80', -1, 12),
    new Among('\uFE81', -1, 16),
    new Among('\uFE82', -1, 16),
    new Among('\uFE83', -1, 13),
    new Among('\uFE84', -1, 13),
    new Among('\uFE85', -1, 17),
    new Among('\uFE86', -1, 17),
    new Among('\uFE87', -1, 14),
    new Among('\uFE88', -1, 14),
    new Among('\uFE89', -1, 15),
    new Among('\uFE8A', -1, 15),
    new Among('\uFE8B', -1, 15),
    new Among('\uFE8C', -1, 15),
    new Among('\uFE8D', -1, 18),
    new Among('\uFE8E', -1, 18),
    new Among('\uFE8F', -1, 19),
    new Among('\uFE90', -1, 19),
    new Among('\uFE91', -1, 19),
    new Among('\uFE92', -1, 19),
    new Among('\uFE93', -1, 20),
    new Among('\uFE94', -1, 20),
    new Among('\uFE95', -1, 21),
    new Among('\uFE96', -1, 21),
    new Among('\uFE97', -1, 21),
    new Among('\uFE98', -1, 21),
    new Among('\uFE99', -1, 22),
    new Among('\uFE9A', -1, 22),
    new Among('\uFE9B', -1, 22),
    new Among('\uFE9C', -1, 22),
    new Among('\uFE9D', -1, 23),
    new Among('\uFE9E', -1, 23),
    new Among('\uFE9F', -1, 23),
    new Among('\uFEA0', -1, 23),
    new Among('\uFEA1', -1, 24),
    new Among('\uFEA2', -1, 24),
    new Among('\uFEA3', -1, 24),
    new Among('\uFEA4', -1, 24),
    new Among('\uFEA5', -1, 25),
    new Among('\uFEA6', -1, 25),
    new Among('\uFEA7', -1, 25),
    new Among('\uFEA8', -1, 25),
    new Among('\uFEA9', -1, 26),
    new Among('\uFEAA', -1, 26),
    new Among('\uFEAB', -1, 27),
    new Among('\uFEAC', -1, 27),
    new Among('\uFEAD', -1, 28),
    new Among('\uFEAE', -1, 28),
    new Among('\uFEAF', -1, 29),
    new Among('\uFEB0', -1, 29),
    new Among('\uFEB1', -1, 30),
    new Among('\uFEB2', -1, 30),
    new Among('\uFEB3', -1, 30),
    new Among('\uFEB4', -1, 30),
    new Among('\uFEB5', -1, 31),
    new Among('\uFEB6', -1, 31),
    new Among('\uFEB7', -1, 31),
    new Among('\uFEB8', -1, 31),
    new Among('\uFEB9', -1, 32),
    new Among('\uFEBA', -1, 32),
    new Among('\uFEBB', -1, 32),
    new Among('\uFEBC', -1, 32),
    new Among('\uFEBD', -1, 33),
    new Among('\uFEBE', -1, 33),
    new Among('\uFEBF', -1, 33),
    new Among('\uFEC0', -1, 33),
    new Among('\uFEC1', -1, 34),
    new Among('\uFEC2', -1, 34),
    new Among('\uFEC3', -1, 34),
    new Among('\uFEC4', -1, 34),
    new Among('\uFEC5', -1, 35),
    new Among('\uFEC6', -1, 35),
    new Among('\uFEC7', -1, 35),
    new Among('\uFEC8', -1, 35),
    new Among('\uFEC9', -1, 36),
    new Among('\uFECA', -1, 36),
    new Among('\uFECB', -1, 36),
    new Among('\uFECC', -1, 36),
    new Among('\uFECD', -1, 37),
    new Among('\uFECE', -1, 37),
    new Among('\uFECF', -1, 37),
    new Among('\uFED0', -1, 37),
    new Among('\uFED1', -1, 38),
    new Among('\uFED2', -1, 38),
    new Among('\uFED3', -1, 38),
    new Among('\uFED4', -1, 38),
    new Among('\uFED5', -1, 39),
    new Among('\uFED6', -1, 39),
    new Among('\uFED7', -1, 39),
    new Among('\uFED8', -1, 39),
    new Among('\uFED9', -1, 40),
    new Among('\uFEDA', -1, 40),
    new Among('\uFEDB', -1, 40),
    new Among('\uFEDC', -1, 40),
    new Among('\uFEDD', -1, 41),
    new Among('\uFEDE', -1, 41),
    new Among('\uFEDF', -1, 41),
    new Among('\uFEE0', -1, 41),
    new Among('\uFEE1', -1, 42),
    new Among('\uFEE2', -1, 42),
    new Among('\uFEE3', -1, 42),
    new Among('\uFEE4', -1, 42),
    new Among('\uFEE5', -1, 43),
    new Among('\uFEE6', -1, 43),
    new Among('\uFEE7', -1, 43),
    new Among('\uFEE8', -1, 43),
    new Among('\uFEE9', -1, 44),
    new Among('\uFEEA', -1, 44),
    new Among('\uFEEB', -1, 44),
    new Among('\uFEEC', -1, 44),
    new Among('\uFEED', -1, 45),
    new Among('\uFEEE', -1, 45),
    new Among('\uFEEF', -1, 46),
    new Among('\uFEF0', -1, 46),
    new Among('\uFEF1', -1, 47),
    new Among('\uFEF2', -1, 47),
    new Among('\uFEF3', -1, 47),
    new Among('\uFEF4', -1, 47),
    new Among('\uFEF5', -1, 51),
    new Among('\uFEF6', -1, 51),
    new Among('\uFEF7', -1, 49),
    new Among('\uFEF8', -1, 49),
    new Among('\uFEF9', -1, 50),
    new Among('\uFEFA', -1, 50),
    new Among('\uFEFB', -1, 48),
    new Among('\uFEFC', -1, 48),
  ];

  static a_1 = Among.table<StemmerAr>(`
    آ,-1,1 أ,-1,1 ؤ,-1,1 إ,-1,1 ئ,-1,1
  `);

  static a_2 = Among.table<StemmerAr>(`
    آ,-1,1 أ,-1,1 ؤ,-1,2 إ,-1,1 ئ,-1,3
  `);

  static a_3 = Among.table<StemmerAr>(`
    ال,-1,2 بال,-1,1 كال,-1,1 لل,-1,2
  `);

  static a_4 = Among.table<StemmerAr>(`
    أآ,-1,2 أأ,-1,1 أؤ,-1,1 أإ,-1,4 أا,-1,3
  `);

  static a_5 = Among.table<StemmerAr>(`
    ف,-1,1 و,-1,1
  `);

  static a_6 = Among.table<StemmerAr>(`
    ال,-1,2 بال,-1,1 كال,-1,1 لل,-1,2
  `);

  static a_7 = Among.table<StemmerAr>(`
    ب,-1,1 با,0,-1 بب,0,2 كك,-1,3
  `);

  static a_8 = Among.table<StemmerAr>(`
    سأ,-1,4 ست,-1,2 سن,-1,3 سي,-1,1
  `);

  static a_9 = Among.table<StemmerAr>(`
    تست,-1,1 نست,-1,1 يست,-1,1
  `);

  static a_10 = Among.table<StemmerAr>(`
    كما,-1,3 هما,-1,3 نا,-1,2 ها,-1,2 ك,-1,1 كم,-1,2 هم,-1,2 هن,-1,2 ه,-1,1
    ي,-1,1
  `);

  static a_11 = Among.table<StemmerAr>(`
    ا,-1,1 و,-1,1 ي,-1,1
  `);

  static a_12 = Among.table<StemmerAr>(`
    كما,-1,3 هما,-1,3 نا,-1,2 ها,-1,2 ك,-1,1 كم,-1,2 هم,-1,2 كن,-1,2 هن,-1,2
    ه,-1,1 كمو,-1,3 ني,-1,2
  `);

  static a_13 = Among.table<StemmerAr>(`
    ا,-1,1 تا,0,2 تما,0,4 نا,0,2 ت,-1,1 ن,-1,1 ان,5,3 تن,5,2 ون,5,3 ين,5,3
    ي,-1,1
  `);

  static a_14 = Among.table<StemmerAr>(`
    وا,-1,1 تم,-1,1
  `);

  static a_15 = Among.table<StemmerAr>(`
    و,-1,1 تمو,0,2
  `);

  static a_16 = Among.table<StemmerAr>(`
    ى,-1,1
  `);

  static a_17 = Among.table<StemmerAr>(`
    ة,-1,1
  `);

  static a_18 = Among.table<StemmerAr>(`
    ات,-1,1
  `);

  static a_19 = Among.table<StemmerAr>(`
    ت,-1,1
  `);

  static a_20 = Among.table<StemmerAr>(`
    ن,-1,1
  `);

  static a_21 = Among.table<StemmerAr>(`
    ي,-1,1
  `);
}

export default StemmerAr;
