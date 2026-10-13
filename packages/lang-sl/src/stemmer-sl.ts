import { Among, BaseStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

class StemmerSl extends BaseStemmer {
  declare I_p1: number;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-sl';
    this.I_p1 = 0;
  }

  innerStem(): boolean {
    let among_var: number;

    let v_2;

    this.I_p1 = this.current.length;
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const v_1 = this.limit - this.cursor;
    {
      for (v_2 = 4; v_2 > 0; v_2--) {
        const v_3 = this.limit - this.cursor;
        lab1: {
          if (!(this.I_p1 > 8)) {
            this.cursor = this.limit - v_3;
            break lab1;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_0);
          if (among_var === 0) {
            this.cursor = this.limit - v_3;
            break lab1;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_3;
              break lab1;
            case 1:
              this.slice_del();
              break;
          }
        }
        const v_4 = this.limit - this.cursor;
        lab2: {
          if (!(this.I_p1 > 7)) {
            this.cursor = this.limit - v_4;
            break lab2;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_1);
          if (among_var === 0) {
            this.cursor = this.limit - v_4;
            break lab2;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_4;
              break lab2;
            case 1:
              this.slice_del();
              break;
          }
        }
        this.I_p1 = this.current.length;
        const v_5 = this.limit - this.cursor;
        lab3: {
          if (!(this.I_p1 > 6)) {
            this.cursor = this.limit - v_5;
            break lab3;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_2);
          if (among_var === 0) {
            this.cursor = this.limit - v_5;
            break lab3;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_5;
              break lab3;
            case 1:
              this.slice_del();
              break;
          }
        }
        this.I_p1 = this.current.length;
        const v_6 = this.limit - this.cursor;
        lab4: {
          if (!(this.I_p1 > 6)) {
            this.cursor = this.limit - v_6;
            break lab4;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_3);
          if (among_var === 0) {
            this.cursor = this.limit - v_6;
            break lab4;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_6;
              break lab4;
            case 1:
              this.slice_del();
              break;
          }
        }
        this.I_p1 = this.current.length;
        const v_7 = this.limit - this.cursor;
        lab5: {
          if (!(this.I_p1 > 5)) {
            this.cursor = this.limit - v_7;
            break lab5;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_4);
          if (among_var === 0) {
            this.cursor = this.limit - v_7;
            break lab5;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_7;
              break lab5;
            case 1:
              this.slice_del();
              break;
          }
        }
        this.I_p1 = this.current.length;
        const v_8 = this.limit - this.cursor;
        lab6: {
          if (!(this.I_p1 > 6)) {
            this.cursor = this.limit - v_8;
            break lab6;
          }
          this.ket = this.cursor;
          if (!this.in_grouping_b(StemmerSl.g_soglasniki, 98, 382)) {
            this.cursor = this.limit - v_8;
            break lab6;
          }
          this.bra = this.cursor;
          const v_9 = this.limit - this.cursor;
          if (!this.in_grouping_b(StemmerSl.g_soglasniki, 98, 382)) {
            this.cursor = this.limit - v_8;
            break lab6;
          }
          this.cursor = this.limit - v_9;
          this.slice_del();
        }
        this.I_p1 = this.current.length;
        const v_10 = this.limit - this.cursor;
        lab7: {
          if (!(this.I_p1 > 5)) {
            this.cursor = this.limit - v_10;
            break lab7;
          }
          this.ket = this.cursor;
          among_var = this.find_among_b(StemmerSl.a_5);
          if (among_var === 0) {
            this.cursor = this.limit - v_10;
            break lab7;
          }
          this.bra = this.cursor;
          switch (among_var) {
            case 0:
              this.cursor = this.limit - v_10;
              break lab7;
            case 1:
              this.slice_del();
              break;
          }
        }
      }
    }
    this.cursor = this.limit - v_1;
    this.cursor = this.limit_backward;
    return true;
  }

  static a_0: Among<StemmerSl>[] = [
    new Among('anski', -1, 1),
    new Among('evski', -1, 1),
    new Among('ovski', -1, 1),
  ];

  static a_1: Among<StemmerSl>[] = [
    new Among('stvo', -1, 1),
    new Among('\u0161tvo', -1, 1),
  ];

  static a_2: Among<StemmerSl>[] = [
    new Among('ega', -1, 1),
    new Among('ija', -1, 1),
    new Among('ila', -1, 1),
    new Among('ema', -1, 1),
    new Among('vna', -1, 1),
    new Among('ite', -1, 1),
    new Among('ste', -1, 1),
    new Among('\u0161\u010De', -1, 1),
    new Among('ski', -1, 1),
    new Among('\u0161ki', -1, 1),
    new Among('iti', -1, 1),
    new Among('ovi', -1, 1),
    new Among('\u010Dek', -1, 1),
    new Among('ovm', -1, 1),
    new Among('\u010Dan', -1, 1),
    new Among('len', -1, 1),
    new Among('ven', -1, 1),
    new Among('\u0161en', -1, 1),
    new Among('ejo', -1, 1),
    new Among('ijo', -1, 1),
    new Among('ast', -1, 1),
    new Among('ost', -1, 1),
  ];

  static a_3: Among<StemmerSl>[] = [
    new Among('ja', -1, 1),
    new Among('ka', -1, 1),
    new Among('ma', -1, 1),
    new Among('ec', -1, 1),
    new Among('je', -1, 1),
    new Among('eg', -1, 1),
    new Among('eh', -1, 1),
    new Among('ih', -1, 1),
    new Among('mi', -1, 1),
    new Among('ti', -1, 1),
    new Among('ij', -1, 1),
    new Among('al', -1, 1),
    new Among('il', -1, 1),
    new Among('em', -1, 1),
    new Among('om', -1, 1),
    new Among('an', -1, 1),
    new Among('en', -1, 1),
    new Among('in', -1, 1),
    new Among('do', -1, 1),
    new Among('jo', -1, 1),
    new Among('ir', -1, 1),
    new Among('at', -1, 1),
    new Among('ev', -1, 1),
    new Among('iv', -1, 1),
    new Among('ov', -1, 1),
    new Among('o\u010D', -1, 1),
  ];

  static a_4: Among<StemmerSl>[] = [
    new Among('a', -1, 1),
    new Among('c', -1, 1),
    new Among('e', -1, 1),
    new Among('i', -1, 1),
    new Among('m', -1, 1),
    new Among('o', -1, 1),
    new Among('u', -1, 1),
    new Among('\u0161', -1, 1),
  ];

  static a_5: Among<StemmerSl>[] = [
    new Among('a', -1, 1),
    new Among('e', -1, 1),
    new Among('i', -1, 1),
    new Among('o', -1, 1),
    new Among('u', -1, 1),
  ];

  static g_soglasniki: number[] = [
    119, 95, 23, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 16,
  ];
}

export default StemmerSl;
