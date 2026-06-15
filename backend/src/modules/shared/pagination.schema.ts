import { z } from "zod";

export const paginationBaseSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).default(""),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

const inovasiSortBy = z
  .enum([
    "namaInovasi",
    "inisiator",
    "jenisInovasi",
    "tglPenerapan",
    "status",
    "createdAt",
  ])
  .optional();

const krenovaSortBy = z
  .enum([
    "judulInovasi",
    "namaInovator1",
    "jenisInovasi",
    "statusPelaku",
    "waktuPenerapan",
    "status",
    "createdAt",
  ])
  .optional();

export const inovasiListQuerySchema = paginationBaseSchema.extend({
  jenis: z.enum(["Digital", "Non_Digital"]).optional(),
  status: z.enum(["Pending", "Disetujui", "Ditolak"]).optional(),
  sortBy: inovasiSortBy,
});

export const krenovaListQuerySchema = paginationBaseSchema.extend({
  jenis: z.enum(["Digital", "Non_Digital"]).optional(),
  status: z.enum(["Pending", "Disetujui", "Ditolak"]).optional(),
  statusPelaku: z.enum(["Umum", "Pelajar"]).optional(),
  sortBy: krenovaSortBy,
});

export const adminSubmissionsQuerySchema = paginationBaseSchema.extend({
  type: z.enum(["All", "InovasiDaerah", "Krenova"]).default("All"),
  sortBy: z.enum(["title", "submitter", "status", "createdAt"]).optional(),
});

export const adminUsersQuerySchema = paginationBaseSchema.extend({
  role: z.enum(["All", "Admin", "OPD"]).default("All"),
  sortBy: z.enum(["name", "email", "username", "role", "createdAt"]).optional(),
});

export const adminGoogleUsersQuerySchema = paginationBaseSchema.extend({
  sortBy: z.enum(["name", "email", "createdAt"]).optional(),
});

export const adminInovasiQuerySchema = paginationBaseSchema.extend({
  jenis: z.enum(["Digital", "Non_Digital"]).optional(),
  status: z.enum(["Pending", "Disetujui", "Ditolak"]).optional(),
  sortBy: inovasiSortBy,
});

export const adminKrenovaQuerySchema = paginationBaseSchema.extend({
  jenis: z.enum(["Digital", "Non_Digital"]).optional(),
  status: z.enum(["Pending", "Disetujui", "Ditolak"]).optional(),
  statusPelaku: z.enum(["Umum", "Pelajar"]).optional(),
  sortBy: krenovaSortBy,
});

export const risetListQuerySchema = paginationBaseSchema.extend({
  jenis: z.enum(["RisetKajian", "Penelitian"]).optional(),
  sortBy: z
    .enum(["judulKajian", "timPeneliti", "jenis", "tahunPublikasi", "createdAt"])
    .optional(),
});

export const adminRisetQuerySchema = risetListQuerySchema;

export const beritaListQuerySchema = paginationBaseSchema.extend({
  sortBy: z.enum(["caption", "createdAt"]).optional(),
});
export const adminBeritaQuerySchema = beritaListQuerySchema;

export const downloadListQuerySchema = paginationBaseSchema.extend({
  sortBy: z.enum(["judul", "createdAt"]).optional(),
});
export const adminDownloadQuerySchema = downloadListQuerySchema;

export type InovasiListQuery = z.infer<typeof inovasiListQuerySchema>;
export type KrenovaListQuery = z.infer<typeof krenovaListQuerySchema>;
export type AdminSubmissionsQuery = z.infer<typeof adminSubmissionsQuerySchema>;
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminGoogleUsersQuery = z.infer<typeof adminGoogleUsersQuerySchema>;
export type AdminInovasiQuery = z.infer<typeof adminInovasiQuerySchema>;
export type AdminKrenovaQuery = z.infer<typeof adminKrenovaQuerySchema>;
export type RisetListQuery = z.infer<typeof risetListQuerySchema>;
export type AdminRisetQuery = z.infer<typeof adminRisetQuerySchema>;
export type BeritaListQuery = z.infer<typeof beritaListQuerySchema>;
export type AdminBeritaQuery = z.infer<typeof adminBeritaQuerySchema>;
export type DownloadListQuery = z.infer<typeof downloadListQuerySchema>;
export type AdminDownloadQuery = z.infer<typeof adminDownloadQuerySchema>;
