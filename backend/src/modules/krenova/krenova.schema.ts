import { JenisInovasi, StatusPelaku } from "@prisma/client";
import { z } from "zod";

const attachmentsOption = z
  .array(z.object({ field: z.string(), path: z.string() }))
  .optional();

const base = {
  judulInovasi: z.string().min(1),
  jenisInovasi: z.nativeEnum(JenisInovasi),
  waktuUjiCoba: z.coerce.date(),
  waktuPenerapan: z.coerce.date(),
  tahapInovasi: z.string().min(1),
  statusPelaku: z.nativeEnum(StatusPelaku),
  namaInovator1: z.string().min(1),
  namaInovator2: z.string().optional(),
  namaInovator3: z.string().optional(),
  namaInovator4: z.string().optional(),
  namaInovator5: z.string().optional(),
  alamat: z.string().min(1),
  nomorHp: z.string().regex(/^\+?\d{8,15}$/),
  abstrak: z.string().min(1, "Abstrak wajib diisi"),
  dokumenProposal: z.string().optional().nullable(),
  lampiranOriginalitas: z.string().optional().nullable(),
  lampiranIdentitas: z.string().optional().nullable(),
  attachments: attachmentsOption,
};

export const createKrenovaSchema = z
  .object(base)
  .refine(
    (obj) => obj.waktuPenerapan.getTime() > obj.waktuUjiCoba.getTime(),
    {
      message: "Waktu penerapan harus lebih besar dari waktu uji coba",
      path: ["waktuPenerapan"],
    },
  );
export const updateKrenovaSchema = z
  .object(base)
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Tidak ada data untuk diperbarui",
  })
  .refine(
    (obj) =>
      !obj.waktuPenerapan ||
      !obj.waktuUjiCoba ||
      obj.waktuPenerapan.getTime() > obj.waktuUjiCoba.getTime(),
    {
      message: "Waktu penerapan harus lebih besar dari waktu uji coba",
      path: ["waktuPenerapan"],
    },
  );
