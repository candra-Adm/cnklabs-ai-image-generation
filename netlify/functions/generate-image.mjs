import { InferenceClient } from "@huggingface/inference";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", ...corsHeaders },
  body: JSON.stringify(body)
});

const ratioSizes = {
  "1:1": [1024, 1024],
  "16:9": [1536, 864],
  "9:16": [864, 1536],
  "4:3": [1152, 864],
  "4:6": [1024, 1536],
  "3:4": [1024, 1365],
  "2:3": [1024, 1536]
};

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)(?:;[^,]*)?,([\s\S]+)$/.exec(dataUrl || "");
  if (!match) throw new Error("Format foto referensi tidak valid.");
  const mime = match[1];
  const base64 = match[2];
  return { mime, buffer: Buffer.from(base64, "base64") };
}

function cleanError(error) {
  const message = error?.message || String(error);
  return message.length > 700 ? `${message.slice(0, 700)}…` : message;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const token = process.env.HF_TOKEN?.trim();
  if (!token) {
    return json(503, {
      configured: false,
      error: "HF_TOKEN belum dipasang di Netlify. Demo Engine dapat digunakan oleh aplikasi."
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { configured: true, error: "Request JSON tidak valid." });
  }

  const prompt = String(payload.prompt || "").trim();
  const mode = payload.mode === "image-to-image" && payload.imageData ? "image-to-image" : "text-to-image";
  const ratio = String(payload.ratio || "1:1");
  const quality = payload.quality === "HD" ? "HD" : "Standard";

  if (!prompt) return json(400, { configured: true, error: "Prompt tidak boleh kosong." });

  try {
    const provider = process.env.HF_PROVIDER?.trim() || "auto";
    const textModel = process.env.HF_TEXT_MODEL?.trim() || "Qwen/Qwen-Image";
    const imageModel = process.env.HF_IMAGE_MODEL?.trim() || "black-forest-labs/FLUX.2-dev";
    const hf = new InferenceClient(token);
    const [width, height] = ratioSizes[ratio] || ratioSizes["1:1"];

    let imageBlob;
    let model;

    if (mode === "image-to-image") {
      const { mime, buffer } = parseDataUrl(payload.imageData);
      if (buffer.length > 5 * 1024 * 1024) {
        return json(413, { configured: true, error: "Foto referensi terlalu besar. Gunakan foto di bawah 5 MB." });
      }

      model = imageModel;
      imageBlob = await hf.imageTextToImage({
        model,
        provider,
        inputs: new Blob([buffer], { type: mime }),
        parameters: {
          prompt,
          target_size: { width, height }
        }
      });
    } else {
      model = textModel;
      imageBlob = await hf.textToImage({
        model,
        provider,
        inputs: prompt,
        parameters: {
          width,
          height,
          num_inference_steps: quality === "HD" ? 28 : 20
        }
      });
    }

    if (!imageBlob) throw new Error("Provider tidak mengembalikan gambar.");

    const contentType = imageBlob.type || "image/png";
    const output = Buffer.from(await imageBlob.arrayBuffer()).toString("base64");

    return json(200, {
      imageData: `data:${contentType};base64,${output}`,
      provider: `Hugging Face Inference Providers · ${provider}`,
      model,
      mode,
      ratio,
      quality
    });
  } catch (error) {
    console.error("generate-image provider error", error);
    return json(502, {
      configured: true,
      error: `AI provider gagal memproses gambar: ${cleanError(error)}`
    });
  }
};
