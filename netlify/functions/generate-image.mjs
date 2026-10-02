const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
});

function stripDataUrl(value = "") {
  return value.replace(/^data:[^;]+;base64,/, "");
}

function getDimensions(ratio = "1:1") {
  const map = {
    "1:1": [1024, 1024],
    "16:9": [1536, 864],
    "9:16": [864, 1536],
    "4:3": [1152, 864],
    "4:6": [768, 1152],
    "3:4": [864, 1152],
    "2:3": [768, 1152]
  };
  return map[ratio] || map["1:1"];
}

export default async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = process.env.HF_TOKEN;
  if (!token) return json({ configured: false, error: "HF_TOKEN belum dikonfigurasi di Netlify Functions." }, 503);

  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return json({ error: "Prompt wajib diisi." }, 400);

    const [width, height] = getDimensions(body.ratio);
    const hasReference = Boolean(body.imageData);
    const endpoint = hasReference ? process.env.HF_IMAGE_ENDPOINT : (process.env.HF_TEXT_ENDPOINT || "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3-medium-diffusers");

    if (!endpoint) {
      return json({ configured: false, error: "HF_IMAGE_ENDPOINT belum dikonfigurasi untuk image-to-image." }, 501);
    }

    const parameters = {
      width,
      height,
      negative_prompt: body.negativePrompt || "blurry, low quality, deformed face, extra fingers, distorted anatomy, watermark, text",
      num_inference_steps: body.quality === "HD" ? 30 : 20
    };

    const payload = hasReference
      ? { inputs: stripDataUrl(body.imageData), parameters: { ...parameters, prompt } }
      : { inputs: prompt, parameters };

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "image/png"
      },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ configured: true, error: `AI provider error (${upstream.status})`, detail: detail.slice(0, 1200) }, upstream.status);
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "image/png";
    const base64 = Buffer.from(buffer).toString("base64");
    return json({ configured: true, provider: "Hugging Face Inference Providers", imageData: `data:${contentType};base64,${base64}` });
  } catch (error) {
    return json({ configured: true, error: error?.message || "Gagal memproses permintaan." }, 500);
  }
};
