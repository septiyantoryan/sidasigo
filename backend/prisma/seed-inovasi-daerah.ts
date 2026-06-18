import {
  JenisInovasi,
  type Prisma,
  Status,
} from "@prisma/client";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

const SEED_MARKER = "[seed]";

function rancang(text: string): string {
  const base = `${text} `;
  let result = base;
  while (result.length < 320) {
    result += "Inovasi ini dirancang untuk meningkatkan kualitas pelayanan publik di Kabupaten Grobogan melalui pemanfaatan teknologi tepat guna dan kolaborasi lintas sektor. ";
  }
  return result.trim();
}

const sampleIndikator: Prisma.IndikatorInovasiDaerahCreateWithoutInovasiDaerahInput = {
  regulasi: "seeds/inovasi/regulasi.pdf",
  sdm: "seeds/inovasi/sdm.pdf",
  dukunganAnggaran: "seeds/inovasi/anggaran.pdf",
  alatKerja: "seeds/inovasi/alat-kerja.pdf",
  bimtek: "seeds/inovasi/bimtek.pdf",
  integrasiRKPD: "seeds/inovasi/rkpd.pdf",
  aktorInovasi: "seeds/inovasi/aktor.pdf",
  pelaksana: "seeds/inovasi/pelaksana.pdf",
  jejaringInovasi: "seeds/inovasi/jejaring.pdf",
  sosialisasi: "seeds/inovasi/sosialisasi.pdf",
  pedomanTeknis: "seeds/inovasi/pedoman.pdf",
  kemudahanInfoLayanan: "seeds/inovasi/info-layanan.pdf",
  kecepatanProses: "seeds/inovasi/kecepatan.pdf",
  penyelesaianPengaduan: "seeds/inovasi/pengaduan.pdf",
  layananTerintegrasi: "seeds/inovasi/terintegrasi.pdf",
  replikasi: "seeds/inovasi/replikasi.pdf",
  kecepatanPenciptaan: "seeds/inovasi/penciptaan.pdf",
  kemanfaatan: "seeds/inovasi/kemanfaatan.pdf",
  monitoringEvaluasi: "seeds/inovasi/monev.pdf",
  kualitasVideo: "https://vimeo.com/123456789",
};

type SeedItem = {
  namaInovasi: string;
  inisiator: string;
  jenisInovasi: JenisInovasi;
  bentukInovasi: string;
  status: Status;
  withIndikator?: boolean;
  monthOffset: number;
};

const inisiators = [
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Dinas Kesehatan",
  "Dinas Pendidikan",
  "Dinas Pertanian",
  "Dinas Pekerjaan Umum",
  "Dinas Lingkungan Hidup",
  "Dinas Perhubungan",
  "Dinas Pariwisata",
  "Dinas Sosial",
  "Dinas Perdagangan",
  "Dinas Koperasi dan UKM",
  "Dinas Pemberdayaan Masyarakat dan Desa",
  "Dinas Komunikasi dan Informatika",
  "Dinas Perikanan",
  "Dinas Peternakan",
  "Dinas Tenaga Kerja",
  "Dinas Perindustrian",
  "Dinas Penanaman Modal dan Pelayanan Terpadu",
  "Badan Perencanaan Pembangunan Daerah",
  "Badan Kepegawaian Daerah",
  "Badan Penanggulangan Bencana Daerah",
  "Badan Pengelolaan Keuangan Daerah",
  "Badan Kesatuan Bangsa dan Politik",
  "Badan Keuangan Daerah",
  "Kecamatan Purwodadi",
  "Kecamatan Wirosari",
  "Kecamatan Godong",
  "Kecamatan Gubug",
  "Kecamatan Toroh",
  "Kecamatan Grobogan",
];

const digitalItems: { name: string; bentuk: string }[] = [
  { name: "Layanan Adminduk Online", bentuk: "Aplikasi Layanan" },
  { name: "Pertanian Presisi Grobogan", bentuk: "Sistem IoT" },
  { name: "Sekolah Inklusi Digital", bentuk: "Platform Pembelajaran" },
  { name: "Smart Posyandu 4.0", bentuk: "Aplikasi Pencatatan" },
  { name: "Wisata Bumiayu Digital", bentuk: "Portal Wisata" },
  { name: "Bank Sampah Online", bentuk: "Aplikasi Marketplace" },
  { name: "Sistem Antrean Puskesmas", bentuk: "Aplikasi Antrean" },
  { name: "PPDB Online Terpadu", bentuk: "Sistem Pendaftaran" },
  { name: "e-Musrenbang Grobogan", bentuk: "Platform Aspirasi" },
  { name: "SIPD Electronic", bentuk: "Sistem Informasi" },
  { name: "PeduliLindungi Desa", bentuk: "Aplikasi Tracing" },
  { name: "e-Retribusi Pasar", bentuk: "Aplikasi Pembayaran" },
  { name: "SIGAP Bencana", bentuk: "Sistem Peringatan Dini" },
  { name: "Dashboard Kinerja OPD", bentuk: "Portal Monitoring" },
  { name: "Si-Bansos Tepat", bentuk: "Aplikasi Verifikasi" },
  { name: "Digitalisasi Arsip Daerah", bentuk: "Sistem Kearsipan" },
  { name: "Lapor Pak Bupati", bentuk: "Aplikasi Pengaduan" },
  { name: "E-Learning ASN", bentuk: "Platform Pelatihan" },
  { name: "Sistem Informasi Geospasial", bentuk: "Pemetaan Digital" },
  { name: "Mobile Pusling", bentuk: "Aplikasi Perpustakaan" },
  { name: "E-Katalog Produk Lokal", bentuk: "Marketplace UMKM" },
  { name: "Smart Traffic Light", bentuk: "Sistem Transportasi" },
  { name: "Telemedicine Puskesmas", bentuk: "Aplikasi Konsultasi" },
  { name: "Sistem Pajak Eletronik", bentuk: "Aplikasi Perpajakan" },
  { name: "Open Data Grobogan", bentuk: "Portal Data Terbuka" },
];

const nonDigitalItems: { name: string; bentuk: string }[] = [
  { name: "Si-DESA Mandiri", bentuk: "Program Pendampingan" },
  { name: "Jemput Bola Adminduk", bentuk: "Layanan Keliling" },
  { name: "Gerakan Tanam Pangan", bentuk: "Program Ketahanan Pangan" },
  { name: "Pelatihan UMKM Naik Kelas", bentuk: "Program Inkubasi" },
  { name: "Grobogan Bebas Stunting", bentuk: "Gerakan Kesehatan" },
  { name: "Kampung Iklim Proklim", bentuk: "Program Lingkungan" },
  { name: "Sekolah Ramah Anak", bentuk: "Program Edukasi" },
  { name: "Pasar Tani Sehat", bentuk: "Program Pasar" },
  { name: "Posyandu Lansia Aktif", bentuk: "Layanan Kesehatan" },
  { name: "Bank Darah Desa", bentuk: "Gerakan Sosial" },
  { name: "Rumah Kompos Komunal", bentuk: "Program Daur Ulang" },
  { name: "Pelayanan Terpadu Kecamatan", bentuk: "One Stop Service" },
  { name: "Kampung Literasi", bentuk: "Program Pendidikan" },
  { name: "Gerbang Desa Wisata", bentuk: "Program Pariwisata" },
  { name: "Sirkulasi Ternak Bergilir", bentuk: "Program Peternakan" },
  { name: "Warung Gotong Royong", bentuk: "Program Ekonomi" },
  { name: "Pojok Bacaan Publik", bentuk: "Fasilitas Literasi" },
  { name: "Modal Usaha Mikro", bentuk: "Program Pembiayaan" },
  { name: "Jumat Bersih Lingkungan", bentuk: "Gerakan Kebersihan" },
  { name: "Pelatihan Digital Marketing", bentuk: "Program Kompetensi" },
  { name: "Beasiswa Grobogan Cerdas", bentuk: "Program Pendidikan" },
  { name: "Klinik Tanaman Gratis", bentuk: "Layanan Pertanian" },
  { name: "Pelayanan Jemput Bola Disdukcapil", bentuk: "Layanan Administrasi" },
  { name: "Musyawarah Perempuan Desa", bentuk: "Program Pemberdayaan" },
  { name: "Pengelolaan Air Bersih Desa", bentuk: "Program Infrastruktur" },
];

function buildItems(
  entries: { name: string; bentuk: string }[],
  jenis: JenisInovasi,
  startMonth: number,
): SeedItem[] {
  return entries.map((entry, idx) => {
    const monthOffset = ((startMonth + idx - 1) % 12) + 1;
    const isDisetujui = idx < entries.length * 0.5;
    const isPending = !isDisetujui && idx < entries.length * 0.8;
    return {
      namaInovasi: entry.name,
      inisiator: inisiators[idx % inisiators.length],
      jenisInovasi: jenis,
      bentukInovasi: entry.bentuk,
      status: isDisetujui ? Status.Disetujui : isPending ? Status.Pending : Status.Ditolak,
      withIndikator: isDisetujui,
      monthOffset,
    };
  });
}

async function main() {
  const opd = await prisma.user.findUnique({ where: { username: "opd" } });

  if (!opd) {
    console.error(
      "Akun OPD seed (username: 'opd') tidak ditemukan. Jalankan `pnpm db:seed` terlebih dahulu.",
    );
    process.exit(1);
  }

  await prisma.inovasiDaerah.deleteMany({
    where: {
      userId: opd.id,
      bentukInovasi: { startsWith: SEED_MARKER },
    },
  });

  const items = [
    ...buildItems(digitalItems, JenisInovasi.Digital, 1),
    ...buildItems(nonDigitalItems, JenisInovasi.Non_Digital, 7),
  ];

  let attachmentCount = 0;

  for (const item of items) {
    const tglUjiCoba = new Date(2024, item.monthOffset - 1, 5);
    const tglPenerapan = new Date(2024, item.monthOffset - 1, 20);

    const inovasi = await prisma.inovasiDaerah.create({
      data: {
        userId: opd.id,
        namaInovasi: item.namaInovasi,
        inisiator: item.inisiator,
        jenisInovasi: item.jenisInovasi,
        bentukInovasi: `${SEED_MARKER} ${item.bentukInovasi}`,
        tglUjiCoba,
        tglPenerapan,
        rancangBangun: rancang(
          `Rancang bangun ${item.namaInovasi} oleh ${item.inisiator}.`,
        ),
        tujuan: `Meningkatkan kualitas layanan melalui ${item.namaInovasi}.`,
        manfaat: `Masyarakat memperoleh kemudahan akses dari ${item.namaInovasi}.`,
        hasil: `Implementasi ${item.namaInovasi} berjalan sesuai target.`,
        status: item.status,
        ...(item.withIndikator
          ? { indikator: { create: { ...sampleIndikator } } }
          : {}),
      },
    });

    // For Disetujui inovasi, also add IndikatorAttachment records (multi-file demo)
    if (item.withIndikator && attachmentCount < 10) {
      const slug = item.namaInovasi.toLowerCase().replace(/\s+/g, "-");
      await prisma.indikatorAttachment.createMany({
        data: [
          { inovasiDaerahId: inovasi.id, field: "regulasi", path: `seeds/inovasi/${slug}-regulasi.pdf` },
          { inovasiDaerahId: inovasi.id, field: "regulasi", path: `seeds/inovasi/${slug}-peraturan.pdf` },
          { inovasiDaerahId: inovasi.id, field: "sdm", path: `seeds/inovasi/${slug}-sdm.pdf` },
        ],
      });
      attachmentCount++;
    }
  }

  const pending = items.filter((i) => i.status === Status.Pending).length;
  const disetujui = items.filter((i) => i.status === Status.Disetujui).length;
  const ditolak = items.filter((i) => i.status === Status.Ditolak).length;

  console.log(
    `Seed inovasi daerah: ${items.length} row (Disetujui=${disetujui}, Pending=${pending}, Ditolak=${ditolak}). Pemilik: ${opd.username}.`,
  );
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
