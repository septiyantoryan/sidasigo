import { JenisRiset } from "@prisma/client";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

const SEED_MARKER = "[seed]";

type SeedItem = {
  judulKajian: string;
  timPeneliti: string;
  tahunPublikasi: number;
  jenis: JenisRiset;
};

const items: SeedItem[] = [
  { judulKajian: "Pemetaan Potensi Pertanian Padi di Kabupaten Grobogan", timPeneliti: "Dr. Andi Wijaya, Budi Santoso M.Si", tahunPublikasi: 2024, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Ketahanan Pangan Daerah Berbasis Komoditas Jagung", timPeneliti: "Prof. Sri Lestari, Rudi Hartono", tahunPublikasi: 2023, jenis: JenisRiset.Penelitian },
  { judulKajian: "Analisis Dampak Irigasi Waduk Kedungombo terhadap Produktivitas Sawah", timPeneliti: "Dr. Maya Putri, Slamet Riyadi M.T", tahunPublikasi: 2022, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Strategi Penurunan Angka Stunting di Wilayah Pedesaan", timPeneliti: "dr. Dewi Anggraini, Intan Permata S.Gz", tahunPublikasi: 2024, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pengembangan Energi Biogas dari Limbah Peternakan Sapi", timPeneliti: "Fajar Nugroho M.Eng, Hendra Wijaya", tahunPublikasi: 2023, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Tata Kelola Pemerintahan Desa Digital", timPeneliti: "Dr. Reza Maulana, Lina Marlina M.AP", tahunPublikasi: 2021, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Adaptasi Varietas Padi Tahan Kekeringan", timPeneliti: "Prof. Bambang Sutrisno, Wahyuni Indah", tahunPublikasi: 2025, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Pengembangan Destinasi Wisata Bledug Kuwu", timPeneliti: "Dr. Nadia Salsabila, Galih Ramadhan M.Par", tahunPublikasi: 2022, jenis: JenisRiset.Penelitian },
  { judulKajian: "Analisis Efektivitas Program Bantuan Sosial Tunai", timPeneliti: "Wati Suryani M.Si, Agus Setiawan", tahunPublikasi: 2023, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Pengelolaan Sampah Terpadu Berbasis Masyarakat", timPeneliti: "Dr. Putri Handayani, Dimas Arifin", tahunPublikasi: 2024, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Kualitas Air Sungai Lusi untuk Irigasi", timPeneliti: "Prof. Sinta Dewi, Yusuf Hamdani M.Sc", tahunPublikasi: 2021, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Peningkatan Daya Saing UMKM Lokal", timPeneliti: "Dr. Rizki Fadhilah, Bayu Anggara M.M", tahunPublikasi: 2023, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pemanfaatan Lahan Kering untuk Tanaman Hortikultura", timPeneliti: "Dina Oktavia M.P, Ahmad Syahputra", tahunPublikasi: 2022, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Mitigasi Bencana Banjir di Daerah Aliran Sungai", timPeneliti: "Dr. Sari Wulandari, Eko Prasetyo M.T", tahunPublikasi: 2024, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Inovasi Pupuk Organik dari Limbah Pertanian", timPeneliti: "Prof. Yoga Pratama, Melati Kusuma", tahunPublikasi: 2023, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Literasi Digital Masyarakat Pedesaan", timPeneliti: "Dr. Hadi Susanto, Rina Marlina M.Pd", tahunPublikasi: 2025, jenis: JenisRiset.Penelitian },
  { judulKajian: "Analisis Potensi Ekonomi Kreatif Berbasis Kearifan Lokal", timPeneliti: "Nurul Hidayah M.Sn, Faisal Rahman", tahunPublikasi: 2022, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Sistem Pelayanan Administrasi Kependudukan", timPeneliti: "Dr. Teguh Wibowo, Rafif Akbar M.AP", tahunPublikasi: 2021, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pengembangan Bibit Unggul Kedelai Lokal", timPeneliti: "Prof. Dita Amelia, Wawan Setiawan", tahunPublikasi: 2024, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Pemberdayaan Perempuan dalam Ekonomi Keluarga", timPeneliti: "Dr. Cahya Ningrum, Andre Wijaya M.Si", tahunPublikasi: 2023, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Teknologi Pascapanen untuk Mengurangi Susut Hasil", timPeneliti: "Susi Susanti M.P, Herman Kusnadi", tahunPublikasi: 2022, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Optimalisasi Pendapatan Asli Daerah", timPeneliti: "Dr. Bambang Sutrisno, Rara Maharani M.Ak", tahunPublikasi: 2023, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pengendalian Hama Terpadu pada Tanaman Padi", timPeneliti: "Prof. Wahyudi, Tasya Amanda M.Si", tahunPublikasi: 2025, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Pengembangan Sistem Transportasi Publik Daerah", timPeneliti: "Dr. Rohmat, Supardi M.T", tahunPublikasi: 2021, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Diversifikasi Pangan Lokal Non-Beras", timPeneliti: "Sulastri M.Gz, Dika Setiawan", tahunPublikasi: 2024, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Dampak Perubahan Iklim terhadap Pola Tanam", timPeneliti: "Dr. Murni Rahayu, Sukamto M.Sc", tahunPublikasi: 2023, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pemanfaatan Teknologi IoT untuk Pertanian Presisi", timPeneliti: "Prof. Bima Sakti, Dian Permata M.Kom", tahunPublikasi: 2024, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Peningkatan Mutu Pendidikan Dasar di Daerah 3T", timPeneliti: "Dr. Ningsih, Juminten M.Pd", tahunPublikasi: 2022, jenis: JenisRiset.Penelitian },
  { judulKajian: "Riset Pengolahan Air Bersih Skala Komunitas", timPeneliti: "Sukini M.T, Paijo", tahunPublikasi: 2023, jenis: JenisRiset.RisetKajian },
  { judulKajian: "Kajian Strategi Pengembangan Industri Pengolahan Hasil Tani", timPeneliti: "Dr. Fani Rahayu, Wagiman M.M", tahunPublikasi: 2025, jenis: JenisRiset.Penelitian },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // Idempotent: hapus seed lama (ditandai prefiks [seed] di abstrak).
  await prisma.riset.deleteMany({
    where: { abstrak: { startsWith: SEED_MARKER } },
  });

  for (const item of items) {
    const slug = slugify(item.judulKajian);
    await prisma.riset.create({
      data: {
        judulKajian: item.judulKajian,
        timPeneliti: item.timPeneliti,
        tahunPublikasi: item.tahunPublikasi,
        abstrak: `${SEED_MARKER} Dokumen ${item.jenis.toLowerCase()} yang membahas ${item.judulKajian.toLowerCase()} di Kabupaten Grobogan. Penelitian ini menyajikan temuan, analisis, dan rekomendasi kebijakan untuk mendukung pembangunan dan inovasi daerah.`,
        filePath: `/api/public-files/seeds/riset/${slug}.pdf`,
        jenis: item.jenis,
      },
    });
  }

  const risetKajian = items.filter((i) => i.jenis === JenisRiset.RisetKajian).length;
  const penelitian = items.filter((i) => i.jenis === JenisRiset.Penelitian).length;

  console.log(`Seed riset: ${items.length} row (Riset/Kajian=${risetKajian}, Penelitian=${penelitian}).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
