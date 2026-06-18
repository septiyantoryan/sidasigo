import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { KrenovaCreateInput } from "@/validators/krenova";

/** Field names handled by this component (used by the wizard's step-1 validation). */
export const krenovaDataFieldNames = [
  "judulInovasi",
  "jenisInovasi",
  "statusPelaku",
  "waktuUjiCoba",
  "waktuPenerapan",
  "tahapInovasi",
  "namaInovator1",
  "namaInovator2",
  "namaInovator3",
  "namaInovator4",
  "namaInovator5",
  "alamat",
  "nomorHp",
  "abstrak",
] as const;

type KrenovaDataFieldsProps = {
  register: UseFormRegister<KrenovaCreateInput>;
  watch: UseFormWatch<KrenovaCreateInput>;
  setValue: UseFormSetValue<KrenovaCreateInput>;
  errors: FieldErrors<KrenovaCreateInput>;
};

/** The non-file data fields of a Krenova submission, shared by Create & Edit. */
export function KrenovaDataFields({
  register,
  watch,
  setValue,
  errors,
}: KrenovaDataFieldsProps) {
  const jenisInovasi = watch("jenisInovasi");
  const statusPelaku = watch("statusPelaku");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="judulInovasi">Judul Inovasi</Label>
          <Input id="judulInovasi" placeholder="Masukkan Judul Inovasi" {...register("judulInovasi")} />
          {errors.judulInovasi && (
            <p role="alert" className="text-xs text-destructive">
              {errors.judulInovasi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jenisInovasi">Jenis Inovasi</Label>
          <Select
            value={jenisInovasi}
            onValueChange={(value) =>
              setValue(
                "jenisInovasi",
                value as KrenovaCreateInput["jenisInovasi"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger id="jenisInovasi" className="w-full">
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Digital">Digital</SelectItem>
              <SelectItem value="Non_Digital">Non Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusPelaku">Status Pelaku</Label>
          <Select
            value={statusPelaku}
            onValueChange={(value) =>
              setValue(
                "statusPelaku",
                value as KrenovaCreateInput["statusPelaku"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger id="statusPelaku" className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Umum">Umum</SelectItem>
              <SelectItem value="Pelajar">Pelajar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktuUjiCoba">Waktu Uji Coba</Label>
          <Input id="waktuUjiCoba" type="date" {...register("waktuUjiCoba")} />
          {errors.waktuUjiCoba && (
            <p role="alert" className="text-xs text-destructive">
              {errors.waktuUjiCoba.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktuPenerapan">Waktu Penerapan</Label>
          <Input id="waktuPenerapan" type="date" {...register("waktuPenerapan")} />
          {errors.waktuPenerapan && (
            <p role="alert" className="text-xs text-destructive">
              {errors.waktuPenerapan.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tahapInovasi">Tahap Inovasi</Label>
          <Input id="tahapInovasi" placeholder="Masukkan Tahap Inovasi" {...register("tahapInovasi")} />
          {errors.tahapInovasi && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tahapInovasi.message}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Tim Inovator</legend>
        <p className="text-xs text-muted-foreground">
          Maksimal 5 inovator. Inovator pertama wajib diisi.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((index) => {
            const fieldName = `namaInovator${index}` as keyof KrenovaCreateInput;
            return (
              <div key={index} className="space-y-2">
                <Label htmlFor={fieldName}>
                  Nama Inovator {index}
                  {index === 1 && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
                <Input
                  id={fieldName}
                  placeholder={`Masukkan Nama Inovator ${index}`}
                  {...register(fieldName)}
                />
                {index === 1 && errors.namaInovator1 && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.namaInovator1.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Input id="alamat" placeholder="Masukkan Alamat" {...register("alamat")} />
          {errors.alamat && (
            <p role="alert" className="text-xs text-destructive">
              {errors.alamat.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomorHp">Nomor HP</Label>
          <Input
            id="nomorHp"
            type="tel"
            inputMode="numeric"
            placeholder="Masukkan Nomor HP"
            {...register("nomorHp")}
            onInput={(event) => {
              const target = event.currentTarget;
              target.value = target.value.replace(/[^\d+]/g, "");
            }}
          />
          {errors.nomorHp && (
            <p role="alert" className="text-xs text-destructive">
              {errors.nomorHp.message}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="abstrak">Abstrak</Label>
        <Textarea
          id="abstrak"
          rows={4}
          placeholder="Masukkan Abstrak"
          {...register("abstrak")}
        />
        {errors.abstrak && (
          <p role="alert" className="text-xs text-destructive">
            {errors.abstrak.message}
          </p>
        )}
      </div>
    </div>
  );
}
