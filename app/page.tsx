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
  Wallet,
  Search,
  Trash2,
  Plus,
  LogOut,
  AlertCircle,
  Save,
  BookOpen,
  Info,
  History,
  Star,
  ShieldCheck,
  MousePointer2,
  ChevronDown,
  ChevronUp,
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
      className={`fixed bottom-10 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-[2rem] shadow-2xl border text-white font-black text-[10px] uppercase tracking-widest min-w-[280px] justify-center ${
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

// --- MODAL DE CONFIRMAÇÃO ---
function ConfirmModal({ isOpen, title, onConfirm, onCancel }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100"
          >
            <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">
              {title}
            </h3>
            <div className="flex gap-3 mt-8">
              <button
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- CARD MÉTRICA ---
function CardMetrica({
  label,
  value,
  icon,
  color,
  bg = "bg-white",
  isPerc = false,
}: any) {
  return (
    <div
      className={`${bg} p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center flex-1 min-w-[140px] md:min-w-[160px] h-32`}
    >
      <div className={`absolute -right-4 -top-4 opacity-10 ${color}`}>
        {icon && cloneElement(icon, { size: 100 })}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest relative z-10">
        {label}
      </p>
      <h3
        className={`text-xl md:text-2xl font-black mt-2 ${color} relative z-10 tracking-tighter`}
      >
        {isPerc
          ? `${Math.round(value)}%`
          : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
      </h3>
    </div>
  );
}

export default function SaaSFinanceiro() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<"dash" | "lista">("dash");
  const [viewMode, setViewMode] = useState<"mes" | "ano">("mes");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
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
  const [busca, setBusca] = useState("");
  const [novaCat, setNovaCat] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function salvarPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: userConfig.nome,
        emoji: userConfig.emoji,
        meta_save: userConfig.meta,
      },
    });
    if (!error) setToast({ msg: "PERFIL ATUALIZADO!", type: "success" });
    else setToast({ msg: "ERRO AO SALVAR", type: "error" });
  }

  async function carregarDados() {
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
    }

    const [resTrans, resCats] = await Promise.all([
      supabase
        .from("transacoes")
        .select("*")
        .order("data", { ascending: true }),
      supabase
        .from("categorias")
        .select("*")
        .order("nome", { ascending: true }),
    ]);

    if (resTrans.data) setTransacoes(resTrans.data);
    if (resCats.data) {
      setCategorias(resCats.data);
      if (!form.cat && resCats.data.length > 0)
        setForm((prev) => ({ ...prev, cat: resCats.data[0].nome }));
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const finance = useMemo(() => {
    const dataLimiteInicio =
      viewMode === "mes" ? new Date(ano, mes, 1) : new Date(ano, 0, 1);
    const dataLimiteFim =
      viewMode === "mes"
        ? new Date(ano, mes + 1, 0, 23, 59, 59)
        : new Date(ano, 11, 31, 23, 59, 59);

    const saldoAnterior = transacoes
      .filter(
        (t) => new Date(t.data + "T12:00:00") < dataLimiteInicio && t.pago
      )
      .reduce(
        (acc, t) => (t.tipo === "Entrada" ? acc + t.valor : acc - t.valor),
        0
      );

    const transacoesPeriodo = transacoes.filter((t) => {
      const d = new Date(t.data + "T12:00:00");
      return d >= dataLimiteInicio && d <= dataLimiteFim;
    });

    const inVal = transacoesPeriodo
      .filter((t) => t.tipo === "Entrada" && t.pago)
      .reduce((a, b) => a + b.valor, 0);
    const outTotal = transacoesPeriodo
      .filter((t) => t.tipo === "Saída")
      .reduce((a, b) => a + b.valor, 0);
    const outPagas = transacoesPeriodo
      .filter((t) => t.tipo === "Saída" && t.pago)
      .reduce((a, b) => a + b.valor, 0);

    const saldoAcumuladoTotal = saldoAnterior + (inVal - outPagas);
    const economia = inVal > 0 ? ((inVal - outTotal) / inVal) * 100 : 0;

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

    let accLocal = saldoAnterior;
    transacoesPeriodo.forEach((t) => {
      const d = new Date(t.data + "T12:00:00");
      const idx = viewMode === "mes" ? d.getDate() - 1 : d.getMonth();
      if (mapa[idx] && t.pago) {
        if (t.tipo === "Entrada") mapa[idx].ganhos += t.valor;
        else mapa[idx].gastos += t.valor;
      }
    });

    const graphData = mapa.map((d) => {
      accLocal += d.ganhos - d.gastos;
      return { ...d, saldo: accLocal };
    });

    return {
      inVal,
      outTotal,
      saldoAcumuladoTotal,
      economia,
      graphData,
      transacoesPeriodo,
    };
  }, [transacoes, viewMode, mes, ano]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!form.valor || !form.desc || !form.cat || !user) return;
    const { error } = await supabase.from("transacoes").insert([
      {
        descricao: form.desc.toUpperCase(),
        valor: parseFloat(form.valor),
        tipo: form.tipo,
        categoria: form.cat,
        data: form.data,
        pago: false,
        user_id: user.id,
      },
    ]);
    if (!error) {
      setForm({ ...form, desc: "", valor: "" });
      carregarDados();
      setToast({ msg: "REGISTRADO!", type: "success" });
      setIsFormExpanded(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-0 md:p-4 overflow-hidden select-none font-sans">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Deseja apagar?"
        onConfirm={async () => {
          await supabase.from("transacoes").delete().eq("id", confirmDelete.id);
          carregarDados();
          setConfirmDelete({ id: "", isOpen: false });
          setToast({ msg: "EXCLUÍDO!", type: "success" });
        }}
        onCancel={() => setConfirmDelete({ id: "", isOpen: false })}
      />

      <div className="w-full h-full max-h-screen bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
        {/* HEADER RESPONSIVO */}
        <header className="p-4 md:p-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-50 shrink-0 gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase">
                {userConfig.nome}{" "}
                <span className="text-indigo-600">{userConfig.emoji}</span>
              </h1>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="md:hidden p-3 bg-slate-900 text-white rounded-xl shadow-lg"
            >
              <Settings size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-slate-100 p-1 rounded-xl border items-center">
              <button
                onClick={() => setViewMode("mes")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                  viewMode === "mes"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                MÊS
              </button>
              <button
                onClick={() => setViewMode("ano")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                  viewMode === "ano"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                ANO
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border items-center shrink-0">
              <button
                onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
                className="p-2"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-black uppercase w-20 md:w-28 text-center">
                {viewMode === "mes"
                  ? `${new Intl.DateTimeFormat("pt-BR", {
                      month: "short",
                    }).format(new Date(ano, mes))} ${ano}`
                  : `ANO ${ano}`}
              </span>
              <button
                onClick={() => setMes((m) => (m === 11 ? 0 : m + 1))}
                className="p-2"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hidden md:block p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 transition"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <nav className="px-6 md:px-10 flex gap-4 md:gap-8 bg-white shrink-0 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("dash")}
            className={`py-4 text-[9px] md:text-[10px] font-black tracking-[0.2em] border-b-4 transition ${
              activeTab === "dash"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400"
            }`}
          >
            📊 DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab("lista")}
            className={`py-4 text-[9px] md:text-[10px] font-black tracking-[0.2em] border-b-4 transition ${
              activeTab === "lista"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400"
            }`}
          >
            📑 LANÇAMENTOS
          </button>
        </nav>

        <main className="flex-1 overflow-hidden p-4 md:p-10 flex flex-col bg-slate-50/20">
          <AnimatePresence mode="wait">
            {activeTab === "dash" ? (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col gap-4 md:gap-8 overflow-y-auto md:overflow-hidden custom-scrollbar"
              >
                <div className="grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap gap-3 md:gap-6 shrink-0">
                  <CardMetrica
                    label="Saldo Acumulado"
                    value={finance.saldoAcumuladoTotal}
                    icon={<History />}
                    color="text-indigo-600"
                    bg="bg-white border-2 border-indigo-50"
                  />
                  <CardMetrica
                    label="Receita Mês"
                    value={finance.inVal}
                    icon={<ArrowUpRight />}
                    color="text-emerald-600"
                  />
                  <CardMetrica
                    label="Despesas Mês"
                    value={finance.outTotal}
                    icon={<ArrowDownRight />}
                    color="text-rose-600"
                  />
                  <CardMetrica
                    label="Economia"
                    value={finance.economia}
                    isPerc
                    icon={<Target />}
                    color="text-slate-900"
                    bg="bg-indigo-100/50"
                  />
                </div>
                <div className="flex-1 min-h-[300px] md:min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 pb-4 md:pb-0">
                  <div className="lg:col-span-8 bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 flex flex-col shadow-sm h-[300px] md:h-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={finance.graphData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fontWeight: "bold" }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                          }}
                        />
                        <Bar
                          dataKey="ganhos"
                          fill="#10b981"
                          barSize={viewMode === "mes" ? 6 : 20}
                        />
                        <Bar
                          dataKey="gastos"
                          fill="#f43f5e"
                          barSize={viewMode === "mes" ? 6 : 20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white flex flex-col shadow-2xl overflow-hidden h-[200px] md:h-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finance.graphData}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="saldo"
                          stroke="#818cf8"
                          strokeWidth={3}
                          fill="url(#grad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="lista"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                    className="lg:hidden w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-between shadow-lg"
                  >
                    Novo Lançamento{" "}
                    {isFormExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  <AnimatePresence>
                    {(isFormExpanded ||
                      (typeof window !== "undefined" &&
                        window.innerWidth >= 1024)) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden lg:block"
                      >
                        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                          <form onSubmit={handleAdd} className="space-y-3">
                            <input
                              type="date"
                              value={form.data}
                              onChange={(e) =>
                                setForm({ ...form, data: e.target.value })
                              }
                              className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-xs shadow-inner"
                            />
                            <input
                              placeholder="DESCRIÇÃO"
                              value={form.desc}
                              onChange={(e) =>
                                setForm({ ...form, desc: e.target.value })
                              }
                              className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-xs uppercase shadow-inner"
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
                                className="w-1/2 p-3 rounded-xl bg-slate-50 border-none font-bold text-xs shadow-inner"
                              />
                              <select
                                value={form.tipo}
                                onChange={(e) =>
                                  setForm({ ...form, tipo: e.target.value })
                                }
                                className={`w-1/2 p-3 rounded-xl font-black text-[10px] uppercase outline-none ${
                                  form.tipo === "Entrada"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
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
                              className="w-full p-3 rounded-xl bg-slate-50 font-bold text-[10px] uppercase shadow-inner"
                            >
                              {categorias.map((c) => (
                                <option key={c.id} value={c.nome}>
                                  {c.nome}
                                </option>
                              ))}
                            </select>
                            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                              Registrar
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                  <div className="relative mb-4 md:mb-6 shrink-0">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      placeholder="PESQUISAR NO PERÍODO..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-3 md:space-y-4 pb-24">
                    {finance.transacoesPeriodo
                      .slice()
                      .reverse()
                      .filter((t) =>
                        t.descricao.toLowerCase().includes(busca.toLowerCase())
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all ${
                            t.pago
                              ? "bg-slate-50/50 border-slate-100"
                              : "bg-white shadow-xl shadow-slate-200/40 border-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 md:gap-6">
                            <button
                              onClick={() =>
                                supabase
                                  .from("transacoes")
                                  .update({ pago: !t.pago })
                                  .eq("id", t.id)
                                  .then(carregarDados)
                              }
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
                                t.pago
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-300"
                              }`}
                            >
                              <Check size={18} strokeWidth={4} />
                            </button>
                            <div>
                              <span
                                className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                                  t.pago ? "text-slate-400" : "text-indigo-600"
                                }`}
                              >
                                {t.categoria}
                              </span>
                              <h4
                                className={`font-black text-xs md:text-sm uppercase ${
                                  t.pago
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {t.descricao}
                              </h4>
                              <p className="text-[8px] md:text-[9px] font-bold text-slate-300">
                                {new Date(
                                  t.data + "T12:00:00"
                                ).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-4">
                            <p
                              className={`font-black text-sm md:text-base ${
                                t.tipo === "Entrada"
                                  ? "text-emerald-500"
                                  : "text-rose-500"
                              }`}
                            >
                              {t.tipo === "Entrada" ? "+" : "-"} R${" "}
                              {t.valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <button
                              onClick={() =>
                                setConfirmDelete({ id: t.id, isOpen: true })
                              }
                              className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* --- MODAIS DE CONFIGURAÇÃO E CENTRAL DE AJUDA --- */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100"
            >
              <button
                onClick={() => setIsConfigOpen(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-8 uppercase italic">
                Ajustes Finos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 uppercase">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">
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
                      className="w-full p-4 bg-slate-50 rounded-2xl font-black border-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">
                        Emoji
                      </label>
                      <input
                        value={userConfig.emoji}
                        onChange={(e) =>
                          setUserConfig({
                            ...userConfig,
                            emoji: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-slate-50 rounded-2xl text-center text-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">
                        Meta %
                      </label>
                      <input
                        type="number"
                        value={userConfig.meta}
                        onChange={(e) =>
                          setUserConfig({
                            ...userConfig,
                            meta: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={salvarPerfil}
                    className="w-full bg-indigo-600 text-white p-4 md:p-5 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Salvar Perfil
                  </button>
                  <button
                    onClick={() => setIsHelpOpen(true)}
                    className="w-full bg-slate-100 text-slate-600 p-4 md:p-5 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} /> Central de Ajuda
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-rose-50 text-rose-600 p-4 md:p-5 rounded-2xl font-black text-[10px] uppercase mt-2 flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
                <div className="bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-100 flex flex-col h-[300px] md:h-[340px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">
                    Categorias
                  </label>
                  <div className="flex gap-2 mb-4 shrink-0">
                    <input
                      placeholder="NOVA..."
                      value={novaCat}
                      onChange={(e) => setNovaCat(e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-white text-[10px] font-black uppercase outline-none shadow-sm"
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
                      className="bg-slate-900 text-white px-4 rounded-xl font-black"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {categorias.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center bg-white p-3 px-4 rounded-xl text-[10px] font-black uppercase shadow-sm border border-slate-100"
                      >
                        <span>{c.nome}</span>
                        <button
                          onClick={async () => {
                            setConfirmDelete({ id: c.id, isOpen: true });
                          }}
                          className="text-slate-200 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- CENTRAL DE AJUDA ELITE (COMPLETA) --- */}
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-5xl rounded-[3.5rem] p-8 md:p-14 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100"
            >
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"
              >
                <X size={32} />
              </button>
              <div className="space-y-16 text-left uppercase">
                <header className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shrink-0">
                    <Zap size={48} />
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
                      Manual de Elite
                    </h2>
                    <p className="text-[11px] font-black text-indigo-600 tracking-[0.4em] mt-2 opacity-80">
                      Domine o Finance.OS e mude o seu jogo financeiro
                    </p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                  {/* Bloco 01 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-900">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        01
                      </div>
                      <h3 className="font-black text-lg tracking-widest italic">
                        Saldo Acumulado
                      </h3>
                    </div>
                    <div className="space-y-4 text-[11px] font-bold text-slate-500 leading-loose">
                      <p>
                        <span className="text-indigo-600 font-black">
                          TRANSPORTE DE SALDO:
                        </span>{" "}
                        O sistema soma automaticamente o que sobrou dos meses
                        passados e adiciona ao mês atual. Se sobrou dinheiro,
                        você começa o novo mês no positivo!
                      </p>
                      <p>
                        <span className="text-rose-600 font-black">
                          DESPESAS PERÍODO:
                        </span>{" "}
                        Mostra o valor total de gastos que você registrou no
                        mês, mesmo que ainda não tenha pago. Ótimo para
                        planejamento bruto.
                      </p>
                    </div>
                  </div>
                  {/* Bloco 02 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-900">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        02
                      </div>
                      <h3 className="font-black text-lg tracking-widest italic">
                        A Regra do Check
                      </h3>
                    </div>
                    <div className="space-y-4 text-[11px] font-bold text-slate-500 leading-loose">
                      <p>
                        Todo lançamento nasce{" "}
                        <span className="underline">pendente</span>. O saldo
                        real só muda quando você clica no{" "}
                        <span className="text-emerald-600 font-black">
                          CHECK VERDE
                        </span>
                        .
                      </p>
                      <p>
                        <span className="text-emerald-600 font-black">
                          ENTRADAS:
                        </span>{" "}
                        Não aparecem no saldo até serem confirmadas.{" "}
                        <span className="text-rose-600 font-black">
                          SAÍDAS:
                        </span>{" "}
                        Use o check para marcar o que já saiu do seu extrato
                        bancário real.
                      </p>
                    </div>
                  </div>
                  {/* Bloco 03 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-900">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        03
                      </div>
                      <h3 className="font-black text-lg tracking-widest italic">
                        Visão Mensal vs Anual
                      </h3>
                    </div>
                    <div className="space-y-4 text-[11px] font-bold text-slate-500 leading-loose">
                      <p>
                        Alterne no topo para ver o ano inteiro. No modo{" "}
                        <span className="font-black">ANO</span>, cada barra do
                        gráfico resume um mês. O gráfico de{" "}
                        <span className="text-indigo-600 font-black">ÁREA</span>{" "}
                        mostra a sua evolução patrimonial total.
                      </p>
                    </div>
                  </div>
                  {/* Bloco 04 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-900">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        04
                      </div>
                      <h3 className="font-black text-lg tracking-widest italic">
                        Mobile e Atalhos
                      </h3>
                    </div>
                    <div className="space-y-4 text-[11px] font-bold text-slate-500 leading-loose">
                      <p>
                        No celular, o formulário de lançamento pode ser
                        recolhido para dar mais espaço à lista. Salve o site na
                        tela de início do seu smartphone para acesso rápido!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex items-center gap-4 text-[9px] font-black text-emerald-800">
                    <Star size={24} fill="currentColor" /> ACUMULAÇÃO DE CAPITAL
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex items-center gap-4 text-[9px] font-black text-indigo-800">
                    <ShieldCheck size={24} fill="currentColor" /> DADOS
                    PROTEGIDOS
                  </div>
                  <div className="bg-slate-100 p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-4 text-[9px] font-black text-slate-800">
                    <MousePointer2 size={24} /> ALTA PERFORMANCE
                  </div>
                </div>

                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="w-full bg-slate-900 text-white p-8 rounded-[2.5rem] font-black text-xs tracking-[0.5em] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all"
                >
                  ESTOU PRONTO PARA PROSPERAR!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body {
          overflow: hidden;
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
