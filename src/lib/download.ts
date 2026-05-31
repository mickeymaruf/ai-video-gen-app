/**
 * Force-download a (cross-origin) file. A bare `<a download>` is ignored for
 * cross-origin URLs, so we fetch the bytes as a blob first (relies on the
 * source's CORS — fal.media allows it) and download from an object URL.
 */
export async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
