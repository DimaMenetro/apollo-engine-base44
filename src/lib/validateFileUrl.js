// SSRF-safeguard for file URLs before they are handed to server-side fetchers
// (e.g. Core.InvokeLLM file_urls). Mirrors the server guard in analyzeAudio:
// only https URLs on trusted Base44 / Google storage hosts, never private hosts.

function isPrivateHost(host) {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = parseInt(m[1]);
    const b = parseInt(m[2]);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;          // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true;          // 192.168.0.0/16
  }
  if (h === '::1' || h.startsWith('[::1') || h.startsWith('[fe80') || h.startsWith('[fc') || h.startsWith('[fd')) return true;
  return false;
}

export function validateFileUrl(fileUrl) {
  let u;
  try {
    u = new URL(fileUrl);
  } catch {
    throw new Error('Invalid file URL');
  }
  if (u.protocol !== 'https:') throw new Error('File URL must use https');
  if (isPrivateHost(u.hostname)) throw new Error('File URL host is not permitted');
  const host = u.hostname.toLowerCase();
  const allowed = /(^|\.)base44\.(app|com)$/.test(host)
    || /(^|\.)googleapis\.com$/.test(host)
    || /(^|\.)storage\.googleapis\.com$/.test(host);
  if (!allowed) throw new Error('File URL host is not an allowed storage domain');
}