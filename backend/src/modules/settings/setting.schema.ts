import { z } from "zod";

const optionalUrl = z.string().trim().url().optional().or(z.literal(""));
const optionalEmail = z.string().trim().email().optional().or(z.literal(""));

export const updateSettingSchema = z.object({
  siteTitle: z.string().trim().min(1).optional(),
  siteSubtitle: z.string().trim().optional(),
  heroWelcomeText: z.string().trim().optional(),
  heroImagePath: z.string().trim().optional().or(z.literal("")).nullable(),
  journalUrl: optionalUrl,
  contactAddress: z.string().trim().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  contactEmail: optionalEmail,
  mapsEmbedUrl: z.string().trim().optional().or(z.literal("")),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
