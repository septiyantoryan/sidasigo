import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Separator } from "@/components/ui/separator";
import { useChangeOwnPassword, useChangeOwnUsername } from "@/hooks/use-change-password";

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

type PwForm = z.infer<typeof pwSchema>;
type UsernameForm = z.infer<typeof usernameSchema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const pwMutation = useChangeOwnPassword();
  const usernameMutation = useChangeOwnUsername();

  const pwForm = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const userForm = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { password: "", username: "" },
  });

  return (
    <div className="flex min-h-[60vh] flex-col items-center gap-6 pt-16">
      <AnimatedSection direction="up" className="w-full max-w-sm">
        <Card className="rounded-[1.75rem]">
          <CardHeader className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background">
              <KeyRound className="size-6 text-primary" aria-hidden />
            </div>
            <CardTitle className="text-lg font-black">Ganti Kata Sandi</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              onSubmit={pwForm.handleSubmit(async (values) => {
                try {
                  await pwMutation.mutateAsync({ oldPassword: values.oldPassword, newPassword: values.newPassword });
                  toast.success("Password berhasil diubah");
                  pwForm.reset();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal mengubah password");
                }
              })}
              className="flex flex-col gap-4"
            >
              <PasswordInput placeholder="Masukkan Password Lama" autoComplete="current-password" className="rounded-full" {...pwForm.register("oldPassword")} />
              {pwForm.formState.errors.oldPassword && <p role="alert" className="text-xs text-destructive">{pwForm.formState.errors.oldPassword.message}</p>}
              <PasswordInput placeholder="Masukkan Password Baru" autoComplete="new-password" className="rounded-full" {...pwForm.register("newPassword")} />
              {pwForm.formState.errors.newPassword && <p role="alert" className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>}
              <PasswordInput placeholder="Konfirmasi password baru" autoComplete="new-password" className="rounded-full" {...pwForm.register("confirmPassword")} />
              {pwForm.formState.errors.confirmPassword && <p role="alert" className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message}</p>}
              <div className="rounded-xl border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mb-1 size-4 text-primary" aria-hidden />
                Password harus mengandung huruf besar, huruf kecil, angka, dan simbol. Minimal 6 karakter.
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={pwMutation.isPending}>Simpan Password Baru</Button>
            </form>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.1} className="w-full max-w-sm">
        <Card className="rounded-[1.75rem]">
          <CardHeader className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background">
              <UserCog className="size-6 text-primary" aria-hidden />
            </div>
            <CardTitle className="text-lg font-black">Ganti Username</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              onSubmit={userForm.handleSubmit(async (values) => {
                try {
                  await usernameMutation.mutateAsync({ password: values.password, username: values.username });
                  toast.success("Username berhasil diubah");
                  userForm.reset();
                  navigate("/dashboard");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal mengubah username");
                }
              })}
              className="flex flex-col gap-4"
            >
              <Input placeholder="Masukkan Username Baru" autoComplete="username" className="rounded-full" {...userForm.register("username")} />
              {userForm.formState.errors.username && <p role="alert" className="text-xs text-destructive">{userForm.formState.errors.username.message}</p>}
              <PasswordInput placeholder="Password konfirmasi" autoComplete="current-password" className="rounded-full" {...userForm.register("password")} />
              {userForm.formState.errors.password && <p role="alert" className="text-xs text-destructive">{userForm.formState.errors.password.message}</p>}
              <Button type="submit" className="w-full rounded-full" disabled={usernameMutation.isPending}>Simpan Username Baru</Button>
            </form>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
