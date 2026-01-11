"use client";
import React, { useState, useEffect, useMemo, cloneElement } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  Check,
  X,
  Search,
  Trash2,
  LogOut,
  AlertCircle,
  Save,
  BookOpen,
  History,
  Star,
  ShieldCheck,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Lock,
  Flag,
  Plus,
  PiggyBank,
  Wallet,
  MinusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENTE DE NOTIFICAÇÃO ---
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
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, scale: 0.5, x: "-50%" }}
      className={`fixed bottom-10 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl border text-white font-black text-[10px] uppercase tracking-widest min-w-[280px] justify-center ${
        type === "error"
          ? "bg-rose-500 border-rose-400"
          : "bg-emerald-500 border-emerald-400"
      }`}
    >
      {type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}{" "}
      {message}
    </motion.div>
  );
}

// --- MODAL DE RESGATE ESTILIZADO ---
function ResgateModal({
  isOpen,
  onConfirm,
  onCancel,
  darkMode,
  metaNome,
}: any) {
  const [valor, setValor] = useState("");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-100"
        } rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border`}
      >
        <div className="bg-amber-50 text-amber-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ArrowDownRight size={32} />
        </div>
        <h3
          className={`text-xl font-black text-center ${
            darkMode ? "text-white" : "text-slate-800"
          } uppercase tracking-tighter mb-1`}
        >
          Resgatar Valor
        </h3>
        <p className="text-[10px] text-center font-bold text-slate-500 uppercase mb-6 italic">
          {metaNome || "Cofre Geral"}
        </p>

        <input
          autoFocus
          type="number"
          placeholder="R$ 0,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={`w-full p-4 rounded-2xl text-center font-black text-lg outline-none mb-6 ${
            darkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
          }`}
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-4 rounded-2xl ${
              darkMode
                ? "bg-slate-700 text-slate-300"
                : "bg-slate-100 text-slate-600"
            } font-black text-[10px] uppercase tracking-widest`}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(valor);
              setValor("");
            }}
            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase shadow-lg tracking-widest"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- MODAL DE CONFIRMAÇÃO ---
function ConfirmModal({ isOpen, title, onConfirm, onCancel, darkMode }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-100"
        } rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border`}
      >
        <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} />
        </div>
        <h3
          className={`text-xl font-black ${
            darkMode ? "text-white" : "text-slate-800"
          } uppercase tracking-tighter mb-2`}
        >
          {title}
        </h3>
        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className={`flex-1 py-4 rounded-2xl ${
              darkMode
                ? "bg-slate-700 text-slate-300"
                : "bg-slate-100 text-slate-600"
            } font-black text-[10px] uppercase tracking-widest`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase shadow-lg tracking-widest"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SaaSFinanceiro() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<"dash" | "lista" | "cofre">(
    "dash"
  );
  const [viewMode, setViewMode] = useState<"mes" | "ano">("mes");
  const [darkMode, setDarkMode] = useState(false);
  const [showPriv, setShowPriv] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isMetaFormOpen, setIsMetaFormOpen] = useState(false);

  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [metas, setMetas] = useState<any[]>([]);
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [toast, setToast] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    isOpen: boolean;
  }>({ id: "", isOpen: false });

  const [resgateModal, setResgateModal] = useState({
    isOpen: false,
    metaNome: "",
  });

  const [userConfig, setUserConfig] = useState({
    nome: "INVESTIDOR",
    emoji: "🚀",
    meta: 20,
  });
  const [form, setForm] = useState({
    desc: "",
    valor: "",
    tipo: "Saída",
    cat: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [novaMeta, setNovaMeta] = useState({ nome: "", valor: "" });
  const [busca, setBusca] = useState("");
  const [novaCat, setNovaCat] = useState("");

  const emojisDisponiveis = [
    "🚀",
    "💰",
    "💎",
    "📈",
    "🏦",
    "🤑",
    "🔥",
    "👑",
    "🎯",
    "🍀",
    "💸",
    "📊",
  ];

  const formatValue = (val: number) =>
    !showPriv
      ? "••••••"
      : `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const carregarDados = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserConfig({
        nome:
          user.user_metadata?.display_name ||
          user.email?.split("@")[0].toUpperCase(),
        emoji: user.user_metadata?.emoji || "🚀",
        meta: user.user_metadata?.meta_save || 20,
      });
      if (user.user_metadata?.dark_mode !== undefined)
        setDarkMode(user.user_metadata.dark_mode);
      const [resT, resC, resM] = await Promise.all([
        supabase
          .from("transacoes")
          .select("*")
          .order("data", { ascending: true }),
        supabase
          .from("categorias")
          .select("*")
          .order("nome", { ascending: true }),
        supabase
          .from("metas")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      if (resT.data) setTransacoes(resT.data);
      if (resC.data) setCategorias(resC.data);
      if (resM.data) setMetas(resM.data);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const finance = useMemo(() => {
    const dInicio =
      viewMode === "mes" ? new Date(ano, mes, 1) : new Date(ano, 0, 1);
    const dFim =
      viewMode === "mes"
        ? new Date(ano, mes + 1, 0, 23, 59, 59)
        : new Date(ano, 11, 31, 23, 59, 59);
    const catsCofre = ["POUPANÇA", "INVESTIMENTO", "CAIXINHA"];

    const saldoAnterior = transacoes
      .filter((t) => new Date(t.data + "T12:00:00") < dInicio && t.pago)
      .reduce(
        (acc, t) => (t.tipo === "Entrada" ? acc + t.valor : acc - t.valor),
        0
      );

    const transPeriodo = transacoes.filter((t) => {
      const d = new Date(t.data + "T12:00:00");
      return d >= dInicio && d <= dFim;
    });

    // LÓGICA DO COFRE: Entradas no cofre (Depósitos) vs Saídas do cofre (Resgates)
    const depositosCofreTotal = transacoes
      .filter(
        (t) =>
          catsCofre.includes(t.categoria?.toUpperCase()) &&
          t.tipo === "Saída" &&
          t.pago
      )
      .reduce((a, b) => a + b.valor, 0);

    const saquesCofreTotal = transacoes
      .filter(
        (t) => t.categoria === "SAQUE COFRE" && t.tipo === "Entrada" && t.pago
      )
      .reduce((a, b) => a + b.valor, 0);

    const totalCofre = depositosCofreTotal - saquesCofreTotal;

    const transCofre = transacoes.filter(
      (t) =>
        catsCofre.includes(t.categoria?.toUpperCase()) ||
        t.categoria === "SAQUE COFRE"
    );

    // LÓGICA DO DASH: Resgate não é Receita, é abatimento de despesa
    const inVal = transPeriodo
      .filter(
        (t) => t.tipo === "Entrada" && t.categoria !== "SAQUE COFRE" && t.pago
      )
      .reduce((a, b) => a + b.valor, 0);

    const outPagasRaw = transPeriodo
      .filter((t) => t.tipo === "Saída" && t.pago)
      .reduce((a, b) => a + b.valor, 0);

    // Subtrai o que foi resgatado da despesa total para não distorcer o dash
    const resgatesNoPeriodo = transPeriodo
      .filter((t) => t.categoria === "SAQUE COFRE" && t.pago)
      .reduce((a, b) => a + b.valor, 0);

    const outTotal = Math.max(0, outPagasRaw - resgatesNoPeriodo);

    const mapa =
      viewMode === "mes"
        ? Array.from(
            { length: new Date(ano, mes + 1, 0).getDate() },
            (_, i) => ({ name: `${i + 1}`, ganhos: 0, gastos: 0, saldo: 0 })
          )
        : [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
          ].map((m) => ({ name: m, ganhos: 0, gastos: 0, saldo: 0 }));

    let accL = saldoAnterior;
    transPeriodo.forEach((t) => {
      const d = new Date(t.data + "T12:00:00");
      const idx = viewMode === "mes" ? d.getDate() - 1 : d.getMonth();
      if (mapa[idx] && t.pago) {
        if (t.tipo === "Entrada") mapa[idx].ganhos += t.valor;
        else mapa[idx].gastos += t.valor;
      }
    });

    const graphData = mapa.map((d) => {
      accL += d.ganhos - d.gastos;
      return { ...d, saldo: accL };
    });

    return {
      inVal,
      outTotal,
      totalCofre,
      transCofre,
      graphData,
      transPeriodo,
      saldoAcumuladoTotal:
        saldoAnterior + (inVal - (outPagasRaw - resgatesNoPeriodo)),
      economia: inVal > 0 ? ((inVal - outTotal) / inVal) * 100 : 0,
    };
  }, [transacoes, viewMode, mes, ano]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!form.valor || !form.desc || !user) return;
    await supabase.from("transacoes").insert([
      {
        descricao: form.desc.toUpperCase().trim(),
        valor: parseFloat(form.valor),
        tipo: form.tipo,
        categoria: form.cat || "GERAL",
        data: form.data,
        pago: false,
        user_id: user.id,
      },
    ]);
    setForm({ ...form, desc: "", valor: "" });
    carregarDados();
    setToast({ msg: "REGISTRADO!", type: "success" });
  };

  const handleSaqueAction = async (val: string) => {
    if (!val || isNaN(parseFloat(val))) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("transacoes").insert([
      {
        descricao: resgateModal.metaNome
          ? resgateModal.metaNome.toUpperCase().trim()
          : "RESGATE COFRE",
        valor: parseFloat(val),
        tipo: "Entrada", // Volta pro saldo principal
        categoria: "SAQUE COFRE",
        data: new Date().toISOString().split("T")[0],
        pago: true,
        user_id: user?.id,
      },
    ]);
    setResgateModal({ isOpen: false, metaNome: "" });
    carregarDados();
    setToast({ msg: "SALDO LIBERADO!", type: "success" });
  };

  const salvarPerfil = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.updateUser({
      data: {
        display_name: userConfig.nome,
        emoji: userConfig.emoji,
        meta_save: userConfig.meta,
        dark_mode: darkMode,
      },
    });
    setToast({ msg: "PERFIL ATUALIZADO!", type: "success" });
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-hidden transition-colors duration-500 font-sans p-4 md:p-6 ${
        darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      <ResgateModal
        isOpen={resgateModal.isOpen}
        metaNome={resgateModal.metaNome}
        darkMode={darkMode}
        onCancel={() => setResgateModal({ isOpen: false, metaNome: "" })}
        onConfirm={handleSaqueAction}
      />
      <ConfirmModal
        darkMode={darkMode}
        isOpen={confirmDelete.isOpen}
        title="Confirmar exclusão?"
        onConfirm={async () => {
          await supabase.from("transacoes").delete().eq("id", confirmDelete.id);
          carregarDados();
          setConfirmDelete({ id: "", isOpen: false });
          setToast({ msg: "APAGADO!", type: "success" });
        }}
        onCancel={() => setConfirmDelete({ id: "", isOpen: false })}
      />

      <div
        className={`w-full h-full max-h-screen md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* HEADER */}
        <header
          className={`p-4 md:p-8 flex flex-col md:flex-row justify-between items-center border-b shrink-0 gap-4 ${
            darkMode ? "border-slate-800" : "border-slate-50"
          }`}
        >
          <div className="flex items-center justify-between w-full md:w-auto gap-4 text-left">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase">
                {userConfig.nome}{" "}
                <span className="text-indigo-600">{userConfig.emoji}</span>
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPriv(!showPriv)}
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {showPriv ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-slate-800 text-amber-400"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between">
            <div
              className={`flex p-1 rounded-xl border ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={() => setViewMode("mes")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black ${
                  viewMode === "mes"
                    ? darkMode
                      ? "bg-slate-700 text-indigo-400"
                      : "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                MÊS
              </button>
              <button
                onClick={() => setViewMode("ano")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black ${
                  viewMode === "ano"
                    ? darkMode
                      ? "bg-slate-700 text-indigo-400"
                      : "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                ANO
              </button>
            </div>
            <div
              className={`flex h-10 px-2 rounded-xl border items-center justify-center ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
                className="p-2 text-slate-500"
              >
                <ChevronLeft size={14} />
              </button>
              <span
                className={`text-[10px] font-black uppercase w-20 md:w-28 text-center leading-none inline-flex items-center justify-center h-full ${
                  darkMode ? "text-slate-300" : "text-slate-800"
                }`}
              >
                {viewMode === "mes"
                  ? `${new Intl.DateTimeFormat("pt-BR", {
                      month: "short",
                    }).format(new Date(ano, mes))} ${ano}`
                  : `ANO ${ano}`}
              </span>
              <button
                onClick={() => setMes((m) => (m === 11 ? 0 : m + 1))}
                className="p-2 text-slate-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className={`hidden md:block p-3 rounded-xl shadow-lg hover:scale-105 transition-all ${
                darkMode ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <nav
          className={`px-6 md:px-10 flex gap-4 md:gap-8 shrink-0 border-b ${
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-100"
          }`}
        >
          {["dash", "lista", "cofre"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`py-4 text-[9px] md:text-[10px] font-black tracking-[0.2em] border-b-4 transition uppercase ${
                activeTab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400"
              }`}
            >
              {t === "dash"
                ? "📊 DASHBOARD"
                : t === "lista"
                ? "📑 LANÇAMENTOS"
                : "🔐 COFRE"}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-hidden p-4 md:p-8 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === "dash" ? (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col gap-6 overflow-y-auto text-left"
              >
                <div className="grid grid-cols-2 md:flex gap-4 md:gap-6">
                  {[
                    {
                      label: "Saldo Acumulado",
                      val: finance.saldoAcumuladoTotal,
                      icon: <History />,
                      color: "text-indigo-500",
                    },
                    {
                      label: "Receita Mês",
                      val: finance.inVal,
                      icon: <ArrowUpRight />,
                      color: "text-emerald-500",
                    },
                    {
                      label: "Despesas Mês",
                      val: finance.outTotal,
                      icon: <ArrowDownRight />,
                      color: "text-rose-500",
                    },
                    {
                      label: "Economia",
                      val: finance.economia,
                      icon: <Target />,
                      color: darkMode ? "text-white" : "text-slate-900",
                      isPerc: true,
                      bg: darkMode ? "bg-slate-800" : "bg-indigo-50",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-[2.5rem] flex-1 h-32 relative overflow-hidden ${
                        darkMode
                          ? "bg-slate-800"
                          : card.bg || "bg-white shadow-sm"
                      }`}
                    >
                      <div
                        className={`absolute -right-4 -top-4 opacity-10 ${card.color}`}
                      >
                        {cloneElement(card.icon as any, { size: 100 })}
                      </div>
                      <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest relative z-10">
                        {card.label}
                      </p>
                      <h3
                        className={`text-xl md:text-2xl font-black mt-2 ${card.color} relative z-10`}
                      >
                        {card.isPerc
                          ? showPriv
                            ? `${Math.round(card.val)}%`
                            : "•••"
                          : formatValue(card.val)}
                      </h3>
                    </div>
                  ))}
                </div>
                {/* Gráficos */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                  <div
                    className={`lg:col-span-8 p-6 rounded-[3rem] border shadow-sm ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={finance.graphData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={darkMode ? "#334155" : "#f1f5f9"}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 9,
                            fontWeight: "bold",
                            fill: "#64748b",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            backgroundColor: darkMode ? "#1e293b" : "#fff",
                          }}
                        />
                        <Bar
                          dataKey="ganhos"
                          fill="#10b981"
                          barSize={8}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="gastos"
                          fill="#f43f5e"
                          barSize={8}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 p-6 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finance.graphData}>
                        <Area
                          type="monotone"
                          dataKey="saldo"
                          stroke="#818cf8"
                          strokeWidth={3}
                          fill="#6366f1"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "lista" ? (
              <motion.div
                key="lista"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-8 overflow-hidden text-left"
              >
                {/* Lançamentos Form e Lista */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div
                    className={`p-6 rounded-[2.5rem] border shadow-xl ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <form onSubmit={handleAdd} className="space-y-3">
                      <input
                        type="date"
                        value={form.data}
                        onChange={(e) =>
                          setForm({ ...form, data: e.target.value })
                        }
                        className={`w-full p-3 rounded-xl border-none font-bold text-xs outline-none ${
                          darkMode
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-900"
                        }`}
                      />
                      <input
                        placeholder="DESCRIÇÃO"
                        value={form.desc}
                        onChange={(e) =>
                          setForm({ ...form, desc: e.target.value })
                        }
                        className={`w-full p-3 rounded-xl border-none font-bold text-xs uppercase outline-none ${
                          darkMode
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-900"
                        }`}
                      />
                      <div className="flex gap-2">
                        <input
                          placeholder="VALOR"
                          type="number"
                          step="0.01"
                          value={form.valor}
                          onChange={(e) =>
                            setForm({ ...form, valor: e.target.value })
                          }
                          className={`w-1/2 p-3 rounded-xl border-none font-bold text-xs outline-none ${
                            darkMode
                              ? "bg-slate-800 text-white"
                              : "bg-slate-50 text-slate-900"
                          }`}
                        />
                        <select
                          value={form.tipo}
                          onChange={(e) =>
                            setForm({ ...form, tipo: e.target.value })
                          }
                          className={`w-1/2 p-3 rounded-xl font-black text-[10px] uppercase outline-none border-none ${
                            form.tipo === "Entrada"
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-rose-500 bg-rose-500/10"
                          }`}
                        >
                          <option value="Saída">Gasto 🔴</option>
                          <option value="Entrada">Ganho 🟢</option>
                        </select>
                      </div>
                      <select
                        value={form.cat}
                        onChange={(e) =>
                          setForm({ ...form, cat: e.target.value })
                        }
                        className={`w-full p-3 rounded-xl font-bold text-[10px] uppercase border-none outline-none ${
                          darkMode
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-900"
                        }`}
                      >
                        <option value="">CATEGORIA</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.nome}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                      <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">
                        Registrar
                      </button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-8 flex flex-col overflow-hidden">
                  <div className="relative mb-6">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      placeholder="PESQUISAR..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none border ${
                        darkMode
                          ? "bg-slate-900 border-slate-800 text-white"
                          : "bg-white border-slate-100 text-slate-900"
                      }`}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-24 custom-scrollbar text-left">
                    {finance.transPeriodo
                      .slice()
                      .reverse()
                      .filter((t) =>
                        t.descricao.toLowerCase().includes(busca.toLowerCase())
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-5 rounded-[2.5rem] border transition-all ${
                            t.pago
                              ? darkMode
                                ? "bg-slate-800/40 border-slate-700"
                                : "bg-slate-50/50 border-slate-100 shadow-sm"
                              : darkMode
                              ? "bg-slate-900 border-indigo-500/20"
                              : "bg-white shadow-xl border-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                supabase
                                  .from("transacoes")
                                  .update({ pago: !t.pago })
                                  .eq("id", t.id)
                                  .then(carregarDados)
                              }
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                t.pago
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              <Check size={20} strokeWidth={4} />
                            </button>
                            <div>
                              <span className="text-[10px] font-black uppercase text-indigo-500">
                                {t.categoria}
                              </span>
                              <h4
                                className={`font-black text-sm uppercase ${
                                  t.pago
                                    ? "text-slate-500 line-through"
                                    : darkMode
                                    ? "text-white"
                                    : "text-slate-800"
                                }`}
                              >
                                {t.descricao}
                              </h4>
                              <p className="text-[9px] font-bold text-slate-500">
                                {new Date(
                                  t.data + "T12:00:00"
                                ).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p
                              className={`font-black text-base ${
                                t.tipo === "Entrada"
                                  ? "text-emerald-500"
                                  : "text-rose-500"
                              }`}
                            >
                              {t.tipo === "Entrada" ? "+" : "-"}{" "}
                              {formatValue(t.valor)}
                            </p>
                            <button
                              onClick={() =>
                                setConfirmDelete({ id: t.id, isOpen: true })
                              }
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* --- ABA COFRE --- */
              <motion.div
                key="cofre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col gap-6 overflow-hidden text-left relative"
              >
                <div className="flex items-center justify-between px-2 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <PiggyBank size={18} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Total Guardado
                      </p>
                      <h2 className="text-2xl font-black italic tracking-tighter leading-none">
                        {formatValue(finance.totalCofre)}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMetaFormOpen(!isMetaFormOpen)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-black text-[9px] uppercase shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                  >
                    <Plus size={14} /> Novo Objetivo
                  </button>
                </div>

                <AnimatePresence>
                  {isMetaFormOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 rounded-[2rem] border-2 border-indigo-500/30 shrink-0 ${
                        darkMode ? "bg-slate-900" : "bg-white shadow-xl"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-3 items-center">
                        <input
                          placeholder="O QUE VAI CONQUISTAR?"
                          value={novaMeta.nome}
                          onChange={(e) =>
                            setNovaMeta({ ...novaMeta, nome: e.target.value })
                          }
                          className={`flex-1 w-full p-3 rounded-xl text-[10px] font-black uppercase outline-none ${
                            darkMode
                              ? "bg-slate-800"
                              : "bg-slate-50 text-slate-900"
                          }`}
                        />
                        <input
                          type="number"
                          placeholder="VALOR ALVO (R$)"
                          value={novaMeta.valor}
                          onChange={(e) =>
                            setNovaMeta({ ...novaMeta, valor: e.target.value })
                          }
                          className={`w-full md:w-32 p-3 rounded-xl text-[10px] font-black outline-none ${
                            darkMode
                              ? "bg-slate-800"
                              : "bg-slate-50 text-slate-900"
                          }`}
                        />
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => setIsMetaFormOpen(false)}
                            className={`p-3 rounded-xl text-[9px] font-black uppercase ${
                              darkMode
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100"
                            }`}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={async () => {
                              if (!novaMeta.nome || !novaMeta.valor) return;
                              const {
                                data: { user },
                              } = await supabase.auth.getUser();
                              await supabase
                                .from("metas")
                                .insert([
                                  {
                                    nome: novaMeta.nome.toUpperCase().trim(),
                                    valor_objetivo: parseFloat(novaMeta.valor),
                                    user_id: user?.id,
                                  },
                                ]);
                              setNovaMeta({ nome: "", valor: "" });
                              setIsMetaFormOpen(false);
                              carregarDados();
                              setToast({
                                msg: "OBJETIVO LANÇADO!",
                                type: "success",
                              });
                            }}
                            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-md"
                          >
                            Criar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                  <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-3 custom-scrollbar">
                      {metas.length === 0 ? (
                        <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 font-black text-[10px] uppercase italic">
                          Nenhum objetivo ativo...
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {metas.map((m) => {
                            const acumulado = transacoes
                              .filter(
                                (t) =>
                                  t.descricao.toUpperCase().trim() ===
                                    m.nome.toUpperCase().trim() && t.pago
                              )
                              .reduce(
                                (acc, t) =>
                                  t.tipo === "Saída"
                                    ? acc + t.valor
                                    : acc - t.valor,
                                0
                              );
                            const prog = Math.max(
                              0,
                              Math.min(
                                (acumulado / m.valor_objetivo) * 100,
                                100
                              )
                            );

                            return (
                              <div
                                key={m.id}
                                className={`p-6 rounded-[2rem] border flex flex-col justify-between h-44 relative group ${
                                  darkMode
                                    ? "bg-slate-900 border-slate-800"
                                    : "bg-white border-slate-100 shadow-sm"
                                }`}
                              >
                                <div className="absolute top-4 right-4 flex gap-2">
                                  <button
                                    onClick={() =>
                                      setResgateModal({
                                        isOpen: true,
                                        metaNome: m.nome,
                                      })
                                    }
                                    className="p-2 bg-amber-500/10 text-amber-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:text-white"
                                  >
                                    <MinusCircle size={14} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await supabase
                                        .from("metas")
                                        .delete()
                                        .eq("id", m.id);
                                      carregarDados();
                                      setToast({
                                        msg: "APAGADO",
                                        type: "success",
                                      });
                                    }}
                                    className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      prog >= 100
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-indigo-500/10 text-indigo-500"
                                    }`}
                                  >
                                    <Star
                                      size={18}
                                      fill={
                                        prog >= 100 ? "currentColor" : "none"
                                      }
                                    />
                                  </div>
                                  <h4 className="font-black text-sm uppercase tracking-tight">
                                    {m.nome}
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end text-[9px] font-black uppercase">
                                    <span className="text-indigo-500">
                                      {formatValue(acumulado)}
                                    </span>
                                    <span className="text-slate-400">
                                      Meta: {formatValue(m.valor_objetivo)}
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${prog}%` }}
                                      className={`h-full ${
                                        prog >= 100
                                          ? "bg-emerald-500"
                                          : "bg-indigo-600"
                                      }`}
                                    />
                                  </div>
                                  <p className="text-[8px] font-black text-right text-slate-400">
                                    {prog.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* EXTRATO DO COFRE COM LÓGICA DE CORES CORRIGIDA */}
                  <div className="lg:col-span-4 flex flex-col min-h-0">
                    <div
                      className={`flex-1 rounded-[2rem] border flex flex-col overflow-hidden ${
                        darkMode
                          ? "bg-slate-900/50 border-slate-800"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="p-4 border-b border-inherit flex items-center gap-2 text-slate-500">
                        <History size={14} />
                        <h3 className="text-[9px] font-black uppercase">
                          Extrato do Cofre
                        </h3>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24 custom-scrollbar">
                        {finance.transCofre
                          .slice()
                          .reverse()
                          .map((t) => {
                            const isResgate = t.categoria === "SAQUE COFRE";
                            return (
                              <div
                                key={t.id}
                                className={`flex items-center justify-between p-3 rounded-2xl border ${
                                  darkMode
                                    ? "bg-slate-900 border-slate-800"
                                    : "bg-white border-slate-100 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                      isResgate
                                        ? "bg-rose-500/10 text-rose-500"
                                        : "bg-emerald-500/10 text-emerald-500"
                                    }`}
                                  >
                                    {isResgate ? (
                                      <ArrowDownRight size={12} />
                                    ) : (
                                      <ArrowUpRight size={12} />
                                    )}
                                  </div>
                                  <h4
                                    className={`font-black text-[8px] uppercase truncate w-20 ${
                                      darkMode ? "text-white" : "text-slate-800"
                                    }`}
                                  >
                                    {t.descricao}
                                  </h4>
                                </div>
                                <p
                                  className={`font-black text-[9px] ${
                                    isResgate
                                      ? "text-rose-500"
                                      : "text-emerald-500"
                                  }`}
                                >
                                  {formatValue(t.valor)}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      {/* SEÇÃO DE AJUSTES PRESERVADA */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              className={`${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-100"
              } w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative border`}
            >
              <button
                onClick={() => setIsConfigOpen(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-slate-900"
              >
                <X size={28} />
              </button>
              <h2 className="text-3xl font-black tracking-tighter mb-8 uppercase italic dark:text-white">
                Ajustes Finos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase block mb-2">
                      Seu Nome
                    </label>
                    <input
                      value={userConfig.nome}
                      onChange={(e) =>
                        setUserConfig({
                          ...userConfig,
                          nome: e.target.value.toUpperCase(),
                        })
                      }
                      className={`w-full p-4 rounded-2xl font-black border-none focus:ring-2 focus:ring-indigo-500 uppercase outline-none ${
                        darkMode ? "bg-slate-800 text-white" : "bg-slate-50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase block mb-2">
                      Avatar Atual: {userConfig.emoji}
                    </label>
                    <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                      {emojisDisponiveis.map((e) => (
                        <button
                          key={e}
                          onClick={() =>
                            setUserConfig({ ...userConfig, emoji: e })
                          }
                          className={`text-xl p-2 rounded-xl transition-all ${
                            userConfig.emoji === e
                              ? "bg-indigo-500 scale-110 shadow-lg"
                              : "hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={salvarPerfil}
                    className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                  >
                    <Save size={16} /> Salvar Perfil
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/login";
                    }}
                    className="w-full bg-rose-500/10 text-rose-500 p-5 rounded-2xl font-black text-[10px] uppercase mt-2 flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <LogOut size={16} /> Sair do Sistema
                  </button>
                </div>
                <div
                  className={`${
                    darkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-100"
                  } p-6 rounded-[2.5rem] border flex flex-col h-[340px]`}
                >
                  <label className="text-[10px] font-black text-slate-600 uppercase block mb-4 italic">
                    Categorias
                  </label>
                  <div className="flex gap-2 mb-4 shrink-0">
                    <input
                      placeholder="NOVA..."
                      value={novaCat}
                      onChange={(e) => setNovaCat(e.target.value)}
                      className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase border-none outline-none ${
                        darkMode ? "bg-slate-700 text-white" : "bg-white"
                      }`}
                    />
                    <button
                      onClick={async () => {
                        if (novaCat) {
                          await supabase
                            .from("categorias")
                            .insert([{ nome: novaCat.toUpperCase() }]);
                          setNovaCat("");
                          carregarDados();
                        }
                      }}
                      className="bg-slate-900 text-white px-4 rounded-xl font-black shadow-md"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 uppercase custom-scrollbar">
                    {categorias.map((c) => (
                      <div
                        key={c.id}
                        className={`flex justify-between items-center p-3 px-4 rounded-xl text-[10px] font-black shadow-sm border ${
                          darkMode
                            ? "bg-slate-900 border-slate-700"
                            : "bg-white border-slate-100"
                        }`}
                      >
                        <span>{c.nome}</span>
                        <button
                          onClick={() =>
                            setConfirmDelete({ id: c.id, isOpen: true })
                          }
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body {
          overflow: hidden;
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
