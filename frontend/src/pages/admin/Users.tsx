import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Plus, Trash2, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { useAdminChangePassword, useAdminChangeUsername } from "@/hooks/use-change-password";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
} from "@/hooks/use-dashboard";
import { formatTanggal } from "@/lib/format";

const passwordRule = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .regex(/[A-Z]/, "Harus mengandung huruf besar")
  .regex(/[a-z]/, "Harus mengandung huruf kecil")
  .regex(/[0-9]/, "Harus mengandung angka")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Harus mengandung simbol");

const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
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

const changePasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type CreateUserInput = z.infer<typeof createUserSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const usernameRule = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .regex(/^[a-z0-9]+$/, "Hanya huruf kecil dan angka");

const changeUsernameSchema = z.object({
  username: usernameRule,
});

type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"All" | "Admin" | "OPD">("All");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, pageSize]);

  const list = useAdminUsers({
    page,
    pageSize,
    search: debouncedSearch,
    role,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  });

  const createMutation = useCreateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwUserId, setPwUserId] = useState("");
  const [pwUserEmail, setPwUserEmail] = useState("");
  const pwMutation = useAdminChangePassword(pwUserId);

  const [userOpen, setUserOpen] = useState(false);
  const [userUserId, setUserUserId] = useState("");
  const [userUserEmail, setUserUserEmail] = useState("");
  const userMutation = useAdminChangeUsername(userUserId);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const pwForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const userForm = useForm<ChangeUsernameInput>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: { username: "" },
  });

  const items = list.data?.items ?? [];
  const pageCount = list.data?.pageCount ?? 1;
  const total = list.data?.total ?? 0;
  const isInitialLoading = list.isLoading && !list.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User OPD"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Tambah OPD
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, email, atau username..."
            className="w-full sm:flex-1"
          />
          <Select value={role} onValueChange={(value) => setRole(value as never)}>
            <SelectTrigger className="shrink-0 sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Semua role</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="OPD">OPD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada akun"
            description="Tambahkan akun OPD untuk mulai menerima inovasi."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="name" label="Nama" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="email" label="Email" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="username" label="Username" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="role" label="Role" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="createdAt" label="Dibuat" sort={sort} onSort={toggleSort} />
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-[12rem] truncate">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username ?? "-"}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{formatTanggal(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPwUserId(user.id);
                            setPwUserEmail(user.email);
                            pwForm.reset();
                            setPwOpen(true);
                          }}
                        >
                          <KeyRound className="size-3.5" /> Password
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setUserUserId(user.id);
                            setUserUserEmail(user.email);
                            userForm.reset();
                            setUserOpen(true);
                          }}
                        >
                          <UserCog className="size-3.5" /> Username
                        </Button>
                        {user.role !== "Admin" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setPendingDelete({ id: user.id, email: user.email })
                            }
                          >
                            <Trash2 className="size-3.5" /> Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <DataPagination
                page={page}
                pageCount={pageCount}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Akun OPD</DialogTitle>
            <DialogDescription>
              Username dipakai untuk masuk. Email tetap dicatat untuk kebutuhan kontak.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await createMutation.mutateAsync(values);
                toast.success("User OPD ditambahkan");
                form.reset();
                setOpen(false);
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Gagal menambah user",
                );
              }
            })}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="Masukkan Nama" {...form.register("name")} />
              {form.formState.errors.name && (
                <p role="alert" className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="username" placeholder="Masukkan Username" {...form.register("username")} />
              {form.formState.errors.username && (
                <p role="alert" className="text-xs text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Masukkan Email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p role="alert" className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" placeholder="Masukkan Password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p role="alert" className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createMutation.isPending}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Atur password baru untuk {pwUserEmail}. User tidak perlu memasukkan password lama.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={pwForm.handleSubmit(async (values) => {
              try {
                await pwMutation.mutateAsync({ newPassword: values.newPassword });
                toast.success("Password berhasil diubah");
                setPwOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal mengubah password");
              }
            })}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="pw-new">Password Baru</Label>
              <PasswordInput id="pw-new" placeholder="Masukkan Password Baru" {...pwForm.register("newPassword")} />
              {pwForm.formState.errors.newPassword && (
                <p role="alert" className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pw-confirm">Konfirmasi Password</Label>
              <PasswordInput id="pw-confirm" placeholder="Konfirmasi password baru" {...pwForm.register("confirmPassword")} />
              {pwForm.formState.errors.confirmPassword && (
                <p role="alert" className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <p className="rounded-xl border border-border bg-muted p-2 text-xs text-muted-foreground">
              Password harus mengandung huruf besar, huruf kecil, angka, dan simbol. Minimal 6 karakter.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPwOpen(false)}>Batal</Button>
              <Button type="submit" disabled={pwMutation.isPending}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Username</DialogTitle>
            <DialogDescription>
              Atur username baru untuk {userUserEmail}.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={userForm.handleSubmit(async (values) => {
              try {
                await userMutation.mutateAsync({ username: values.username });
                toast.success("Username berhasil diubah");
                setUserOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal mengubah username");
              }
            })}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-new">Username Baru</Label>
              <Input id="user-new" placeholder="Masukkan Username Baru" {...userForm.register("username")} />
              {userForm.formState.errors.username && (
                <p role="alert" className="text-xs text-destructive">{userForm.formState.errors.username.message}</p>
              )}
            </div>
            <p className="rounded-xl border border-border bg-muted p-2 text-xs text-muted-foreground">
              Username minimal 3 karakter. Hanya huruf, angka, titik, garis bawah, atau tanda hubung.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUserOpen(false)}>Batal</Button>
              <Button type="submit" disabled={userMutation.isPending}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Hapus User OPD"
        description={
          pendingDelete
            ? `User "${pendingDelete.email}" akan dihapus permanen.`
            : undefined
        }
        confirmLabel="Hapus"
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteMutation.mutateAsync(pendingDelete.id);
            toast.success("User dihapus");
            if (items.length === 1 && page > 1) {
              setPage(page - 1);
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menghapus user");
          } finally {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
