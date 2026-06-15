import { Mail, MapPin, Phone } from "lucide-react";
import { usePublicSettings } from "@/hooks/use-settings";

export function Footer() {
  const settings = usePublicSettings();
  const data = settings.data;

  const address = data?.contactAddress?.trim() || "";
  const phone = data?.contactPhone?.trim() || "";
  const email = data?.contactEmail?.trim() || "";
  const mapsEmbedUrl = data?.mapsEmbedUrl?.trim() || "";
  const hasContact = Boolean(address || phone || email);

  return (
    <footer id="kontak" className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex w-80 items-center justify-center">
              <img src="/bapperida.png" alt="Logo Kabupaten Grobogan"/>
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Kontak</h2>
            {hasContact ? (
              <ul className="space-y-3 text-sm text-muted-foreground">
                {address ? (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="whitespace-pre-line">{address}</span>
                  </li>
                ) : null}
                {phone ? (
                  <li className="flex items-center gap-3">
                    <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                    <a href={`tel:${phone}`} className="hover:text-foreground">{phone}</a>
                  </li>
                ) : null}
                {email ? (
                  <li className="flex items-center gap-3">
                    <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                    <a href={`mailto:${email}`} className="hover:text-foreground">{email}</a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Informasi kontak belum tersedia.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-[1.75rem] border border-border bg-muted/40">
            {mapsEmbedUrl ? (
              <iframe
                src={mapsEmbedUrl}
                title="Peta lokasi"
                className="size-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Peta lokasi belum tersedia.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-center text-sm text-muted-foreground sm:px-6">
          <p>&copy; {new Date().getFullYear()} SIDASI-GO &mdash; Pemerintah Kabupaten Grobogan</p>
        </div>
      </div>
    </footer>
  );
}
