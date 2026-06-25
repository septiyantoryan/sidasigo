import { JenisInovasi } from "@prisma/client";
import { z } from "zod";

const inovasiBase = {
  namaInovasi: z.string().min(1),
  inisiator: z.string().min(1),
  jenisInovasi: z.nativeEnum(JenisInovasi),
  bentukInovasi: z.string().min(1),
  tglUjiCoba: z.coerce.date(),
  tglPenerapan: z.coerce.date(),
  rancangBangun: z.string().refine(
    (v) => v.trim().split(/\s+/).filter(Boolean).length >= 300,
    "Rancang bangun minimal 300 kata",
  ),
  tujuan: z.string().min(1),
  manfaat: z.string().min(1),
  hasil: z.string().min(1),
};

export const createInovasiDaerahSchema = z.object(inovasiBase);
export const updateInovasiDaerahSchema = z
  .object(inovasiBase)
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Tidak ada data untuk diperbarui",
  });
