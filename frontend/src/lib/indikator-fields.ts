import type { Indikator } from "@/types";

export type DocField = { key: keyof Indikator; label: string };

export const docGroups: Array<{ title: string; fields: DocField[] }> = [
  {
    title: "Regulasi & Sumber Daya",
    fields: [
      { key: "regulasi", label: "Regulasi" },
      { key: "sdm", label: "Ketersediaan SDM" },
      { key: "dukunganAnggaran", label: "Dukungan Anggaran" },
      { key: "alatKerja", label: "Penggunaan IT/Alat Kerja" },
      { key: "bimtek", label: "Bimtek" },
    ],
  },
  {
    title: "Tata Kelola & Aktor",
    fields: [
      { key: "integrasiRKPD", label: "Integrasi dalam RKPD" },
      { key: "aktorInovasi", label: "Keterlibatan Aktor Inovasi" },
      { key: "pelaksana", label: "Pelaksana Inovasi Daerah" },
      { key: "jejaringInovasi", label: "Jejaring Inovasi" },
      { key: "sosialisasi", label: "Sosialisasi Inovasi" },
      { key: "pedomanTeknis", label: "Pedoman Teknis" },
    ],
  },
  {
    title: "Kualitas Layanan",
    fields: [
      { key: "kemudahanInfoLayanan", label: "Kemudahan Informasi Layanan" },
      { key: "kecepatanProses", label: "Kecepatan Proses" },
      { key: "penyelesaianPengaduan", label: "Penyelesaian Pengaduan" },
      { key: "layananTerintegrasi", label: "Layanan Terintegrasi" },
    ],
  },
  {
    title: "Dampak & Evaluasi",
    fields: [
      { key: "replikasi", label: "Replikasi" },
      { key: "kecepatanPenciptaan", label: "Kecepatan Penciptaan" },
      { key: "kemanfaatan", label: "Kemanfaatan" },
      { key: "monitoringEvaluasi", label: "Monitoring & Evaluasi" },
    ],
  },
];

export const docFields: DocField[] = docGroups.flatMap((group) => group.fields);

/** 19 berkas dokumen + 1 URL video. */
export const TOTAL_INDIKATOR = docFields.length + 1;
