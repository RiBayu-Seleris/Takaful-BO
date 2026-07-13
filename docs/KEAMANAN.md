# Panduan Keamanan Frontend — Takaful Backoffice v1

Keamanan frontend itu **berlapis**. Frontend tidak boleh dianggap sebagai satu-satunya
benteng — **backend tetap wajib memvalidasi setiap request**. Namun frontend yang baik
menutup banyak celah umum. Berikut yang sudah diterapkan & yang harus dijaga.

---

## 1. Yang SUDAH diterapkan di kode

| Ancaman | Pertahanan | Lokasi |
| --- | --- | --- |
| Akses tanpa login | Guard router mengalihkan ke `/sign-in` | `router/index.js` |
| Sesi kedaluwarsa/token dicabut | Interceptor menangkap HTTP 401 → auto logout | `lib/api.js` |
| XSS (script jahat lewat data) | Helper `escapeHtml`/`stripTags`/`safeUrl`, larangan `v-html` | `lib/sanitize.js` |
| Token bocor lewat log | Tidak ada `console.log` token/data sensitif | seluruh kode |
| Kebocoran referrer ke situs lain | `<meta name="referrer" content="strict-origin-when-cross-origin">` | `index.html` |
| Akses fitur lintas-role | Menu difilter per role | `lib/menuFlags.js` |
| Tabnabbing (link eksternal) | Wajib `rel="noopener noreferrer"` | konvensi tim |

## 2. Penyimpanan Token

Token disimpan di `localStorage` **karena kontrak API mewajibkan header
`Authorization: Bearer <token>`** (harus bisa dibaca JavaScript), sama seperti aplikasi
lama (ehd-backoffice). Konsekuensinya token rawan dicuri bila ada celah XSS — itulah
mengapa **pencegahan XSS (poin 1) menjadi prioritas utama**.

> Peningkatan di masa depan (butuh dukungan backend): pindahkan token ke cookie
> `HttpOnly` + `Secure` + `SameSite=Strict` sehingga tidak bisa dibaca JavaScript.

## 3. Content Security Policy (WAJIB dipasang saat produksi)

CSP mencegah eksekusi script dari sumber tak dikenal. **Jangan** dipasang lewat `<meta>`
karena bentrok dengan dev server Vite (HMR). Pasang sebagai **HTTP response header** di
web server / hosting produksi. Contoh nilai:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://api-gateway.seleris.id https://staging-api-gateway.seleris.id;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Contoh header keamanan lain (produksi)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Contoh untuk Netlify (`public/_headers`)

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api-gateway.seleris.id;
```

## 4. Checklist saat Review Kode

- [ ] Tidak ada `v-html` dengan data dari server/user (atau sudah disanitasi).
- [ ] Semua panggilan API lewat `@/lib/api` (bukan `axios` langsung).
- [ ] Tidak ada endpoint/URL/rahasia yang di-hardcode di komponen.
- [ ] Tidak ada `console.log` data sensitif.
- [ ] Route baru sudah benar: publik (`meta.public`) atau butuh login.
- [ ] Link eksternal memakai `rel="noopener noreferrer"`.
