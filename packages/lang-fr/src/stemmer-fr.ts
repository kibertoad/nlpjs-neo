import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from french.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerFr extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-fr';
    this.I_pV = 0;
    this.I_p1 = 0;
    this.I_p2 = 0;
  }

  r_prelude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        lab1: for (;;) {
          const v_2 = this.cursor;
          lab2: {
            lab3: {
              const v_3 = this.cursor;
              lab4: {
                if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
                  break lab4;
                }
                this.bra = this.cursor;
                lab5: {
                  const v_4 = this.cursor;
                  lab6: {
                    if (!this.eq_s('u')) {
                      break lab6;
                    }
                    this.ket = this.cursor;
                    if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
                      break lab6;
                    }
                    this.slice_from('U');
                    break lab5;
                  }
                  this.cursor = v_4;
                  lab7: {
                    if (!this.eq_s('i')) {
                      break lab7;
                    }
                    this.ket = this.cursor;
                    if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
                      break lab7;
                    }
                    this.slice_from('I');
                    break lab5;
                  }
                  this.cursor = v_4;
                  if (!this.eq_s('y')) {
                    break lab4;
                  }
                  this.ket = this.cursor;
                  this.slice_from('Y');
                }
                break lab3;
              }
              this.cursor = v_3;
              lab8: {
                this.bra = this.cursor;
                if (!this.eq_s('\u00EB')) {
                  break lab8;
                }
                this.ket = this.cursor;
                this.slice_from('He');
                break lab3;
              }
              this.cursor = v_3;
              lab9: {
                this.bra = this.cursor;
                if (!this.eq_s('\u00EF')) {
                  break lab9;
                }
                this.ket = this.cursor;
                this.slice_from('Hi');
                break lab3;
              }
              this.cursor = v_3;
              lab10: {
                this.bra = this.cursor;
                if (!this.eq_s('y')) {
                  break lab10;
                }
                this.ket = this.cursor;
                if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
                  break lab10;
                }
                this.slice_from('Y');
                break lab3;
              }
              this.cursor = v_3;
              if (!this.eq_s('q')) {
                break lab2;
              }
              this.bra = this.cursor;
              if (!this.eq_s('u')) {
                break lab2;
              }
              this.ket = this.cursor;
              this.slice_from('U');
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
        continue;
      }
      this.cursor = v_1;
      break;
    }
    return true;
  }

  r_mark_regions(): boolean {
    this.I_pV = this.limit;
    this.I_p1 = this.limit;
    this.I_p2 = this.limit;
    const v_1 = this.cursor;
    lab0: {
      lab1: {
        const v_2 = this.cursor;
        lab2: {
          if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
            break lab2;
          }
          if (!this.in_grouping(StemmerFr.g_v, 97, 251)) {
            break lab2;
          }
          if (this.cursor >= this.limit) {
            break lab2;
          }
          this.cursor++;
          break lab1;
        }
        this.cursor = v_2;
        lab3: {
          if (this.find_among(StemmerFr.a_0) === 0) {
            break lab3;
          }
          break lab1;
        }
        this.cursor = v_2;
        if (this.cursor >= this.limit) {
          break lab0;
        }
        this.cursor++;
        if (!this.gopast_in_grouping(StemmerFr.g_v, 97, 251)) {
          break lab0;
        }
      }
      this.I_pV = this.cursor;
    }
    this.cursor = v_1;
    const v_3 = this.cursor;
    lab4: {
      if (!this.gopast_in_grouping(StemmerFr.g_v, 97, 251)) {
        break lab4;
      }
      if (!this.gopast_out_grouping(StemmerFr.g_v, 97, 251)) {
        break lab4;
      }
      this.I_p1 = this.cursor;
      if (!this.gopast_in_grouping(StemmerFr.g_v, 97, 251)) {
        break lab4;
      }
      if (!this.gopast_out_grouping(StemmerFr.g_v, 97, 251)) {
        break lab4;
      }
      this.I_p2 = this.cursor;
    }
    this.cursor = v_3;
    return true;
  }

  r_postlude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerFr.a_1);
        switch (among_var) {
          case 1:
            this.slice_from('i');
            break;
          case 2:
            this.slice_from('u');
            break;
          case 3:
            this.slice_from('y');
            break;
          case 4:
            this.slice_from('\u00EB');
            break;
          case 5:
            this.slice_from('\u00EF');
            break;
          case 6:
            this.slice_del();
            break;
          case 7:
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
    among_var = this.find_slice_b(StemmerFr.a_4);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        break;
      case 2: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_1 = this.limit - this.cursor;
        lab0: {
          this.ket = this.cursor;
          if (!this.eq_s_b('ic')) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.bra = this.cursor;
          lab1: {
            const v_2 = this.limit - this.cursor;
            lab2: {
              if (!this.r_R2()) {
                break lab2;
              }
              this.slice_del();
              break lab1;
            }
            this.cursor = this.limit - v_2;
            this.slice_from('iqU');
          }
        }
        break;
      }
      case 3:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('log');
        break;
      case 4:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('u');
        break;
      case 5:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('ent');
        break;
      case 6: {
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        const v_3 = this.limit - this.cursor;
        lab3: {
          among_var = this.find_slice_b(StemmerFr.a_2);
          if (among_var === 0) {
            this.cursor = this.limit - v_3;
            break lab3;
          }
          switch (among_var) {
            case 1:
              if (!this.r_R2()) {
                this.cursor = this.limit - v_3;
                break lab3;
              }
              this.slice_del();
              this.ket = this.cursor;
              if (!this.eq_s_b('at')) {
                this.cursor = this.limit - v_3;
                break lab3;
              }
              this.bra = this.cursor;
              if (!this.r_R2()) {
                this.cursor = this.limit - v_3;
                break lab3;
              }
              this.slice_del();
              break;
            case 2:
              lab4: {
                const v_4 = this.limit - this.cursor;
                lab5: {
                  if (!this.r_R2()) {
                    break lab5;
                  }
                  this.slice_del();
                  break lab4;
                }
                this.cursor = this.limit - v_4;
                if (!this.r_R1()) {
                  this.cursor = this.limit - v_3;
                  break lab3;
                }
                this.slice_from('eux');
              }
              break;
            case 3:
              if (!this.r_R2()) {
                this.cursor = this.limit - v_3;
                break lab3;
              }
              this.slice_del();
              break;
            case 4:
              if (!this.r_RV()) {
                this.cursor = this.limit - v_3;
                break lab3;
              }
              this.slice_from('i');
              break;
          }
        }
        break;
      }
      case 7: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_5 = this.limit - this.cursor;
        lab6: {
          among_var = this.find_slice_b(StemmerFr.a_3);
          if (among_var === 0) {
            this.cursor = this.limit - v_5;
            break lab6;
          }
          switch (among_var) {
            case 1:
              lab7: {
                const v_6 = this.limit - this.cursor;
                lab8: {
                  if (!this.r_R2()) {
                    break lab8;
                  }
                  this.slice_del();
                  break lab7;
                }
                this.cursor = this.limit - v_6;
                this.slice_from('abl');
              }
              break;
            case 2:
              lab9: {
                const v_7 = this.limit - this.cursor;
                lab10: {
                  if (!this.r_R2()) {
                    break lab10;
                  }
                  this.slice_del();
                  break lab9;
                }
                this.cursor = this.limit - v_7;
                this.slice_from('iqU');
              }
              break;
            case 3:
              if (!this.r_R2()) {
                this.cursor = this.limit - v_5;
                break lab6;
              }
              this.slice_del();
              break;
          }
        }
        break;
      }
      case 8: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_8 = this.limit - this.cursor;
        lab11: {
          this.ket = this.cursor;
          if (!this.eq_s_b('at')) {
            this.cursor = this.limit - v_8;
            break lab11;
          }
          this.bra = this.cursor;
          if (!this.r_R2()) {
            this.cursor = this.limit - v_8;
            break lab11;
          }
          this.slice_del();
          this.ket = this.cursor;
          if (!this.eq_s_b('ic')) {
            this.cursor = this.limit - v_8;
            break lab11;
          }
          this.bra = this.cursor;
          lab12: {
            const v_9 = this.limit - this.cursor;
            lab13: {
              if (!this.r_R2()) {
                break lab13;
              }
              this.slice_del();
              break lab12;
            }
            this.cursor = this.limit - v_9;
            this.slice_from('iqU');
          }
        }
        break;
      }
      case 9:
        this.slice_from('eau');
        break;
      case 10:
        if (!this.r_R1()) {
          return false;
        }
        this.slice_from('al');
        break;
      case 11:
        lab14: {
          const v_10 = this.limit - this.cursor;
          lab15: {
            if (!this.r_R2()) {
              break lab15;
            }
            this.slice_del();
            break lab14;
          }
          this.cursor = this.limit - v_10;
          if (!this.r_R1()) {
            return false;
          }
          this.slice_from('eux');
        }
        break;
      case 12:
        if (!this.r_R1()) {
          return false;
        }
        if (!this.out_grouping_b(StemmerFr.g_v, 97, 251)) {
          return false;
        }
        this.slice_del();
        break;
      case 13:
        if (!this.r_RV()) {
          return false;
        }
        this.slice_from('ant');
        return false;
      case 14:
        if (!this.r_RV()) {
          return false;
        }
        this.slice_from('ent');
        return false;
      case 15: {
        const v_11 = this.limit - this.cursor;
        if (!this.in_grouping_b(StemmerFr.g_v, 97, 251)) {
          return false;
        }
        if (!this.r_RV()) {
          return false;
        }
        this.cursor = this.limit - v_11;
        this.slice_del();
        return false;
      }
    }
    return true;
  }

  r_i_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(StemmerFr.a_5);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    switch (among_var) {
      case 1:
        if (this.eq_s_b('H')) {
          this.limit_backward = v_1;
          return false;
        }
        if (!this.out_grouping_b(StemmerFr.g_v, 97, 251)) {
          this.limit_backward = v_1;
          return false;
        }
        this.slice_del();
        break;
    }
    this.limit_backward = v_1;
    return true;
  }

  r_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(StemmerFr.a_6);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_R2()) {
          this.limit_backward = v_1;
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_del();
        break;
      case 3: {
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab0: {
          this.ket = this.cursor;
          if (!this.eq_s_b('e')) {
            this.cursor = this.limit - v_2;
            break lab0;
          }
          this.bra = this.cursor;
          this.slice_del();
        }
        break;
      }
    }
    this.limit_backward = v_1;
    return true;
  }

  r_residual_suffix(): boolean {
    const v_1 = this.limit - this.cursor;
    lab0: {
      this.ket = this.cursor;
      if (!this.eq_s_b('s')) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      this.bra = this.cursor;
      const v_2 = this.limit - this.cursor;
      lab1: {
        lab2: {
          if (!this.eq_s_b('Hi')) {
            break lab2;
          }
          break lab1;
        }
        if (!this.out_grouping_b(StemmerFr.g_keep_with_s, 97, 232)) {
          this.cursor = this.limit - v_1;
          break lab0;
        }
      }
      this.cursor = this.limit - v_2;
      this.slice_del();
    }
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_3 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(StemmerFr.a_7);
    if (among_var === 0) {
      this.limit_backward = v_3;
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_R2()) {
          this.limit_backward = v_3;
          return false;
        }
        if (!this.eq_s_b('s') && !this.eq_s_b('t')) {
          this.limit_backward = v_3;
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_from('i');
        break;
      case 3:
        this.slice_del();
        break;
    }
    this.limit_backward = v_3;
    return true;
  }

  r_un_double(): boolean {
    const v_1 = this.limit - this.cursor;
    if (this.find_among_b(StemmerFr.a_8) === 0) {
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

  r_un_accent(): boolean {
    {
      let v_1 = 1;
      for (;;) {
        lab0: {
          if (!this.out_grouping_b(StemmerFr.g_v, 97, 251)) {
            break lab0;
          }
          v_1--;
          continue;
        }
        break;
      }
      if (v_1 > 0) {
        return false;
      }
    }
    this.ket = this.cursor;
    if (!this.eq_s_b('\u00E9') && !this.eq_s_b('\u00E8')) {
      return false;
    }
    this.bra = this.cursor;
    this.slice_from('e');
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_prelude);
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const v_2 = this.limit - this.cursor;
    lab0: {
      lab1: {
        const v_3 = this.limit - this.cursor;
        lab2: {
          const v_4 = this.limit - this.cursor;
          lab3: {
            const v_5 = this.limit - this.cursor;
            lab4: {
              if (!this.r_standard_suffix()) {
                break lab4;
              }
              break lab3;
            }
            this.cursor = this.limit - v_5;
            lab5: {
              if (!this.r_i_verb_suffix()) {
                break lab5;
              }
              break lab3;
            }
            this.cursor = this.limit - v_5;
            if (!this.r_verb_suffix()) {
              break lab2;
            }
          }
          this.cursor = this.limit - v_4;
          const v_6 = this.limit - this.cursor;
          lab6: {
            this.ket = this.cursor;
            lab7: {
              const v_7 = this.limit - this.cursor;
              lab8: {
                if (!this.eq_s_b('Y')) {
                  break lab8;
                }
                this.bra = this.cursor;
                this.slice_from('i');
                break lab7;
              }
              this.cursor = this.limit - v_7;
              if (!this.eq_s_b('\u00E7')) {
                this.cursor = this.limit - v_6;
                break lab6;
              }
              this.bra = this.cursor;
              this.slice_from('c');
            }
          }
          break lab1;
        }
        this.cursor = this.limit - v_3;
        if (!this.r_residual_suffix()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_2;
    this.do_backward(this.r_un_double);
    this.do_backward(this.r_un_accent);
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 130, 103, 8, 5,
  ];

  static g_keep_with_s: number[] = [
    1, 65, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128,
  ];

  static a_0 = Among.table<StemmerFr>(`
    col,-1,-1 par,-1,-1 tap,-1,-1
  `);

  static a_1: Among<StemmerFr>[] = [
    new Among('', -1, 7),
    new Among('H', 0, 6),
    new Among('He', 1, 4),
    new Among('Hi', 1, 5),
    new Among('I', 0, 1),
    new Among('U', 0, 2),
    new Among('Y', 0, 3),
  ];

  static a_2 = Among.table<StemmerFr>(`
    iqU,-1,3 abl,-1,3 Ièr,-1,4 ièr,-1,4 eus,-1,2 iv,-1,1
  `);

  static a_3 = Among.table<StemmerFr>(`
    ic,-1,2 abil,-1,1 iv,-1,3
  `);

  static a_4 = Among.table<StemmerFr>(`
    iqUe,-1,1 atrice,-1,2 ance,-1,1 ence,-1,5 logie,-1,3 able,-1,1 isme,-1,1
    euse,-1,11 iste,-1,1 ive,-1,8 if,-1,8 usion,-1,4 ation,-1,2 ution,-1,4
    ateur,-1,2 iqUes,-1,1 atrices,-1,2 ances,-1,1 ences,-1,5 logies,-1,3
    ables,-1,1 ismes,-1,1 euses,-1,11 istes,-1,1 ives,-1,8 ifs,-1,8 usions,-1,4
    ations,-1,2 utions,-1,4 ateurs,-1,2 ments,-1,15 ements,30,6 issements,31,12
    ités,-1,7 ment,-1,15 ement,34,6 issement,35,12 amment,34,13 emment,34,14
    aux,-1,10 eaux,39,9 eux,-1,1 ité,-1,7
  `);

  static a_5 = Among.table<StemmerFr>(`
    ira,-1,1 ie,-1,1 isse,-1,1 issante,-1,1 i,-1,1 irai,4,1 ir,-1,1 iras,-1,1
    ies,-1,1 îmes,-1,1 isses,-1,1 issantes,-1,1 îtes,-1,1 is,-1,1 irais,13,1
    issais,13,1 irions,-1,1 issions,-1,1 irons,-1,1 issons,-1,1 issants,-1,1
    it,-1,1 irait,21,1 issait,21,1 issant,-1,1 iraIent,-1,1 issaIent,-1,1
    irent,-1,1 issent,-1,1 iront,-1,1 ît,-1,1 iriez,-1,1 issiez,-1,1 irez,-1,1
    issez,-1,1
  `);

  static a_6 = Among.table<StemmerFr>(`
    a,-1,3 era,0,2 asse,-1,3 ante,-1,3 ée,-1,2 ai,-1,3 erai,5,2 er,-1,2 as,-1,3
    eras,8,2 âmes,-1,3 asses,-1,3 antes,-1,3 âtes,-1,3 ées,-1,2 ais,-1,3
    erais,15,2 ions,-1,1 erions,17,2 assions,17,3 erons,-1,2 ants,-1,3 és,-1,2
    ait,-1,3 erait,23,2 ant,-1,3 aIent,-1,3 eraIent,26,2 èrent,-1,2 assent,-1,3
    eront,-1,2 ât,-1,3 ez,-1,2 iez,32,2 eriez,33,2 assiez,33,3 erez,32,2 é,-1,2
  `);

  static a_7 = Among.table<StemmerFr>(`
    e,-1,3 Ière,0,2 ière,0,2 ion,-1,1 Ier,-1,2 ier,-1,2
  `);

  static a_8 = Among.table<StemmerFr>(`
    ell,-1,-1 eill,-1,-1 enn,-1,-1 onn,-1,-1 ett,-1,-1
  `);
}

export default StemmerFr;
