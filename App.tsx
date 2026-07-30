import { useEffect, useState } from "react";
import { db } from "@/lib/supabase";
import { buscarPerfil, sair } from "@/lib/auth";
import { listarEstagios, listarPerfis } from "@/lib/dados";
import type { Profile, Estagio } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import FichaEstudante from "@/components/FichaEstudante";
import Mapa from "@/pages/Mapa";

export default function App() {
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [meuEstagio, setMeuEstagio] = useState<Estagio | null>(null);
  const [meuProfessor, setMeuProfessor] = useState<Profile | null>(null);

  useEffect(() => {
    db.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) {
        const p = await buscarPerfil(uid);
        setPerfil(p);
      }
      setCarregandoSessao(false);
    });
  }, []);

  useEffect(() => {
    if (perfil?.role !== "estudante") return;
    (async () => {
      const [estagios, perfis] = await Promise.all([listarEstagios(), listarPerfis()]);
      const meu = estagios.find((e) => e.estudante_id === perfil.id) || null;
      setMeuEstagio(meu);
      if (meu) setMeuProfessor(perfis.find((p) => p.id === meu.professor_id) || null);
    })();
  }, [perfil]);

  async function aoLogar(uid: string) {
    const p = await buscarPerfil(uid);
    setPerfil(p);
  }

  async function sairDaConta() {
    await sair();
    setPerfil(null);
  }

  if (carregandoSessao) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--texto2)" }}>Carregando...</div>;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          background: "var(--azul)",
          color: "#fff",
          padding: "1rem 1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.15rem" }}>🗺️ Mapa de Orientadores</h1>
          <div style={{ fontSize: ".75rem", opacity: 0.75 }}>Acompanhamento de estágio</div>
        </div>
        {perfil ? (
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
            <span style={{ fontSize: ".85rem" }}>{perfil.nome}</span>
            <button className="btn btn-sm btn-outline" style={{ background: "transparent", color: "#fff", borderColor: "#fff" }} onClick={sairDaConta}>
              Sair
            </button>
          </div>
        ) : (
          <button className="btn btn-sm" style={{ background: "#fff", color: "var(--azul)" }} onClick={() => setMostrarAuth(true)}>
            Entrar
          </button>
        )}
      </header>

      <main>
        {!perfil && (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--texto2)" }}>
            <p>Faça login como professor(a) ou estudante pra acessar o mapa de acompanhamento.</p>
          </div>
        )}

        {perfil?.role === "professor" && <Mapa perfil={perfil} />}

        {perfil?.role === "estudante" && (
          meuEstagio ? (
            <div style={{ padding: "1rem" }}>
              <FichaEstudante
                estudante={perfil}
                estagio={meuEstagio}
                professorNome={meuProfessor?.nome || "—"}
                perfil={perfil}
                onAtualizado={() => {}}
                inline
              />
            </div>
          ) : (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto2)" }}>Carregando sua ficha...</p>
          )
        )}
      </main>

      {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} onLogged={aoLogar} />}
    </div>
  );
}
