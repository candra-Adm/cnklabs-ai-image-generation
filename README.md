# CNKlabs AI Image Generation

MVP frontend for the CNKlabs AI Image Generation portfolio project.

## Run
npm install
npm run dev

## Build
npm run build

The current MVP uses a demo image engine so the UI can be tested without an API key.
The generation layer is intentionally isolated so a real provider can be connected later.


## Portrait Presets
The MVP includes dedicated prompt presets for:
- Foto Siswa
- Foto Formal Pria dengan jas
- Foto Formal Wanita dengan jas

These presets are prompt-layer features; the current demo engine remains image-provider independent.

## Portrait Studio v1

Portrait Studio now includes dedicated portrait flows:

- Foto Siswa: SD, SMP, SMA
- Seragam sekolah dengan opsi warna/tingkat dan dasi
- Foto Formal Pria: beberapa pilihan jas dan dasi
- Foto Formal Wanita: beberapa pilihan blazer/setelan
- Upload foto referensi (fondasi untuk image-to-image/provider nyata)
- Background studio
- Ukuran foto 4x6, 3x4, 1:1, dan portrait
- Prompt adaptif berdasarkan seluruh pilihan portrait

## Monetization foundation

The MVP includes a product/plan foundation:

- Free: maximum 15 generated photos per month
- 1 Month plan placeholder
- 1 Year plan placeholder
- Plan modal and monthly usage indicator

The 15-photo limit in this MVP is local-only for prototyping. Before commercial launch, usage, account identity, subscriptions, payment status, and quota enforcement must move to a server/backend so users cannot reset the quota by clearing browser storage.

## Important current limitation

The current demo engine still uses demo images. Portrait Studio collects the real generation parameters and optional reference image, but it does not yet perform real AI image-to-image generation. The next engineering stage is to add a secure provider API/backend while keeping this UI unchanged.


## AI Provider Layer v1

Portrait Studio v1 sekarang memiliki endpoint server-side `/.netlify/functions/generate-image` melalui redirect `/api/generate-image`. Frontend tidak menyimpan API key. Netlify Functions membaca secret dari environment variable, sesuai pola server-side secrets Netlify.

### Hugging Face setup

Set environment variable di Netlify Functions: `HF_TOKEN`. Opsional untuk text-to-image: `HF_TEXT_ENDPOINT`. Untuk image-to-image/reference photo: `HF_IMAGE_ENDPOINT` dapat diarahkan ke endpoint provider/model yang mendukung task image-to-image. Hugging Face saat ini mendokumentasikan text-to-image dan image-to-image melalui Inference Providers, dengan model/provider yang dapat berubah; karena itu endpoint dibuat configurable agar UI CNKlabs tidak terkunci pada satu provider.

Tanpa `HF_TOKEN`, aplikasi otomatis memakai Demo Engine sebagai fallback. Ini memungkinkan UI tetap dapat diuji sebelum provider dikonfigurasi.

### Deployment

1. Upload repository ke GitHub.
2. Import repository ke Netlify.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Pastikan Functions directory: `netlify/functions`.
6. Tambahkan `HF_TOKEN` pada Netlify Environment Variables dengan scope Functions.
7. Redeploy setelah mengubah environment variable.

**Catatan:** batas 15 foto/bulan masih merupakan fondasi MVP berbasis browser. Untuk produk berbayar, kuota harus dipindahkan ke database/backend bersama autentikasi pengguna dan payment gateway sehingga tidak dapat di-reset dengan menghapus localStorage.
