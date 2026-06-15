import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

const SEED_MARKER = "[seed]";

const juduls: string[] = [
  "Profil Daerah Kabupaten Grobogan 2024",
  "Rencana Pembangunan Jangka Menengah Daerah (RPJMD)",
  "Panduan Pengajuan Inovasi Daerah",
  "Formulir Pendaftaran Krenova",
  "Laporan Kinerja Instansi Pemerintah (LKjIP)",
  "Pedoman Teknis Penilaian Inovasi",
  "Data Statistik Sektoral Grobogan",
  "Peraturan Daerah tentang Inovasi Daerah",
];

async function main() {
  await prisma.download.deleteMany({
    where: { judul: { startsWith: SEED_MARKER } },
  });

  for (let i = 0; i < juduls.length; i += 1) {
    await prisma.download.create({
      data: {
        judul: `${SEED_MARKER} ${juduls[i]}`,
        filePath: `/api/public-files/seeds/download/${i + 1}.pdf`,
      },
    });
  }

  console.log(`Seed download: ${juduls.length} row.`);
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
