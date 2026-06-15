import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

const SEED_MARKER = "[seed]";

const captions: string[] = [
  "Pemkab Grobogan meluncurkan program inovasi pelayanan publik berbasis digital untuk mempercepat layanan administrasi kependudukan.",
  "Bapperida Grobogan menggelar Festival Krenova 2024, ajang unjuk kreativitas masyarakat dan pelajar se-Kabupaten Grobogan.",
  "Panen raya padi di Kecamatan Toroh meningkat berkat penerapan teknologi pertanian presisi hasil inovasi daerah.",
  "Sosialisasi Bank Sampah Online mendorong masyarakat memilah sampah dari rumah dan menukarkannya menjadi saldo digital.",
  "Posyandu Smart hadir di puluhan desa, mempermudah pencatatan kesehatan ibu dan anak secara real-time.",
  "Wisata Bledug Kuwu kini hadir dalam portal digital, memudahkan wisatawan merencanakan kunjungan.",
  "Pelatihan UMKM Naik Kelas membekali pelaku usaha dengan keterampilan pemasaran digital.",
  "Gerakan Grobogan Bebas Stunting menargetkan penurunan angka stunting melalui intervensi gizi terpadu.",
  "Sistem antrean puskesmas digital memangkas waktu tunggu pasien hingga setengahnya.",
  "Inovasi pengolahan air bersih skala komunitas menjangkau desa-desa terpencil di Grobogan.",
  "Kampung Iklim Proklim mengajak warga beradaptasi terhadap perubahan iklim melalui aksi lingkungan.",
  "Bupati Grobogan mengapresiasi inovasi pelajar dalam ajang lomba teknologi tepat guna tingkat daerah.",
];

async function main() {
  await prisma.berita.deleteMany({
    where: { caption: { startsWith: SEED_MARKER } },
  });

  for (let i = 0; i < captions.length; i += 1) {
    await prisma.berita.create({
      data: {
        posterPath: `/api/public-files/seeds/berita/${i + 1}.jpg`,
        caption: `${SEED_MARKER} ${captions[i]}`,
      },
    });
  }

  console.log(`Seed berita: ${captions.length} row.`);
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
