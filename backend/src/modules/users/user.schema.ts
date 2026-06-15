import { z } from "zod";

const passwordRule = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password harus mengandung simbol");

export const createOpdUserSchema = z.object({
  name: z.string().min(1),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .regex(
      /^[a-z0-9]+$/,
      "Username hanya boleh berisi huruf kecil dan angka",
    ),
  email: z.string().email("Format email tidak valid"),
  password: passwordRule,
});

export const changePasswordSelfSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: passwordRule,
});

export const changePasswordAdminSchema = z.object({
  newPassword: passwordRule,
});

const usernameRule = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .regex(
    /^[a-z0-9]+$/,
    "Username hanya boleh berisi huruf kecil dan angka",
  );

export const changeUsernameSelfSchema = z.object({
  password: z.string().min(1, "Password wajib diisi"),
  username: usernameRule,
});

export const changeUsernameAdminSchema = z.object({
  username: usernameRule,
});

export type CreateOpdUserInput = z.infer<typeof createOpdUserSchema>;
export type ChangePasswordSelfInput = z.infer<typeof changePasswordSelfSchema>;
export type ChangePasswordAdminInput = z.infer<typeof changePasswordAdminSchema>;
export type ChangeUsernameSelfInput = z.infer<typeof changeUsernameSelfSchema>;
export type ChangeUsernameAdminInput = z.infer<typeof changeUsernameAdminSchema>;
