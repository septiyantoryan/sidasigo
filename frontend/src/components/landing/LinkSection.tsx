import {
  BookOpen,
  CircleCheck,
  Download,
  Lightbulb,
  Newspaper,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicSettings } from "@/hooks/use-settings";
import { AnimatedSection } from "@/components/public/AnimatedSection";

function ServiceCard({
  to,
  href,
  icon: Icon,
  title,
}: {
  to?: string;
  href?: string;
  icon: typeof Users;
  title: string;
}) {
  const inner = (
    <div className="group flex flex-col items-center gap-3 rounded-[2rem] border border-border bg-card p-6 text-foreground shadow-2xl shadow-primary/10 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-accent hover:shadow-2xl hover:shadow-primary/15">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background/70 text-primary transition-transform group-hover:rotate-3 group-hover:scale-105">
        <Icon aria-hidden className="size-6" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }

  return (
    <Link to={to ?? "#"} className="block">
      {inner}
    </Link>
  );
}

export function LinkSection() {
  const settings = usePublicSettings();

  const rawJournal = settings.data?.journalUrl?.trim() || "";
  const journalUrl =
    rawJournal && !/^https?:\/\//.test(rawJournal)
      ? `https://${rawJournal}`
      : rawJournal;

  return (
    <AnimatedSection className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 -translate-y-[33%] md:-translate-y-[40%] lg:-translate-y-1/2" direction="up">
      <AnimatedSection direction="up" delay={0}>
        <ServiceCard
          to="/inovasi-daerah"
          icon={Lightbulb}
          title="Inovasi Daerah"
        />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.15}>
        <ServiceCard
          to="/krenova"
          icon={Users}
          title="Krenova"
        />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.3}>
        <ServiceCard
          to="/riset"
          icon={BookOpen}
          title="Riset/Kajian"
        />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.45}>
        <ServiceCard
          to="/berita"
          icon={Newspaper}
          title="Berita"
        />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.6}>
        <ServiceCard
          to="/download"
          icon={Download}
          title="Unduhan"
        />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.75}>
        {journalUrl ? (
          <ServiceCard
            href={journalUrl}
            icon={BookOpen}
            title="Jurnal Paradigma"
          />
        ) : (
          <ServiceCard
            to="/login"
            icon={CircleCheck}
            title="Ruang Pengajuan"
          />
        )}
      </AnimatedSection>
    </AnimatedSection>
  );
}
