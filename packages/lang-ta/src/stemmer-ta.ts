import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from tamil.sbl of Snowball at commit 411550d. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerTa extends SnowballStemmer {
  declare B_found_a_match: boolean;
  declare B_found_vetrumai_urupu: boolean;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-ta';
    this.B_found_a_match = false;
    this.B_found_vetrumai_urupu = false;
  }

  r_has_min_length(): boolean {
    return this.current.length > 4;
  }

  r_fix_va_start(): boolean {
    const among_var = this.find_slice(StemmerTa.a_0);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('\u0B93');
        break;
      case 2:
        this.slice_from('\u0B92');
        break;
      case 3:
        this.slice_from('\u0B89');
        break;
      case 4:
        this.slice_from('\u0B8A');
        break;
    }
    return true;
  }

  r_fix_endings(): boolean {
    const v_1 = this.cursor;
    for (;;) {
      const v_2 = this.cursor;
      lab1: {
        if (!this.r_fix_ending()) {
          break lab1;
        }
        continue;
      }
      this.cursor = v_2;
      break;
    }
    this.cursor = v_1;
    return true;
  }

  r_remove_question_prefixes(): boolean {
    this.bra = this.cursor;
    if (!this.eq_s('\u0B8E')) {
      return false;
    }
    if (this.find_among(StemmerTa.a_8) === 0) {
      return false;
    }
    if (!this.eq_s('\u0BCD')) {
      return false;
    }
    this.ket = this.cursor;
    this.slice_del();
    this.do_forward(this.r_fix_va_start);
    return true;
  }

  r_fix_ending(): boolean {
    let among_var: number;
    if (this.current.length <= 3) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        among_var = this.find_slice_b(StemmerTa.a_1);
        if (among_var === 0) {
          break lab1;
        }
        switch (among_var) {
          case 1:
            this.slice_del();
            break;
          case 2: {
            const v_2 = this.limit - this.cursor;
            if (this.find_among_b(StemmerTa.a_2) === 0) {
              break lab1;
            }
            this.cursor = this.limit - v_2;
            this.slice_del();
            break;
          }
          case 3:
            this.slice_from('\u0BB3\u0BCD');
            break;
          case 4:
            this.slice_from('\u0BB2\u0BCD');
            break;
          case 5:
            this.slice_from('\u0B9F\u0BC1');
            break;
          case 6:
            if (!this.B_found_vetrumai_urupu) {
              break lab1;
            }
            if (this.eq_s_b('\u0BC8')) {
              break lab1;
            }
            this.slice_from('\u0BAE\u0BCD');
            break;
          case 7:
            this.slice_from('\u0BCD');
            break;
          case 8:
            if (this.find_among_b(StemmerTa.a_3) !== 0) {
              break lab1;
            }
            this.slice_del();
            break;
          case 9:
            among_var = this.find_among_b(StemmerTa.a_4);
            switch (among_var) {
              case 1:
                this.slice_del();
                break;
              case 2:
                this.slice_from('\u0BAE\u0BCD');
                break;
            }
            break;
        }
        break lab0;
      }
      this.cursor = this.limit - v_1;
      this.ket = this.cursor;
      if (!this.eq_s_b('\u0BCD')) {
        return false;
      }
      lab2: {
        const v_3 = this.limit - this.cursor;
        lab3: {
          if (this.find_among_b(StemmerTa.a_5) === 0) {
            break lab3;
          }
          const v_4 = this.limit - this.cursor;
          lab4: {
            if (!this.eq_s_b('\u0BCD')) {
              this.cursor = this.limit - v_4;
              break lab4;
            }
            if (this.find_among_b(StemmerTa.a_9) === 0) {
              this.cursor = this.limit - v_4;
              break lab4;
            }
          }
          this.bra = this.cursor;
          this.slice_del();
          break lab2;
        }
        this.cursor = this.limit - v_3;
        lab5: {
          if (this.find_among_b(StemmerTa.a_6) === 0) {
            break lab5;
          }
          this.bra = this.cursor;
          if (!this.eq_s_b('\u0BCD')) {
            break lab5;
          }
          this.slice_del();
          break lab2;
        }
        this.cursor = this.limit - v_3;
        const v_5 = this.limit - this.cursor;
        if (this.find_among_b(StemmerTa.a_7) === 0) {
          return false;
        }
        this.cursor = this.limit - v_5;
        this.bra = this.cursor;
        this.slice_del();
      }
    }
    this.cursor = this.limit_backward;
    return true;
  }

  r_remove_pronoun_prefixes(): boolean {
    this.bra = this.cursor;
    if (this.find_among(StemmerTa.a_10) === 0) {
      return false;
    }
    if (this.find_among(StemmerTa.a_11) === 0) {
      return false;
    }
    if (!this.eq_s('\u0BCD')) {
      return false;
    }
    this.ket = this.cursor;
    this.slice_del();
    this.do_forward(this.r_fix_va_start);
    return true;
  }

  r_remove_plural_suffix(): boolean {
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const among_var = this.find_slice_b(StemmerTa.a_13);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        lab0: {
          const v_1 = this.limit - this.cursor;
          lab1: {
            if (this.find_among_b(StemmerTa.a_12) === 0) {
              break lab1;
            }
            this.slice_from('\u0BC1\u0B99\u0BCD');
            break lab0;
          }
          this.cursor = this.limit - v_1;
          this.slice_from('\u0BCD');
        }
        break;
      case 2:
        this.slice_from('\u0BB2\u0BCD');
        break;
      case 3:
        this.slice_from('\u0BB3\u0BCD');
        break;
      case 4:
        this.slice_del();
        break;
    }
    this.cursor = this.limit_backward;
    return true;
  }

  r_remove_question_suffixes(): boolean {
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const v_1 = this.limit - this.cursor;
    lab0: {
      this.ket = this.cursor;
      if (this.find_among_b(StemmerTa.a_14) === 0) {
        break lab0;
      }
      this.bra = this.cursor;
      this.slice_from('\u0BCD');
    }
    this.cursor = this.limit - v_1;
    this.cursor = this.limit_backward;
    this.r_fix_endings();
    return true;
  }

  r_remove_command_suffixes(): boolean {
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.ket = this.cursor;
    if (this.find_among_b(StemmerTa.a_15) === 0) {
      return false;
    }
    this.bra = this.cursor;
    this.slice_del();
    this.cursor = this.limit_backward;
    return true;
  }

  r_remove_um(): boolean {
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.ket = this.cursor;
    if (!this.eq_s_b('\u0BC1\u0BAE\u0BCD')) {
      return false;
    }
    this.bra = this.cursor;
    this.slice_from('\u0BCD');
    this.cursor = this.limit_backward;
    this.do_forward(this.r_fix_ending);
    return true;
  }

  r_remove_common_word_endings(): boolean {
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const among_var = this.find_slice_b(StemmerTa.a_16);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('\u0BCD');
        break;
      case 2:
        if (this.find_among_b(StemmerTa.a_17) !== 0) {
          return false;
        }
        this.slice_from('\u0BCD');
        break;
      case 3:
        this.slice_del();
        break;
    }
    this.cursor = this.limit_backward;
    this.r_fix_endings();
    return true;
  }

  r_remove_vetrumai_urupukal(): boolean {
    this.B_found_vetrumai_urupu = false;
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    lab0: {
      const v_1 = this.limit - this.cursor;
      lab1: {
        const v_2 = this.limit - this.cursor;
        const among_var = this.find_slice_b(StemmerTa.a_18);
        if (among_var === 0) {
          break lab1;
        }
        switch (among_var) {
          case 1:
            this.slice_del();
            break;
          case 2:
            this.slice_from('\u0BCD');
            break;
          case 3:
            if (this.eq_s_b('\u0BAE')) {
              break lab1;
            }
            this.slice_from('\u0BCD');
            break;
          case 4:
            if (this.current.length < 7) {
              break lab1;
            }
            this.slice_from('\u0BCD');
            break;
          case 5:
            if (this.find_among_b(StemmerTa.a_20) !== 0) {
              break lab1;
            }
            this.slice_from('\u0BCD');
            break;
          case 6:
            if (this.find_among_b(StemmerTa.a_21) !== 0) {
              break lab1;
            }
            this.slice_del();
            break;
          case 7:
            this.slice_from('\u0BBF');
            break;
        }
        this.cursor = this.limit - v_2;
        break lab0;
      }
      this.cursor = this.limit - v_1;
      const v_3 = this.limit - this.cursor;
      this.ket = this.cursor;
      if (!this.eq_s_b('\u0BC8')) {
        return false;
      }
      lab2: {
        const v_4 = this.limit - this.cursor;
        lab3: {
          if (this.find_among_b(StemmerTa.a_22) !== 0) {
            break lab3;
          }
          break lab2;
        }
        this.cursor = this.limit - v_4;
        const v_5 = this.limit - this.cursor;
        if (this.find_among_b(StemmerTa.a_19) === 0) {
          return false;
        }
        if (!this.eq_s_b('\u0BCD')) {
          return false;
        }
        this.cursor = this.limit - v_5;
      }
      this.bra = this.cursor;
      this.slice_from('\u0BCD');
      this.cursor = this.limit - v_3;
    }
    this.B_found_vetrumai_urupu = true;
    const v_6 = this.limit - this.cursor;
    lab4: {
      this.ket = this.cursor;
      if (!this.eq_s_b('\u0BBF\u0BA9\u0BCD')) {
        break lab4;
      }
      this.bra = this.cursor;
      this.slice_from('\u0BCD');
    }
    this.cursor = this.limit - v_6;
    this.cursor = this.limit_backward;
    this.r_fix_endings();
    return true;
  }

  r_remove_tense_suffixes(): boolean {
    for (;;) {
      const v_1 = this.cursor;
      lab0: {
        if (!this.r_remove_tense_suffix()) {
          break lab0;
        }
        continue;
      }
      this.cursor = v_1;
      break;
    }
    return true;
  }

  r_remove_tense_suffix(): boolean {
    this.B_found_a_match = false;
    if (!this.r_has_min_length()) {
      return false;
    }
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    const v_1 = this.limit - this.cursor;
    lab0: {
      const v_2 = this.limit - this.cursor;
      const among_var = this.find_slice_b(StemmerTa.a_23);
      if (among_var === 0) {
        break lab0;
      }
      switch (among_var) {
        case 1:
          this.slice_del();
          break;
        case 2:
          if (this.find_among_b(StemmerTa.a_25) !== 0) {
            break lab0;
          }
          this.slice_del();
          break;
        case 3:
          if (this.find_among_b(StemmerTa.a_26) !== 0) {
            break lab0;
          }
          this.slice_del();
          break;
        case 4:
          if (this.eq_s_b('\u0B9A')) {
            break lab0;
          }
          this.slice_from('\u0BCD');
          break;
        case 5:
          this.slice_from('\u0BCD');
          break;
        case 6: {
          const v_3 = this.limit - this.cursor;
          if (!this.eq_s_b('\u0BCD')) {
            break lab0;
          }
          this.cursor = this.limit - v_3;
          this.slice_del();
          break;
        }
      }
      this.B_found_a_match = true;
      this.cursor = this.limit - v_2;
    }
    this.cursor = this.limit - v_1;
    const v_4 = this.limit - this.cursor;
    lab1: {
      this.ket = this.cursor;
      if (this.find_among_b(StemmerTa.a_24) === 0) {
        break lab1;
      }
      this.bra = this.cursor;
      this.slice_del();
      this.B_found_a_match = true;
    }
    this.cursor = this.limit - v_4;
    this.cursor = this.limit_backward;
    this.r_fix_endings();
    if (!this.B_found_a_match) {
      return false;
    }
    return true;
  }

  innerStem(): boolean {
    this.B_found_vetrumai_urupu = false;
    this.do_forward(this.r_fix_ending);
    if (!this.r_has_min_length()) {
      return false;
    }
    this.do_forward(this.r_remove_question_prefixes);
    this.do_forward(this.r_remove_pronoun_prefixes);
    this.r_remove_question_suffixes();
    this.do_forward(this.r_remove_um);
    this.do_forward(this.r_remove_common_word_endings);
    this.do_forward(this.r_remove_vetrumai_urupukal);
    this.do_forward(this.r_remove_plural_suffix);
    this.do_forward(this.r_remove_command_suffixes);
    this.do_forward(this.r_remove_tense_suffixes);
    return true;
  }

  static a_0 = Among.table<StemmerTa>(`
    வு,-1,3 வூ,-1,4 வொ,-1,2 வோ,-1,1
  `);

  static a_1 = Among.table<StemmerTa>(`
    ந்த,-1,1 ய,-1,1 வ,-1,1 னு,-1,8 ுக்,-1,7 ுக்க்,-1,7 ட்க்,-1,3 ற்க்,-1,4
    ங்,-1,9 ட்ட்,-1,5 த்த்,-1,6 ந்த்,-1,1 ந்,-1,1 ட்ப்,-1,3 ய்,-1,2 ன்ற்,-1,4
    வ்,-1,1
  `);

  static a_2 = Among.table<StemmerTa>(`
    ி,-1,-1 ீ,-1,-1 ை,-1,-1
  `);

  static a_3 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1
  `);

  static a_4: Among<StemmerTa>[] = [
    new Among('', -1, 2),
    new Among('\u0BC8', 0, 1),
    new Among('\u0BCD', 0, 1),
  ];

  static a_5 = Among.table<StemmerTa>(`
    க,-1,-1 ச,-1,-1 ட,-1,-1 த,-1,-1 ப,-1,-1 ற,-1,-1
  `);

  static a_6 = Among.table<StemmerTa>(`
    ஞ,-1,-1 ண,-1,-1 ந,-1,-1 ன,-1,-1 ம,-1,-1 ய,-1,-1 ர,-1,-1 ல,-1,-1 ள,-1,-1
    ழ,-1,-1 வ,-1,-1
  `);

  static a_7 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1 ்,-1,-1
  `);

  static a_8 = Among.table<StemmerTa>(`
    க,-1,-1 ங,-1,-1 ச,-1,-1 ஞ,-1,-1 த,-1,-1 ந,-1,-1 ப,-1,-1 ம,-1,-1 ய,-1,-1
    வ,-1,-1
  `);

  static a_9 = Among.table<StemmerTa>(`
    க,-1,-1 ச,-1,-1 ட,-1,-1 த,-1,-1 ப,-1,-1 ற,-1,-1
  `);

  static a_10 = Among.table<StemmerTa>(`
    அ,-1,-1 இ,-1,-1 உ,-1,-1
  `);

  static a_11 = Among.table<StemmerTa>(`
    க,-1,-1 ங,-1,-1 ச,-1,-1 ஞ,-1,-1 த,-1,-1 ந,-1,-1 ப,-1,-1 ம,-1,-1 ய,-1,-1
    வ,-1,-1
  `);

  static a_12 = Among.table<StemmerTa>(`
    க,-1,-1 ச,-1,-1 ட,-1,-1 த,-1,-1 ப,-1,-1 ற,-1,-1
  `);

  static a_13 = Among.table<StemmerTa>(`
    கள்,-1,4 ுங்கள்,0,1 ட்கள்,0,3 ற்கள்,0,2
  `);

  static a_14 = Among.table<StemmerTa>(`
    ா,-1,-1 ே,-1,-1 ோ,-1,-1
  `);

  static a_15 = Among.table<StemmerTa>(`
    பி,-1,-1 வி,-1,-1
  `);

  static a_16 = Among.table<StemmerTa>(`
    பட்ட,-1,3 பட்டண,-1,3 தான,-1,3 படிதான,2,3 ென,-1,1 ாகிய,-1,1 குரிய,-1,3
    ுடைய,-1,1 ல்ல,-1,2 ுள்ள,-1,1 ாகி,-1,1 படி,-1,3 ின்றி,-1,1 பற்றி,-1,3
    படு,-1,3 விடு,-1,3 பட்டு,-1,3 விட்டு,-1,3 பட்டது,-1,3 ென்று,-1,1 ுடை,-1,1
    ில்லை,-1,1 ுடன்,-1,1 ிடம்,-1,1 ெல்லாம்,-1,3 ெனும்,-1,1
  `);

  static a_17 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1
  `);

  static a_18 = Among.table<StemmerTa>(`
    விட,-1,2 ீ,-1,7 ொடு,-1,2 ோடு,-1,2 து,-1,6 ிருந்து,4,2 ின்று,-1,2 ுடை,-1,2
    னை,-1,1 கண்,-1,1 ின்,-1,3 முன்,-1,1 ிடம்,-1,4 ிற்,-1,2 மேற்,-1,1 ல்,-1,5
    ாமல்,15,2 ால்,15,2 ில்,15,2 மேல்,15,1 ுள்,-1,2 கீழ்,-1,1
  `);

  static a_19 = Among.table<StemmerTa>(`
    க,-1,-1 ச,-1,-1 ட,-1,-1 த,-1,-1 ப,-1,-1 ற,-1,-1
  `);

  static a_20 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1
  `);

  static a_21 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1
  `);

  static a_22 = Among.table<StemmerTa>(`
    க,-1,-1 ச,-1,-1 ட,-1,-1 த,-1,-1 ப,-1,-1 ற,-1,-1
  `);

  static a_23 = Among.table<StemmerTa>(`
    க,-1,1 த,-1,1 ன,-1,1 ப,-1,1 ய,-1,1 ா,-1,5 கு,-1,6 படு,-1,1 து,-1,3
    ிற்று,-1,1 னை,-1,1 வை,-1,1 னன்,-1,1 பன்,-1,1 வன்,-1,2 ான்,-1,4 னான்,15,1
    மின்,-1,1 னென்,-1,1 ேன்,-1,5 னம்,-1,1 பம்,-1,1 ாம்,-1,5 கும்,-1,1 டும்,-1,5
    தும்,-1,1 றும்,-1,1 ெம்,-1,5 ேம்,-1,5 ோம்,-1,5 ாய்,-1,5 னர்,-1,1 பர்,-1,1
    ீயர்,-1,5 வர்,-1,1 ார்,-1,5 னார்,35,1 மார்,35,1 கொண்டிர்,-1,1 னிர்,-1,5
    ீர்,-1,5 னள்,-1,1 பள்,-1,1 வள்,-1,1 ாள்,-1,5 னாள்,44,1
  `);

  static a_24 = Among.table<StemmerTa>(`
    கிற,-1,-1 கின்ற,-1,-1 ாநின்ற,-1,-1 கிற்,-1,-1 கின்ற்,-1,-1 ாநின்ற்,-1,-1
  `);

  static a_25 = Among.table<StemmerTa>(`
    அ,-1,-1 ஆ,-1,-1 இ,-1,-1 ஈ,-1,-1 உ,-1,-1 ஊ,-1,-1 எ,-1,-1 ஏ,-1,-1 ஐ,-1,-1
    ஒ,-1,-1 ஓ,-1,-1 ஔ,-1,-1
  `);

  static a_26 = Among.table<StemmerTa>(`
    ா,-1,-1 ி,-1,-1 ீ,-1,-1 ு,-1,-1 ூ,-1,-1 ெ,-1,-1 ே,-1,-1 ை,-1,-1
  `);
}

export default StemmerTa;
