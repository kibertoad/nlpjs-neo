import { Among, SnowballStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * Stemmer written by tools/snowball from lithuanian.sbl of Snowball 2.2.0. Do not edit it by hand:
 * change the Snowball program and generate it again.
 */
class StemmerLt extends SnowballStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-lt';
    this.I_p1 = 0;
  }

  r_step1(): boolean {
    if (this.cursor < this.I_p1) {
      return false;
    }
    const v_1 = this.limit_backward;
    this.limit_backward = this.I_p1;
    if (this.find_slice_b(StemmerLt.a_0) === 0) {
      this.limit_backward = v_1;
      return false;
    }
    this.limit_backward = v_1;
    if (!this.r_R1()) {
      return false;
    }
    this.slice_del();
    return true;
  }

  r_step2(): boolean {
    for (;;) {
      const v_1 = this.limit - this.cursor;
      lab0: {
        if (this.cursor < this.I_p1) {
          break lab0;
        }
        const v_2 = this.limit_backward;
        this.limit_backward = this.I_p1;
        if (this.find_slice_b(StemmerLt.a_1) === 0) {
          this.limit_backward = v_2;
          break lab0;
        }
        this.limit_backward = v_2;
        this.slice_del();
        continue;
      }
      this.cursor = this.limit - v_1;
      break;
    }
    return true;
  }

  r_fix_conflicts(): boolean {
    const among_var = this.find_slice_b(StemmerLt.a_2);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('ait\u0117');
        break;
      case 2:
        this.slice_from('uot\u0117');
        break;
      case 3:
        this.slice_from('\u0117jimas');
        break;
      case 4:
        this.slice_from('esys');
        break;
      case 5:
        this.slice_from('asys');
        break;
      case 6:
        this.slice_from('avimas');
        break;
      case 7:
        this.slice_from('ojimas');
        break;
      case 8:
        this.slice_from('okat\u0117');
        break;
    }
    return true;
  }

  r_fix_chdz(): boolean {
    const among_var = this.find_slice_b(StemmerLt.a_3);
    if (among_var === 0) {
      return false;
    }
    switch (among_var) {
      case 1:
        this.slice_from('t');
        break;
      case 2:
        this.slice_from('d');
        break;
    }
    return true;
  }

  r_fix_gd(): boolean {
    this.ket = this.cursor;
    if (!this.eq_s_b('gd')) {
      return false;
    }
    this.bra = this.cursor;
    this.slice_from('g');
    return true;
  }

  innerStem(): boolean {
    this.I_p1 = this.limit;
    const v_1 = this.cursor;
    lab0: {
      const v_2 = this.cursor;
      lab1: {
        const v_3 = this.cursor;
        if (!this.eq_s('a')) {
          this.cursor = v_2;
          break lab1;
        }
        this.cursor = v_3;
        if (this.current.length <= 6) {
          this.cursor = v_2;
          break lab1;
        }
        if (this.cursor + 1 > this.limit) {
          this.cursor = v_2;
          break lab1;
        }
        this.cursor += 1;
      }
      if (!this.gopast_in_grouping(StemmerLt.g_v, 97, 371)) {
        break lab0;
      }
      if (!this.gopast_out_grouping(StemmerLt.g_v, 97, 371)) {
        break lab0;
      }
      this.I_p1 = this.cursor;
    }
    this.cursor = v_1;
    this.limit_backward = this.cursor;
    this.cursor = this.limit;
    this.do_backward(this.r_fix_conflicts);
    this.do_backward(this.r_step1);
    this.do_backward(this.r_fix_chdz);
    this.do_backward(this.r_step2);
    this.do_backward(this.r_fix_chdz);
    this.do_backward(this.r_fix_gd);
    this.cursor = this.limit_backward;
    return true;
  }

  static g_v: number[] = [
    17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 64, 1,
    0, 64, 0, 0, 0, 0, 0, 0, 0, 4, 4,
  ];

  static a_0 = Among.table<StemmerLt>(`
    a,-1,-1 ia,0,-1 eria,1,-1 osna,0,-1 iosna,3,-1 uosna,3,-1 iuosna,5,-1
    ysna,0,-1 ėsna,0,-1 e,-1,-1 ie,9,-1 enie,10,-1 erie,10,-1 oje,9,-1
    ioje,13,-1 uje,9,-1 iuje,15,-1 yje,9,-1 enyje,17,-1 eryje,17,-1 ėje,9,-1
    ame,9,-1 iame,21,-1 sime,9,-1 ome,9,-1 ėme,9,-1 tumėme,25,-1 ose,9,-1
    iose,27,-1 uose,27,-1 iuose,29,-1 yse,9,-1 enyse,31,-1 eryse,31,-1 ėse,9,-1
    ate,9,-1 iate,35,-1 ite,9,-1 kite,37,-1 site,37,-1 ote,9,-1 tute,9,-1
    ėte,9,-1 tumėte,42,-1 i,-1,-1 ai,44,-1 iai,45,-1 eriai,46,-1 ei,44,-1
    tumei,48,-1 ki,44,-1 imi,44,-1 erimi,51,-1 umi,44,-1 iumi,53,-1 si,44,-1
    asi,55,-1 iasi,56,-1 esi,55,-1 iesi,58,-1 siesi,59,-1 isi,55,-1 aisi,61,-1
    eisi,61,-1 tumeisi,63,-1 uisi,61,-1 osi,55,-1 ėjosi,66,-1 uosi,66,-1
    iuosi,68,-1 siuosi,69,-1 usi,55,-1 ausi,71,-1 čiausi,72,-1 ąsi,55,-1
    ėsi,55,-1 ųsi,55,-1 tųsi,76,-1 ti,44,-1 enti,78,-1 inti,78,-1 oti,78,-1
    ioti,81,-1 uoti,81,-1 iuoti,83,-1 auti,78,-1 iauti,85,-1 yti,78,-1 ėti,78,-1
    telėti,88,-1 inėti,88,-1 terėti,88,-1 ui,44,-1 iui,92,-1 eniui,93,-1
    oj,-1,-1 ėj,-1,-1 k,-1,-1 am,-1,-1 iam,98,-1 iem,-1,-1 im,-1,-1 sim,101,-1
    om,-1,-1 tum,-1,-1 ėm,-1,-1 tumėm,105,-1 an,-1,-1 on,-1,-1 ion,108,-1
    un,-1,-1 iun,110,-1 ėn,-1,-1 o,-1,-1 io,113,-1 enio,114,-1 ėjo,113,-1
    uo,113,-1 s,-1,-1 as,118,-1 ias,119,-1 es,118,-1 ies,121,-1 is,118,-1
    ais,123,-1 iais,124,-1 tumeis,123,-1 imis,123,-1 enimis,127,-1 omis,123,-1
    iomis,129,-1 umis,123,-1 ėmis,123,-1 enis,123,-1 asis,123,-1 ysis,123,-1
    ams,118,-1 iams,136,-1 iems,118,-1 ims,118,-1 enims,139,-1 erims,139,-1
    oms,118,-1 ioms,142,-1 ums,118,-1 ėms,118,-1 ens,118,-1 os,118,-1 ios,147,-1
    uos,147,-1 iuos,149,-1 ers,118,-1 us,118,-1 aus,152,-1 iaus,153,-1
    ius,152,-1 ys,118,-1 enys,156,-1 erys,156,-1 ąs,118,-1 iąs,159,-1 ės,118,-1
    amės,161,-1 iamės,162,-1 imės,161,-1 kimės,164,-1 simės,164,-1 omės,161,-1
    ėmės,161,-1 tumėmės,168,-1 atės,161,-1 iatės,170,-1 sitės,161,-1 otės,161,-1
    ėtės,161,-1 tumėtės,174,-1 įs,118,-1 ūs,118,-1 tųs,118,-1 at,-1,-1
    iat,179,-1 it,-1,-1 sit,181,-1 ot,-1,-1 ėt,-1,-1 tumėt,184,-1 u,-1,-1
    au,186,-1 iau,187,-1 čiau,188,-1 iu,186,-1 eniu,190,-1 siu,190,-1 y,-1,-1
    ą,-1,-1 ią,194,-1 ė,-1,-1 ę,-1,-1 į,-1,-1 enį,198,-1 erį,198,-1 ų,-1,-1
    ių,201,-1 erų,201,-1
  `);

  static a_1 = Among.table<StemmerLt>(`
    ing,-1,-1 aj,-1,-1 iaj,1,-1 iej,-1,-1 oj,-1,-1 ioj,4,-1 uoj,4,-1 iuoj,6,-1
    auj,-1,-1 ąj,-1,-1 iąj,9,-1 ėj,-1,-1 ųj,-1,-1 iųj,12,-1 ok,-1,-1 iok,14,-1
    iuk,-1,-1 uliuk,16,-1 učiuk,16,-1 išk,-1,-1 iul,-1,-1 yl,-1,-1 ėl,-1,-1
    am,-1,-1 dam,23,-1 jam,23,-1 zgan,-1,-1 ain,-1,-1 esn,-1,-1 op,-1,-1
    iop,29,-1 ias,-1,-1 ies,-1,-1 ais,-1,-1 iais,33,-1 os,-1,-1 ios,35,-1
    uos,35,-1 iuos,37,-1 aus,-1,-1 iaus,39,-1 ąs,-1,-1 iąs,41,-1 ęs,-1,-1
    utėait,-1,-1 ant,-1,-1 iant,45,-1 siant,46,-1 int,-1,-1 ot,-1,-1 uot,49,-1
    iuot,50,-1 yt,-1,-1 ėt,-1,-1 ykšt,-1,-1 iau,-1,-1 dav,-1,-1 sv,-1,-1
    šv,-1,-1 ykšč,-1,-1 ę,-1,-1 ėję,60,-1
  `);

  static a_2 = Among.table<StemmerLt>(`
    ojime,-1,7 ėjime,-1,3 avime,-1,6 okate,-1,8 aite,-1,1 uote,-1,2 asius,-1,5
    okatės,-1,8 aitės,-1,1 uotės,-1,2 esiu,-1,4
  `);

  static a_3 = Among.table<StemmerLt>(`
    č,-1,1 dž,-1,2
  `);
}

export default StemmerLt;
