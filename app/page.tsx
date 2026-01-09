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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENTE DE NOTIFICAÇÃO (TOAST) ---
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
      {type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
      {message}
    </motion.div>
  );
}

// --- MODAL DE CONFIRMAÇÃO PERSONALIZADO ---
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
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">
              {title}
            </h3>
            <p className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest">
              Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all"
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
      className={`${bg} p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center flex-1 min-w-[160px] h-32`}
    >
      <div className={`absolute -right-4 -top-4 opacity-10 ${color}`}>
        {icon && cloneElement(icon, { size: 100 })}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest relative z-10">
        {label}
      </p>
      <h3
        className={`text-2xl font-black mt-2 ${color} relative z-10 tracking-tighter`}
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

    const primeiroDia =
      viewMode === "mes"
        ? new Date(ano, mes, 1).toISOString()
        : new Date(ano, 0, 1).toISOString();
    const ultimoDia =
      viewMode === "mes"
        ? new Date(ano, mes + 1, 0, 23, 59, 59).toISOString()
        : new Date(ano, 11, 31, 23, 59, 59).toISOString();

    const [resTrans, resCats] = await Promise.all([
      supabase
        .from("transacoes")
        .select("*")
        .gte("data", primeiroDia)
        .lte("data", ultimoDia)
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
  }, [mes, ano, viewMode]);

  const finance = useMemo(() => {
    // AJUSTE AQUI: Só soma entrada se estiver flegada (pago === true)
    const inVal = transacoes
      .filter((t) => t.tipo === "Entrada" && t.pago)
      .reduce((a, b) => a + b.valor, 0);

    const outTotal = transacoes
      .filter((t) => t.tipo === "Saída")
      .reduce((a, b) => a + b.valor, 0);
    const outPagas = transacoes
      .filter((t) => t.tipo === "Saída" && t.pago)
      .reduce((a, b) => a + b.valor, 0);
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

    let acc = 0;
    transacoes.forEach((t) => {
      const d = new Date(t.data + "T12:00:00");
      const idx = viewMode === "mes" ? d.getDate() - 1 : d.getMonth();
      if (mapa[idx]) {
        // AJUSTE NO GRÁFICO TAMBÉM: Só mostra no gráfico se estiver flegado
        if (t.pago) {
          if (t.tipo === "Entrada") mapa[idx].ganhos += t.valor;
          else mapa[idx].gastos += t.valor;
        }
      }
    });
    const graphData = mapa.map((d) => {
      acc += d.ganhos - d.gastos;
      return { ...d, saldo: acc };
    });

    return {
      inVal,
      outTotal,
      saldoReal: inVal - outPagas,
      economia,
      graphData,
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
        pago: false, // AJUSTE AQUI: Começa sempre como não flegado (pendente)
        user_id: user.id,
      },
    ]);
    if (!error) {
      setForm({ ...form, desc: "", valor: "" });
      carregarDados();
      setToast({ msg: "REGISTRADO!", type: "success" });
    }
  };

  const confirmarExclusao = async () => {
    const { error } = await supabase
      .from("transacoes")
      .delete()
      .eq("id", confirmDelete.id);
    if (!error) {
      carregarDados();
      setToast({ msg: "EXCLUÍDO!", type: "success" });
    }
    setConfirmDelete({ id: "", isOpen: false });
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
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmDelete({ id: "", isOpen: false })}
      />

      <div className="w-full h-full max-h-screen bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
        <header className="p-6 md:p-8 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">
              {userConfig.nome}{" "}
              <span className="text-indigo-600">{userConfig.emoji}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* SELETOR MÊS / ANO */}
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
              <span className="text-[10px] font-black uppercase w-28 text-center">
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
              className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 transition"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <nav className="px-10 flex gap-8 bg-white shrink-0 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("dash")}
            className={`py-4 text-[10px] font-black tracking-[0.2em] border-b-4 transition ${
              activeTab === "dash"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400"
            }`}
          >
            📊 DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab("lista")}
            className={`py-4 text-[10px] font-black tracking-[0.2em] border-b-4 transition ${
              activeTab === "lista"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400"
            }`}
          >
            📑 LANÇAMENTOS
          </button>
        </nav>

        <main className="flex-1 overflow-hidden p-6 md:p-10 flex flex-col bg-slate-50/20">
          <AnimatePresence mode="wait">
            {activeTab === "dash" ? (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col gap-8"
              >
                <div className="flex flex-wrap md:flex-nowrap gap-6 shrink-0">
                  <CardMetrica
                    label="Saldo Real"
                    value={finance.saldoReal}
                    icon={<Wallet />}
                    color="text-indigo-600"
                    bg="bg-white border-2 border-indigo-50"
                  />
                  <CardMetrica
                    label="Receita"
                    value={finance.inVal}
                    icon={<ArrowUpRight />}
                    color="text-emerald-600"
                  />
                  <CardMetrica
                    label="Despesas"
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
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
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
                          tick={{ fontSize: 10, fontWeight: "bold" }}
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
                          radius={[4, 4, 0, 0]}
                          barSize={viewMode === "mes" ? 8 : 25}
                        />
                        <Bar
                          dataKey="gastos"
                          fill="#f43f5e"
                          radius={[4, 4, 0, 0]}
                          barSize={viewMode === "mes" ? 8 : 25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col shadow-2xl overflow-hidden">
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
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 shrink-0 flex flex-col">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                    <form onSubmit={handleAdd} className="space-y-3">
                      <input
                        type="date"
                        value={form.data}
                        onChange={(e) =>
                          setForm({ ...form, data: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none"
                      />
                      <input
                        placeholder="DESCRIÇÃO"
                        value={form.desc}
                        onChange={(e) =>
                          setForm({ ...form, desc: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none uppercase"
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
                          className="w-1/2 p-3 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none"
                        />
                        <select
                          value={form.tipo}
                          onChange={(e) =>
                            setForm({ ...form, tipo: e.target.value })
                          }
                          className={`w-1/2 p-3 rounded-xl border-none font-black text-[10px] uppercase outline-none ${
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
                        className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-[10px] uppercase outline-none"
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
                </div>

                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                  <div className="relative mb-6 shrink-0">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      placeholder="PESQUISAR..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 pb-20">
                    {transacoes
                      .slice()
                      .reverse()
                      .filter((t) =>
                        t.descricao.toLowerCase().includes(busca.toLowerCase())
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-6 rounded-[2.5rem] border transition-all ${
                            t.pago
                              ? "bg-slate-50/50 border-slate-100"
                              : "bg-white shadow-xl shadow-slate-200/40 border-white"
                          }`}
                        >
                          <div className="flex items-center gap-6">
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
                                  : "bg-slate-100 text-slate-300"
                              }`}
                            >
                              <Check size={20} strokeWidth={4} />
                            </button>
                            <div>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${
                                  t.pago ? "text-slate-400" : "text-indigo-600"
                                }`}
                              >
                                {t.categoria}
                              </span>
                              <h4
                                className={`font-black text-sm uppercase ${
                                  t.pago
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {t.descricao}
                              </h4>
                              <p className="text-[9px] font-bold text-slate-300">
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
                              <Trash2 size={16} />
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
              className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl relative"
            >
              <button
                onClick={() => setIsConfigOpen(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"
              >
                <X size={28} />
              </button>
              <h2 className="text-3xl font-black tracking-tighter mb-10 uppercase italic">
                Ajustes Finos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
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
                      className="w-full p-4 bg-slate-50 rounded-2xl font-black border-none outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
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
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none text-center text-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
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
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={salvarPerfil}
                    className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <Save size={16} /> Salvar Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-rose-50 text-rose-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col h-72">
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
