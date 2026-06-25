import { z } from "zod";

export const inovasiDaerahCreateSchema = z.object({
  namaInovasi: z.string().min(1, "Nama inovasi wajib diisi"),
  inisiator: z.string().min(1, "Inisiator wajib diisi"),
  jenisInovasi: z.enum(["Digital", "Non_Digital"]),
  bentukInovasi: z.string().min(1, "Bentuk inovasi wajib diisi"),
  tglUjiCoba: z.string().min(1, "Tanggal uji coba wajib diisi"),
  tglPenerapan: z.string().min(1, "Tanggal penerapan wajib diisi"),
  rancangBangun: z.string().refine(
    (v) => v.trim().split(/\s+/).filter(Boolean).length >= 300,
    "Rancang bangun minimal 300 kata",
  ),
  tujuan: z.string().min(1, "Tujuan wajib diisi"),
  manfaat: z.string().min(1, "Manfaat wajib diisi"),
  hasil: z.string().min(1, "Hasil wajib diisi"),
});

export type InovasiDaerahCreateInput = z.infer<typeof inovasiDaerahCreateSchema>;
