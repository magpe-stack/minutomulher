import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clipboard,
  Download,
  Facebook,
  Heart,
  ImagePlus,
  Instagram,
  Link2,
  Moon,
  Quote,
  Share2,
  Sparkles,
  Sun,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { phrases } from "@/data/phrases";
import { useTheme } from "@/contexts/ThemeContext";

const SESSION_KEY = "minuto-mulher-seen";
const ASSET_BASE = import.meta.env.BASE_URL;

type SessionState = { current: number; seen: number[] };

type CardPosition = "top" | "center" | "bottom";

function randomIndex(pool: number[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function startSession(): SessionState {
  let previous: number[] = [];
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]");
    if (Array.isArray(stored)) previous = stored.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < phrases.length);
  } catch {
    previous = [];
  }
  const available = phrases.map((_, index) => index).filter(index => !previous.includes(index));
  const pool = available.length ? available : phrases.map((_, index) => index);
  const current = randomIndex(pool);
  const seen = available.length ? [...previous, current] : [current];
  return { current, seen };
}

function nextSession(currentState: SessionState): SessionState {
  const available = phrases.map((_, index) => index).filter(index => !currentState.seen.includes(index));
  const pool = available.length ? available : phrases.map((_, index) => index).filter(index => index !== currentState.current);
  const current = randomIndex(pool);
  return { current, seen: available.length ? [...currentState.seen, current] : [current] };
}

function openPopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=640,height=640");
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState<SessionState>(() => startSession());
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [position, setPosition] = useState<CardPosition>("center");
  const [contrast, setContrast] = useState(68);
  const fileInput = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phrase = phrases[session.current] ?? phrases[0];
  const remaining = phrases.length - session.seen.length;

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session.seen));
  }, [session.seen]);

  useEffect(() => () => {
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
  }, [photo]);

  const positionLabel = useMemo(() => ({ top: "alto", center: "centro", bottom: "baixo" })[position], [position]);

  const unlock = () => {
    setSession(nextSession);
    setCopied(false);
    setShareOpen(false);
  };

  const copyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
      toast.success("Frase copiada para a área de transferência");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Não foi possível copiar agora");
    }
  };

  const sharePhrase = async () => {
    const shareData = { title: "Minuto Mulher", text: `“${phrase}” — Minuto Mulher` };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // The user closed the native sheet; keep the fallback available.
      }
    }
    setShareOpen(value => !value);
  };

  const shareWhatsApp = () => openPopup(`https://wa.me/?text=${encodeURIComponent(`“${phrase}” — Minuto Mulher`)}`);
  const shareX = () => openPopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`“${phrase}” — Minuto Mulher`)}`);
  const shareFacebook = () => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(phrase)}`);

  const pickPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem da sua galeria");
      return;
    }
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    toast.success("Foto adicionada ao card");
  };

  const drawCard = async (): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas indisponível");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexto de desenho indisponível");
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const drawBase = () => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#e2a3a5");
      gradient.addColorStop(0.5, "#9b78aa");
      gradient.addColorStop(1, "#4e477b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.beginPath(); ctx.arc(920, 150, 230, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,249,245,.11)";
      ctx.beginPath(); ctx.arc(50, 1240, 340, 0, Math.PI * 2); ctx.fill();
    };

    if (photo) {
      const image = new Image();
      image.src = photo;
      await new Promise<void>(resolve => { image.onload = () => resolve(); image.onerror = () => resolve(); });
      const scale = Math.max(width / image.width, height / image.height);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      ctx.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, width, height);
    } else {
      drawBase();
    }

    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, `rgba(26, 21, 42, ${Math.max(0.2, contrast / 170)})`);
    veil.addColorStop(0.48, `rgba(26, 21, 42, ${Math.max(0.12, contrast / 260)})`);
    veil.addColorStop(1, "rgba(26, 21, 42, .76)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,249,245,.92)";
    ctx.font = "600 28px Inter, Arial, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("MINUTO MULHER", 72, 94);
    ctx.letterSpacing = "0px";
    ctx.font = "italic 600 58px Georgia, serif";
    const lines = wrapCanvasText(ctx, phrase, width - 144);
    const lineHeight = 78;
    const startY = position === "top" ? 270 : position === "bottom" ? 970 - lines.length * lineHeight : 640 - (lines.length * lineHeight) / 2;
    lines.forEach((line, index) => ctx.fillText(line, 72, startY + index * lineHeight));
    ctx.font = "400 26px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,249,245,.7)";
    ctx.fillText("um minuto para lembrar do seu valor", 72, height - 76);

    return canvas.toDataURL("image/png", 1);
  };

  const downloadCard = async () => {
    const dataUrl = await drawCard();
    const link = document.createElement("a");
    link.download = "minuto-mulher-card.png";
    link.href = dataUrl;
    link.click();
    toast.success("Card salvo como imagem");
  };

  const shareCard = async () => {
    const dataUrl = await drawCard();
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "minuto-mulher-card.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Minuto Mulher", text: phrase, files: [file] });
        return;
      } catch {
        return;
      }
    }
    await downloadCard();
  };

  return (
    <div className="app-root">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="Minuto Mulher, página inicial">
          <span className="brand-mark"><img src={`${ASSET_BASE}logo.svg`} alt="" /></span>
          <span className="brand-lockup"><strong>Minuto</strong><em>Mulher</em></span>
        </a>
        <div className="topbar-actions">
          <span className="session-note"><Sparkles size={14} /> {remaining ? `${remaining} frases para descobrir` : "coleção completa"}</span>
          <button className="icon-button soft" onClick={toggleTheme} aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"} title={theme === "light" ? "Modo escuro" : "Modo claro"}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="content-grid">
        <section className="intro-column" aria-labelledby="page-title">
          <div className="eyebrow"><span /> UM MINUTO SÓ SEU</div>
          <h1 id="page-title">Uma frase para lembrar do seu <i>valor.</i></h1>
          <p className="intro-copy">Abra espaço para uma palavra que chega na hora certa. Inspire, desbloqueie e leve com você.</p>

          <div className="phrase-card" aria-live="polite">
            <div className="card-corner corner-tl" /><div className="card-corner corner-br" />
            <div className="phrase-topline"><span>FRASE {String(session.current + 1).padStart(3, "0")}</span><Heart size={16} fill="currentColor" /></div>
            <Quote className="quote-icon" size={42} strokeWidth={1.4} />
            <p className="phrase-text">{phrase}</p>
            <div className="phrase-footer"><span>MINUTO MULHER</span><span>{String(session.seen.length).padStart(3, "0")} / 1.000</span></div>
          </div>

          <div className="main-actions">
            <button className="unlock-button" onClick={unlock} aria-label="Desbloquear uma nova frase" title="Desbloquear nova frase"><WandSparkles size={21} /><span>desbloquear outra</span></button>
            <div className="secondary-actions">
              <button className={`icon-button ${copied ? "active" : ""}`} onClick={copyPhrase} aria-label="Copiar frase" title="Copiar frase">{copied ? <Check size={19} /> : <Clipboard size={19} />}</button>
              <div className="share-wrap">
                <button className="icon-button" onClick={sharePhrase} aria-label="Compartilhar frase" title="Compartilhar frase"><Share2 size={19} /></button>
                {shareOpen && <div className="share-menu" role="menu" aria-label="Opções de compartilhamento">
                  <button onClick={shareWhatsApp} aria-label="Compartilhar no WhatsApp" title="WhatsApp"><Link2 size={17} /></button>
                  <button onClick={shareX} aria-label="Compartilhar no X" title="X">𝕏</button>
                  <button onClick={shareFacebook} aria-label="Compartilhar no Facebook" title="Facebook"><Facebook size={17} /></button>
                </div>}
              </div>
            </div>
          </div>
          <p className="helper-line"><span className="helper-dot" /> cada frase só volta depois que todas forem descobertas</p>
        </section>

        <section className="studio-column" aria-labelledby="studio-title">
          <div className="studio-heading">
            <div><div className="eyebrow"><span /> ESTÚDIO DE CARD</div><h2 id="studio-title">Leve essa frase com você.</h2></div>
            <span className="studio-count">01 <small>/ 01</small></span>
          </div>
          <div className="studio-panel">
            <div className="studio-toolbar">
              <div><strong>Seu card</strong><span>feito para compartilhar</span></div>
              <label className="icon-button upload-button" aria-label="Escolher foto da galeria" title="Escolher foto da galeria"><ImagePlus size={19} /><input ref={fileInput} type="file" accept="image/*" onChange={pickPhoto} /></label>
            </div>
            <div className="card-preview" style={{ backgroundImage: photo ? `url(${photo})` : "linear-gradient(140deg, #e8b0ac 0%, #a27faf 50%, #4c4779 100%)" }}>
              {!photo && <><span className="preview-orb orb-a" /><span className="preview-orb orb-b" /></>}
              <div className="preview-shade" style={{ opacity: Math.min(0.82, Math.max(0.38, contrast / 100)) }} />
              <div className={`preview-copy position-${position}`}>
                <span className="preview-brand">MINUTO MULHER</span>
                <p>{phrase}</p>
                <span className="preview-signoff">um minuto para lembrar do seu valor</span>
              </div>
              {!photo && <div className="photo-hint"><ImagePlus size={17} /><span>adicione uma foto sua</span></div>}
            </div>
            <canvas ref={canvasRef} className="hidden-canvas" aria-hidden="true" />
            <div className="control-label"><span>Personalize seu card</span><small>ajuste a leitura da frase</small></div>
            <div className="studio-controls">
              <div className="control-group"><span>posição</span><div className="control-row">
                <button className={`icon-button tiny ${position === "top" ? "selected" : ""}`} onClick={() => setPosition("top")} aria-label="Texto no alto" title="Texto no alto"><ArrowUp size={16} /></button>
                <button className={`icon-button tiny ${position === "center" ? "selected" : ""}`} onClick={() => setPosition("center")} aria-label="Texto no centro" title="Texto no centro"><Quote size={15} /></button>
                <button className={`icon-button tiny ${position === "bottom" ? "selected" : ""}`} onClick={() => setPosition("bottom")} aria-label="Texto embaixo" title="Texto embaixo"><ArrowDown size={16} /></button>
              </div></div>
              <div className="control-group contrast-control"><span>contraste <b>{contrast}%</b></span><input aria-label="Contraste do texto" type="range" min="35" max="95" value={contrast} onChange={event => setContrast(Number(event.target.value))} /></div>
            </div>
            <div className="studio-actions">
              <button className="studio-share" onClick={shareCard} aria-label="Compartilhar card" title="Compartilhar card"><Share2 size={18} /></button>
              <button className="studio-download" onClick={downloadCard} aria-label="Baixar card como imagem" title="Baixar card como imagem"><Download size={18} /><span>baixar card</span></button>
            </div>
            <p className="studio-footnote"><Instagram size={14} /> pronto para seus stories, feed ou onde quiser</p>
          </div>
          <div className="tiny-brand-line"><span>feito para mulheres que não esquecem de si</span><span><span className="tiny-dot" /> 1.000 frases originais</span></div>
        </section>
      </main>
      <footer className="footer"><span>© Minuto Mulher</span><span>um lembrete gentil, todos os dias</span></footer>
    </div>
  );
}
