import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from portuguese.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerPt extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-pt';
    this.I_pV = 0;
    this.I_p1 = 0;
    this.I_p2 = 0;
  }

  r_prelude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerPt.a_0);
        switch (among_var) {
          case 1:
            this.slice_from('a~');
            break;
          case 2:
            this.slice_from('o~');
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

  r_mark_regions(): boolean {
    this.I_pV = this.limit;
    this.I_p1 = this.limit;
    this.I_p2 = this.limit;
    const v_1 = this.cursor;
    lab0: {
      lab1: {
        const v_2 = this.cursor;
        lab2: {
          if (!this.in_grouping(StemmerPt.g_v, 97, 250)) {
            break lab2;
          }
          lab3: {
            const v_3 = this.cursor;
            lab4: {
              if (!this.out_grouping(StemmerPt.g_v, 97, 250)) {
                break lab4;
              }
              if (!this.gopast_in_grouping(StemmerPt.g_v, 97, 250)) {
                break lab4;
              }
              break lab3;
            }
            this.cursor = v_3;
            if (!this.in_grouping(StemmerPt.g_v, 97, 250)) {
              break lab2;
            }
            if (!this.gopast_out_grouping(StemmerPt.g_v, 97, 250)) {
              break lab2;
            }
          }
          break lab1;
        }
        this.cursor = v_2;
        if (!this.out_grouping(StemmerPt.g_v, 97, 250)) {
          break lab0;
        }
        lab5: {
          const v_4 = this.cursor;
          lab6: {
            if (!this.out_grouping(StemmerPt.g_v, 97, 250)) {
              break lab6;
            }
            if (!this.gopast_in_grouping(StemmerPt.g_v, 97, 250)) {
              break lab6;
            }
            break lab5;
          }
          this.cursor = v_4;
          if (!this.in_grouping(StemmerPt.g_v, 97, 250)) {
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
      if (!this.gopast_in_grouping(StemmerPt.g_v, 97, 250)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerPt.g_v, 97, 250)) {
        break lab7;
      }
      this.I_p1 = this.cursor;
      if (!this.gopast_in_grouping(StemmerPt.g_v, 97, 250)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerPt.g_v, 97, 250)) {
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
        const among_var = this.find_slice(StemmerPt.a_1);
        switch (among_var) {
          case 1:
            this.slice_from('\u00E3');
            break;
          case 2:
            this.slice_from('\u00F5');
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

  r_standard_suffix(): boolean {
    let among_var: number;
    among_var = this.find_slice_b(StemmerPt.a_5);
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
      case 2:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('log');
        break;
      case 3:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('u');
        break;
      case 4:
        if (!this.r_R2()) {
          return false;
        }
        this.slice_from('ente');
        break;
      case 5: {
        if (!this.r_R1()) {
          return false;
        }
        this.slice_del();
        const v_1 = this.limit - this.cursor;
        lab0: {
          among_var = this.find_slice_b(StemmerPt.a_2);
          if (among_var === 0) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          if (!this.r_R2()) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.slice_del();
          switch (among_var) {
            case 1:
              this.ket = this.cursor;
              if (!this.eq_s_b('at')) {
                this.cursor = this.limit - v_1;
                break lab0;
              }
              this.bra = this.cursor;
              if (!this.r_R2()) {
                this.cursor = this.limit - v_1;
                break lab0;
              }
              this.slice_del();
              break;
          }
        }
        break;
      }
      case 6: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab1: {
          among_var = this.find_slice_b(StemmerPt.a_3);
          if (among_var === 0) {
            this.cursor = this.limit - v_2;
            break lab1;
          }
          switch (among_var) {
            case 1:
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
          among_var = this.find_slice_b(StemmerPt.a_4);
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
          this.ket = this.cursor;
          if (!this.eq_s_b('at')) {
            this.cursor = this.limit - v_4;
            break lab3;
          }
          this.bra = this.cursor;
          if (!this.r_R2()) {
            this.cursor = this.limit - v_4;
            break lab3;
          }
          this.slice_del();
        }
        break;
      }
      case 9:
        if (!this.r_RV()) {
          return false;
        }
        if (!this.eq_s_b('e')) {
          return false;
        }
        this.slice_from('ir');
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
    const among_var = this.find_slice_b(StemmerPt.a_6);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    this.limit_backward = v_1;
    return true;
  }

  r_residual_suffix(): boolean {
    const among_var = this.find_slice_b(StemmerPt.a_7);
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
    }
    return true;
  }

  r_residual_form(): boolean {
    const among_var = this.find_slice_b(StemmerPt.a_8);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        this.ket = this.cursor;
        lab0: {
          const v_1 = this.limit - this.cursor;
          lab1: {
            if (!this.eq_s_b('u')) {
              break lab1;
            }
            this.bra = this.cursor;
            const v_2 = this.limit - this.cursor;
            if (!this.eq_s_b('g')) {
              break lab1;
            }
            this.cursor = this.limit - v_2;
            break lab0;
          }
          this.cursor = this.limit - v_1;
          if (!this.eq_s_b('i')) {
            return false;
          }
          this.bra = this.cursor;
          const v_3 = this.limit - this.cursor;
          if (!this.eq_s_b('c')) {
            return false;
          }
          this.cursor = this.limit - v_3;
        }
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_from('c');
        break;
    }
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
            if (!this.r_verb_suffix()) {
              break lab2;
            }
          }
          this.cursor = this.limit - v_4;
          const v_6 = this.limit - this.cursor;
          lab5: {
            this.ket = this.cursor;
            if (!this.eq_s_b('i')) {
              break lab5;
            }
            this.bra = this.cursor;
            const v_7 = this.limit - this.cursor;
            if (!this.eq_s_b('c')) {
              break lab5;
            }
            this.cursor = this.limit - v_7;
            if (!this.r_RV()) {
              break lab5;
            }
            this.slice_del();
          }
          this.cursor = this.limit - v_6;
          break lab1;
        }
        this.cursor = this.limit - v_3;
        if (!this.r_residual_suffix()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_2;
    this.do_backward(this.r_residual_form);
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2,
  ];

  static a_0: Among<StemmerPt>[] = [
    new Among('', -1, 3),
    new Among('\u00E3', 0, 1),
    new Among('\u00F5', 0, 2),
  ];

  static a_1: Among<StemmerPt>[] = [
    new Among('', -1, 3),
    new Among('a~', 0, 1),
    new Among('o~', 0, 2),
  ];

  static a_2 = Among.table<StemmerPt>(`
    ic,-1,-1 ad,-1,-1 os,-1,-1 iv,-1,1
  `);

  static a_3 = Among.table<StemmerPt>(`
    ante,-1,1 avel,-1,1 ível,-1,1
  `);

  static a_4 = Among.table<StemmerPt>(`
    ic,-1,1 abil,-1,1 iv,-1,1
  `);

  static a_5 = Among.table<StemmerPt>(`
    ica,-1,1 ância,-1,1 ência,-1,4 logia,-1,2 ira,-1,9 adora,-1,1 osa,-1,1
    ista,-1,1 iva,-1,8 eza,-1,1 idade,-1,7 ante,-1,1 mente,-1,6 amente,12,5
    ável,-1,1 ível,-1,1 ico,-1,1 ismo,-1,1 oso,-1,1 amento,-1,1 imento,-1,1
    ivo,-1,8 aça~o,-1,1 uça~o,-1,3 ador,-1,1 icas,-1,1 ências,-1,4 logias,-1,2
    iras,-1,9 adoras,-1,1 osas,-1,1 istas,-1,1 ivas,-1,8 ezas,-1,1 idades,-1,7
    adores,-1,1 antes,-1,1 aço~es,-1,1 uço~es,-1,3 icos,-1,1 ismos,-1,1
    osos,-1,1 amentos,-1,1 imentos,-1,1 ivos,-1,8
  `);

  static a_6 = Among.table<StemmerPt>(`
    ada,-1,1 ida,-1,1 ia,-1,1 aria,2,1 eria,2,1 iria,2,1 ara,-1,1 era,-1,1
    ira,-1,1 ava,-1,1 asse,-1,1 esse,-1,1 isse,-1,1 aste,-1,1 este,-1,1
    iste,-1,1 ei,-1,1 arei,16,1 erei,16,1 irei,16,1 am,-1,1 iam,20,1 ariam,21,1
    eriam,21,1 iriam,21,1 aram,20,1 eram,20,1 iram,20,1 avam,20,1 em,-1,1
    arem,29,1 erem,29,1 irem,29,1 assem,29,1 essem,29,1 issem,29,1 ado,-1,1
    ido,-1,1 ando,-1,1 endo,-1,1 indo,-1,1 ara~o,-1,1 era~o,-1,1 ira~o,-1,1
    ar,-1,1 er,-1,1 ir,-1,1 as,-1,1 adas,47,1 idas,47,1 ias,47,1 arias,50,1
    erias,50,1 irias,50,1 aras,47,1 eras,47,1 iras,47,1 avas,47,1 es,-1,1
    ardes,58,1 erdes,58,1 irdes,58,1 ares,58,1 eres,58,1 ires,58,1 asses,58,1
    esses,58,1 isses,58,1 astes,58,1 estes,58,1 istes,58,1 is,-1,1 ais,71,1
    eis,71,1 areis,73,1 ereis,73,1 ireis,73,1 áreis,73,1 éreis,73,1 íreis,73,1
    ásseis,73,1 ésseis,73,1 ísseis,73,1 áveis,73,1 íeis,73,1 aríeis,84,1
    eríeis,84,1 iríeis,84,1 ados,-1,1 idos,-1,1 amos,-1,1 áramos,90,1
    éramos,90,1 íramos,90,1 ávamos,90,1 íamos,90,1 aríamos,95,1 eríamos,95,1
    iríamos,95,1 emos,-1,1 aremos,99,1 eremos,99,1 iremos,99,1 ássemos,99,1
    êssemos,99,1 íssemos,99,1 imos,-1,1 armos,-1,1 ermos,-1,1 irmos,-1,1
    ámos,-1,1 arás,-1,1 erás,-1,1 irás,-1,1 eu,-1,1 iu,-1,1 ou,-1,1 ará,-1,1
    erá,-1,1 irá,-1,1
  `);

  static a_7 = Among.table<StemmerPt>(`
    a,-1,1 i,-1,1 o,-1,1 os,-1,1 á,-1,1 í,-1,1 ó,-1,1
  `);

  static a_8 = Among.table<StemmerPt>(`
    e,-1,1 ç,-1,2 é,-1,1 ê,-1,1
  `);
}

export default StemmerPt;
