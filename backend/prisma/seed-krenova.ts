import { JenisInovasi, Status, StatusPelaku } from "@prisma/client";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

const SEED_MARKER = "[seed]";
const MASYARAKAT_EMAIL = "masyarakat-seed@sidasi-go.local";

type SeedItem = {
  judulInovasi: string;
  jenisInovasi: JenisInovasi;
  statusPelaku: StatusPelaku;
  inovator: string[];
  alamat: string;
};

const digitalItems: SeedItem[] = [
  { judulInovasi: "Aplikasi Belajar Bahasa Jawa", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Andi Pratama"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Robot Penyiram Tanaman Otomatis", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Fajar Nugroho", "Intan Permata"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Game Edukasi Sejarah Grobogan", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Reza Maulana"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Solar Charger Sederhana", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Hendra Wijaya", "Lina Marlina"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Aplikasi Pengaduan Sekolah", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Nadia Salsabila"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Lampu Hidroponik Mini", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Agus Setiawan", "Putri Handayani"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Pendeteksi Banjir Berbasis IoT", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Dimas Arifin", "Sinta Dewi"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Smart Home untuk Peternak", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Yusuf Hamdani"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Aplikasi Belajar Ngaji Digital", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Rizki Fadhilah"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Sistem Presensi Sekolah RFID", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Bayu Anggara", "Dina Oktavia"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Kalkulator Zakat Online", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Ahmad Syahputra"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Website Profil Desa Interaktif", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sari Wulandari", "Eko Prasetyo"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Drone Pemantau Sawah", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Yoga Pratama"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Chatbot Layanan Desa", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Melati Kusuma"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Aplikasi Marketplace Petani", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Hadi Susanto", "Rina Marlina"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Sistem Alarm Kebakaran Sederhana", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Galih Ramadhan"], alamat: "Kecamatan Godong" },
  { judulInovasi: "E-Dompet Sampah", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Nurul Hidayah", "Faisal Rahman"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Aplikasi Pencatat Stok Pangan", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Teguh Wibowo"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Aquarium Monitoring System", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Rafif Akbar", "Dita Amelia"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Sistem Antrean Puskesmas Mandiri", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Wawan Setiawan"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Kamus Digital Bahasa Daerah", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Cahya Ningrum"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Remote Control Alat Listrik", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Andre Wijaya", "Susi Susanti"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Arsip Digital Kelurahan", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Herman Kusnadi"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Klinik Online Tanaman Pangan", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Wahyuni Indah", "Bambang Sutrisno"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Notifikasi Jadwal Posyandu", jenisInovasi: JenisInovasi.Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Rara Maharani"], alamat: "Kecamatan Toroh" },
];

const nonDigitalItems: SeedItem[] = [
  { judulInovasi: "Mesin Kompos Otomatis", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Budi Santoso", "Sri Lestari"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Filter Air Eceng Gondok", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Dewi Anggraini", "Rudi Hartono", "Maya Putri"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Pakan Ternak dari Limbah Tahu", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Slamet Riyadi"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Buku Saku Resep Lokal", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Wati Suryani"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Briket Arang Sekam Padi", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Suparno"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Kerajinan Limbah Plastik", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Ani Rahmawati", "Tini Kartini"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Genteng dari Serat Kelapa", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Hadi Prasetyo"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Tinta Alami dari Buah Naga", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Lisa Kurnia"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Sabun Ekstrak Daun Sirih", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Maya Putri", "Rina Sari"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Pupuk Organik Cair Urine Sapi", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sumardi"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Kompor Biogas Skala Rumah", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Wagimin", "Poniran"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Alat Jemur Otomatis", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Bima Sakti"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Pot Bunga dari Ban Bekas", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sumarni"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Tempat Pensil Bambu Anyam", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Dian Permata"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Kemasan Daun Pisang", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Ningsih", "Juminten"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Pewarna Kain dari Kunyit", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sukini"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Alat Pemipil Jagung Manual", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Paijo"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Rak Hidroponik Vertikal", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Fani Rahayu"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Daur Ulang Kertas Koran", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Wahyudi"], alamat: "Kecamatan Purwodadi" },
  { judulInovasi: "Lilin Aromaterapi Kulit Jeruk", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Tasya Amanda"], alamat: "Kecamatan Wirosari" },
  { judulInovasi: "Alat Pencacah Sampah Organik", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Rohmat", "Supardi"], alamat: "Kecamatan Godong" },
  { judulInovasi: "Keset Kain Perca", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sulastri"], alamat: "Kecamatan Grobogan" },
  { judulInovasi: "Baterai Alami dari Kentang", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Pelajar, inovator: ["Dika Setiawan"], alamat: "Kecamatan Gubug" },
  { judulInovasi: "Tas Belanja Anyaman", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Murni Rahayu", "Tutik"], alamat: "Kecamatan Toroh" },
  { judulInovasi: "Jebakan Nyamuk Sederhana", jenisInovasi: JenisInovasi.Non_Digital, statusPelaku: StatusPelaku.Umum, inovator: ["Sukamto"], alamat: "Kecamatan Purwodadi" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureMasyarakatUser() {
  const existing = await prisma.user.findUnique({
    where: { email: MASYARAKAT_EMAIL },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: MASYARAKAT_EMAIL,
      name: "Masyarakat Seed",
      role: "Masyarakat",
      emailVerified: true,
    },
  });
}

function buildItems(entries: SeedItem[], startMonth: number) {
  return entries.map((entry, idx) => {
    const monthOffset = ((startMonth + idx - 1) % 12) + 1;
    const isDisetujui = idx < entries.length * 0.5;
    const isPending = !isDisetujui && idx < entries.length * 0.8;
    return {
      ...entry,
      status: isDisetujui ? Status.Disetujui : isPending ? Status.Pending : Status.Ditolak,
      monthOffset,
    };
  });
}

async function main() {
  const masyarakat = await ensureMasyarakatUser();

  await prisma.krenova.deleteMany({
    where: {
      userId: masyarakat.id,
      tahapInovasi: { startsWith: SEED_MARKER },
    },
  });

  const items = [
    ...buildItems(digitalItems, 1),
    ...buildItems(nonDigitalItems, 7),
  ];

  for (const item of items) {
    const slug = slugify(item.judulInovasi);
    const waktuUjiCoba = new Date(2024, item.monthOffset - 1, 8);
    const waktuPenerapan = new Date(2024, item.monthOffset - 1, 22);

    await prisma.krenova.create({
      data: {
        userId: masyarakat.id,
        judulInovasi: item.judulInovasi,
        jenisInovasi: item.jenisInovasi,
        waktuUjiCoba,
        waktuPenerapan,
        tahapInovasi: `${SEED_MARKER} Tahap Penerapan`,
        statusPelaku: item.statusPelaku,
        namaInovator1: item.inovator[0],
        namaInovator2: item.inovator[1] ?? null,
        namaInovator3: item.inovator[2] ?? null,
        namaInovator4: item.inovator[3] ?? null,
        namaInovator5: item.inovator[4] ?? null,
        alamat: item.alamat,
        nomorHp: "081200000000",
        dokumenProposal: `seeds/krenova/${slug}-proposal.pdf`,
        lampiranOriginalitas: `seeds/krenova/${slug}-originalitas.pdf`,
        lampiranIdentitas: `seeds/krenova/${slug}-identitas.pdf`,
        status: item.status,
      },
    });
  }

  const pending = items.filter((i) => i.status === Status.Pending).length;
  const disetujui = items.filter((i) => i.status === Status.Disetujui).length;
  const ditolak = items.filter((i) => i.status === Status.Ditolak).length;
  const umum = items.filter((i) => i.statusPelaku === StatusPelaku.Umum).length;
  const pelajar = items.filter((i) => i.statusPelaku === StatusPelaku.Pelajar).length;

  console.log(
    `Seed krenova: ${items.length} row (Disetujui=${disetujui}, Pending=${pending}, Ditolak=${ditolak}; Umum=${umum}, Pelajar=${pelajar}). Pemilik: ${MASYARAKAT_EMAIL}.`,
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
