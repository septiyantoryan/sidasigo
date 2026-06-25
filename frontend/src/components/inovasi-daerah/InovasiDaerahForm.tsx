import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  inovasiDaerahCreateSchema,
  type InovasiDaerahCreateInput,
} from "@/validators/inovasi-daerah";

type InovasiDaerahFormProps = {
  defaultValues?: Partial<InovasiDaerahCreateInput>;
  onSubmit: (input: InovasiDaerahCreateInput) => Promise<unknown> | unknown;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function InovasiDaerahForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Simpan",
}: InovasiDaerahFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<InovasiDaerahCreateInput>({
    resolver: zodResolver(inovasiDaerahCreateSchema),
    defaultValues: {
      jenisInovasi: "Digital",
      ...defaultValues,
    },
  });

  const jenisInovasi = watch("jenisInovasi");
  const rancangBangun = watch("rancangBangun") ?? "";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="namaInovasi">Nama Inovasi</Label>
          <Input id="namaInovasi" placeholder="Masukkan Nama Inovasi" {...register("namaInovasi")} />
          {errors.namaInovasi && (
            <p role="alert" className="text-xs text-destructive">
              {errors.namaInovasi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inisiator">Inisiator</Label>
          <Input id="inisiator" placeholder="Masukkan Inisiator" {...register("inisiator")} />
          {errors.inisiator && (
            <p role="alert" className="text-xs text-destructive">
              {errors.inisiator.message}
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
                value as InovasiDaerahCreateInput["jenisInovasi"],
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bentukInovasi">Bentuk Inovasi</Label>
          <Input id="bentukInovasi" placeholder="Masukkan Bentuk Inovasi" {...register("bentukInovasi")} />
          {errors.bentukInovasi && (
            <p role="alert" className="text-xs text-destructive">
              {errors.bentukInovasi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tglUjiCoba">Tanggal Uji Coba</Label>
          <Input
            id="tglUjiCoba"
            type="date"
            {...register("tglUjiCoba")}
          />
          {errors.tglUjiCoba && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tglUjiCoba.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tglPenerapan">Tanggal Penerapan</Label>
          <Input
            id="tglPenerapan"
            type="date"
            {...register("tglPenerapan")}
          />
          {errors.tglPenerapan && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tglPenerapan.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="rancangBangun">Rancang Bangun</Label>
          <span className="text-xs text-muted-foreground">
            {rancangBangun.trim().split(/\s+/).filter(Boolean).length} kata (target ≥ 300)
          </span>
        </div>
        <Textarea
          id="rancangBangun"
          rows={6}
          placeholder="Masukkan Rancang Bangun"
          {...register("rancangBangun")}
        />
        {errors.rancangBangun && (
          <p role="alert" className="text-xs text-destructive">
            {errors.rancangBangun.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tujuan">Tujuan</Label>
          <Textarea id="tujuan" rows={4} placeholder="Masukkan Tujuan" {...register("tujuan")} />
          {errors.tujuan && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tujuan.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="manfaat">Manfaat</Label>
          <Textarea id="manfaat" rows={4} placeholder="Masukkan Manfaat" {...register("manfaat")} />
          {errors.manfaat && (
            <p role="alert" className="text-xs text-destructive">
              {errors.manfaat.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hasil">Hasil</Label>
          <Textarea id="hasil" rows={4} placeholder="Masukkan Hasil" {...register("hasil")} />
          {errors.hasil && (
            <p role="alert" className="text-xs text-destructive">
              {errors.hasil.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || formSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
