import { buildPaginated } from "../../utils/pagination";
import type { AdminSubmissionsQuery } from "../shared/pagination.schema";
import {
  countDashboardStats,
  findInovasiCountPerOpd,
  findMergedPendingSubmissionRows,
  findPendingInovasiSubmissionRows,
  findPendingKrenovaSubmissionRows,
} from "./dashboard.repository";

type SubmissionItem = {
  id: string;
  title: string;
  type: "InovasiDaerah" | "Krenova";
  status: string;
  submitter: string;
  createdAt: Date;
};

export async function getDashboardStats() {
  const [
    totalUsers,
    totalInovasiDaerah,
    totalKrenova,
    pendingInovasi,
    pendingKrenova,
    approvedInovasi,
    approvedKrenova,
    rejectedInovasi,
    rejectedKrenova,
    totalRiset,
    totalBerita,
    totalDownload,
    totalOpd,
    totalKrenovaPeserta,
  ] = await countDashboardStats();

  const inovasiPerOpd = await findInovasiCountPerOpd();

  return {
    totalUsers,
    totalInovasiDaerah,
    totalKrenova,
    totalRiset,
    totalBerita,
    totalDownload,
    totalOpd,
    totalKrenovaPeserta,
    pendingTotal: pendingInovasi + pendingKrenova,
    approvedTotal: approvedInovasi + approvedKrenova,
    rejectedTotal: rejectedInovasi + rejectedKrenova,
    inovasiPerOpd,
  };
}

export async function getPendingSubmissionsPaginated(input: AdminSubmissionsQuery) {
  if (input.type === "InovasiDaerah") {
    const [rows, total] = await findPendingInovasiSubmissionRows(input);
    const items: SubmissionItem[] = rows.map((row) => ({
      id: row.id,
      title: row.namaInovasi,
      type: "InovasiDaerah",
      status: row.status,
      submitter: row.user.name,
      createdAt: row.createdAt,
    }));
    return buildPaginated(items, total, input.page, input.pageSize);
  }

  if (input.type === "Krenova") {
    const [rows, total] = await findPendingKrenovaSubmissionRows(input);
    const items: SubmissionItem[] = rows.map((row) => ({
      id: row.id,
      title: row.judulInovasi,
      type: "Krenova",
      status: row.status,
      submitter: row.user.name,
      createdAt: row.createdAt,
    }));
    return buildPaginated(items, total, input.page, input.pageSize);
  }

  const [inovasiRows, inovasiTotal, krenovaRows, krenovaTotal] = await findMergedPendingSubmissionRows(input);
  const direction = input.sortDir ?? (input.sort === "oldest" ? "asc" : "desc");
  const merged: SubmissionItem[] = [
    ...inovasiRows.map((row) => ({
      id: row.id,
      title: row.namaInovasi,
      type: "InovasiDaerah" as const,
      status: row.status,
      submitter: row.user.name,
      createdAt: row.createdAt,
    })),
    ...krenovaRows.map((row) => ({
      id: row.id,
      title: row.judulInovasi,
      type: "Krenova" as const,
      status: row.status,
      submitter: row.user.name,
      createdAt: row.createdAt,
    })),
  ].sort((a, b) => {
    const factor = direction === "asc" ? 1 : -1;
    if (input.sortBy === "title") return factor * a.title.localeCompare(b.title);
    if (input.sortBy === "submitter") return factor * a.submitter.localeCompare(b.submitter);
    if (input.sortBy === "status") return factor * a.status.localeCompare(b.status);
    return factor * (a.createdAt.getTime() - b.createdAt.getTime());
  });

  const offset = (input.page - 1) * input.pageSize;
  return buildPaginated(merged.slice(offset, offset + input.pageSize), inovasiTotal + krenovaTotal, input.page, input.pageSize);
}
