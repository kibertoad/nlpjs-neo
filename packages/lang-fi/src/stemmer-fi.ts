import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from finnish.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerFi extends SnowballStemmer {
  declare S_x: string;
  declare B_ending_removed: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-fi';
    this.I_p1 = 0;
    this.I_p2 = 0;
    this.S_x = '';
    this.B_ending_removed = false;
  }

  r_mark_regions(): boolean {
    this.I_p1 = this.limit;
    this.I_p2 = this.limit;
    if (!this.goto_in_grouping(StemmerFi.g_V1, 97, 246)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerFi.g_V1, 97, 246)) {
      return false;
    }
    this.I_p1 = this.cursor;
    if (!this.goto_in_grouping(StemmerFi.g_V1, 97, 246)) {
      return false;
    }
    if (!this.gopast_out_grouping(StemmerFi.g_V1, 97, 246)) {
      return false;
    }
    this.I_p2 = this.cursor;
    return true;
  }

  r_particle_etc(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerFi.a_0);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        if (!this.in_grouping_b(StemmerFi.g_particle_end, 97, 246)) {
          return false;
        }
        break;
      case 2:
        if (!this.r_R2()) {
          return false;
        }
        break;
    }
    this.slice_del();
    return true;
  }

  r_possessive(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerFi.a_1);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        if (this.eq_s_b('k')) {
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_del();
        this.ket = this.cursor;
        if (!this.eq_s_b('kse')) {
          return false;
        }
        this.bra = this.cursor;
        this.slice_from('ksi');
        break;
      case 3:
        this.slice_del();
        break;
      case 4:
        if (this.find_among_b(StemmerFi.a_2) === 0) {
          return false;
        }
        this.slice_del();
        break;
      case 5:
        if (this.find_among_b(StemmerFi.a_3) === 0) {
          return false;
        }
        this.slice_del();
        break;
      case 6:
        if (this.find_among_b(StemmerFi.a_4) === 0) {
          return false;
        }
        this.slice_del();
        break;
    }
    return true;
  }

  r_LONG(): boolean {
    if (this.find_among_b(StemmerFi.a_5) === 0) {
      return false;
    }
    return true;
  }

  r_VI(): boolean {
    if (!this.eq_s_b('i')) {
      return false;
    }
    return this.in_grouping_b(StemmerFi.g_V2, 97, 246);
  }

  r_case_ending(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const among_var = this.find_slice_b(StemmerFi.a_6);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        if (!this.eq_s_b('a')) {
          return false;
        }
        break;
      case 2:
        if (!this.eq_s_b('e')) {
          return false;
        }
        break;
      case 3:
        if (!this.eq_s_b('i')) {
          return false;
        }
        break;
      case 4:
        if (!this.eq_s_b('o')) {
          return false;
        }
        break;
      case 5:
        if (!this.eq_s_b('\u00E4')) {
          return false;
        }
        break;
      case 6:
        if (!this.eq_s_b('\u00F6')) {
          return false;
        }
        break;
      case 7: {
        const v_2 = this.limit - this.cursor;
        lab0: {
          const v_3 = this.limit - this.cursor;
          lab1: {
            const v_4 = this.limit - this.cursor;
            lab2: {
              if (!this.r_LONG()) {
                break lab2;
              }
              break lab1;
            }
            this.cursor = this.limit - v_4;
            if (!this.eq_s_b('ie')) {
              this.cursor = this.limit - v_2;
              break lab0;
            }
          }
          this.cursor = this.limit - v_3;
          if (this.cursor <= this.limit_backward) {
            this.cursor = this.limit - v_2;
            break lab0;
          }
          this.cursor--;
          this.bra = this.cursor;
        }
        break;
      }
      case 8:
        if (!this.in_grouping_b(StemmerFi.g_V1, 97, 246)) {
          return false;
        }
        if (!this.in_grouping_b(StemmerFi.g_C, 98, 122)) {
          return false;
        }
        break;
    }
    this.slice_del();
    this.B_ending_removed = true;
    return true;
  }

  r_other_endings(): boolean {
    if (this.cursor < this.I_p2) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p2;
    const among_var = this.find_slice_b(StemmerFi.a_7);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    switch (among_var) {
      case 1:
        if (this.eq_s_b('po')) {
          return false;
        }
        break;
    }
    this.slice_del();
    return true;
  }

  r_i_plural(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    if (this.find_slice_b(StemmerFi.a_8) === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    this.slice_del();
    return true;
  }

  r_t_plural(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    this.ket = this.cursor;
    if (!this.eq_s_b('t')) {
      this.limit_backward = v_1;
      return false;
    }
    this.bra = this.cursor;
    const v_2 = this.limit - this.cursor;
    if (!this.in_grouping_b(StemmerFi.g_V1, 97, 246)) {
      this.limit_backward = v_1;
      return false;
    }
    this.cursor = this.limit - v_2;
    this.slice_del();
    this.limit_backward = v_1;
    if (this.cursor < this.I_p2) {
      return false;
    }
    const v_3 = this.limit_backward;
    this.limit_backward = this.I_p2;
    const among_var = this.find_slice_b(StemmerFi.a_9);
    if (among_var === 0) {
      this.limit_backward = v_3;
      return false;
    }
    this.limit_backward = v_3;
    switch (among_var) {
      case 1:
        if (this.eq_s_b('po')) {
          return false;
        }
        break;
    }
    this.slice_del();
    return true;
  }

  r_tidy(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    const v_2 = this.limit - this.cursor;
    lab0: {
      const v_3 = this.limit - this.cursor;
      if (!this.r_LONG()) {
        break lab0;
      }
      this.cursor = this.limit - v_3;
      this.ket = this.cursor;
      if (this.cursor <= this.limit_backward) {
        break lab0;
      }
      this.cursor--;
      this.bra = this.cursor;
      this.slice_del();
    }
    this.cursor = this.limit - v_2;
    const v_4 = this.limit - this.cursor;
    lab1: {
      this.ket = this.cursor;
      if (!this.in_grouping_b(StemmerFi.g_AEI, 97, 228)) {
        break lab1;
      }
      this.bra = this.cursor;
      if (!this.in_grouping_b(StemmerFi.g_C, 98, 122)) {
        break lab1;
      }
      this.slice_del();
    }
    this.cursor = this.limit - v_4;
    const v_5 = this.limit - this.cursor;
    lab2: {
      this.ket = this.cursor;
      if (!this.eq_s_b('j')) {
        break lab2;
      }
      this.bra = this.cursor;
      if (!this.eq_s_b('o') && !this.eq_s_b('u')) {
        break lab2;
      }
      this.slice_del();
    }
    this.cursor = this.limit - v_5;
    const v_6 = this.limit - this.cursor;
    lab3: {
      this.ket = this.cursor;
      if (!this.eq_s_b('o')) {
        break lab3;
      }
      this.bra = this.cursor;
      if (!this.eq_s_b('j')) {
        break lab3;
      }
      this.slice_del();
    }
    this.cursor = this.limit - v_6;
    this.limit_backward = v_1;
    if (!this.goto_out_grouping_b(StemmerFi.g_V1, 97, 246)) {
      return false;
    }
    this.ket = this.cursor;
    if (!this.in_grouping_b(StemmerFi.g_C, 98, 122)) {
      return false;
    }
    this.bra = this.cursor;
    this.S_x = this.slice_to();
    if (!this.eq_s_b(this.S_x)) {
      return false;
    }
    this.slice_del();
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_mark_regions);
    this.B_ending_removed = false;
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_particle_etc);
    this.do_backward(this.r_possessive);
    this.do_backward(this.r_case_ending);
    this.do_backward(this.r_other_endings);
    lab0: {
      lab1: {
        if (!this.B_ending_removed) {
          break lab1;
        }
        this.do_backward(this.r_i_plural);
        break lab0;
      }
      this.do_backward(this.r_t_plural);
    }
    this.do_backward(this.r_tidy);
    this.cursor = this.limit_backward;
    return true;
  }

  static g_AEI: number[] = [17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];

  static g_C: number[] = [119, 223, 119, 1];

  static g_V1: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32,
  ];

  static g_V2: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32,
  ];

  static g_particle_end: number[] = [
    17, 97, 24, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32,
  ];

  static a_0 = Among.table<StemmerFi>(`
    pa,-1,1 sti,-1,2 kaan,-1,1 han,-1,1 kin,-1,1 hän,-1,1 kään,-1,1 ko,-1,1
    pä,-1,1 kö,-1,1
  `);

  static a_1 = Among.table<StemmerFi>(`
    nsa,-1,3 mme,-1,3 nne,-1,3 ni,-1,2 si,-1,1 an,-1,4 en,-1,6 än,-1,5 nsä,-1,3
  `);

  static a_2 = Among.table<StemmerFi>(`
    lla,-1,-1 na,-1,-1 ssa,-1,-1 ta,-1,-1 lta,3,-1 sta,3,-1
  `);

  static a_3 = Among.table<StemmerFi>(`
    llä,-1,-1 nä,-1,-1 ssä,-1,-1 tä,-1,-1 ltä,3,-1 stä,3,-1
  `);

  static a_4 = Among.table<StemmerFi>(`
    lle,-1,-1 ine,-1,-1
  `);

  static a_5 = Among.table<StemmerFi>(`
    aa,-1,-1 ee,-1,-1 ii,-1,-1 oo,-1,-1 uu,-1,-1 ää,-1,-1 öö,-1,-1
  `);

  static a_6: Among<StemmerFi>[] = [
    new Among('a', -1, 8),
    new Among('lla', 0, -1),
    new Among('na', 0, -1),
    new Among('ssa', 0, -1),
    new Among('ta', 0, -1),
    new Among('lta', 4, -1),
    new Among('sta', 4, -1),
    new Among('tta', 4, 2),
    new Among('lle', -1, -1),
    new Among('ine', -1, -1),
    new Among('ksi', -1, -1),
    new Among('n', -1, 7),
    new Among('han', 11, 1),
    new Among('den', 11, -1, (stemmer) => stemmer.r_VI()),
    new Among('seen', 11, -1, (stemmer) => stemmer.r_LONG()),
    new Among('hen', 11, 2),
    new Among('tten', 11, -1, (stemmer) => stemmer.r_VI()),
    new Among('hin', 11, 3),
    new Among('siin', 11, -1, (stemmer) => stemmer.r_VI()),
    new Among('hon', 11, 4),
    new Among('h\u00E4n', 11, 5),
    new Among('h\u00F6n', 11, 6),
    new Among('\u00E4', -1, 8),
    new Among('ll\u00E4', 22, -1),
    new Among('n\u00E4', 22, -1),
    new Among('ss\u00E4', 22, -1),
    new Among('t\u00E4', 22, -1),
    new Among('lt\u00E4', 26, -1),
    new Among('st\u00E4', 26, -1),
    new Among('tt\u00E4', 26, 2),
  ];

  static a_7 = Among.table<StemmerFi>(`
    eja,-1,-1 mma,-1,1 imma,1,-1 mpa,-1,1 impa,3,-1 mmi,-1,1 immi,5,-1 mpi,-1,1
    impi,7,-1 ejä,-1,-1 mmä,-1,1 immä,10,-1 mpä,-1,1 impä,12,-1
  `);

  static a_8 = Among.table<StemmerFi>(`
    i,-1,-1 j,-1,-1
  `);

  static a_9 = Among.table<StemmerFi>(`
    mma,-1,1 imma,0,-1
  `);
}

export default StemmerFi;
