import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from czech-do.sbl of Jim O'Regan (2012), for the stemmer of Ljiljana Dolamic. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerCs extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-cs';
    this.I_pV = 0;
    this.I_p1 = 0;
  }

  r_mark_regions(): boolean {
    this.I_pV = this.limit;
    this.I_p1 = this.limit;
    const v_1 = this.cursor;
    lab0: {
      if (!this.gopast_out_grouping(StemmerCs.g_v, 97, 367)) {
        break lab0;
      }
      this.I_pV = this.cursor;
      if (!this.gopast_out_grouping(StemmerCs.g_v, 97, 367)) {
        break lab0;
      }
      if (!this.gopast_in_grouping(StemmerCs.g_v, 97, 367)) {
        break lab0;
      }
      this.I_p1 = this.cursor;
    }
    this.cursor = v_1;
    return true;
  }

  r_palatalise(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_0);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_RV()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('k');
        break;
      case 2:
        this.slice_from('h');
        break;
      case 3:
        this.slice_from('ck');
        break;
      case 4:
        this.slice_from('sk');
        break;
    }
    return true;
  }

  r_do_possessive(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_1);
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
      case 2: {
        this.slice_del();
        const v_1 = this.limit - this.cursor;
        lab0: {
          if (!this.r_palatalise()) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
        }
        break;
      }
    }
    return true;
  }

  r_do_case(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_2);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2: {
        this.slice_del();
        const v_1 = this.limit - this.cursor;
        lab0: {
          if (!this.r_palatalise()) {
            this.cursor = this.limit - v_1;
            break lab0;
          }
        }
        break;
      }
      case 3: {
        this.slice_from('e');
        const v_2 = this.limit - this.cursor;
        lab1: {
          if (!this.r_palatalise()) {
            this.cursor = this.limit - v_2;
            break lab1;
          }
        }
        break;
      }
    }
    return true;
  }

  r_do_derivational(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_3);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        this.slice_from('i');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 3:
        this.slice_from('e');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 4:
        this.slice_from('\u00E9');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 5:
        this.slice_from('\u011B');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 6:
        this.slice_from('\u00ED');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
    }
    return true;
  }

  r_do_deriv_single(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_4);
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

  r_do_augmentative(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_5);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        this.slice_from('i');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
    }
    return true;
  }

  r_do_diminutive(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_6);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_del();
        break;
      case 2:
        this.slice_from('e');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 3:
        this.slice_from('\u00E9');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 4:
        this.slice_from('i');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 5:
        this.slice_from('\u00ED');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 6:
        this.slice_from('\u00E1');
        break;
      case 7:
        this.slice_from('a');
        break;
      case 8:
        this.slice_from('o');
        break;
      case 9:
        this.slice_from('u');
        break;
    }
    return true;
  }

  r_do_comparative(): boolean {
    const among_var = this.find_slice_b(StemmerCs.a_7);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('\u011B');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
      case 2:
        this.slice_from('e');
        if (!this.r_palatalise()) {
          return false;
        }
        break;
    }
    return true;
  }

  r_do_aggressive(): boolean {
    this.do_backward(this.r_do_comparative);
    this.do_backward(this.r_do_diminutive);
    this.do_backward(this.r_do_augmentative);
    lab0: {
      const v_4 = this.limit - this.cursor;
      lab1: {
        if (!this.r_do_derivational()) {
          break lab1;
        }
        break lab0;
      }
      this.cursor = this.limit - v_4;
      return this.r_do_deriv_single();
    }
    return true;
  }

  innerStem(): boolean {
    if (this.current.length <= 4) {
      return false;
    }
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    if (!this.r_do_case()) {
      return false;
    }
    if (!this.r_do_possessive()) {
      return false;
    }
    if (!this.r_do_aggressive()) {
      return false;
    }
    this.cursor = this.limit_backward;
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 18, 0, 0, 0, 4,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 64,
  ];

  static a_0 = Among.table<StemmerCs>(`
    ce,-1,1 ze,-1,2 že,-1,2 ci,-1,1 čti,-1,3 šti,-1,4 zi,-1,2 či,-1,1 ži,-1,2
    čté,-1,3 šté,-1,4 č,-1,1 čtě,-1,3 ště,-1,4
  `);

  static a_1 = Among.table<StemmerCs>(`
    in,-1,2 ov,-1,1 ův,-1,1
  `);

  static a_2 = Among.table<StemmerCs>(`
    a,-1,1 ama,0,1 ata,0,1 e,-1,2 ěte,3,2 ech,-1,2 atech,5,1 ich,-1,2 ách,-1,1
    ích,-1,2 ých,-1,1 i,-1,2 mi,11,1 ami,12,1 emi,12,2 ími,12,2 ými,12,1
    ěmi,12,2 ěti,11,2 ovi,11,1 em,-1,3 ětem,20,1 ám,-1,1 ém,-1,2 ím,-1,2 ým,-1,1
    atům,-1,1 o,-1,1 iho,27,2 ého,27,2 ího,27,2 es,-1,2 os,-1,1 us,-1,1 at,-1,1
    u,-1,1 imu,35,2 ému,35,2 ou,35,1 y,-1,1 aty,39,1 á,-1,1 é,-1,1 ové,42,1
    í,-1,2 ý,-1,1 ě,-1,2 ů,-1,1
  `);

  static a_3 = Among.table<StemmerCs>(`
    ob,-1,1 itb,-1,2 ec,-1,3 inec,2,2 obinec,3,1 ovec,2,1 ic,-1,2 enic,6,3
    och,-1,1 ásek,-1,1 nk,-1,1 isk,-1,2 ovisk,11,1 tk,-1,1 vk,-1,1 ník,-1,1
    ovník,15,1 ovík,-1,1 čk,-1,1 išk,-1,2 ušk,-1,1 dl,-1,1 itel,-1,2 ul,-1,1
    an,-1,1 čan,24,1 en,-1,3 in,-1,2 štin,27,1 ovin,27,1 teln,-1,1 árn,-1,1
    írn,-1,6 oun,-1,1 loun,33,1 ovn,-1,1 yn,-1,1 kyn,36,1 án,-1,1 ián,38,2
    ín,-1,6 čn,-1,1 ěn,-1,5 as,-1,1 it,-1,2 ot,-1,1 ist,-1,2 ost,-1,1 nost,47,1
    out,-1,1 ovišt,-1,1 iv,-1,2 ov,-1,1 tv,-1,1 ctv,53,1 stv,53,1 ovstv,55,1
    ovtv,53,1 ač,-1,1 áč,-1,1 oň,-1,1 ář,-1,1 kář,61,1 ionář,61,2 éř,-1,4
    néř,64,1 íř,-1,6 ouš,-1,1
  `);

  static a_4 = Among.table<StemmerCs>(`
    c,-1,1 k,-1,1 l,-1,1 n,-1,1 t,-1,1 č,-1,1
  `);

  static a_5 = Among.table<StemmerCs>(`
    isk,-1,2 ák,-1,1 izn,-1,2 ajzn,-1,1
  `);

  static a_6 = Among.table<StemmerCs>(`
    k,-1,1 ak,0,7 ek,0,2 anek,2,1 enek,2,2 inek,2,4 onek,2,1 unek,2,1 ánek,2,1
    aček,2,1 eček,2,2 iček,2,4 oček,2,1 uček,2,1 áček,2,1 éček,2,3 íček,2,5
    oušek,2,1 ik,0,4 ank,0,1 enk,0,1 ink,0,1 onk,0,1 unk,0,1 ánk,0,1 énk,0,1
    ínk,0,1 ok,0,8 átk,0,1 uk,0,9 ák,0,6 ék,0,3 ík,0,5 ačk,0,1 ečk,0,1 ičk,0,1
    očk,0,1 učk,0,1 áčk,0,1 éčk,0,1 íčk,0,1 ušk,0,1
  `);

  static a_7 = Among.table<StemmerCs>(`
    ejš,-1,2 ějš,-1,1
  `);
}

export default StemmerCs;
