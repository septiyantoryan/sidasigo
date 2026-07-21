export type Status = "Pending" | "Disetujui" | "Ditolak";
export type JenisInovasi = "Digital" | "Non_Digital";
export type Role = "Admin" | "OPD" | "Masyarakat";
export type JenisRiset = "RisetKajian" | "Penelitian" | "PolicyBrief";

export type Riset = {
  id: string;
  judulKajian: string;
  timPeneliti: string;
  tahunPublikasi: number;
  abstrak: string;
  filePath: string;
  jenis: JenisRiset;
  createdAt: string;
  updatedAt: string;
};

export type Berita = {
  id: string;
  posterPath: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
};

export type Download = {
  id: string;
  judul: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemSetting = {
  id: string;
  siteTitle: string;
  siteSubtitle: string;
  heroWelcomeText: string;
  heroImagePath: string | null;
  journalUrl: string | null;
  contactAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  mapsEmbedUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
};

export type InovasiDaerah = {
  id: string;
  userId: string;
  namaInovasi: string;
  inisiator: string;
  jenisInovasi: JenisInovasi;
  bentukInovasi: string;
  tglUjiCoba: string;
  tglPenerapan: string;
  rancangBangun: string;
  tujuan: string;
  manfaat: string;
  hasil: string;
  status: Status;
  alasanPenolakan?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Indikator = {
  id: string;
  inovasiDaerahId: string;
  regulasi?: string | null;
  sdm?: string | null;
  dukunganAnggaran?: string | null;
  alatKerja?: string | null;
  bimtek?: string | null;
  integrasiRKPD?: string | null;
  aktorInovasi?: string | null;
  pelaksana?: string | null;
  jejaringInovasi?: string | null;
  sosialisasi?: string | null;
  pedomanTeknis?: string | null;
  kemudahanInfoLayanan?: string | null;
  kecepatanProses?: string | null;
  penyelesaianPengaduan?: string | null;
  layananTerintegrasi?: string | null;
  replikasi?: string | null;
  kecepatanPenciptaan?: string | null;
  kemanfaatan?: string | null;
  monitoringEvaluasi?: string | null;
  kualitasVideo?: string | null;
};

export type IndikatorAttachment = {
  id: string;
  inovasiDaerahId: string;
  field: string;
  path: string;
  createdAt: string;
};

export type KrenovaAttachment = {
  id: string;
  krenovaId: string;
  field: string;
  path: string;
  createdAt: string;
};

export type Krenova = {
  id: string;
  userId: string;
  judulInovasi: string;
  jenisInovasi: JenisInovasi;
  waktuUjiCoba: string;
  waktuPenerapan: string;
  tahapInovasi: string;
  statusPelaku: "Umum" | "Pelajar";
  namaInovator1: string;
  namaInovator2?: string | null;
  namaInovator3?: string | null;
  namaInovator4?: string | null;
  namaInovator5?: string | null;
  alamat: string;
  nomorHp: string;
  abstrak?: string | null;
  fotoProduk?: string[];
  dokumenProposal: string | null;
  lampiranOriginalitas: string | null;
  lampiranIdentitas: string | null;
  attachments?: { id: string; field: string; path: string; createdAt: string }[];
  status: Status;
  alasanPenolakan?: string | null;
  createdAt: string;
  updatedAt: string;
};
