# CNKlabs AI Image Generation

CNKlabs AI Image Generation is a React/Vite web app with a Portrait Studio and a server-side AI provider layer designed for Netlify deployment.

## Current architecture

`Browser → Netlify Function → Hugging Face Inference Providers → AI model → image result`

The browser never receives `HF_TOKEN`. Netlify Functions read the secret from server-side environment variables.

## Features

- Text-to-image generation
- Portrait Studio: Foto Siswa, Formal Pria, Formal Wanita
- SD/SMP/SMA portrait options
- Uniform, suit, tie, clothing, background and photo-size options
- Optional reference photo for image+text-to-image workflows
- Aspect ratios and quality controls
- Local Gallery/History for the MVP
- Demo fallback when no provider token is configured
- Provider/model selection through server environment variables
- Netlify Function API at `/api/generate-image`

## Hugging Face provider setup

The app uses the official `@huggingface/inference` JavaScript client. Hugging Face documents Inference Providers as a unified way to call supported models through serverless inference partners, and recommends keeping tokens private/server-side.

Set these variables in **Netlify → Project configuration → Environment variables**:

- `HF_TOKEN` — Hugging Face access token with Inference Providers permission.
- `HF_PROVIDER` — default `auto`.
- `HF_TEXT_MODEL` — default `Qwen/Qwen-Image`.
- `HF_IMAGE_MODEL` — default `black-forest-labs/FLUX.2-dev` for image+text-to-image.

Model/provider availability and pricing can change. If a selected model is not available through the selected provider, change the model/provider variables rather than changing the UI.

## Important billing note

Hugging Face Inference Providers is pay-as-you-go with a free tier/credit system, not unlimited free inference. Check the current account credit and model/provider pricing before repeated generation. The local 15-photo UI limit is only an MVP guard; commercial quota enforcement must eventually move to a server-side database tied to authenticated users and subscriptions.

## Deployment

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

After changing environment variables, trigger a new Netlify deploy.

## Security

Never put `HF_TOKEN` in `VITE_*` variables, frontend source code, GitHub commits, or the browser. The `.env.example` file contains placeholders only.
