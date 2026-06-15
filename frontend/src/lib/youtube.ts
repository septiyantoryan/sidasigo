/**
 * Mengubah berbagai bentuk URL YouTube menjadi URL embed.
 * Mengembalikan null jika bukan URL YouTube yang dikenali.
 */
export function getYouTubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    // /watch?v=<id>
    const watchId = url.searchParams.get("v");
    if (watchId) return `https://www.youtube.com/embed/${watchId}`;

    // /embed/<id> atau /shorts/<id> atau /live/<id>
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length >= 2 && ["embed", "shorts", "live"].includes(segments[0])) {
      return `https://www.youtube.com/embed/${segments[1]}`;
    }
  }

  return null;
}
