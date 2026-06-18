import { HeroSection } from "@/components/landing/HeroSection";
import { LinkSection } from "@/components/landing/LinkSection";
import { InovasiSection } from "@/components/landing/InovasiSection";
import { KrenovaSection } from "@/components/landing/KrenovaSection";
import { BeritaSection } from "@/components/landing/BeritaSection";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <HeroSection />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 sm:px-6 lg:gap-6 lg:pb-24">
        <LinkSection />
        <InovasiSection />
        <KrenovaSection />
        <BeritaSection />
      </div>
    </div>
  );
}
