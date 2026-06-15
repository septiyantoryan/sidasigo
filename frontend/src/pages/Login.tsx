import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth";

const credentialsSchema = z.object({
  username: z
    .string()
    .min(1, "Username wajib diisi")
    .min(3, "Username minimal 3 karakter"),
  password: z.string().min(1, "Password wajib diisi"),
});

type CredentialsInput = z.infer<typeof credentialsSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refresh = useAuthStore((state) => state.refresh);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<CredentialsInput>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_40%),radial-gradient(circle_at_50%_80%,color-mix(in_oklch,var(--accent)_12%,transparent),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] opacity-30" />

      <AnimatedSection direction="up" delay={0.15} className="relative w-full max-w-sm">
        <Card className="overflow-hidden rounded-[2rem] border-border bg-card/90 shadow-2xl shadow-primary/5 backdrop-blur">
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                <img src="/grobogan.svg" alt="Logo Grobogan" className="size-8" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black tracking-tight text-foreground">
                  SIDASIGO
                </span>
                <span className="text-xs text-muted-foreground">
                  Sistem Data Inovasi Grobogan
                </span>
              </div>
            </div>

            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-1 rounded-full">
                <TabsTrigger value="credentials" className="rounded-full text-xs">
                  Admin / OPD
                </TabsTrigger>
                <TabsTrigger value="masyarakat" className="rounded-full text-xs">
                  Masyarakat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="mt-5">
                <form
                  noValidate
                  onSubmit={form.handleSubmit(async (values) => {
                    const result = await authClient.signIn.username({
                      username: values.username,
                      password: values.password,
                    });

                    if (result.error) {
                      toast.error(
                        result.error.message ??
                          "Gagal masuk. Periksa kembali username & password.",
                      );
                      return;
                    }

                    await refresh();
                    toast.success("Berhasil masuk");
                    navigate("/dashboard");
                  })}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Masukkan Username"
                      className="rounded-full"
                      {...form.register("username")}
                    />
                    {form.formState.errors.username && (
                      <p role="alert" className="text-xs text-destructive">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Masukkan Password"
                        className="rounded-full pr-10"
                        {...form.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    {form.formState.errors.password && (
                      <p role="alert" className="text-xs text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={form.formState.isSubmitting}
                  >
                    <LogIn className="size-4" /> Masuk
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="masyarakat" className="mt-5 flex flex-col gap-4">
                <p className="px-1 text-center text-sm text-muted-foreground">
                  Masuk cepat menggunakan akun Google untuk mengirim Krenova.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={async () => {
                    setIsOAuthLoading(true);
                    try {
                      const result = await authClient.signIn.social({
                        provider: "google",
                        callbackURL: `${window.location.origin}/dashboard`,
                        errorCallbackURL: `${window.location.origin}/login`,
                      });
                      if (result.error) {
                        toast.error(result.error.message ?? "Gagal memulai Google Sign-In.");
                      }
                    } catch {
                      toast.error("Gagal memulai Google Sign-In.");
                    } finally {
                      setIsOAuthLoading(false);
                    }
                  }}
                  disabled={isOAuthLoading}
                >
                  <Mail className="size-4" /> Masuk dengan Google
                </Button>
                <Separator />
                <p className="text-center text-xs text-muted-foreground">
                  Dengan masuk, Anda menyetujui ketentuan layanan SIDASIGO.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}

export default LoginPage;
