export function formatTanggal(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatJenis(jenis: "Digital" | "Non_Digital") {
  return jenis === "Digital" ? "Digital" : "Non Digital";
}

export function formatJenisRiset(jenis: "RisetKajian" | "Penelitian" | "PolicyBrief") {
  return jenis === "RisetKajian" ? "Riset/Kajian" : jenis === "PolicyBrief" ? "Policy Brief" : "Penelitian";
}
