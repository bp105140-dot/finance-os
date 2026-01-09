"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Lock, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RedefinirSenha() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      alert("A SENHA DEVE TER NO MÍNIMO 6 CARACTERES");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      alert("ERRO AO ATUALIZAR: " + error.message);
    } else {
      setSucesso(true);
      setTimeout(() => (window.location.href = "/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />

        <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg relative z-10">
          <Zap size={32} fill="currentColor" />
        </div>

        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 relative z-10 text-slate-900">
          Nova Senha
        </h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 relative z-10 italic">
          Segurança em primeiro lugar
        </p>

        {sucesso ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-emerald-50 text-emerald-600 p-8 rounded-[2rem] flex flex-col items-center gap-4 border border-emerald-100 relative z-10"
          >
            <CheckCircle2 size={40} />
            <p className="font-black text-xs uppercase tracking-widest">
              Senha alterada com sucesso! Redirecionando...
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleUpdatePassword}
            className="space-y-4 relative z-10"
          >
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                required
                type="password"
                placeholder="DIGITE A NOVA SENHA"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full pl-12 pr-4 py-5 rounded-2xl bg-slate-50 border-none font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest shadow-inner transition-all"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "SALVANDO..." : "ATUALIZAR ACESSO"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
