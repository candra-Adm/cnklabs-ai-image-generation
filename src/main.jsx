import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sparkles, Image as ImageIcon, History, Wand2, Download, Copy,
  RefreshCw, ChevronDown, SlidersHorizontal, Layers3, Search,
  Monitor, Smartphone, Tablet, Check, X, Menu, Plus, Trash2
} from "lucide-react";
import "./styles.css";

const styles = [
  ["Cinematic", "cinematic, dramatic lighting, detailed composition"],
  ["3D Render", "high-quality 3D render, realistic materials, studio lighting"],
  ["Illustration", "clean digital illustration, expressive shapes, polished details"],
  ["Educational", "clear educational visual, age-appropriate, labeled-friendly composition"],
  ["Anime", "anime-inspired illustration, refined linework, expressive lighting"],
  ["Photorealistic", "photorealistic, natural textures, realistic lighting"],
  ["Minimal", "minimalist composition, clean background, elegant visual hierarchy"]
];

const ratios = [
  ["1:1", "1024 × 1024"],
  ["16:9", "1536 × 864"],
  ["9:16", "864 × 1536"],
  ["4:3", "1152 × 864"]
];

const portraitPresets = [
  {
    id: "student",
    label: "Foto Siswa",
    icon: "🎓",
    description: "Potret siswa yang rapi dan natural",
    prompt: "formal student portrait, neat school uniform, natural friendly expression, clean grooming, realistic skin texture, neutral studio background, soft even lighting, centered head-and-shoulders composition, school-document photography"
  },
  {
    id: "formal-male",
    label: "Formal Pria",
    icon: "👔",
    description: "Foto formal pria dengan jas",
    prompt: "professional formal portrait of an adult man wearing an elegant well-fitted dark suit and white dress shirt, subtle tie, neat grooming, natural confident expression, neutral studio background, soft professional lighting, centered head-and-shoulders composition, realistic photography"
  },
  {
    id: "formal-female",
    label: "Formal Wanita",
    icon: "👩‍💼",
    description: "Foto formal wanita dengan jas",
    prompt: "professional formal portrait of an adult woman wearing an elegant well-fitted formal blazer and professional inner shirt, neat grooming, natural confident expression, neutral studio background, soft professional lighting, centered head-and-shoulders composition, realistic photography"
  }
];

const studentLevels = {
  SD: { uniform: "seragam SD putih-merah lengkap, kemeja putih, bawahan merah", detail: "siswa sekolah dasar, tampilan sesuai usia, rapi dan natural" },
  SMP: { uniform: "seragam SMP putih-biru lengkap, kemeja putih, bawahan biru", detail: "siswa sekolah menengah pertama, tampilan sesuai usia, rapi dan natural" },
  SMA: { uniform: "seragam SMA putih-abu-abu lengkap, kemeja putih, bawahan abu-abu", detail: "siswa sekolah menengah atas, tampilan sesuai usia, rapi dan natural" }
};

const portraitOptions = {
  ties: ["Dasi standar", "Dasi slim", "Dasi sekolah", "Tanpa dasi"],
  suits: ["Jas hitam + kemeja putih", "Jas navy + kemeja putih", "Jas abu-abu + kemeja putih", "Tuxedo formal + kemeja putih"],
  female: ["Blazer hitam + inner putih", "Blazer navy + inner putih", "Blazer abu-abu + inner putih", "Setelan formal wanita + blouse putih"],
  backgrounds: ["Putih studio", "Abu-abu studio", "Biru muda studio", "Biru pas foto", "Gradasi profesional"],
  sizes: [["4:6", "Pas foto 4 × 6"], ["3:4", "Pas foto 3 × 4"], ["1:1", "Kotak"], ["2:3", "Portrait"]]
};

const plans = [
  { id: "free", name: "Free", price: "Rp0", period: "selamanya", limit: "15 foto / bulan", features: ["Portrait Studio", "Text to Image", "Gallery lokal", "15 generasi per bulan"] },
  { id: "monthly", name: "1 Bulan", price: "Berbayar", period: "per bulan", limit: "Kuota lebih besar", features: ["Semua fitur Free", "Kuota generasi lebih besar", "Prioritas provider", "Riwayat tersimpan"] },
  { id: "yearly", name: "1 Tahun", price: "Berbayar", period: "per tahun", limit: "Kuota tahunan", features: ["Semua fitur", "Kuota tahunan", "Prioritas provider", "Cocok untuk sekolah & kantor"] }
];

const demoImages = [
  { id: "demo-1", title: "Solar System", prompt: "Educational 3D illustration of the solar system for Grade 6 students", style: "Educational", ratio: "16:9", date: "Demo", src: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=1000&q=80" },
  { id: "demo-2", title: "Futuristic Classroom", prompt: "Futuristic elementary classroom with interactive digital board", style: "Cinematic", ratio: "16:9", date: "Demo", src: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80" },
  { id: "demo-3", title: "Creative Robot", prompt: "Friendly educational AI robot helping children learn", style: "3D Render", ratio: "1:1", date: "Demo", src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80" }
];

function enhancePrompt(raw, style, purpose, preset, options = {}) {
  if (preset) {
    const level = studentLevels[options.schoolLevel] || studentLevels.SD;
    let presetText = "";
    if (preset === "student") {
      presetText = `${level.detail}, ${level.uniform}, ${options.tieStyle || "Dasi standar"}, clean grooming, natural friendly expression, realistic skin texture`;
    } else if (preset === "formal-male") {
      presetText = `professional formal portrait of an adult man, ${options.suitStyle || "Jas hitam + kemeja putih"}, ${options.tieStyle || "Dasi standar"}, neat grooming, natural confident expression, realistic skin texture`;
    } else {
      presetText = `professional formal portrait of an adult woman, ${options.femaleStyle || "Blazer hitam + inner putih"}, neat grooming, natural confident expression, realistic skin texture`;
    }
    return `${raw.trim() ? raw.trim() + ", " : ""}${presetText}, ${options.background || "Putih studio"}, centered head-and-shoulders composition, official portrait photography, balanced soft lighting, realistic proportions, high detail`;
  }
  const base = raw.trim() || "a creative educational scene";
  const styleText = styles.find(s => s[0] === style)?.[1] || "";
  const purposeText = purpose === "Pembelajaran"
    ? "designed for elementary students, clear visual hierarchy, age-appropriate, educationally accurate"
    : purpose === "Poster" ? "strong focal point, readable negative space, polished poster composition"
    : purpose === "Sosial Media" ? "attention-grabbing composition, optimized for social media viewing"
    : "professional visual storytelling";
  return `${base}, ${styleText}, ${purposeText}, high detail, balanced composition, professional quality`;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("1:1");
  const [purpose, setPurpose] = useState("Kreatif");
  const [portraitPreset, setPortraitPreset] = useState("student");
  const [schoolLevel, setSchoolLevel] = useState("SD");
  const [gender, setGender] = useState("Pria");
  const [studentUniform, setStudentUniform] = useState("Putih-merah");
  const [tieStyle, setTieStyle] = useState("Dasi standar");
  const [suitStyle, setSuitStyle] = useState("Jas hitam + kemeja putih");
  const [femaleStyle, setFemaleStyle] = useState("Blazer hitam + inner putih");
  const [background, setBackground] = useState("Putih studio");
  const [photoSize, setPhotoSize] = useState("4:6");
  const [referenceImage, setReferenceImage] = useState(null);
  const [usage, setUsage] = useState(() => {
    const key = `cnklabs_usage_${new Date().getFullYear()}_${new Date().getMonth()+1}`;
    try { return Number(localStorage.getItem(key) || 0); } catch { return 0; }
  });
  const [showPlans, setShowPlans] = useState(false);
  const [quality, setQuality] = useState("HD");
  const [active, setActive] = useState("create");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [gallery, setGallery] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cnklabs_gallery") || "[]"); } catch { return []; }
  });
  const [copied, setCopied] = useState(false);
  const [providerMessage, setProviderMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("cnklabs_gallery", JSON.stringify(gallery.slice(0, 4).map(({ referenceImage, ...item }) => item)));
    } catch {
      try { localStorage.removeItem("cnklabs_gallery"); } catch {}
    }
  }, [gallery]);

  const enhanced = useMemo(() => enhancePrompt(prompt, style, purpose, portraitPreset, { schoolLevel, tieStyle, suitStyle, femaleStyle, background }), [prompt, style, purpose, portraitPreset, schoolLevel, tieStyle, suitStyle, femaleStyle, background]);

  const recordUsage = () => {
    setUsage(prev => {
      const next = prev + 1;
      const key = `cnklabs_usage_${new Date().getFullYear()}_${new Date().getMonth()+1}`;
      localStorage.setItem(key, String(next));
      return next;
    });
  };

  const buildGeneratedItem = (src, engineLabel = "Demo Engine") => ({
    id: crypto.randomUUID(),
    title: portraitPreset ? `${portraitPresets.find(p => p.id === portraitPreset)?.label} — ${portraitPreset === "student" ? schoolLevel : "Formal"}` : (prompt.trim() ? prompt.trim().slice(0, 34) : "AI Generated Image"),
    prompt: enhanced,
    style,
    ratio: portraitPreset ? photoSize : ratio,
    portraitPreset,
    schoolLevel,
    referenceImage: referenceImage?.data || null,
    engine: engineLabel,
    src,
    date: new Date().toLocaleString("id-ID")
  });

  const generateImage = async () => {
    if (usage >= 15) { setShowPlans(true); return; }
    setGenerating(true);
    setProviderMessage("");
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhanced,
          imageData: referenceImage?.data || null,
          ratio: portraitPreset ? photoSize : ratio,
          quality,
          mode: referenceImage ? "image-to-image" : "text-to-image"
        })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.imageData) {
        const item = buildGeneratedItem(data.imageData, data.provider || "AI Provider");
        setResult(item);
        setGallery(prev => [item, ...prev].slice(0, 4));
        recordUsage();
        setProviderMessage("AI provider aktif — hasil dibuat oleh mesin AI nyata.");
        return;
      }
      if (data?.error && data.configured) {
        setProviderMessage(`Provider belum siap: ${data.error}`);
      }
      await new Promise(resolve => setTimeout(resolve, 700));
      const demo = demoImages[Math.floor(Math.random() * demoImages.length)];
      const item = buildGeneratedItem(demo.src, "Demo Engine (fallback)");
      setResult({ ...item, title: demo.title });
      setGallery(prev => [item, ...prev].slice(0, 4));
      recordUsage();
    } catch (error) {
      setProviderMessage("Backend AI belum tersedia. Demo Engine digunakan sebagai fallback.");
      const demo = demoImages[Math.floor(Math.random() * demoImages.length)];
      const item = buildGeneratedItem(demo.src, "Demo Engine (fallback)");
      setResult({ ...item, title: demo.title });
      setGallery(prev => [item, ...prev].slice(0, 4));
      recordUsage();
    } finally {
      setGenerating(false);
    }
  };

  const handleReference = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReferenceImage({ name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  };


  const copyPrompt = async () => {
    await navigator.clipboard?.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadImage = async (item) => {
    try {
      const res = await fetch(item.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "cnklabs-ai-image.jpg"; a.click();
      URL.revokeObjectURL(url);
    } catch { window.open(item.src, "_blank"); }
  };

  const clearHistory = () => {
    setGallery([]);
    setResult(null);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18}/></div>
          <div><strong>CNKlabs</strong><span>AI Image Generation</span></div>
        </div>
        <nav>
          <button className={active === "create" ? "nav active" : "nav"} onClick={() => {setActive("create");setMobileMenu(false)}}><Wand2/> Create</button>
          <button className={active === "gallery" ? "nav active" : "nav"} onClick={() => {setActive("gallery");setMobileMenu(false)}}><ImageIcon/> Gallery <em>{gallery.length}</em></button>
          <button className={active === "history" ? "nav active" : "nav"} onClick={() => {setActive("history");setMobileMenu(false)}}><History/> History</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="provider-card">
            <span className="dot"></span>
            <div><b>AI Provider Layer</b><small>Hugging Face + Demo fallback</small></div>
          </div>
          <small className="dev">Developed by <b>CNKlabs</b></small>
        </div>
      </aside>

      <main className="main">
        <header>
          <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}><Menu/></button>
          <div>
            <p className="eyebrow">CREATIVE WORKSPACE</p>
            <h1>{active === "create" ? "Create anything from an idea." : active === "gallery" ? "Your creations." : "Generation history."}</h1>
          </div>
          <div className="header-actions"><span className="status"><span className="dot"></span> Ready</span></div>
        </header>

        {active === "create" && (
          <section className="workspace">
            <div className="composer card">
              <div className="card-head">
                <div><span className="kicker">01 / PROMPT</span><h2>Describe your image</h2></div>
                <button className="icon-btn" title="Enhance prompt" onClick={() => setPrompt(enhanced)}><Sparkles size={17}/></button>
              </div>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Contoh: buat ilustrasi sistem tata surya untuk siswa kelas 6..." />
              <div className="quick-prompts">
                {["Sistem tata surya untuk kelas 6", "Poster literasi digital", "Laboratorium sains futuristik"].map(x =>
                  <button key={x} onClick={() => setPrompt(x)}>{x}</button>
                )}
              </div>
              <div className="assistant">
                <div className="assistant-title"><Sparkles size={15}/> Prompt Assistant</div>
                <p>{enhanced}</p>
                <div className="assistant-actions"><button onClick={copyPrompt}><Copy size={14}/>{copied ? "Copied" : "Copy enhanced prompt"}</button></div>
              </div>
            </div>

            <div className="controls card">
              <div className="card-head"><div><span className="kicker">02 / SETTINGS</span><h2>Generation settings</h2></div><SlidersHorizontal size={18}/></div>
              <label>Special portrait presets</label>
              <div className="portrait-grid">
                {portraitPresets.map(p => (
                  <button
                    className={portraitPreset === p.id ? "portrait-card selected" : "portrait-card"}
                    onClick={() => {
                      const next = portraitPreset === p.id ? null : p.id;
                      setPortraitPreset(next);
                      if (next) setPrompt(p.description);
                    }}
                    key={p.id}
                  >
                    <span className="portrait-icon">{p.icon}</span>
                    <span><b>{p.label}</b><small>{p.description}</small></span>
                  </button>
                ))}
              </div>
              {portraitPreset && <div className="portrait-studio">
                <div className="studio-title"><Sparkles size={15}/> Portrait Studio</div>
                <label>Foto referensi (opsional)</label>
                <label className="upload-box">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleReference(e.target.files?.[0])}/>
                  {referenceImage ? <><Check size={16}/> {referenceImage.name}</> : <><Plus size={16}/> Upload foto referensi</>}
                </label>
                {referenceImage && <button className="remove-preset" onClick={() => setReferenceImage(null)}>× Hapus foto referensi</button>}
                {portraitPreset === "student" && <>
                  <label>Jenjang sekolah</label>
                  <div className="chips">{Object.keys(studentLevels).map(x => <button className={schoolLevel===x?"chip selected":"chip"} onClick={()=>setSchoolLevel(x)} key={x}>{x}</button>)}</div>
                  <label>Seragam</label>
                  <div className="select-wrap"><select value={studentUniform} onChange={e=>setStudentUniform(e.target.value)}><option>Putih-merah</option><option>Putih-biru</option><option>Putih-abu-abu</option></select><ChevronDown/></div>
                </>}
                {(portraitPreset === "student" || portraitPreset === "formal-male") && <>
                  <label>Pilihan dasi</label>
                  <div className="select-wrap"><select value={tieStyle} onChange={e=>setTieStyle(e.target.value)}>{portraitOptions.ties.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></div>
                </>}
                {portraitPreset === "formal-male" && <><label>Model jas</label><div className="select-wrap"><select value={suitStyle} onChange={e=>setSuitStyle(e.target.value)}>{portraitOptions.suits.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></div></>}
                {portraitPreset === "formal-female" && <><label>Model pakaian wanita</label><div className="select-wrap"><select value={femaleStyle} onChange={e=>setFemaleStyle(e.target.value)}>{portraitOptions.female.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></div></>}
                <label>Background</label><div className="select-wrap"><select value={background} onChange={e=>setBackground(e.target.value)}>{portraitOptions.backgrounds.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></div>
                <label>Ukuran foto</label><div className="ratio-grid">{portraitOptions.sizes.map(r=><button className={photoSize===r[0]?"ratio selected":"ratio"} onClick={()=>setPhotoSize(r[0])} key={r[0]}><b>{r[0]}</b><small>{r[1]}</small></button>)}</div>
              </div>}
              {portraitPreset && <button className="remove-preset" onClick={() => setPortraitPreset(null)}>× Remove portrait preset</button>}
              <label>Purpose</label>
              <div className="chips">{["Kreatif","Pembelajaran","Poster","Sosial Media"].map(x => <button className={purpose===x?"chip selected":"chip"} onClick={()=>setPurpose(x)} key={x}>{x}</button>)}</div>
              <label>Visual style</label>
              <div className="select-wrap"><select value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(s=><option key={s[0]}>{s[0]}</option>)}</select><ChevronDown/></div>
              <label>Aspect ratio</label>
              <div className="ratio-grid">{ratios.map(r=><button className={ratio===r[0]?"ratio selected":"ratio"} onClick={()=>setRatio(r[0])} key={r[0]}><b>{r[0]}</b><small>{r[1]}</small></button>)}</div>
              <label>Quality</label>
              <div className="chips">{["Standard","HD"].map(x => <button className={quality===x?"chip selected":"chip"} onClick={()=>setQuality(x)} key={x}>{x}</button>)}</div>
              <div className="usage-card"><div><b>Free plan</b><span>{usage}/15 foto bulan ini</span></div><div className="usage-bar"><i style={{width:`${Math.min(100,(usage/15)*100)}%`}} /></div><button onClick={()=>setShowPlans(true)}>Lihat paket</button></div>
              <button className="generate" onClick={generateImage} disabled={generating}>
                {generating ? <><RefreshCw className="spin"/> Creating...</> : usage >= 15 ? <><Layers3/> Lihat paket untuk lanjut</> : <><Sparkles/> Generate image</>}
              </button>
              <small className="demo-note">AI Provider Layer siap. Jika HF_TOKEN belum dipasang di Netlify, aplikasi otomatis memakai Demo Engine. Kuota 15 foto/bulan masih lokal untuk MVP.</small>{providerMessage && <div className="provider-message">{providerMessage}</div>}
            </div>

            <div className="result card">
              <div className="card-head"><div><span className="kicker">03 / RESULT</span><h2>Generated image</h2></div>{result && <button className="icon-btn" onClick={()=>setResult(null)}><X size={17}/></button>}</div>
              {result ? <div className="result-content">
                <img src={result.src} alt={result.title}/>
                <div className="result-meta"><div><b>{result.title}</b><span>{result.style} · {result.ratio} · {quality}</span></div><div className="result-buttons"><button onClick={()=>downloadImage(result)}><Download size={15}/> Download</button><button onClick={()=>setPrompt(result.prompt)}><Copy size={15}/> Use prompt</button></div></div>
              </div> : <div className="empty-result"><div className="empty-icon"><Layers3/></div><h3>Your canvas is waiting.</h3><p>Write an idea, tune the settings, then generate your first image.</p></div>}
            </div>
          </section>
        )}

        {(active === "gallery" || active === "history") && (
          <section className="gallery-page">
            <div className="gallery-toolbar">
              <div className="search"><Search size={16}/><input placeholder="Search creations..." /></div>
              <button className="clear-btn" onClick={clearHistory}><Trash2 size={15}/> Clear local history</button>
            </div>
            <div className="gallery-grid">
              {(gallery.length ? gallery : demoImages).map(item => <article className="gallery-item" key={item.id}>
                <img src={item.src} alt={item.title}/>
                <div className="gallery-info"><b>{item.title}</b><span>{item.style} · {item.ratio}</span><div><button onClick={()=>{setResult(item);setActive("create")}}><RefreshCw size={14}/> Open</button><button onClick={()=>downloadImage(item)}><Download size={14}/></button></div></div>
              </article>)}
            </div>
          </section>
        )}

        {showPlans && <div className="modal-backdrop" onClick={()=>setShowPlans(false)}><div className="plans-modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-head"><div><span className="kicker">CNKlabs / PLANS</span><h2>Pilih paket penggunaan</h2><p>Struktur langganan sudah disiapkan untuk tahap komersial.</p></div><button className="icon-btn" onClick={()=>setShowPlans(false)}><X size={17}/></button></div>
          <div className="plans-grid">{plans.map(plan=><article className={plan.id === "free" ? "plan featured" : "plan"} key={plan.id}><span className="plan-name">{plan.name}</span><h3>{plan.price}</h3><small>{plan.period}</small><b>{plan.limit}</b><ul>{plan.features.map(f=><li key={f}><Check size={14}/>{f}</li>)}</ul><button onClick={()=>setShowPlans(false)}>{plan.id === "free" ? "Paket aktif" : "Segera tersedia"}</button></article>)}</div>
          <small className="plan-note">Pembayaran belum diaktifkan pada MVP. Nanti paket dapat diperluas menjadi 1 bulan, 1 tahun, dan periode lain tanpa mengubah Portrait Studio.</small>
        </div></div>}
        <footer><span>CNKlabs AI Image Generation</span><span>Free 15 foto/bulan · Provider-ready architecture</span></footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
