"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Lock, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AlertModal({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100"
      >
        <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2 italic">
          Aviso
        </h3>
        {/* Texto do modal escurecido para slate-600 */}
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-8 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase shadow-lg tracking-widest hover:bg-indigo-600 active:scale-95 transition-all"
        >
          Entendi
        </button>
      </motion.div>
    </div>
  );
}

export default function RedefinirSenha() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [alerta, setAlerta] = useState({ isOpen: false, msg: "" });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      setAlerta({ isOpen: true, msg: "A senha deve ter no mínimo 6 caracteres para ser segura." });
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setAlerta({ isOpen: true, msg: "Não foi possível atualizar: " + error.message });
    } else {
      setSucesso(true);
      setTimeout(() => (window.location.href = "/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6 font-sans select-none overflow-hidden">
      
      <AnimatePresence>
        {alerta.isOpen && (
          <AlertModal
            isOpen={alerta.isOpen}
            message={alerta.msg}
            onClose={() => setAlerta({ isOpen: false, msg: "" })}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />

        <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg relative z-10">
          <Zap size={32} fill="currentColor" />
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">
            Fin<span className="text-indigo-600">Lab</span>
          </h1>
          
          <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
            by{" "}
            <a 
              href="https://devlabzz.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-4"
            >
              DevLabzz
            </a>
          </p>

          <h2 className="text-lg font-black uppercase italic tracking-tighter mt-6 text-slate-900">
            Nova Senha
          </h2>
          {/* Subtítulo escurecido para slate-500 */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 italic">
            Segurança em primeiro lugar
          </p>
        </div>

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
              {/* Ícone escurecido para slate-400 */}
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              {/* Adicionado text-slate-900 e placeholder:text-slate-400 */}
              <input
                required
                type="password"
                placeholder="DIGITE A NOVA SENHA"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full pl-12 pr-4 py-5 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border-none font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest shadow-inner transition-all"
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
