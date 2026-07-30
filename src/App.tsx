import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/supabase";

const PERFIL_DEMO = {
  nome: "Seu Antônio",
  localizacao: "Mamanguape, Paraíba",
  culturas: ["Alface", "Couve", "Tomate", "Macaxeira"],
};

const SUGESTOES = [
  "Minha alface tá com as folhas amarelando",
  "Qual produto meu vendeu mais em outubro?",
  "Quanto eu lucrei esse mês?",
  "Vale a pena plantar mais tomate?",
];

/* ============================================================
   MASCOTE — Tomé, sprite em pixel art (estilo Undertale)
============================================================ */
function construirGradeTome(humor = "normal", piscando = false) {
  const cols = 22, rows = 26;
  const dentroElipse = (c: number, r: number, cx: number, cy: number, rx: number, ry: number) =>
    ((c - cx) / rx) ** 2 + ((r - cy) / ry) ** 2 <= 1;

  const corEm = (c: number, r: number): string | null => {
    if (r === 0 && [8, 10, 12, 13].includes(c)) return "#4C8C3B";
    if (r === 1 && [9, 10, 11, 13].includes(c)) return "#4C8C3B";
    if (dentroElipse(c, r, 10.5, 4.5, 4.3, 4.3)) {
      if (dentroElipse(c, r, 8.5, 3, 1.6, 1.1)) return "#F0705A";
      return "#D5432C";
    }

    if (piscando && humor === "normal") {
      if (r === 13 && c >= 6 && c <= 8) return "#1B2B1F";
      if (r === 13 && c >= 13 && c <= 15) return "#1B2B1F";
    } else if (humor === "feliz") {
      if (r === 12 && (c === 6 || c === 8)) return "#1B2B1F";
      if (r === 11 && c === 7) return "#1B2B1F";
      if (r === 12 && (c === 13 || c === 15)) return "#1B2B1F";
      if (r === 11 && c === 14) return "#1B2B1F";
    } else if (humor === "pensando") {
      if (dentroElipse(c, r, 7, 11.5, 1.4, 1.6)) return c <= 6.7 ? "#fff" : "#1B2B1F";
      if (dentroElipse(c, r, 14, 11.5, 1.4, 1.6)) return c <= 13.7 ? "#fff" : "#1B2B1F";
    } else if (humor === "confuso") {
      if (dentroElipse(c, r, 7, 12.5, 1.5, 1.9)) return c <= 6.6 ? "#fff" : "#1B2B1F";
      if (r === 13 && c >= 13 && c <= 15) return "#1B2B1F";
    } else {
      if (dentroElipse(c, r, 7, 12.5, 1.5, 1.9)) return c <= 6.6 ? "#fff" : "#1B2B1F";
      if (dentroElipse(c, r, 14, 12.5, 1.5, 1.9)) return c <= 13.6 ? "#fff" : "#1B2B1F";
    }

    if (humor === "feliz") {
      if (r === 16 && c >= 7 && c <= 14) return "#1B2B1F";
      if (r === 15 && (c === 7 || c === 14)) return "#1B2B1F";
    } else if (humor === "pensando") {
      if (r === 17 && c >= 9 && c <= 11) return "#1B2B1F";
    } else if (humor === "confuso") {
      if (r === 16 && c === 9) return "#1B2B1F";
      if (r === 17 && c === 10) return "#1B2B1F";
      if (r === 16 && c === 11) return "#1B2B1F";
      if (r === 17 && c === 12) return "#1B2B1F";
    } else {
      if (r === 16 && (c === 8 || c === 13)) return "#1B2B1F";
      if (r === 17 && c >= 9 && c <= 12) return "#1B2B1F";
    }

    if (dentroElipse(c, r, 5, 14.5, 1.1, 0.8)) return "#E8788A";
    if (dentroElipse(c, r, 16, 14.5, 1.1, 0.8)) return "#E8788A";
    if (dentroElipse(c, r, 1.3, 14, 2.6, 1.4)) return "#5FA83F";
    if (dentroElipse(c, r, 19.7, 14, 2.6, 1.4)) return "#4C8C3B";
    if (dentroElipse(c, r, 10.5, 13, 8.6, 7.3)) {
      if (dentroElipse(c, r, 7.5, 9, 2.6, 1.8)) return "#84D065";
      return "#6BBF4A";
    }
    if (r >= 14 && r <= 21 && Math.abs(c - 10.5) <= 1.1) return "#3C7530";
    if (dentroElipse(c, r, 10.5, 23, 10, 3.2)) return r <= 21.5 ? "#5C4530" : "#3A2A1B";
    return null;
  };

  const celulas: { c: number; r: number; cor: string | null }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) celulas.push({ c, r, cor: corEm(c, r) });
  }

  const mapa = new Map(celulas.map((cel) => [`${cel.c},${cel.r}`, cel.cor]));
  celulas.forEach((cel) => {
    if (!cel.cor) {
      const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const temVizinho = vizinhos.some(([dc, dr]) => mapa.get(`${cel.c + dc},${cel.r + dr}`));
      if (temVizinho) cel.cor = "#161616";
    }
  });

  return { celulas, cols, rows };
}

function Tome({ size = 40, humor = "normal", piscando = false, animado = true }: { size?: number; humor?: string; piscando?: boolean; animado?: boolean }) {
  const grade = construirGradeTome(humor, piscando);
  const altura = (size / grade.cols) * grade.rows;
  return (
    <div
      style={{
        display: "inline-block",
        animation: animado
          ? humor === "pensando"
            ? "tome-pensando 0.9s ease-in-out infinite"
            : "tome-bob 2.4s ease-in-out infinite"
          : "none",
      }}
    >
      <svg width={size} height={altura} viewBox={`0 0 ${grade.cols} ${grade.rows}`} shapeRendering="crispEdges">
        {grade.celulas
          .filter((cel) => cel.cor)
          .map((cel, i) => (
            <rect key={i} x={cel.c} y={cel.r} width="1.03" height="1.03" fill={cel.cor!} />
          ))}
      </svg>
    </div>
  );
}

type Mensagem = {
  role: "user" | "assistant";
  text: string;
  imagemPreview?: string | null;
  tool?: { nome: string; resultado: any } | null;
};

const NOME_FERRAMENTA: Record<string, string> = {
  buscar_produtos_usuario: "📦 produtos cadastrados",
  buscar_historico_vendas: "💰 histórico de vendas",
  buscar_custos_registrados: "🧾 custos registrados",
  calcular_financeiro: "🧮 cálculo financeiro",
};

export default function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: "assistant",
      text: `Oi, ${PERFIL_DEMO.nome}! Eu sou o Tomé 🍅, o brotinho que ajuda por aqui no FeiraFood. Posso dar uma força com dúvida de plantio, conta de custo e lucro, ou dar uma olhada em como estão suas vendas na plataforma. Bora nessa?`,
      tool: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [imagem, setImagem] = useState<{ base64: string; tipo: string; preview: string } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const [humorTome, setHumorTome] = useState("normal");
  const [piscando, setPiscando] = useState(false);
  const [lerAutomatico, setLerAutomatico] = useState(false);
  const [tocandoIndex, setTocandoIndex] = useState<number | null>(null);
  const [gravando, setGravando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reconhecimentoRef = useRef<any>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPiscando(true);
      setTimeout(() => setPiscando(false), 140);
    }, 3200 + Math.random() * 1500);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      window.speechSynthesis.cancel();
    };
  }, []);

  const cores = {
    verdeEscuro: "#2D5016",
    verdeQuadro: "#1B2B1F",
    terra: "#4A3524",
    milho: "#E8A83C",
    papel: "#FBF6EC",
    tomate: "#C1432E",
    tintaGiz: "#F2EFE4",
  };

  function escolherVozPt() {
    const vozes = window.speechSynthesis.getVoices();
    return vozes.find((v) => v.lang === "pt-BR") || vozes.find((v) => v.lang?.startsWith("pt")) || vozes[0] || null;
  }

  function falar(texto: string, index: number) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = "pt-BR";
    utter.rate = 1.0;
    utter.pitch = 1.05;
    const voz = escolherVozPt();
    if (voz) utter.voice = voz;
    utter.onend = () => setTocandoIndex(null);
    utter.onerror = () => setTocandoIndex(null);
    setTocandoIndex(index);
    window.speechSynthesis.speak(utter);
  }

  function pararDeFalar() {
    window.speechSynthesis.cancel();
    setTocandoIndex(null);
  }

  function alternarAudio(texto: string, index: number) {
    if (tocandoIndex === index) pararDeFalar();
    else falar(texto, index);
  }

  function iniciarGravacao() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErroApi("Seu navegador não suporta gravação de voz. Pode digitar sua pergunta.");
      return;
    }
    const reconhecimento = new SpeechRecognition();
    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = false;
    reconhecimento.interimResults = true;
    reconhecimento.onresult = (event: any) => {
      let texto = "";
      for (let i = 0; i < event.results.length; i++) texto += event.results[i][0].transcript;
      setInput(texto);
    };
    reconhecimento.onerror = () => setGravando(false);
    reconhecimento.onend = () => setGravando(false);
    reconhecimentoRef.current = reconhecimento;
    reconhecimento.start();
    setGravando(true);
  }

  function pararGravacao() {
    reconhecimentoRef.current?.stop();
    setGravando(false);
  }

  async function enviarMensagem() {
    if (!input.trim() && !imagem) return;
    setErroApi("");

    const novaMsgUsuario: Mensagem = { role: "user", text: input.trim(), imagemPreview: imagem?.preview || null };
    const historicoAtualizado = [...mensagens, novaMsgUsuario];
    setMensagens(historicoAtualizado);
    const imagemEnviada = imagem;
    setInput("");
    setImagem(null);
    setCarregando(true);
    setHumorTome("pensando");

    try {
      const historicoParaApi = historicoAtualizado.slice(0, -1).map((m) => ({ role: m.role, text: m.text }));

      const { data, error } = await db.functions.invoke("chat-ia", {
        body: {
          historico: historicoParaApi,
          mensagem: novaMsgUsuario.text,
          imagem: imagemEnviada ? { base64: imagemEnviada.base64, tipo: imagemEnviada.tipo } : null,
        },
      });

      if (error) throw error;
      if (data?.erro) throw new Error(data.erro);

      const textoFinal: string = data?.texto || "(sem resposta)";
      const ferramentaUsada = data?.ferramenta || null;

      const palavrasDeIncerteza = ["não tenho certeza", "não encontrei", "não sei", "não tenho informações", "sem dados"];
      const pareceIncerto = palavrasDeIncerteza.some((p) => textoFinal.toLowerCase().includes(p));
      setHumorTome(pareceIncerto ? "confuso" : "feliz");
      setTimeout(() => setHumorTome("normal"), 3000);

      setMensagens((prev) => {
        const novas = [...prev, { role: "assistant" as const, text: textoFinal, tool: ferramentaUsada }];
        if (lerAutomatico) setTimeout(() => falar(textoFinal, novas.length - 1), 150);
        return novas;
      });
    } catch (e) {
      setErroApi("Não consegui falar com o Tomé agora. Tenta de novo em instantes.");
      setHumorTome("confuso");
      setTimeout(() => setHumorTome("normal"), 3000);
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImagem({ base64, tipo: file.type, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: cores.papel, fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @keyframes tome-bob { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-3px) rotate(-1.5deg);} }
        @keyframes tome-pensando { 0%,100%{transform:translateY(0) rotate(-2deg);} 50%{transform:translateY(-2px) rotate(2deg);} }
        @keyframes msg-pop { from{opacity:0; transform:scale(.85) translateY(6px);} to{opacity:1; transform:scale(1) translateY(0);} }
        @keyframes pontinhos { 0%,80%,100%{opacity:.25; transform:translateY(0);} 40%{opacity:1; transform:translateY(-2px);} }
        @keyframes grava-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(193,67,46,.5);} 50%{box-shadow:0 0 0 7px rgba(193,67,46,0);} }
      `}</style>

      <div style={{ background: cores.verdeQuadro, padding: "1.1rem 1.2rem", borderBottom: `6px solid ${cores.milho}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <Tome size={38} humor={humorTome} piscando={piscando} />
          <div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "1.9rem", color: cores.tintaGiz, lineHeight: 1 }}>
              Tomé · FeiraFood
            </div>
            <div style={{ color: "rgba(242,239,228,.65)", fontSize: ".78rem", marginTop: ".1rem" }}>
              Conversando com {PERFIL_DEMO.nome} · {PERFIL_DEMO.localizacao}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: ".5rem", padding: ".8rem 1rem 0", overflowX: "auto" }}>
        {SUGESTOES.map((s, i) => (
          <button
            key={i}
            onClick={() => setInput(s)}
            style={{ flexShrink: 0, background: cores.tintaGiz, border: `1.5px dashed ${cores.terra}`, color: cores.terra, borderRadius: "999px", padding: ".4rem .9rem", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem 1rem 0" }}>
        <button
          onClick={() => { const novo = !lerAutomatico; setLerAutomatico(novo); if (!novo) pararDeFalar(); }}
          style={{ display: "flex", alignItems: "center", gap: ".4rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{ width: 34, height: 19, borderRadius: "999px", background: lerAutomatico ? cores.verdeEscuro : "rgba(74,53,36,.25)", position: "relative", transition: "background .2s" }}>
            <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: lerAutomatico ? 17 : 2, transition: "left .2s" }} />
          </div>
          <span style={{ fontSize: ".78rem", color: cores.terra, fontWeight: 600 }}>🔊 Ler respostas em voz alta</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {mensagens.map((m, i) => (
          <div key={i} style={{ marginBottom: "1rem", display: "flex", gap: ".5rem", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "msg-pop 0.3s ease-out" }}>
            {m.role === "assistant" && <div style={{ flexShrink: 0, marginTop: ".1rem" }}><Tome size={28} /></div>}
            <div style={{ maxWidth: "78%" }}>
              {m.imagemPreview && (
                <img src={m.imagemPreview} alt="enviada pelo usuário" style={{ width: 160, borderRadius: 10, marginBottom: ".4rem", border: `2px solid ${cores.terra}` }} />
              )}
              <div
                style={{
                  background: m.role === "user" ? cores.verdeEscuro : "#fff",
                  color: m.role === "user" ? "#fff" : "#2a2a2a",
                  padding: ".7rem .9rem",
                  borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  fontSize: ".92rem",
                  lineHeight: 1.5,
                  boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>

              {m.role === "assistant" && (
                <button
                  onClick={() => alternarAudio(m.text, i)}
                  style={{ marginTop: ".35rem", background: "none", border: `1.3px solid ${cores.terra}`, color: cores.terra, borderRadius: "999px", padding: ".2rem .6rem", fontSize: ".7rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {tocandoIndex === i ? "⏸️ Parar" : "🔊 Ouvir"}
                </button>
              )}

              {m.tool && (
                <div
                  style={{ marginTop: ".4rem", display: "inline-flex", alignItems: "center", gap: ".4rem", background: cores.milho, color: cores.verdeQuadro, borderRadius: "6px", padding: ".25rem .6rem", fontFamily: "'JetBrains Mono', monospace", fontSize: ".68rem", fontWeight: 600, border: `1.5px solid ${cores.verdeQuadro}` }}
                  title={JSON.stringify(m.tool.resultado)}
                >
                  🏷️ dado real: {NOME_FERRAMENTA[m.tool.nome] || m.tool.nome}
                </div>
              )}
            </div>
          </div>
        ))}

        {carregando && (
          <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-start" }}>
            <Tome size={28} humor="pensando" />
            <div style={{ background: "#fff", padding: ".7rem .9rem", borderRadius: "14px 14px 14px 3px", display: "flex", gap: ".25rem", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: cores.verdeEscuro, display: "inline-block", animation: `pontinhos 1.1s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {erroApi && <div style={{ color: cores.tomate, fontSize: ".8rem", textAlign: "center", marginTop: ".5rem" }}>{erroApi}</div>}
        <div ref={fimRef} />
      </div>

      {imagem && (
        <div style={{ padding: ".5rem 1rem 0", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <img src={imagem.preview} alt="prévia" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
          <span style={{ fontSize: ".78rem", color: cores.terra }}>Foto pronta pra enviar</span>
          <button onClick={() => setImagem(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: cores.tomate, cursor: "pointer" }}>✕</button>
        </div>
      )}

      <div style={{ display: "flex", gap: ".5rem", padding: "1rem", borderTop: "1px solid rgba(74,53,36,.15)" }}>
        <input type="file" accept="image/*" ref={fileRef} onChange={handleArquivo} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} style={{ background: cores.tintaGiz, border: `1.5px solid ${cores.terra}`, borderRadius: "10px", width: 42, flexShrink: 0, fontSize: "1.1rem", cursor: "pointer" }} title="Enviar foto">
          📷
        </button>
        <button
          onClick={() => (gravando ? pararGravacao() : iniciarGravacao())}
          style={{ background: gravando ? cores.tomate : cores.tintaGiz, border: `1.5px solid ${cores.terra}`, borderRadius: "10px", width: 42, flexShrink: 0, fontSize: "1.1rem", cursor: "pointer", animation: gravando ? "grava-pulse 1.1s infinite" : "none" }}
          title={gravando ? "Parar gravação" : "Gravar pergunta por voz"}
        >
          {gravando ? "⏺️" : "🎙️"}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
          placeholder="Digite sua pergunta..."
          style={{ flex: 1, border: "1.5px solid rgba(74,53,36,.25)", borderRadius: "10px", padding: "0 .8rem", fontSize: ".9rem", fontFamily: "inherit" }}
        />
        <button
          onClick={enviarMensagem}
          disabled={carregando}
          style={{ background: cores.verdeEscuro, color: "#fff", border: "none", borderRadius: "10px", width: 52, flexShrink: 0, fontSize: "1.1rem", cursor: carregando ? "default" : "pointer", opacity: carregando ? 0.6 : 1 }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
