/**
 * The stemmers that are written in Snowball: each names where its program is,
 * what it says of its origin, and the TypeScript file made from it.
 */
import { ARABIC, CZECH, SPANISH, type Edit } from './edits.ts';
import { generate } from './generate.ts';
import { parseSource } from './sbl.ts';
import { loadProgram, type Source } from './sources.ts';

export interface Stemmer {
  /** Where the Snowball program is, and our changes to it. */
  source: Source;
  /** What the header of the generated file says the program is. */
  origin: string;
  /** The TypeScript file to write. */
  out: string;
  className: string;
  name: string;
  /** Character set of the numbers of the stringdefs, when it is not Unicode. */
  charset?: string;
}

/** A version of Snowball that does not change: a tag or a commit. */
interface Release {
  ref: string;
  label: string;
}

/** The version the stemmers were generated from before. */
const V2_2_0: Release = { ref: 'v2.2.0', label: 'Snowball 2.2.0' };
/** The newest, for the languages that 2.2.0 does not have. */
const HEAD: Release = {
  ref: '411550ddb8ea049bc3e8d39bf56454e8a9ef0be6',
  label: 'Snowball at commit 411550d',
};

/**
 * A stemmer made from a program of Snowball, where the package of the language
 * is `lang-<code>` (English and Spanish keep their own class beside the
 * generated one, so theirs is `SnowballStemmer<Code>`).
 */
function snowball(
  code: string,
  language: string,
  release: Release,
  sha256: string,
  { edits }: { edits?: Edit[] } = {}
): Stemmer {
  const own = code === 'en' || code === 'es';
  const pack = code === 'en' ? 'lang-en-min' : `lang-${code}`;
  const suffix = code[0].toUpperCase() + code[1];
  const url = `https://raw.githubusercontent.com/snowballstem/snowball/${release.ref}/algorithms/${language}.sbl`;
  return {
    source: { url, sha256, edits },
    origin: `${language}.sbl of ${release.label}${edits ? ' with our changes (tools/snowball/edits.ts)' : ''}`,
    out: `packages/${pack}/src/stemmer-${code}${own ? '.generated' : ''}.ts`,
    className: `${own ? 'SnowballStemmer' : 'Stemmer'}${suffix}`,
    name: `stemmer-${code}`,
  };
}

export const STEMMERS: Stemmer[] = [
  snowball(
    'en',
    'english',
    V2_2_0,
    '10493352edae52d38759a442168e929635d9e731e444b1bdc79eb30e2da60cb1'
  ),
  snowball(
    'ca',
    'catalan',
    HEAD,
    '4cc048a2bab5a619f71266d6efcbc189761f0794d4a83d3797788eded81fef9c'
  ),
  snowball(
    'eu',
    'basque',
    HEAD,
    'f11a00f12105dba9bcf8f57cf4dd63bf65d1d0528a72b86e4a8f5d55bdd3fd03'
  ),
  snowball(
    'ga',
    'irish',
    HEAD,
    '54481cdd8dcf849ed306c39ea1651e7ca96a39498ffb88b40d7568772a1bec3f'
  ),
  snowball(
    'hy',
    'armenian',
    HEAD,
    '3fcb6fb60a8722469ad95b49737a206790156efd76add087733209a278befd71'
  ),
  snowball(
    'id',
    'indonesian',
    HEAD,
    '1900b5d9a2d9c616b1249f75f731c12915c98a0db6be2ffd38fef5066573c71d'
  ),
  snowball(
    'ne',
    'nepali',
    HEAD,
    'fa2f63d722259a9b11729409b0fae4ab46ba36e9def696939db84bc8b76a39bf'
  ),
  snowball(
    'ta',
    'tamil',
    HEAD,
    '7d14bb3e9ef6932f5a74dfca6732e0443c0272f9cb84c780a028d8d88518cbb6'
  ),
  snowball(
    'tr',
    'turkish',
    HEAD,
    'bbfa3db376246ec52c11d78275ce271baa3d01b46f10e654688c855e06047e44'
  ),
  snowball(
    'es',
    'spanish',
    V2_2_0,
    'f75c503f8c669da762b1e7692ff18e31c3858b20e77a8937546b3870b0585cfe',
    { edits: SPANISH }
  ),
  snowball(
    'ar',
    'arabic',
    V2_2_0,
    'ff7495f0ce6738f29684c66399c32c018eb3f25a01c30bd2e69180db484b8f56',
    { edits: ARABIC }
  ),
  snowball(
    'da',
    'danish',
    V2_2_0,
    '03e163d32c78f976afc6455f287083cc78b339afa271d73b575e711c04cacc19'
  ),
  snowball(
    'de',
    'german',
    V2_2_0,
    'da77e92ed1b84507204e307ccfc4df1e163108994e987a82aa9e63e8cbc89d78'
  ),
  snowball(
    'fi',
    'finnish',
    V2_2_0,
    '917156c9da56a18b1e81b8d8051bcf2d1ea58f5dc09b35a38dbff8d74ae7920b'
  ),
  snowball(
    'fr',
    'french',
    V2_2_0,
    '119074de7759bbbb3e1472382dac93b6017426732034bd85962635cc5a707e5b'
  ),
  snowball(
    'hu',
    'hungarian',
    V2_2_0,
    'b3a1a2c5121b6522054f1191c1627e34afd73baa7ec448af2095ea6e14fe1df3'
  ),
  snowball(
    'it',
    'italian',
    V2_2_0,
    '5046fbe37e26938a32d7782266479358e3e61cd24831afb0eb0c2573421381c6'
  ),
  snowball(
    'lt',
    'lithuanian',
    V2_2_0,
    'a03da5b6336c7373eb330ff9014536c4f733512d7830512c7c4d9236fefe23ea'
  ),
  snowball(
    'nl',
    'dutch',
    V2_2_0,
    '2552f3db19f94bb352df84f31be5db25103bdb5d6577932be6ea4220ca7910ee'
  ),
  snowball(
    'no',
    'norwegian',
    V2_2_0,
    '7cfa1644a3fce7b14e027a790281bcf2ac84d198845b7ef06ad8a3236c23e69f'
  ),
  snowball(
    'pt',
    'portuguese',
    V2_2_0,
    '5709ba2a1ca960ffd2a53185ed53bef03cd42de74d869ed94493917fe1eb8135'
  ),
  snowball(
    'ro',
    'romanian',
    V2_2_0,
    '2bcdf2d072d0a718652c22f9c1e4e5636e37c534467bfd6f31ecbdcd72f58ca0'
  ),
  snowball(
    'ru',
    'russian',
    V2_2_0,
    'f1b54ea9315b434c4595529e95dd6ad024490785aa56d5013de988a0d3d27fc9'
  ),
  snowball(
    'sr',
    'serbian',
    V2_2_0,
    '08d8bc64c088ba8fbfe25be2c931150d5883aee38de39019b4229cab95489223'
  ),
  snowball(
    'sv',
    'swedish',
    V2_2_0,
    'cf877514abf1f67f1f91ac2c50d3b0f06bdb7006a514e4976c96c5fc8f5622be'
  ),
  {
    source: {
      url: 'https://raw.githubusercontent.com/dundalek/czech-stemmer/dd88172be558da5dccec97972a5b34a41f5a827b/original/czech-do.sbl.txt',
      sha256:
        'a3e606b35d6aa7e73186da9f232b8db49bde2e868337880829848d3e6ed1f91f',
      edits: CZECH,
    },
    origin:
      "czech-do.sbl of Jim O'Regan (2012), for the stemmer of Ljiljana Dolamic",
    out: 'packages/lang-cs/src/stemmer-cs.ts',
    className: 'StemmerCs',
    name: 'stemmer-cs',
    charset: 'iso-8859-2',
  },
];

/** The TypeScript that the tool writes for a stemmer. */
export async function render(stemmer: Stemmer): Promise<string> {
  const text = await loadProgram(stemmer.source);
  return generate(
    parseSource(text, stemmer.source.url, { charset: stemmer.charset }),
    {
      className: stemmer.className,
      name: stemmer.name,
      source: stemmer.origin,
      inheritRegions: true,
    }
  );
}
