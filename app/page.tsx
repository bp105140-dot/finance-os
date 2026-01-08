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
  TrendingUp,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CARD MÉTRICA (SETAS E ALVO) ---
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
  const [userConfig, setUserConfig] = useState({
    nome: "Investidor",
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

  // FUNÇÃO DE LOGOUT
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function carregarDados() {
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
    // Verifica usuário antes de carregar dados
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserConfig((prev) => ({
          ...prev,
          nome: user.email?.split("@")[0].toUpperCase() || "INVESTIDOR",
        }));
        carregarDados();
      }
    };
    checkUser();
  }, [mes, ano, viewMode]);

  const finance = useMemo(() => {
    const inVal = transacoes
      .filter((t) => t.tipo === "Entrada")
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
      const d = new Date(t.data);
      const idx = viewMode === "mes" ? d.getUTCDate() - 1 : d.getUTCMonth();
      if (mapa[idx]) {
        if (t.tipo === "Entrada") mapa[idx].ganhos += t.valor;
        else mapa[idx].gastos += t.valor;
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
      saldoPrevisto: inVal - outTotal,
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
        pago: form.tipo === "Entrada",
        user_id: user.id, // IMPORTANTE: Vincula ao usuário
      },
    ]);
    if (!error) {
      setForm({ ...form, desc: "", valor: "" });
      carregarDados();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-0 md:p-4 overflow-hidden select-none font-sans">
      <div className="w-full h-full max-h-screen bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
        {/* HEADER */}
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
            <div className="flex bg-slate-100 p-1 rounded-xl border items-center shrink-0">
              <button
                onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
                className="p-2"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-black uppercase w-20 md:w-28 text-center">
                {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
                  new Date(ano, mes)
                )}{" "}
                {ano}
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

        {/* NAVEGAÇÃO ABAS */}
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

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 overflow-hidden p-6 md:p-10 flex flex-col bg-slate-50/20">
          <AnimatePresence mode="wait">
            {activeTab === "dash" ? (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                  <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Fluxo de Caixa
                      </h3>
                    </div>
                    <div className="flex-1 min-h-0">
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
                  </div>

                  <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col shadow-2xl overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                      Evolução do Saldo
                    </h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={finance.graphData}>
                          <defs>
                            <linearGradient
                              id="grad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
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
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="lista"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 shrink-0 flex flex-col">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Plus
                        className="text-indigo-600"
                        size={16}
                        strokeWidth={3}
                      />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Novo Registro
                      </h3>
                    </div>
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
                              : "bg-white border-white shadow-xl shadow-slate-200/40"
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
                                {new Date(t.data).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
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
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MODAL CONFIG */}
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
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative"
            >
              <button
                onClick={() => setIsConfigOpen(false)}
                className="absolute top-8 right-8 text-slate-300"
              >
                <X size={28} />
              </button>
              <h2 className="text-3xl font-black tracking-tighter mb-10">
                Configurações
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Nome
                    </label>
                    <input
                      value={userConfig.nome}
                      onChange={(e) =>
                        setUserConfig({ ...userConfig, nome: e.target.value })
                      }
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-black">
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
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col h-64">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">
                    Categorias
                  </label>
                  <div className="flex gap-2 mb-4">
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
                      className="bg-indigo-600 text-white px-4 rounded-xl font-black"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {categorias.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center bg-white p-3 px-4 rounded-xl text-[10px] font-black uppercase shadow-sm"
                      >
                        <span>{c.nome}</span>
                        <button
                          onClick={async () => {
                            if (confirm("Apagar?")) {
                              await supabase
                                .from("categorias")
                                .delete()
                                .eq("id", c.id);
                              carregarDados();
                            }
                          }}
                          className="text-slate-200 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTÃO DE LOGOUT ADICIONADO */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 bg-rose-50 text-rose-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sair da Conta
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body {
          overflow: hidden;
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
