import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from hungarian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerHu extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-hu';
    this.I_p1 = 0;
  }

  r_mark_regions(): boolean {
    this.I_p1 = this.limit;
    lab0: {
      const v_1 = this.cursor;
      lab1: {
        if (!this.in_grouping(StemmerHu.g_v, 97, 369)) {
          break lab1;
        }
        if (!this.goto_out_grouping(StemmerHu.g_v, 97, 369)) {
          break lab1;
        }
        if (this.find_among(StemmerHu.a_0) === 0) {
          if (this.cursor >= this.limit) {
            break lab1;
          }
          this.cursor++;
        }
        this.I_p1 = this.cursor;
        break lab0;
      }
      this.cursor = v_1;
      if (!this.out_grouping(StemmerHu.g_v, 97, 369)) {
        return false;
      }
      if (!this.gopast_in_grouping(StemmerHu.g_v, 97, 369)) {
        return false;
      }
      this.I_p1 = this.cursor;
    }
    return true;
  }

  r_v_ending(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_1);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('a');
        break;
      case 2:
        this.slice_from('e');
        break;
    }
    return true;
  }

  r_double(): boolean {
    const v_1 = this.limit - this.cursor;
    if (this.find_among_b(StemmerHu.a_2) === 0) {
      return false;
    }
    this.cursor = this.limit - v_1;
    return true;
  }

  r_undouble(): boolean {
    if (this.cursor <= this.limit_backward) {
      return false;
    }
    this.cursor--;
    this.ket = this.cursor;
    if (this.cursor - 1 < this.limit_backward) {
      return false;
    }
    this.cursor -= 1;
    this.bra = this.cursor;
    this.slice_del();
    return true;
  }

  r_instrum(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_3);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_double()) {
          return false;
        }
        break;
    }
    this.slice_del();
    return this.r_undouble();
  }

  r_case(): boolean {
    if (this.find_slice_b(StemmerHu.a_4) === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    this.slice_del();
    return this.r_v_ending();
  }

  r_case_special(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_5);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('e');
        break;
      case 2:
        this.slice_from('a');
        break;
    }
    return true;
  }

  r_case_other(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_6);
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
        this.slice_from('a');
        break;
      case 3:
        this.slice_from('e');
        break;
    }
    return true;
  }

  r_factive(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_7);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.r_double()) {
          return false;
        }
        break;
    }
    this.slice_del();
    return this.r_undouble();
  }

  r_plural(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_8);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('a');
        break;
      case 2:
        this.slice_from('e');
        break;
      case 3:
        this.slice_del();
        break;
    }
    return true;
  }

  r_owned(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_9);
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
        this.slice_from('e');
        break;
      case 3:
        this.slice_from('a');
        break;
    }
    return true;
  }

  r_sing_owner(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_10);
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
        this.slice_from('a');
        break;
      case 3:
        this.slice_from('e');
        break;
    }
    return true;
  }

  r_plur_owner(): boolean {
    const among_var = this.find_slice_b(StemmerHu.a_11);
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
        this.slice_from('a');
        break;
      case 3:
        this.slice_from('e');
        break;
    }
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_mark_regions);
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_instrum);
    this.do_backward(this.r_case);
    this.do_backward(this.r_case_special);
    this.do_backward(this.r_case_other);
    this.do_backward(this.r_factive);
    this.do_backward(this.r_owned);
    this.do_backward(this.r_sing_owner);
    this.do_backward(this.r_plur_owner);
    this.do_backward(this.r_plural);
    this.cursor = this.limit_backward;
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 36, 10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
  ];

  static a_0 = Among.table<StemmerHu>(`
    cs,-1,-1 dzs,-1,-1 gy,-1,-1 ly,-1,-1 ny,-1,-1 sz,-1,-1 ty,-1,-1 zs,-1,-1
  `);

  static a_1 = Among.table<StemmerHu>(`
    á,-1,1 é,-1,2
  `);

  static a_2 = Among.table<StemmerHu>(`
    bb,-1,-1 cc,-1,-1 dd,-1,-1 ff,-1,-1 gg,-1,-1 jj,-1,-1 kk,-1,-1 ll,-1,-1
    mm,-1,-1 nn,-1,-1 pp,-1,-1 rr,-1,-1 ccs,-1,-1 ss,-1,-1 zzs,-1,-1 tt,-1,-1
    vv,-1,-1 ggy,-1,-1 lly,-1,-1 nny,-1,-1 tty,-1,-1 ssz,-1,-1 zz,-1,-1
  `);

  static a_3 = Among.table<StemmerHu>(`
    al,-1,1 el,-1,1
  `);

  static a_4 = Among.table<StemmerHu>(`
    ba,-1,-1 ra,-1,-1 be,-1,-1 re,-1,-1 ig,-1,-1 nak,-1,-1 nek,-1,-1 val,-1,-1
    vel,-1,-1 ul,-1,-1 nál,-1,-1 nél,-1,-1 ból,-1,-1 ról,-1,-1 tól,-1,-1
    ül,-1,-1 ből,-1,-1 ről,-1,-1 től,-1,-1 n,-1,-1 an,19,-1 ban,20,-1 en,19,-1
    ben,22,-1 képpen,22,-1 on,19,-1 ön,19,-1 képp,-1,-1 kor,-1,-1 t,-1,-1
    at,29,-1 et,29,-1 ként,29,-1 anként,32,-1 enként,32,-1 onként,32,-1 ot,29,-1
    ért,29,-1 öt,29,-1 hez,-1,-1 hoz,-1,-1 höz,-1,-1 vá,-1,-1 vé,-1,-1
  `);

  static a_5 = Among.table<StemmerHu>(`
    án,-1,2 én,-1,1 ánként,-1,2
  `);

  static a_6 = Among.table<StemmerHu>(`
    stul,-1,1 astul,0,1 ástul,0,2 stül,-1,1 estül,3,1 éstül,3,3
  `);

  static a_7 = Among.table<StemmerHu>(`
    á,-1,1 é,-1,1
  `);

  static a_8 = Among.table<StemmerHu>(`
    k,-1,3 ak,0,3 ek,0,3 ok,0,3 ák,0,1 ék,0,2 ök,0,3
  `);

  static a_9 = Among.table<StemmerHu>(`
    éi,-1,1 áéi,0,3 ééi,0,2 é,-1,1 ké,3,1 aké,4,1 eké,4,1 oké,4,1 áké,4,3
    éké,4,2 öké,4,1 éé,3,2
  `);

  static a_10 = Among.table<StemmerHu>(`
    a,-1,1 ja,0,1 d,-1,1 ad,2,1 ed,2,1 od,2,1 ád,2,2 éd,2,3 öd,2,1 e,-1,1 je,9,1
    nk,-1,1 unk,11,1 ánk,11,2 énk,11,3 ünk,11,1 uk,-1,1 juk,16,1 ájuk,17,2
    ük,-1,1 jük,19,1 éjük,20,3 m,-1,1 am,22,1 em,22,1 om,22,1 ám,22,2 ém,22,3
    o,-1,1 á,-1,2 é,-1,3
  `);

  static a_11 = Among.table<StemmerHu>(`
    id,-1,1 aid,0,1 jaid,1,1 eid,0,1 jeid,3,1 áid,0,2 éid,0,3 i,-1,1 ai,7,1
    jai,8,1 ei,7,1 jei,10,1 ái,7,2 éi,7,3 itek,-1,1 eitek,14,1 jeitek,15,1
    éitek,14,3 ik,-1,1 aik,18,1 jaik,19,1 eik,18,1 jeik,21,1 áik,18,2 éik,18,3
    ink,-1,1 aink,25,1 jaink,26,1 eink,25,1 jeink,28,1 áink,25,2 éink,25,3
    aitok,-1,1 jaitok,32,1 áitok,-1,2 im,-1,1 aim,35,1 jaim,36,1 eim,35,1
    jeim,38,1 áim,35,2 éim,35,3
  `);
}

export default StemmerHu;
