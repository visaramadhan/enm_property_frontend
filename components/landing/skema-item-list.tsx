import { urlAbsolut } from "@/lib/seo";

interface EntriItem {
  slug: string;
  title: string;
}

/**
 * Menyuntikkan skema JSON-LD `ItemList` untuk katalog properti.
 *
 * Urutan `position` disusun 1:1 mengikuti urutan larik yang diberikan, sehingga
 * sinyal ke Googlebot selaras dengan algoritma pengurutan internal backend
 * (`standa_seo_web.txt` bagian 1.B dan 4.B).
 */
export function SkemaItemList({ nama, properti }: { nama: string; properti: EntriItem[] }) {
  if (properti.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: nama,
    numberOfItems: properti.length,
    itemListElement: properti.map((item, indeks) => ({
      "@type": "ListItem",
      position: indeks + 1,
      url: urlAbsolut(`/katalog/${item.slug}`),
      name: item.title,
    })),
  };

  // Karakter "<" di-escape agar teks dari CMS tidak dapat menutup tag <script>.
  const isi = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: isi }} />;
}
