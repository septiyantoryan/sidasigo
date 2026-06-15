import { z } from "zod";

const krenovaBaseShape = {
  judulInovasi: z.string().min(1, "Judul wajib diisi"),
  jenisInovasi: z.enum(["Digital", "Non_Digital"]),
  waktuUjiCoba: z.string().min(1, "Waktu uji coba wajib diisi"),
  waktuPenerapan: z.string().min(1, "Waktu penerapan wajib diisi"),
  tahapInovasi: z.string().min(1, "Tahap inovasi wajib diisi"),
  statusPelaku: z.enum(["Umum", "Pelajar"]),
  namaInovator1: z.string().min(1, "Inovator utama wajib diisi"),
  namaInovator2: z.string().optional(),
  namaInovator3: z.string().optional(),
  namaInovator4: z.string().optional(),
  namaInovator5: z.string().optional(),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  nomorHp: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(/^\+?\d{8,15}$/, "Nomor HP hanya boleh berisi angka (8-15 digit)"),
  dokumenProposal: z.string().min(1, "Dokumen proposal wajib diunggah"),
  lampiranOriginalitas: z.string().min(1, "Lampiran originalitas wajib diunggah"),
  lampiranIdentitas: z.string().min(1, "Lampiran identitas wajib diunggah"),
};

/** Base object schema (supports `.omit()` for the create wizard's step 1). */
export const krenovaBaseSchema = z.object(krenovaBaseShape);

/**
 * Cross-field rule: the application date must be strictly after the trial date.
 * Reusable so both the full create schema and the wizard's step-1 schema enforce it.
 */
export function penerapanSetelahUjiCoba(data: {
  waktuUjiCoba?: string;
  waktuPenerapan?: string;
}): boolean {
  if (!data.waktuUjiCoba || !data.waktuPenerapan) return true;
  return (
    new Date(data.waktuPenerapan).getTime() >
    new Date(data.waktuUjiCoba).getTime()
  );
}

export const penerapanSetelahUjiCobaError = {
  message: "Waktu penerapan harus lebih besar dari waktu uji coba",
  path: ["waktuPenerapan"],
};

export const krenovaCreateSchema = krenovaBaseSchema.refine(
  penerapanSetelahUjiCoba,
  penerapanSetelahUjiCobaError,
);

export type KrenovaCreateInput = z.infer<typeof krenovaBaseSchema>;

