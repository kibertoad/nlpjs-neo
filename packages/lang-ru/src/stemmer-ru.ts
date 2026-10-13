import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from russian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerRu extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ru';
    this.I_pV = 0;
    this.I_p2 = 0;
  }

  r_mark_regions(): boolean {
    this.I_pV = this.limit;
    this.I_p2 = this.limit;
    const v_1 = this.cursor;
    lab0: {
      if (!this.gopast_in_grouping(StemmerRu.g_v, 1072, 1103)) {
        break lab0;
      }
      this.I_pV = this.cursor;
      if (!this.gopast_out_grouping(StemmerRu.g_v, 1072, 1103)) {
        break lab0;
      }
      if (!this.gopast_in_grouping(StemmerRu.g_v, 1072, 1103)) {
        break lab0;
      }
      if (!this.gopast_out_grouping(StemmerRu.g_v, 1072, 1103)) {
        break lab0;
      }
      this.I_p2 = this.cursor;
    }
    this.cursor = v_1;
    return true;
  }

  r_perfective_gerund(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_0);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.eq_s_b('\u0430') && !this.eq_s_b('\u044F')) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_del();
        break;
    }
    return true;
  }

  r_adjective(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_1);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    return true;
  }

  r_adjectival(): boolean {
    if (!this.r_adjective()) {
      return false;
    }
    const v_1 = this.limit - this.cursor;
    lab0: {
      const among_var = this.find_slice_b(StemmerRu.a_2);
      if (among_var === 0) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      switch (among_var) {
        case 1:
          if (!this.eq_s_b('\u0430') && !this.eq_s_b('\u044F')) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
          this.slice_del();
          break;
        case 2:
          this.slice_del();
          break;
      }
    }
    return true;
  }

  r_reflexive(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_3);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    return true;
  }

  r_verb(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_4);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.eq_s_b('\u0430') && !this.eq_s_b('\u044F')) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_del();
        break;
    }
    return true;
  }

  r_noun(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_5);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    return true;
  }

  r_derivational(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_6);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R2()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
    }
    return true;
  }

  r_tidy_up(): boolean {
    const among_var = this.find_slice_b(StemmerRu.a_7);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        this.ket = this.cursor;
        if (!this.eq_s_b('\u043D')) {
          return false;
        }
        this.bra = this.cursor;
        if (!this.eq_s_b('\u043D')) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        if (!this.eq_s_b('\u043D')) {
          return false;
        }
        this.slice_del();
        break;
      case 3:
        this.slice_del();
        break;
    }
    return true;
  }

  innerStem(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab1: {
        lab2: for (;;) {
          const v_3 = this.cursor;
          lab3: {
            this.bra = this.cursor;
            if (!this.eq_s('\u0451')) {
              break lab3;
            }
            this.ket = this.cursor;
            this.cursor = v_3;
            break lab2;
          }
          this.cursor = v_3;
          if (this.cursor >= this.limit) {
            break lab1;
          }
          this.cursor++;
        }
        this.slice_from('\u0435');
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_4 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const v_5 = this.limit - this.cursor;
    lab4: {
      lab5: {
        const v_6 = this.limit - this.cursor;
        lab6: {
          if (!this.r_perfective_gerund()) {
            break lab6;
          }
          break lab5;
        }
        this.cursor = this.limit - v_6;
        const v_7 = this.limit - this.cursor;
        lab7: {
          if (!this.r_reflexive()) {
            this.cursor = this.limit - v_7;
            break lab7;
          }
        }
        lab8: {
          const v_8 = this.limit - this.cursor;
          lab9: {
            if (!this.r_adjectival()) {
              break lab9;
            }
            break lab8;
          }
          this.cursor = this.limit - v_8;
          lab10: {
            if (!this.r_verb()) {
              break lab10;
            }
            break lab8;
          }
          this.cursor = this.limit - v_8;
          if (!this.r_noun()) {
            break lab4;
          }
        }
      }
    }
    this.cursor = this.limit - v_5;
    const v_9 = this.limit - this.cursor;
    lab11: {
      this.ket = this.cursor;
      if (!this.eq_s_b('\u0438')) {
        this.cursor = this.limit - v_9;
        break lab11;
      }
      this.bra = this.cursor;
      this.slice_del();
    }
    this.do_backward(this.r_derivational);
    this.do_backward(this.r_tidy_up);
    this.limit_backward = v_4;
    this.cursor = this.limit_backward;
    return true;
  }

  static g_v: number[] = [33, 65, 8, 232];

  static a_0 = Among.table<StemmerRu>(`
    в,-1,1 ив,0,2 ыв,0,2 вши,-1,1 ивши,3,2 ывши,3,2 вшись,-1,1 ившись,6,2
    ывшись,6,2
  `);

  static a_1 = Among.table<StemmerRu>(`
    ее,-1,1 ие,-1,1 ое,-1,1 ые,-1,1 ими,-1,1 ыми,-1,1 ей,-1,1 ий,-1,1 ой,-1,1
    ый,-1,1 ем,-1,1 им,-1,1 ом,-1,1 ым,-1,1 его,-1,1 ого,-1,1 ему,-1,1 ому,-1,1
    их,-1,1 ых,-1,1 ею,-1,1 ою,-1,1 ую,-1,1 юю,-1,1 ая,-1,1 яя,-1,1
  `);

  static a_2 = Among.table<StemmerRu>(`
    ем,-1,1 нн,-1,1 вш,-1,1 ивш,2,2 ывш,2,2 щ,-1,1 ющ,5,1 ующ,6,2
  `);

  static a_3 = Among.table<StemmerRu>(`
    сь,-1,1 ся,-1,1
  `);

  static a_4 = Among.table<StemmerRu>(`
    ла,-1,1 ила,0,2 ыла,0,2 на,-1,1 ена,3,2 ете,-1,1 ите,-1,2 йте,-1,1 ейте,7,2
    уйте,7,2 ли,-1,1 или,10,2 ыли,10,2 й,-1,1 ей,13,2 уй,13,2 л,-1,1 ил,16,2
    ыл,16,2 ем,-1,1 им,-1,2 ым,-1,2 н,-1,1 ен,22,2 ло,-1,1 ило,24,2 ыло,24,2
    но,-1,1 ено,27,2 нно,27,1 ет,-1,1 ует,30,2 ит,-1,2 ыт,-1,2 ют,-1,1 уют,34,2
    ят,-1,2 ны,-1,1 ены,37,2 ть,-1,1 ить,39,2 ыть,39,2 ешь,-1,1 ишь,-1,2 ю,-1,2
    ую,44,2
  `);

  static a_5 = Among.table<StemmerRu>(`
    а,-1,1 ев,-1,1 ов,-1,1 е,-1,1 ие,3,1 ье,3,1 и,-1,1 еи,6,1 ии,6,1 ами,6,1
    ями,6,1 иями,10,1 й,-1,1 ей,12,1 ией,13,1 ий,12,1 ой,12,1 ам,-1,1 ем,-1,1
    ием,18,1 ом,-1,1 ям,-1,1 иям,21,1 о,-1,1 у,-1,1 ах,-1,1 ях,-1,1 иях,26,1
    ы,-1,1 ь,-1,1 ю,-1,1 ию,30,1 ью,30,1 я,-1,1 ия,33,1 ья,33,1
  `);

  static a_6 = Among.table<StemmerRu>(`
    ост,-1,1 ость,-1,1
  `);

  static a_7 = Among.table<StemmerRu>(`
    ейше,-1,1 н,-1,2 ейш,-1,1 ь,-1,3
  `);
}

export default StemmerRu;
