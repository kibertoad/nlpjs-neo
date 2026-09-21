import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from spanish.sbl of Snowball 2.2.0 with our changes (tools/snowball/edits.ts). Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class SnowballStemmerEs extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-es';
    this.I_pV = 0;
    this.I_p1 = 0;
    this.I_p2 = 0;
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
          if (!this.in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
            break lab2;
          }
          lab3: {
            const v_3 = this.cursor;
            lab4: {
              if (!this.out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
                break lab4;
              }
              if (!this.gopast_in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
                break lab4;
              }
              break lab3;
            }
            this.cursor = v_3;
            if (!this.in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
              break lab2;
            }
            if (!this.gopast_out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
              break lab2;
            }
          }
          break lab1;
        }
        this.cursor = v_2;
        if (!this.out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
          break lab0;
        }
        lab5: {
          const v_4 = this.cursor;
          lab6: {
            if (!this.out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
              break lab6;
            }
            if (!this.gopast_in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
              break lab6;
            }
            break lab5;
          }
          this.cursor = v_4;
          if (!this.in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
            break lab0;
          }
          if (this.cursor >= this.limit) {
            break lab0;
          }
          this.cursor++;
        }
      }
      this.I_pV = this.cursor;
    }
    this.cursor = v_1;
    const v_5 = this.cursor;
    lab7: {
      if (!this.gopast_in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
        break lab7;
      }
      this.I_p1 = this.cursor;
      if (!this.gopast_in_grouping(SnowballStemmerEs.g_v, 97, 117)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(SnowballStemmerEs.g_v, 97, 117)) {
        break lab7;
      }
      this.I_p2 = this.cursor;
    }
    this.cursor = v_5;
    return true;
  }

  r_postlude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        const among_var = this.find_slice(SnowballStemmerEs.a_0);
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
      this.cursor = v_1;
      break;
    }
    return true;
  }

  r_R2b(): boolean {
    return this.cursor * 2 >= this.current.length;
  }

  r_attached_pronoun(): boolean {
    if (this.find_slice_b(SnowballStemmerEs.a_1) === 0) {
      return false;
    }
    const among_var = this.find_among_b(SnowballStemmerEs.a_2);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_RV()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        if (!this.eq_s_b('u')) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_standard_suffix(): boolean {
    let among_var: number;
    among_var = this.find_slice_b(SnowballStemmerEs.a_6);
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
        if (!this.r_R2b()) {
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
          if (!this.r_R2()) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.slice_del();
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
        this.slice_from('ente');
        break;
      case 6: {
        if (!this.r_R1()) {
          return false;
        }
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab1: {
          among_var = this.find_slice_b(SnowballStemmerEs.a_3);
          if (among_var === 0) {
            this.cursor = this.limit - v_2;
            break lab1;
          }
          if (!this.r_R2()) {
            this.cursor = this.limit - v_2;
            break lab1;
          }
          this.slice_del();
          switch (among_var) {
            case 1:
              this.ket = this.cursor;
              if (!this.eq_s_b('at')) {
                this.cursor = this.limit - v_2;
                break lab1;
              }
              this.bra = this.cursor;
              if (!this.r_R2()) {
                this.cursor = this.limit - v_2;
                break lab1;
              }
              this.slice_del();
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
        const v_3 = this.limit - this.cursor;
        lab2: {
          among_var = this.find_slice_b(SnowballStemmerEs.a_4);
          if (among_var === 0) {
            this.cursor = this.limit - v_3;
            break lab2;
          }
          switch (among_var) {
            case 1:
              if (!this.r_R2()) {
                this.cursor = this.limit - v_3;
                break lab2;
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
        const v_4 = this.limit - this.cursor;
        lab3: {
          among_var = this.find_slice_b(SnowballStemmerEs.a_5);
          if (among_var === 0) {
            this.cursor = this.limit - v_4;
            break lab3;
          }
          switch (among_var) {
            case 1:
              if (!this.r_R2()) {
                this.cursor = this.limit - v_4;
                break lab3;
              }
              this.slice_del();
              break;
          }
        }
        break;
      }
      case 9: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_5 = this.limit - this.cursor;
        lab4: {
          this.ket = this.cursor;
          if (!this.eq_s_b('at')) {
            this.cursor = this.limit - v_5;
            break lab4;
          }
          this.bra = this.cursor;
          if (!this.r_R2()) {
            this.cursor = this.limit - v_5;
            break lab4;
          }
          this.slice_del();
        }
        break;
      }
    }
    return true;
  }

  r_y_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(SnowballStemmerEs.a_7);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        if (!this.eq_s_b('u')) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(SnowballStemmerEs.a_8);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1: {
        const v_2 = this.limit - this.cursor;
        lab0: {
          if (!this.eq_s_b('u')) {
            this.cursor = this.limit - v_2;
            break lab0;
          }
          const v_3 = this.limit - this.cursor;
          if (!this.eq_s_b('g')) {
            this.cursor = this.limit - v_2;
            break lab0;
          }
          this.cursor = this.limit - v_3;
        }
        this.bra = this.cursor;
        this.slice_del();
        break;
      }
      case 2:
        this.slice_del();
        break;
    }
    return true;
  }

  r_residual_suffix(): boolean {
    const among_var = this.find_slice_b(SnowballStemmerEs.a_9);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        break;
      case 2: {
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        const v_1 = this.limit - this.cursor;
        lab0: {
          this.ket = this.cursor;
          if (!this.eq_s_b('u')) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.bra = this.cursor;
          const v_2 = this.limit - this.cursor;
          if (!this.eq_s_b('g')) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.cursor = this.limit - v_2;
          if (!this.r_RV()) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.slice_del();
        }
        break;
      }
    }
    return true;
  }

  innerStem(): boolean {
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_attached_pronoun);
    const v_2 = this.limit - this.cursor;
    lab0: {
      lab1: {
        const v_3 = this.limit - this.cursor;
        lab2: {
          if (!this.r_standard_suffix()) {
            break lab2;
          }
          break lab1;
        }
        this.cursor = this.limit - v_3;
        lab3: {
          if (!this.r_y_verb_suffix()) {
            break lab3;
          }
          break lab1;
        }
        this.cursor = this.limit - v_3;
        if (!this.r_verb_suffix()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_2;
    this.do_backward(this.r_residual_suffix);
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [17, 65, 16];

  static a_0: Among<SnowballStemmerEs>[] = [
    new Among('', -1, 6),
    new Among('a', 0, 1),
    new Among('e', 0, 2),
    new Among('i', 0, 3),
    new Among('o', 0, 4),
    new Among('u', 0, 5),
  ];

  static a_1 = Among.table<SnowballStemmerEs>(`
    la,-1,-1 sela,0,-1 le,-1,-1 me,-1,-1 se,-1,-1 lo,-1,-1 selo,5,-1 las,-1,-1
    selas,7,-1 les,-1,-1 los,-1,-1 selos,10,-1 nos,-1,-1
  `);

  static a_2 = Among.table<SnowballStemmerEs>(`
    ando,-1,1 iendo,-1,1 yendo,-1,2 ar,-1,1 er,-1,1 ir,-1,1
  `);

  static a_3 = Among.table<SnowballStemmerEs>(`
    ic,-1,-1 ad,-1,-1 os,-1,-1 iv,-1,1
  `);

  static a_4 = Among.table<SnowballStemmerEs>(`
    able,-1,1 ible,-1,1 ante,-1,1
  `);

  static a_5 = Among.table<SnowballStemmerEs>(`
    ic,-1,1 abil,-1,1 iv,-1,1
  `);

  static a_6 = Among.table<SnowballStemmerEs>(`
    ica,-1,1 ancia,-1,2 encia,-1,5 logia,-1,3 adora,-1,2 osa,-1,1 ista,-1,1
    iva,-1,9 anza,-1,1 idad,-1,8 able,-1,1 ible,-1,1 ante,-1,2 mente,-1,7
    amente,13,6 acion,-1,2 ucion,-1,4 ico,-1,1 ismo,-1,1 oso,-1,1 amiento,-1,1
    imiento,-1,1 ivo,-1,9 ador,-1,2 icas,-1,1 ancias,-1,2 encias,-1,5
    logias,-1,3 adoras,-1,2 osas,-1,1 istas,-1,1 ivas,-1,9 anzas,-1,1
    idades,-1,8 ables,-1,1 ibles,-1,1 aciones,-1,2 uciones,-1,4 adores,-1,2
    antes,-1,2 icos,-1,1 ismos,-1,1 osos,-1,1 amientos,-1,1 imientos,-1,1
    ivos,-1,9
  `);

  static a_7 = Among.table<SnowballStemmerEs>(`
    ya,-1,1 ye,-1,1 yan,-1,1 yen,-1,1 yeron,-1,1 yendo,-1,1 yo,-1,1 yas,-1,1
    yes,-1,1 yais,-1,1 yamos,-1,1
  `);

  static a_8 = Among.table<SnowballStemmerEs>(`
    aba,-1,2 ada,-1,2 ida,-1,2 ea,-1,2 ia,-1,2 aria,4,2 eria,4,2 iria,4,2
    ara,-1,2 era,-1,2 iera,9,2 ira,-1,2 ad,-1,2 ed,-1,2 id,-1,2 ee,-1,2 are,-1,2
    ere,-1,2 iere,17,2 ire,-1,2 ase,-1,2 iese,-1,2 aste,-1,2 iste,-1,2 an,-1,2
    aban,24,2 ian,24,2 arian,26,2 erian,26,2 irian,26,2 aran,24,2 eran,24,2
    ieran,31,2 iran,24,2 en,-1,1 aren,34,2 eren,34,2 ieren,36,2 asen,34,2
    esen,34,2 iesen,39,2 aron,-1,2 ieron,-1,2 ado,-1,2 ido,-1,2 ando,-1,2
    iendo,-1,2 eo,-1,2 io,-1,2 ar,-1,2 er,-1,2 ir,-1,2 s,-1,2 as,52,2 abas,53,2
    adas,53,2 idas,53,2 ias,53,2 arias,57,2 erias,57,2 irias,57,2 aras,53,2
    eras,53,2 ieras,62,2 iras,53,2 es,52,1 ares,65,2 ieres,65,2 ases,65,2
    ieses,65,2 is,52,2 ais,70,2 abais,71,2 iais,71,2 ariais,73,2 eriais,73,2
    iriais,73,2 arais,71,2 ierais,71,2 eis,70,1 areis,79,2 ereis,79,2
    iereis,81,2 ireis,79,2 aseis,79,2 ieseis,79,2 asteis,79,2 isteis,79,2
    os,52,2 ados,88,2 idos,88,2 ios,88,2 amos,88,2 abamos,92,2 iamos,92,2
    ariamos,94,2 eriamos,94,2 iriamos,94,2 aramos,92,2 ieramos,92,2 emos,88,1
    aremos,100,2 eremos,100,2 ieremos,102,2 iremos,100,2 asemos,100,2
    iesemos,100,2 imos,88,2
  `);

  static a_9 = Among.table<SnowballStemmerEs>(`
    a,-1,1 e,-1,2 i,-1,1 o,-1,1 os,-1,1
  `);
}

export default SnowballStemmerEs;
