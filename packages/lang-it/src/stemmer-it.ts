import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from italian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerIt extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-it';
    this.I_pV = 0;
    this.I_p1 = 0;
    this.I_p2 = 0;
  }

  r_prelude(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab0: {
        const among_var = this.find_slice(StemmerIt.a_0);
        switch (among_var) {
          case 1:
            this.slice_from('\u00E0');
            break;
          case 2:
            this.slice_from('\u00E8');
            break;
          case 3:
            this.slice_from('\u00EC');
            break;
          case 4:
            this.slice_from('\u00F2');
            break;
          case 5:
            this.slice_from('\u00F9');
            break;
          case 6:
            this.slice_from('qU');
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
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    for (;;) {
      const v_3 = this.cursor;
      lab1: {
        lab2: for (;;) {
          const v_4 = this.cursor;
          lab3: {
            if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
              break lab3;
            }
            this.bra = this.cursor;
            lab4: {
              const v_5 = this.cursor;
              lab5: {
                if (!this.eq_s('u')) {
                  break lab5;
                }
                this.ket = this.cursor;
                if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
                  break lab5;
                }
                this.slice_from('U');
                break lab4;
              }
              this.cursor = v_5;
              if (!this.eq_s('i')) {
                break lab3;
              }
              this.ket = this.cursor;
              if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
                break lab3;
              }
              this.slice_from('I');
            }
            this.cursor = v_4;
            break lab2;
          }
          this.cursor = v_4;
          if (this.cursor >= this.limit) {
            break lab1;
          }
          this.cursor++;
        }
        continue;
      }
      this.cursor = v_3;
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
          if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
            break lab2;
          }
          lab3: {
            const v_3 = this.cursor;
            lab4: {
              if (!this.out_grouping(StemmerIt.g_v, 97, 249)) {
                break lab4;
              }
              if (!this.gopast_in_grouping(StemmerIt.g_v, 97, 249)) {
                break lab4;
              }
              break lab3;
            }
            this.cursor = v_3;
            if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
              break lab2;
            }
            if (!this.gopast_out_grouping(StemmerIt.g_v, 97, 249)) {
              break lab2;
            }
          }
          break lab1;
        }
        this.cursor = v_2;
        if (!this.out_grouping(StemmerIt.g_v, 97, 249)) {
          break lab0;
        }
        lab5: {
          const v_4 = this.cursor;
          lab6: {
            if (!this.out_grouping(StemmerIt.g_v, 97, 249)) {
              break lab6;
            }
            if (!this.gopast_in_grouping(StemmerIt.g_v, 97, 249)) {
              break lab6;
            }
            break lab5;
          }
          this.cursor = v_4;
          if (!this.in_grouping(StemmerIt.g_v, 97, 249)) {
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
      if (!this.gopast_in_grouping(StemmerIt.g_v, 97, 249)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerIt.g_v, 97, 249)) {
        break lab7;
      }
      this.I_p1 = this.cursor;
      if (!this.gopast_in_grouping(StemmerIt.g_v, 97, 249)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerIt.g_v, 97, 249)) {
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
        const among_var = this.find_slice(StemmerIt.a_1);
        switch (among_var) {
          case 1:
            this.slice_from('i');
            break;
          case 2:
            this.slice_from('u');
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

  r_attached_pronoun(): boolean {
    if (this.find_slice_b(StemmerIt.a_3) === 0) {
      return false;
    }
    const among_var = this.find_among_b(StemmerIt.a_2);
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
        this.slice_from('e');
        break;
    }
    return true;
  }

  r_standard_suffix(): boolean {
    let among_var: number;
    among_var = this.find_slice_b(StemmerIt.a_6);
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
      case 6:
        if (!this.r_RV()) {
          return false;
        }
        this.slice_del();
        break;
      case 7: {
        if (!this.r_R1()) {
          return false;
        }
        this.slice_del();
        const v_2 = this.limit - this.cursor;
        lab1: {
          among_var = this.find_slice_b(StemmerIt.a_4);
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
      case 8: {
        if (!this.r_R2()) {
          return false;
        }
        this.slice_del();
        const v_3 = this.limit - this.cursor;
        lab2: {
          among_var = this.find_slice_b(StemmerIt.a_5);
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
      case 9: {
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
          this.ket = this.cursor;
          if (!this.eq_s_b('ic')) {
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
    }
    return true;
  }

  r_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(StemmerIt.a_7);
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

  r_vowel_suffix(): boolean {
    const v_1 = this.limit - this.cursor;
    lab0: {
      this.ket = this.cursor;
      if (!this.in_grouping_b(StemmerIt.g_AEIO, 97, 242)) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      this.bra = this.cursor;
      if (!this.r_RV()) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      this.slice_del();
      this.ket = this.cursor;
      if (!this.eq_s_b('i')) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      this.bra = this.cursor;
      if (!this.r_RV()) {
        this.cursor = this.limit - v_1;
        break lab0;
      }
      this.slice_del();
    }
    const v_2 = this.limit - this.cursor;
    lab1: {
      this.ket = this.cursor;
      if (!this.eq_s_b('h')) {
        this.cursor = this.limit - v_2;
        break lab1;
      }
      this.bra = this.cursor;
      if (!this.in_grouping_b(StemmerIt.g_CG, 99, 103)) {
        this.cursor = this.limit - v_2;
        break lab1;
      }
      if (!this.r_RV()) {
        this.cursor = this.limit - v_2;
        break lab1;
      }
      this.slice_del();
    }
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_prelude);
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_attached_pronoun);
    const v_3 = this.limit - this.cursor;
    lab0: {
      lab1: {
        const v_4 = this.limit - this.cursor;
        lab2: {
          if (!this.r_standard_suffix()) {
            break lab2;
          }
          break lab1;
        }
        this.cursor = this.limit - v_4;
        if (!this.r_verb_suffix()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_3;
    this.do_backward(this.r_vowel_suffix);
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2, 1,
  ];

  static g_AEIO: number[] = [
    17, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2,
  ];

  static g_CG: number[] = [17];

  static a_0: Among<StemmerIt>[] = [
    new Among('', -1, 7),
    new Among('qu', 0, 6),
    new Among('\u00E1', 0, 1),
    new Among('\u00E9', 0, 2),
    new Among('\u00ED', 0, 3),
    new Among('\u00F3', 0, 4),
    new Among('\u00FA', 0, 5),
  ];

  static a_1: Among<StemmerIt>[] = [
    new Among('', -1, 3),
    new Among('I', 0, 1),
    new Among('U', 0, 2),
  ];

  static a_2 = Among.table<StemmerIt>(`
    ando,-1,1 endo,-1,1 ar,-1,2 er,-1,2 ir,-1,2
  `);

  static a_3 = Among.table<StemmerIt>(`
    la,-1,-1 cela,0,-1 gliela,0,-1 mela,0,-1 tela,0,-1 vela,0,-1 le,-1,-1
    cele,6,-1 gliele,6,-1 mele,6,-1 tele,6,-1 vele,6,-1 ne,-1,-1 cene,12,-1
    gliene,12,-1 mene,12,-1 sene,12,-1 tene,12,-1 vene,12,-1 ci,-1,-1 li,-1,-1
    celi,20,-1 glieli,20,-1 meli,20,-1 teli,20,-1 veli,20,-1 gli,20,-1 mi,-1,-1
    si,-1,-1 ti,-1,-1 vi,-1,-1 lo,-1,-1 celo,31,-1 glielo,31,-1 melo,31,-1
    telo,31,-1 velo,31,-1
  `);

  static a_4 = Among.table<StemmerIt>(`
    ic,-1,-1 abil,-1,-1 os,-1,-1 iv,-1,1
  `);

  static a_5 = Among.table<StemmerIt>(`
    ic,-1,1 abil,-1,1 iv,-1,1
  `);

  static a_6 = Among.table<StemmerIt>(`
    ica,-1,1 logia,-1,3 osa,-1,1 ista,-1,1 iva,-1,9 anza,-1,1 enza,-1,5 ice,-1,1
    atrice,7,1 iche,-1,1 logie,-1,3 abile,-1,1 ibile,-1,1 usione,-1,4
    azione,-1,2 uzione,-1,4 atore,-1,2 ose,-1,1 ante,-1,1 mente,-1,1 amente,19,7
    iste,-1,1 ive,-1,9 anze,-1,1 enze,-1,5 ici,-1,1 atrici,25,1 ichi,-1,1
    abili,-1,1 ibili,-1,1 ismi,-1,1 usioni,-1,4 azioni,-1,2 uzioni,-1,4
    atori,-1,2 osi,-1,1 anti,-1,1 amenti,-1,6 imenti,-1,6 isti,-1,1 ivi,-1,9
    ico,-1,1 ismo,-1,1 oso,-1,1 amento,-1,6 imento,-1,6 ivo,-1,9 ità,-1,8
    istà,-1,1 istè,-1,1 istì,-1,1
  `);

  static a_7 = Among.table<StemmerIt>(`
    isca,-1,1 enda,-1,1 ata,-1,1 ita,-1,1 uta,-1,1 ava,-1,1 eva,-1,1 iva,-1,1
    erebbe,-1,1 irebbe,-1,1 isce,-1,1 ende,-1,1 are,-1,1 ere,-1,1 ire,-1,1
    asse,-1,1 ate,-1,1 avate,16,1 evate,16,1 ivate,16,1 ete,-1,1 erete,20,1
    irete,20,1 ite,-1,1 ereste,-1,1 ireste,-1,1 ute,-1,1 erai,-1,1 irai,-1,1
    isci,-1,1 endi,-1,1 erei,-1,1 irei,-1,1 assi,-1,1 ati,-1,1 iti,-1,1
    eresti,-1,1 iresti,-1,1 uti,-1,1 avi,-1,1 evi,-1,1 ivi,-1,1 isco,-1,1
    ando,-1,1 endo,-1,1 Yamo,-1,1 iamo,-1,1 avamo,-1,1 evamo,-1,1 ivamo,-1,1
    eremo,-1,1 iremo,-1,1 assimo,-1,1 ammo,-1,1 emmo,-1,1 eremmo,54,1
    iremmo,54,1 immo,-1,1 ano,-1,1 iscano,58,1 avano,58,1 evano,58,1 ivano,58,1
    eranno,-1,1 iranno,-1,1 ono,-1,1 iscono,65,1 arono,65,1 erono,65,1
    irono,65,1 erebbero,-1,1 irebbero,-1,1 assero,-1,1 essero,-1,1 issero,-1,1
    ato,-1,1 ito,-1,1 uto,-1,1 avo,-1,1 evo,-1,1 ivo,-1,1 ar,-1,1 ir,-1,1
    erà,-1,1 irà,-1,1 erò,-1,1 irò,-1,1
  `);
}

export default StemmerIt;
