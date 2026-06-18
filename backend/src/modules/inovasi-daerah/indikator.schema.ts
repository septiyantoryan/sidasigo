import { z } from "zod";

const optionalDoc = z.string().optional();

export const updateIndikatorSchema = z
  .object({
    regulasi: optionalDoc,
    sdm: optionalDoc,
    dukunganAnggaran: optionalDoc,
    alatKerja: optionalDoc,
    bimtek: optionalDoc,
    integrasiRKPD: optionalDoc,
    aktorInovasi: optionalDoc,
    pelaksana: optionalDoc,
    jejaringInovasi: optionalDoc,
    sosialisasi: optionalDoc,
    pedomanTeknis: optionalDoc,
    kemudahanInfoLayanan: optionalDoc,
    kecepatanProses: optionalDoc,
    penyelesaianPengaduan: optionalDoc,
    layananTerintegrasi: optionalDoc,
    replikasi: optionalDoc,
    kecepatanPenciptaan: optionalDoc,
    kemanfaatan: optionalDoc,
    monitoringEvaluasi: optionalDoc,
    kualitasVideo: z.string().url().optional().or(z.literal("")),
    /** Multi-file attachments per field. Each field can have an arbitrary list of file paths. */
    attachments: z
      .array(
        z.object({
          field: z.string(),
          path: z.string().min(1),
        }),
      )
      .optional(),
  })
  .strict();

export type UpdateIndikatorInput = z.infer<typeof updateIndikatorSchema>;
