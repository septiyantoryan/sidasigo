import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EditorialBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_12%_16%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_32%),radial-gradient(circle_at_84%_12%,color-mix(in_oklch,var(--accent)_70%,transparent),transparent_30%),linear-gradient(180deg,color-mix(in_oklch,var(--muted)_70%,transparent),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
    </div>
  );
}

export function EditorialPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-background text-foreground", className)}>
      <EditorialBackdrop />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        {children}
      </div>
    </div>
  );
}

export function EditorialEyebrow({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function EditorialHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-6 overflow-hidden rounded-[2rem] border border-border bg-card/88 p-6 shadow-xl shadow-primary/5 backdrop-blur lg:grid-cols-[1fr_20rem] lg:p-8", className)}>
      <div className="flex flex-col gap-5">
        {eyebrow}
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p> : null}
        </div>
        {children}
      </div>
      {aside ? <div className="lg:self-stretch">{aside}</div> : null}
    </section>
  );
}

export function EditorialStat({ icon: Icon, label, value, tone = "primary" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: "primary" | "muted" | "accent" }) {
  const toneClass = tone === "muted" ? "text-muted-foreground" : tone === "accent" ? "text-accent-foreground" : "text-primary";

  return (
    <div className="flex min-h-36 flex-col justify-between gap-4 rounded-3xl border border-border bg-background/70 p-5 shadow-inner">
      <Icon className={cn("size-6", toneClass)} aria-hidden />
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-black text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function EditorialSectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow ? <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</span> : null}
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{title}</h2>
      </div>
      {description ? <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function EditorialMetaCard({ children, className }: { children: ReactNode; className?: string }) {
  return <aside className={cn("rounded-[1.75rem] border border-border bg-card/90 p-5 shadow-sm", className)}>{children}</aside>;
}

export function EditorialNarrative({ title, value }: { title: string; value: string }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{value || "-"}</p>
    </section>
  );
}
