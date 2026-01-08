"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENTE DE TOAST (O SUBSTITUTO DO ALERT) ---
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, scale: 0.5, x: "-50%" }}
      className={`fixed bottom-10 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-[2rem] shadow-2xl border text-white font-black text-xs uppercase tracking-widest min-w-[300px] justify-center ${
        type === "error"
          ? "bg-rose-500 border-rose-400"
          : "bg-emerald-500 border-emerald-400"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={18} />
      ) : (
        <CheckCircle2 size={18} />
      )}
      {message}
    </motion.div>
  );
}

export default function Login() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Estado para a notificação
  const [toast, setToast] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailLimpo = email.toLowerCase().trim();

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email: emailLimpo,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setToast({ msg: "Erro no cadastro: " + error.message, type: "error" });
      } else {
        setToast({ msg: "Sucesso! Verifique seu e-mail.", type: "success" });
        setIsRegistering(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password,
      });

      if (error) {
        setToast({
          msg: "Acesso Negado: E-mail ou senha incorretos",
          type: "error",
        });
      } else {
        setToast({ msg: "Acesso autorizado! Entrando...", type: "success" });
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans select-none overflow-hidden">
      {/* NOTIFICAÇÃO FLUTUANTE */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 flex flex-col items-center relative"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />

        <div className="bg-indigo-600 p-4 rounded-[2rem] text-white mb-6 shadow-xl shadow-indigo-100 relative z-10">
          <Zap size={32} fill="currentColor" />
        </div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">
            Finance<span className="text-indigo-600">.</span>OS
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">
            {isRegistering ? "Crie sua conta agora" : "Gerencie seu império"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="w-full space-y-4 relative z-10">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              required
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-inner"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              required
              type="password"
              placeholder="SENHA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase placeholder:text-slate-300 shadow-inner"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading
              ? "PROCESSANDO..."
              : isRegistering
              ? "CRIAR CONTA"
              : "ACESSAR DASHBOARD"}
            {!loading && (
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            {isRegistering
              ? "Já tenho uma conta? Entrar"
              : "Ainda não tem conta? Registre-se"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
