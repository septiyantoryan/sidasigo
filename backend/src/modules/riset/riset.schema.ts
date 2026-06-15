import { JenisRiset } from "@prisma/client";
import { z } from "zod";

const currentYear = new Date().getFullYear();

const base = {
  judulKajian: z.string().min(1, "Judul kajian wajib diisi"),
  timPeneliti: z.string().min(1, "Tim peneliti wajib diisi"),
  tahunPublikasi: z.coerce
    .number()
    .int("Tahun publikasi harus berupa angka")
    .min(1900, "Tahun publikasi tidak valid")
    .max(currentYear + 1, "Tahun publikasi tidak valid"),
  abstrak: z.string().min(1, "Abstrak wajib diisi"),
  filePath: z.string().min(1, "File wajib diunggah"),
  jenis: z.nativeEnum(JenisRiset),
};

export const createRisetSchema = z.object(base);

export const updateRisetSchema = z
  .object(base)
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Tidak ada data untuk diperbarui",
  });

export type CreateRisetInput = z.infer<typeof createRisetSchema>;
export type UpdateRisetInput = z.infer<typeof updateRisetSchema>;
