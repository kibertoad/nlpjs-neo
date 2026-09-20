/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { LangAr } from '@nlpjs-neo/lang-ar';
import { LangBn } from '@nlpjs-neo/lang-bn';
import { LangCa } from '@nlpjs-neo/lang-ca';
import { LangCs } from '@nlpjs-neo/lang-cs';
import { LangDa } from '@nlpjs-neo/lang-da';
import { LangDe } from '@nlpjs-neo/lang-de';
import { LangEl } from '@nlpjs-neo/lang-el';
import { LangEn } from '@nlpjs-neo/lang-en';
import { LangEs } from '@nlpjs-neo/lang-es';
import { LangEu } from '@nlpjs-neo/lang-eu';
import { LangFa } from '@nlpjs-neo/lang-fa';
import { LangFi } from '@nlpjs-neo/lang-fi';
import { LangFr } from '@nlpjs-neo/lang-fr';
import { LangGa } from '@nlpjs-neo/lang-ga';
import { LangGl } from '@nlpjs-neo/lang-gl';
import { LangHi } from '@nlpjs-neo/lang-hi';
import { LangHu } from '@nlpjs-neo/lang-hu';
import { LangHy } from '@nlpjs-neo/lang-hy';
import { LangId } from '@nlpjs-neo/lang-id';
import { LangIt } from '@nlpjs-neo/lang-it';
import { LangJa } from '@nlpjs-neo/lang-ja';
import { LangKo } from '@nlpjs-neo/lang-ko';
import { LangLt } from '@nlpjs-neo/lang-lt';
import { LangMs } from '@nlpjs-neo/lang-ms';
import { LangNe } from '@nlpjs-neo/lang-ne';
import { LangNl } from '@nlpjs-neo/lang-nl';
import { LangNo } from '@nlpjs-neo/lang-no';
import { LangPl } from '@nlpjs-neo/lang-pl';
import { LangPt } from '@nlpjs-neo/lang-pt';
import { LangRo } from '@nlpjs-neo/lang-ro';
import { LangRu } from '@nlpjs-neo/lang-ru';
import { LangSl } from '@nlpjs-neo/lang-sl';
import { LangSr } from '@nlpjs-neo/lang-sr';
import { LangSv } from '@nlpjs-neo/lang-sv';
import { LangTa } from '@nlpjs-neo/lang-ta';
import { LangTh } from '@nlpjs-neo/lang-th';
import { LangTl } from '@nlpjs-neo/lang-tl';
import { LangTr } from '@nlpjs-neo/lang-tr';
import { LangUk } from '@nlpjs-neo/lang-uk';
import { LangZh } from '@nlpjs-neo/lang-zh';

class LangAll {
  register(container) {
    container.use(LangAr);
    container.use(LangBn);
    container.use(LangCa);
    container.use(LangCs);
    container.use(LangDa);
    container.use(LangDe);
    container.use(LangEl);
    container.use(LangEn);
    container.use(LangEs);
    container.use(LangEu);
    container.use(LangFa);
    container.use(LangFi);
    container.use(LangFr);
    container.use(LangGa);
    container.use(LangGl);
    container.use(LangHi);
    container.use(LangHu);
    container.use(LangHy);
    container.use(LangId);
    container.use(LangIt);
    container.use(LangJa);
    container.use(LangKo);
    container.use(LangLt);
    container.use(LangMs);
    container.use(LangNe);
    container.use(LangNl);
    container.use(LangNo);
    container.use(LangPl);
    container.use(LangPt);
    container.use(LangRo);
    container.use(LangRu);
    container.use(LangSl);
    container.use(LangSr);
    container.use(LangSv);
    container.use(LangTa);
    container.use(LangTh);
    container.use(LangTl);
    container.use(LangTr);
    container.use(LangUk);
    container.use(LangZh);
  }
}

export default LangAll;
