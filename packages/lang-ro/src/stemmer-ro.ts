import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from romanian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerRo extends SnowballStemmer {
  declare B_standard_suffix_removed: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ro';
    this.I_pV = 0;
    this.I_p1 = 0;
    this.I_p2 = 0;
    this.B_standard_suffix_removed = false;
  }

  r_prelude(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        lab1: for (;;) {
          const v_2 = this.cursor;
          lab2: {
            if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
              break lab2;
            }
            this.bra = this.cursor;
            lab3: {
              const v_3 = this.cursor;
              lab4: {
                if (!this.eq_s('u')) {
                  break lab4;
                }
                this.ket = this.cursor;
                if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
                  break lab4;
                }
                this.slice_from('U');
                break lab3;
              }
              this.cursor = v_3;
              if (!this.eq_s('i')) {
                break lab2;
              }
              this.ket = this.cursor;
              if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
                break lab2;
              }
              this.slice_from('I');
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
          if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
            break lab2;
          }
          lab3: {
            const v_3 = this.cursor;
            lab4: {
              if (!this.out_grouping(StemmerRo.g_v, 97, 259)) {
                break lab4;
              }
              if (!this.gopast_in_grouping(StemmerRo.g_v, 97, 259)) {
                break lab4;
              }
              break lab3;
            }
            this.cursor = v_3;
            if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
              break lab2;
            }
            if (!this.gopast_out_grouping(StemmerRo.g_v, 97, 259)) {
              break lab2;
            }
          }
          break lab1;
        }
        this.cursor = v_2;
        if (!this.out_grouping(StemmerRo.g_v, 97, 259)) {
          break lab0;
        }
        lab5: {
          const v_4 = this.cursor;
          lab6: {
            if (!this.out_grouping(StemmerRo.g_v, 97, 259)) {
              break lab6;
            }
            if (!this.gopast_in_grouping(StemmerRo.g_v, 97, 259)) {
              break lab6;
            }
            break lab5;
          }
          this.cursor = v_4;
          if (!this.in_grouping(StemmerRo.g_v, 97, 259)) {
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
      if (!this.gopast_in_grouping(StemmerRo.g_v, 97, 259)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerRo.g_v, 97, 259)) {
        break lab7;
      }
      this.I_p1 = this.cursor;
      if (!this.gopast_in_grouping(StemmerRo.g_v, 97, 259)) {
        break lab7;
      }
      if (!this.gopast_out_grouping(StemmerRo.g_v, 97, 259)) {
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
        const among_var = this.find_slice(StemmerRo.a_0);
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

  r_step_0(): boolean {
    const among_var = this.find_slice_b(StemmerRo.a_1);
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
      case 4:
        this.slice_from('i');
        break;
      case 5:
        if (this.eq_s_b('ab')) {
          return false;
        }
        this.slice_from('i');
        break;
      case 6:
        this.slice_from('at');
        break;
      case 7:
        this.slice_from('a\u0163i');
        break;
    }
    return true;
  }

  r_combo_suffix(): boolean {
    const v_1 = this.limit - this.cursor;
    const among_var = this.find_slice_b(StemmerRo.a_2);
    if (among_var === 0) {
      return false;
    }
    if (!this.r_R1()) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('abil');
        break;
      case 2:
        this.slice_from('ibil');
        break;
      case 3:
        this.slice_from('iv');
        break;
      case 4:
        this.slice_from('ic');
        break;
      case 5:
        this.slice_from('at');
        break;
      case 6:
        this.slice_from('it');
        break;
    }
    this.B_standard_suffix_removed = true;
    this.cursor = this.limit - v_1;
    return true;
  }

  r_standard_suffix(): boolean {
    this.B_standard_suffix_removed = false;
    for (;;) {
      const v_1 = this.limit - this.cursor;
      lab0: {
        if (!this.r_combo_suffix()) {
          break lab0;
        }
        continue;
      }
      this.cursor = this.limit - v_1;
      break;
    }
    const among_var = this.find_slice_b(StemmerRo.a_3);
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
      case 2:
        if (!this.eq_s_b('\u0163')) {
          return false;
        }
        this.bra = this.cursor;
        this.slice_from('t');
        break;
      case 3:
        this.slice_from('ist');
        break;
    }
    this.B_standard_suffix_removed = true;
    return true;
  }

  r_verb_suffix(): boolean {
    if (this.cursor < this.I_pV) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_pV;
    const among_var = this.find_slice_b(StemmerRo.a_4);
    if (among_var === 0) {
      this.limit_backward = v_1;
      return false;
    }
    switch (among_var) {
      case 1:
        if (!this.out_grouping_b(StemmerRo.g_v, 97, 259) && !this.eq_s_b('u')) {
          this.limit_backward = v_1;
          return false;
        }
        this.slice_del();
        break;
      case 2:
        this.slice_del();
        break;
    }
    this.limit_backward = v_1;
    return true;
  }

  r_vowel_suffix(): boolean {
    const among_var = this.find_slice_b(StemmerRo.a_5);
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
    }
    return true;
  }

  innerStem(): boolean {
    this.do_forward(this.r_prelude);
    this.r_mark_regions();
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_step_0);
    this.do_backward(this.r_standard_suffix);
    const v_4 = this.limit - this.cursor;
    lab0: {
      if (!this.B_standard_suffix_removed) {
        if (!this.r_verb_suffix()) {
          break lab0;
        }
      }
    }
    this.cursor = this.limit - v_4;
    this.do_backward(this.r_vowel_suffix);
    this.cursor = this.limit_backward;
    this.do_forward(this.r_postlude);
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 32, 0, 0, 4,
  ];

  static a_0: Among<StemmerRo>[] = [
    new Among('', -1, 3),
    new Among('I', 0, 1),
    new Among('U', 0, 2),
  ];

  static a_1 = Among.table<StemmerRo>(`
    ea,-1,3 aţia,-1,7 aua,-1,2 iua,-1,4 aţie,-1,7 ele,-1,3 ile,-1,5 iile,6,4
    iei,-1,4 atei,-1,6 ii,-1,4 ului,-1,1 ul,-1,1 elor,-1,3 ilor,-1,4 iilor,14,4
  `);

  static a_2 = Among.table<StemmerRo>(`
    icala,-1,4 iciva,-1,4 ativa,-1,5 itiva,-1,6 icale,-1,4 aţiune,-1,5
    iţiune,-1,6 atoare,-1,5 itoare,-1,6 ătoare,-1,5 icitate,-1,4 abilitate,-1,1
    ibilitate,-1,2 ivitate,-1,3 icive,-1,4 ative,-1,5 itive,-1,6 icali,-1,4
    atori,-1,5 icatori,18,4 itori,-1,6 ători,-1,5 icitati,-1,4 abilitati,-1,1
    ivitati,-1,3 icivi,-1,4 ativi,-1,5 itivi,-1,6 icităi,-1,4 abilităi,-1,1
    ivităi,-1,3 icităţi,-1,4 abilităţi,-1,1 ivităţi,-1,3 ical,-1,4 ator,-1,5
    icator,35,4 itor,-1,6 ător,-1,5 iciv,-1,4 ativ,-1,5 itiv,-1,6 icală,-1,4
    icivă,-1,4 ativă,-1,5 itivă,-1,6
  `);

  static a_3 = Among.table<StemmerRo>(`
    ica,-1,1 abila,-1,1 ibila,-1,1 oasa,-1,1 ata,-1,1 ita,-1,1 anta,-1,1
    ista,-1,3 uta,-1,1 iva,-1,1 ic,-1,1 ice,-1,1 abile,-1,1 ibile,-1,1 isme,-1,3
    iune,-1,2 oase,-1,1 ate,-1,1 itate,17,1 ite,-1,1 ante,-1,1 iste,-1,3
    ute,-1,1 ive,-1,1 ici,-1,1 abili,-1,1 ibili,-1,1 iuni,-1,2 atori,-1,1
    osi,-1,1 ati,-1,1 itati,30,1 iti,-1,1 anti,-1,1 isti,-1,3 uti,-1,1 işti,-1,3
    ivi,-1,1 ităi,-1,1 oşi,-1,1 ităţi,-1,1 abil,-1,1 ibil,-1,1 ism,-1,3
    ator,-1,1 os,-1,1 at,-1,1 it,-1,1 ant,-1,1 ist,-1,3 ut,-1,1 iv,-1,1 ică,-1,1
    abilă,-1,1 ibilă,-1,1 oasă,-1,1 ată,-1,1 ită,-1,1 antă,-1,1 istă,-1,3
    ută,-1,1 ivă,-1,1
  `);

  static a_4 = Among.table<StemmerRo>(`
    ea,-1,1 ia,-1,1 esc,-1,1 ăsc,-1,1 ind,-1,1 ând,-1,1 are,-1,1 ere,-1,1
    ire,-1,1 âre,-1,1 se,-1,2 ase,10,1 sese,10,2 ise,10,1 use,10,1 âse,10,1
    eşte,-1,1 ăşte,-1,1 eze,-1,1 ai,-1,1 eai,19,1 iai,19,1 sei,-1,2 eşti,-1,1
    ăşti,-1,1 ui,-1,1 ezi,-1,1 âi,-1,1 aşi,-1,1 seşi,-1,2 aseşi,29,1 seseşi,29,2
    iseşi,29,1 useşi,29,1 âseşi,29,1 işi,-1,1 uşi,-1,1 âşi,-1,1 aţi,-1,2
    eaţi,38,1 iaţi,38,1 eţi,-1,2 iţi,-1,2 âţi,-1,2 arăţi,-1,1 serăţi,-1,2
    aserăţi,45,1 seserăţi,45,2 iserăţi,45,1 userăţi,45,1 âserăţi,45,1 irăţi,-1,1
    urăţi,-1,1 ârăţi,-1,1 am,-1,1 eam,54,1 iam,54,1 em,-1,2 asem,57,1 sesem,57,2
    isem,57,1 usem,57,1 âsem,57,1 im,-1,2 âm,-1,2 ăm,-1,2 arăm,65,1 serăm,65,2
    aserăm,67,1 seserăm,67,2 iserăm,67,1 userăm,67,1 âserăm,67,1 irăm,65,1
    urăm,65,1 ârăm,65,1 au,-1,1 eau,76,1 iau,76,1 indu,-1,1 ându,-1,1 ez,-1,1
    ească,-1,1 ară,-1,1 seră,-1,2 aseră,84,1 seseră,84,2 iseră,84,1 useră,84,1
    âseră,84,1 iră,-1,1 ură,-1,1 âră,-1,1 ează,-1,1
  `);

  static a_5 = Among.table<StemmerRo>(`
    a,-1,1 e,-1,1 ie,1,1 i,-1,1 ă,-1,1
  `);
}

export default StemmerRo;
