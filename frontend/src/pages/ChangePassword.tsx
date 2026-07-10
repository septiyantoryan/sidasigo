import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, ShieldCheck, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useChangeOwnEmail,
  useChangeOwnPassword,
  useChangeOwnUsername,
} from "@/hooks/use-change-password";
import { useAuthStore } from "@/stores/auth";

const passwordRule = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .regex(/[A-Z]/, "Harus mengandung huruf besar")
  .regex(/[a-z]/, "Harus mengandung huruf kecil")
  .regex(/[0-9]/, "Harus mengandung angka")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Harus mengandung simbol");

const usernameRule = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .regex(/^[a-z0-9]+$/, "Hanya huruf kecil dan angka");

const pwSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
  });

const usernameSchema = z.object({
  password: z.string().min(1, "Password wajib diisi"),
  username: usernameRule,
});

const emailSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type PwForm = z.infer<typeof pwSchema>;
type UsernameForm = z.infer<typeof usernameSchema>;
type EmailForm = z.infer<typeof emailSchema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canManageAccount = user?.role === "Admin" || user?.role === "OPD";
  const pwMutation = useChangeOwnPassword();
  const usernameMutation = useChangeOwnUsername();
  const emailMutation = useChangeOwnEmail();

  const pwForm = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const userForm = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { password: "", username: "" },
  });

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Akun"
        description="Kelola kata sandi, email, dan username akun Anda."
      />

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="password">
            <KeyRound className="size-4" />
            Kata Sandi
          </TabsTrigger>
          {canManageAccount && (
            <TabsTrigger value="email">
              <Mail className="size-4" />
              Email
            </TabsTrigger>
          )}
          {canManageAccount && (
            <TabsTrigger value="username">
              <UserCog className="size-4" />
              Username
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="password" className="mt-6">
          <form
            noValidate
            onSubmit={pwForm.handleSubmit(async (values) => {
              try {
                await pwMutation.mutateAsync({
                  oldPassword: values.oldPassword,
                  newPassword: values.newPassword,
                });
                toast.success("Password berhasil diubah");
                pwForm.reset();
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Gagal mengubah password",
                );
              }
            })}
            className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold tracking-tight">Ganti Kata Sandi</h2>

            <div className="space-y-2">
              <Label htmlFor="oldPassword">Password Lama</Label>
              <PasswordInput
                id="oldPassword"
                placeholder="Masukkan password lama"
                autoComplete="current-password"
                {...pwForm.register("oldPassword")}
              />
              {pwForm.formState.errors.oldPassword && (
                <p role="alert" className="text-xs text-destructive">
                  {pwForm.formState.errors.oldPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <PasswordInput
                id="newPassword"
                placeholder="Masukkan password baru"
                autoComplete="new-password"
                {...pwForm.register("newPassword")}
              />
              {pwForm.formState.errors.newPassword && (
                <p role="alert" className="text-xs text-destructive">
                  {pwForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Konfirmasi password baru"
                autoComplete="new-password"
                {...pwForm.register("confirmPassword")}
              />
              {pwForm.formState.errors.confirmPassword && (
                <p role="alert" className="text-xs text-destructive">
                  {pwForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mb-1 size-4 text-primary" aria-hidden />
              Password harus mengandung huruf besar, huruf kecil, angka, dan simbol. Minimal 6 karakter.
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={pwMutation.isPending}>
                Simpan Password Baru
              </Button>
            </div>
          </form>
        </TabsContent>

        {canManageAccount && (
          <TabsContent value="email" className="mt-6">
            <form
              noValidate
              onSubmit={emailForm.handleSubmit(async (values) => {
                try {
                  await emailMutation.mutateAsync(values);
                  toast.success("Email berhasil diubah");
                  emailForm.reset();
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Gagal mengubah email",
                  );
                }
              })}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight">Ganti Email</h2>

              <div className="space-y-2">
                <Label htmlFor="email">Email Baru</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email baru"
                  autoComplete="email"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p role="alert" className="text-xs text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Password Konfirmasi</Label>
                <PasswordInput
                  id="emailPassword"
                  placeholder="Masukkan password untuk konfirmasi"
                  autoComplete="current-password"
                  {...emailForm.register("password")}
                />
                {emailForm.formState.errors.password && (
                  <p role="alert" className="text-xs text-destructive">
                    {emailForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={emailMutation.isPending}>
                  Simpan Email Baru
                </Button>
              </div>
            </form>
          </TabsContent>
        )}

        {canManageAccount && (
          <TabsContent value="username" className="mt-6">
            <form
              noValidate
              onSubmit={userForm.handleSubmit(async (values) => {
                try {
                  await usernameMutation.mutateAsync({
                    password: values.password,
                    username: values.username,
                  });
                  toast.success("Username berhasil diubah");
                  userForm.reset();
                  navigate("/dashboard");
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Gagal mengubah username",
                  );
                }
              })}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight">Ganti Username</h2>

              <div className="space-y-2">
                <Label htmlFor="username">Username Baru</Label>
                <Input
                  id="username"
                  placeholder="Masukkan username baru"
                  autoComplete="username"
                  {...userForm.register("username")}
                />
                {userForm.formState.errors.username && (
                  <p role="alert" className="text-xs text-destructive">
                    {userForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usernamePassword">Password Konfirmasi</Label>
                <PasswordInput
                  id="usernamePassword"
                  placeholder="Masukkan password untuk konfirmasi"
                  autoComplete="current-password"
                  {...userForm.register("password")}
                />
                {userForm.formState.errors.password && (
                  <p role="alert" className="text-xs text-destructive">
                    {userForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={usernameMutation.isPending}>
                  Simpan Username Baru
                </Button>
              </div>
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}