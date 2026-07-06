import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Dumbbell, Waves, Activity, History, TrendingUp, Home as HomeIcon,
  Plus, Trash2, ChevronDown, ChevronUp, Save, X, ArrowLeft, Pencil,
  CheckCircle2, AlertCircle, ImageIcon
} from "lucide-react";

function imageSearchUrl(query) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + " ejercicio técnica")}`;
}

/* ------------------------------------------------------------------ */
/*  Tokens                                                              */
/* ------------------------------------------------------------------ */
const INK = "#12181A";        // near-black background
const PANEL = "#1B2325";      // card surface
const PANEL_2 = "#222C2E";    // raised surface
const LINE = "#2E3A3D";       // hairline
const TEAL = "#3ECFB2";       // signature accent — pulled from the gym's teal mats
const TEAL_DIM = "#276358";
const CORAL = "#E8845A";      // secondary accent — day B / warmth
const PAPER = "#EDF3F2";      // primary text
const MUTE = "#8FA3A0";       // secondary text

const TYPE_META = {
  A: { label: "Día A", sub: "Fuerza + hombro", color: TEAL },
  B: { label: "Día B", sub: "Fuerza + nado", color: CORAL },
  SWIM: { label: "Natación", sub: "Piscina", color: "#5CA8E8" },
};

/* ------------------------------------------------------------------ */
/*  Default routine data                                               */
/* ------------------------------------------------------------------ */
const DEFAULT_EXERCISES = {
  A: [
    { id: "a1", name: "Sentadilla goblet con mancuerna", sets: 3, reps: "12", cat: "squat", block: "circuito" },
    { id: "a2", name: "Remo horizontal en polea baja (alterno)", sets: 3, reps: "10/lado", cat: "pull", block: "circuito" },
    { id: "a3", name: "Press de pecho en banco", sets: 3, reps: "12", cat: "push", block: "circuito" },
    { id: "a4", name: "Zancada estática con mancuernas", sets: 3, reps: "10/pierna", cat: "lunge", block: "circuito" },
    { id: "a5", name: "Plancha antirotación en fitball", sets: 3, reps: "30 seg", cat: "plank", block: "circuito" },
    { id: "a6", name: "Face pull en polea alta", sets: 2, reps: "15", cat: "pull", block: "hombro" },
    { id: "a7", name: "Pallof press en polea", sets: 2, reps: "10/lado", cat: "rotation", block: "hombro" },
    { id: "a8", name: "Extensión lumbar en máquina", sets: 2, reps: "12", cat: "core", block: "hombro" },
  ],
  B: [
    { id: "b1", name: "Peso muerto rumano con mancuernas", sets: 3, reps: "10", cat: "hinge", block: "circuito" },
    { id: "b2", name: "Jalón al pecho en polea", sets: 3, reps: "12", cat: "pull", block: "circuito" },
    { id: "b3", name: "Press de hombro sentado con mancuernas", sets: 3, reps: "10", cat: "push", block: "circuito" },
    { id: "b4", name: "Prensa de piernas", sets: 3, reps: "12", cat: "squat", block: "circuito" },
    { id: "b5", name: "Wood chop en polea", sets: 2, reps: "10/lado", cat: "rotation", block: "hombro" },
    { id: "b6", name: "Plancha lateral", sets: 2, reps: "25-30 seg/lado", cat: "plank", block: "hombro" },
    { id: "b7", name: "Rotación externa hombro con banda (extra izq.)", sets: 2, reps: "15 (+5 izq)", cat: "rotation", block: "hombro" },
  ],
};

const WARMUP = {
  A: ["Movilidad de hombros (círculos, cat-cow) — 2 min", "Rotación externa de hombro con banda, énfasis izq. — 2×15", "Rotación de tronco de pie — 10/lado"],
  B: ["Movilidad de hombros con banda — 2 min", "Y-T-W con mancuernas ligeras — 10 reps cada letra", "Rotación de tronco de pie — 10/lado"],
};
const COOLDOWN = {
  A: ["Estiramiento pectoral y hombro izquierdo", "Rotadores de hombro", "Isquiotibiales y flexores de cadera"],
  B: ["Estiramiento dorsal ancho", "Rotadores de hombro (extra izq.)", "Pectoral e isquiotibiales"],
};

const CATS = [
  { id: "squat", label: "Sentadilla / pierna" },
  { id: "hinge", label: "Bisagra de cadera" },
  { id: "push", label: "Empuje" },
  { id: "pull", label: "Tracción" },
  { id: "lunge", label: "Zancada" },
  { id: "plank", label: "Plancha / core" },
  { id: "rotation", label: "Rotación / antirotación" },
  { id: "core", label: "Core / lumbar" },
];

/* ------------------------------------------------------------------ */
/*  Pictograms — abstract stick-figure diagrams per movement category  */
/* ------------------------------------------------------------------ */
function Pictogram({ cat, size = 40, color = TEAL }) {
  const common = { viewBox: "0 0 64 64", width: size, height: size, fill: "none", stroke: color, strokeWidth: 3.4, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (cat) {
    case "squat":
      return (<svg {...common}><circle cx="32" cy="9" r="4.4" /><path d="M32 13 L32 27 M32 27 L21 40 L19 52 M32 27 L43 40 L45 52 M24 20 L14 27 M40 20 L50 27" /></svg>);
    case "hinge":
      return (<svg {...common}><circle cx="20" cy="10" r="4.4" /><path d="M20 14 L34 30 M34 30 L52 24 M34 30 L30 48 M30 48 L20 56 M30 48 L42 54 M20 14 L10 22" /></svg>);
    case "push":
      return (<svg {...common}><circle cx="32" cy="9" r="4.4" /><path d="M32 13 L32 34 M32 20 L18 14 M32 20 L46 14 M32 34 L22 52 M32 34 L42 52" /></svg>);
    case "pull":
      return (<svg {...common}><circle cx="32" cy="9" r="4.4" /><path d="M32 13 L32 34 M32 18 L16 26 M32 18 L48 26 M32 34 L22 52 M32 34 L42 52" strokeDasharray="0" /><path d="M16 26 L8 20 M48 26 L56 20" /></svg>);
    case "lunge":
      return (<svg {...common}><circle cx="26" cy="9" r="4.4" /><path d="M26 13 L28 30 M28 30 L16 40 L14 52 M28 30 L46 34 L52 48 M20 20 L12 16 M34 22 L44 18" /></svg>);
    case "plank":
      return (<svg {...common}><circle cx="10" cy="34" r="4.4" /><path d="M14 34 L48 28 M20 34 L18 46 M34 30 L34 46 M48 28 L58 22" /></svg>);
    case "rotation":
      return (<svg {...common}><circle cx="32" cy="9" r="4.4" /><path d="M32 13 L32 34 M32 34 L22 52 M32 34 L42 52" /><path d="M18 20 A16 16 0 0 1 32 12 M46 20 A16 16 0 0 0 32 12" strokeDasharray="2 4" /><path d="M18 20 L14 16 M18 20 L14 24 M46 20 L50 16 M46 20 L50 24" /></svg>);
    case "core":
      return (<svg {...common}><circle cx="16" cy="14" r="4.4" /><path d="M16 18 L16 34 L34 40 M34 40 L50 30 M34 40 L38 54" /></svg>);
    case "run":
      return (<svg {...common}><circle cx="30" cy="9" r="4.4" /><path d="M30 13 L26 28 M26 28 L38 34 L46 26 M26 28 L14 40 M14 40 L18 52 M38 34 L34 48 L40 56" /></svg>);
    case "swim":
      return (<svg {...common}><circle cx="14" cy="20" r="4.4" /><path d="M18 22 L34 28 L50 20 M18 22 L10 34" /><path d="M6 46 Q12 40 18 46 T30 46 T42 46 T54 46" /></svg>);
    default:
      return (<svg {...common}><circle cx="32" cy="32" r="16" /></svg>);
  }
}

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                     */
/* ------------------------------------------------------------------ */
async function loadJSON(key, fallback) {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
      const res = await window.storage.get(key, false);
      if (!res) return fallback;
      return JSON.parse(res.value);
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
      await window.storage.set(key, JSON.stringify(value), false);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error", e);
  }
}

/* ------------------------------------------------------------------ */
/*  Time / pace helpers                                                 */
/* ------------------------------------------------------------------ */
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}
function paceSecPerKm(min, sec, km) {
  const totalSec = (Number(min) || 0) * 60 + (Number(sec) || 0);
  if (!km || km <= 0 || totalSec <= 0) return null;
  return totalSec / km;
}
function paceSecPer100m(min, sec, meters) {
  const totalSec = (Number(min) || 0) * 60 + (Number(sec) || 0);
  if (!meters || meters <= 0 || totalSec <= 0) return null;
  return (totalSec / meters) * 100;
}
function formatMMSS(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "--:--";
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                      */
/* ------------------------------------------------------------------ */
function Chip({ children, color = TEAL }) {
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
      className="text-[11px] font-medium px-2 py-0.5 rounded-full tracking-wide">
      {children}
    </span>
  );
}

function NumInput({ value, onChange, placeholder, w = "w-16" }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${w} bg-transparent border-b-2 text-center py-1.5 text-[15px] font-semibold outline-none focus:border-current transition-colors`}
      style={{ borderColor: LINE, color: PAPER }}
    />
  );
}

function PrimaryButton({ children, onClick, color = TEAL, icon: Icon, full }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-[15px] active:scale-[0.98] transition-transform`}
      style={{ background: color, color: INK }}
    >
      {Icon && <Icon size={17} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, color = MUTE }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg" style={{ color }}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom navigation                                                   */
/* ------------------------------------------------------------------ */
function TabBar({ screen, setScreen }) {
  const items = [
    { id: "home", label: "Inicio", icon: HomeIcon },
    { id: "history", label: "Historial", icon: History },
    { id: "progress", label: "Progreso", icon: TrendingUp },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around border-t backdrop-blur-md"
      style={{ background: `${INK}E8`, borderColor: LINE, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map((it) => {
        const active = screen === it.id;
        return (
          <button key={it.id} onClick={() => setScreen(it.id)}
            className="flex flex-col items-center gap-1 py-2.5 px-6">
            <it.icon size={20} strokeWidth={active ? 2.6 : 2} color={active ? TEAL : MUTE} />
            <span style={{ color: active ? TEAL : MUTE }} className="text-[10.5px] font-medium">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home screen                                                        */
/* ------------------------------------------------------------------ */
function Home({ sessions, onStart, onManage }) {
  const lastOf = (type) => {
    const found = sessions.filter((s) => s.type === type).sort((a, b) => b.date.localeCompare(a.date))[0];
    return found ? formatDate(found.date) : "todavía sin registrar";
  };
  return (
    <div className="px-5 pt-8 pb-6">
      <div className="mb-7">
        <p className="text-[12px] tracking-[0.18em] font-semibold" style={{ color: TEAL }}>MI ENTRENO</p>
        <h1 className="text-[26px] font-bold mt-1" style={{ color: PAPER }}>¿Qué toca hoy?</h1>
      </div>

      <div className="flex flex-col gap-3">
        {["A", "B", "SWIM"].map((type) => {
          const meta = TYPE_META[type];
          const Icon = type === "SWIM" ? Waves : Dumbbell;
          return (
            <button key={type} onClick={() => onStart(type)}
              className="text-left rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-transform"
              style={{ background: PANEL, border: `1px solid ${LINE}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}1F` }}>
                <Icon size={22} color={meta.color} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[16px]" style={{ color: PAPER }}>{meta.label}</h3>
                </div>
                <p className="text-[12.5px] mt-0.5" style={{ color: MUTE }}>{meta.sub} · última vez: {lastOf(type)}</p>
              </div>
              <span className="text-[13px] font-semibold" style={{ color: meta.color }}>Empezar</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-[11px] tracking-[0.14em] font-semibold mb-3" style={{ color: MUTE }}>RUTINA</p>
        <div className="flex gap-3">
          <GhostButton icon={Pencil} onClick={() => onManage("A")} color={TEAL}>Editar Día A</GhostButton>
          <GhostButton icon={Pencil} onClick={() => onManage("B")} color={CORAL}>Editar Día B</GhostButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Manage routine (add / remove exercises)                             */
/* ------------------------------------------------------------------ */
function ManageRoutine({ type, exercises, setExercises, onClose }) {
  const meta = TYPE_META[type];
  const list = exercises[type];
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("12");
  const [cat, setCat] = useState("squat");
  const [block, setBlock] = useState("circuito");

  const addExercise = () => {
    if (!name.trim()) return;
    const newEx = { id: `${type.toLowerCase()}-${Date.now()}`, name: name.trim(), sets: Number(sets) || 1, reps, cat, block };
    setExercises((prev) => ({ ...prev, [type]: [...prev[type], newEx] }));
    setName(""); setReps("12"); setSets(3);
  };
  const removeExercise = (id) => {
    setExercises((prev) => ({ ...prev, [type]: prev[type].filter((e) => e.id !== id) }));
  };

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose}><ArrowLeft size={20} color={PAPER} /></button>
        <h1 className="text-[19px] font-bold" style={{ color: PAPER }}>Editar {meta.label}</h1>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {list.map((ex) => (
          <div key={ex.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
            <Pictogram cat={ex.cat} size={28} color={meta.color} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: PAPER }}>{ex.name}</p>
              <p className="text-[12px]" style={{ color: MUTE }}>{ex.sets} × {ex.reps} · {ex.block === "circuito" ? "circuito" : "hombro/core"}</p>
            </div>
            <button onClick={() => removeExercise(ex.id)}><Trash2 size={17} color="#C1594A" /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-[13px]" style={{ color: MUTE }}>Sin ejercicios todavía.</p>}
      </div>

      <div className="rounded-2xl p-4" style={{ background: PANEL_2, border: `1px solid ${LINE}` }}>
        <p className="text-[12px] font-semibold mb-3" style={{ color: meta.color }}>AÑADIR EJERCICIO</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del ejercicio"
          className="w-full bg-transparent border-b-2 py-2 mb-3 text-[14px] outline-none" style={{ borderColor: LINE, color: PAPER }} />
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[10.5px]" style={{ color: MUTE }}>Series</label>
            <input type="number" value={sets} onChange={(e) => setSets(e.target.value)}
              className="w-full bg-transparent border-b-2 py-1.5 text-[14px] outline-none" style={{ borderColor: LINE, color: PAPER }} />
          </div>
          <div className="flex-1">
            <label className="text-[10.5px]" style={{ color: MUTE }}>Reps objetivo</label>
            <input value={reps} onChange={(e) => setReps(e.target.value)}
              className="w-full bg-transparent border-b-2 py-1.5 text-[14px] outline-none" style={{ borderColor: LINE, color: PAPER }} />
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <select value={cat} onChange={(e) => setCat(e.target.value)}
            className="flex-1 bg-transparent border-b-2 py-1.5 text-[13px] outline-none" style={{ borderColor: LINE, color: PAPER }}>
            {CATS.map((c) => <option key={c.id} value={c.id} style={{ background: PANEL }}>{c.label}</option>)}
          </select>
          <select value={block} onChange={(e) => setBlock(e.target.value)}
            className="flex-1 bg-transparent border-b-2 py-1.5 text-[13px] outline-none" style={{ borderColor: LINE, color: PAPER }}>
            <option value="circuito" style={{ background: PANEL }}>Circuito fuerza</option>
            <option value="hombro" style={{ background: PANEL }}>Hombro / core</option>
          </select>
        </div>
        <PrimaryButton onClick={addExercise} icon={Plus} color={meta.color} full>Añadir a {meta.label}</PrimaryButton>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session screen (logging)                                           */
/* ------------------------------------------------------------------ */
function lastValueFor(sessions, type, exerciseId) {
  const past = sessions.filter((s) => s.type === type).sort((a, b) => b.date.localeCompare(a.date));
  for (const s of past) {
    const ex = (s.exercises || []).find((e) => e.id === exerciseId);
    if (ex && ex.sets.some((st) => st.peso)) {
      const best = ex.sets.filter((st) => st.peso).sort((a, b) => Number(b.peso) - Number(a.peso))[0];
      return `${best.peso} kg × ${best.reps || "?"}`;
    }
  }
  return null;
}

function ExerciseCard({ ex, meta, draftSets, onSetChange, lastText }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
      <button className="w-full flex items-center gap-3 p-3.5" onClick={() => setOpen(!open)}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}1F` }}>
          <Pictogram cat={ex.cat} size={24} color={meta.color} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[14.5px] font-semibold" style={{ color: PAPER }}>{ex.name}</p>
          <p className="text-[12px]" style={{ color: MUTE }}>
            Objetivo: {ex.sets} × {ex.reps}{lastText ? ` · Última vez: ${lastText}` : ""}
          </p>
        </div>
        {open ? <ChevronUp size={18} color={MUTE} /> : <ChevronDown size={18} color={MUTE} />}
      </button>
      {open && (
        <div className="px-3.5 pb-3.5">
          <a href={imageSearchUrl(ex.name)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium mb-3 px-2.5 py-1.5 rounded-lg"
            style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}40` }}>
            <ImageIcon size={13} /> Ver foto real
          </a>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 items-center text-[11px] mb-1.5" style={{ color: MUTE }}>
            <span className="w-6">#</span><span>Peso (kg)</span><span>Reps</span>
          </div>
          {draftSets.map((st, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_1fr] gap-x-4 items-center py-1">
              <span className="w-6 text-[12px] font-semibold" style={{ color: meta.color }}>{i + 1}</span>
              <NumInput value={st.peso} onChange={(v) => onSetChange(i, "peso", v)} placeholder="—" w="w-full" />
              <NumInput value={st.reps} onChange={(v) => onSetChange(i, "reps", v)} placeholder="—" w="w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChecklistBlock({ title, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl mb-3" style={{ background: PANEL_2, border: `1px solid ${LINE}` }}>
      <button className="w-full flex items-center justify-between p-3.5" onClick={() => setOpen(!open)}>
        <span className="text-[13px] font-semibold" style={{ color: MUTE }}>{title}</span>
        {open ? <ChevronUp size={16} color={MUTE} /> : <ChevronDown size={16} color={MUTE} />}
      </button>
      {open && (
        <ul className="px-4 pb-4 flex flex-col gap-1.5">
          {items.map((it, i) => <li key={i} className="text-[13px]" style={{ color: PAPER }}>· {it}</li>)}
        </ul>
      )}
    </div>
  );
}

function CardioBlock({ cardio, setCardio }) {
  const km = Number(cardio.distanciaKm) || 0;
  const pace = paceSecPerKm(cardio.minutos, cardio.segundos, km);
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TEAL}1F` }}>
          <Pictogram cat="run" size={24} color={TEAL} />
        </div>
        <div>
          <p className="text-[14.5px] font-semibold" style={{ color: PAPER }}>Carrera</p>
          <p className="text-[12px]" style={{ color: MUTE }}>Mínimo 30 min · cinta o exterior</p>
        </div>
      </div>
      <a href={imageSearchUrl("técnica de carrera en cinta")} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium mb-3 px-2.5 py-1.5 rounded-lg"
        style={{ color: TEAL, background: `${TEAL}15`, border: `1px solid ${TEAL}40` }}>
        <ImageIcon size={13} /> Ver foto real
      </a>
      <div className="flex gap-2 mb-3">
        {["cinta", "exterior"].map((m) => (
          <button key={m} onClick={() => setCardio({ ...cardio, modo: m })}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold capitalize"
            style={{ background: cardio.modo === m ? TEAL : "transparent", color: cardio.modo === m ? INK : MUTE, border: `1px solid ${cardio.modo === m ? TEAL : LINE}` }}>
            {m}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Min</label>
          <NumInput value={cardio.minutos} onChange={(v) => setCardio({ ...cardio, minutos: v })} w="w-full" placeholder="30" />
        </div>
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Seg</label>
          <NumInput value={cardio.segundos} onChange={(v) => setCardio({ ...cardio, segundos: v })} w="w-full" placeholder="00" />
        </div>
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Km</label>
          <NumInput value={cardio.distanciaKm} onChange={(v) => setCardio({ ...cardio, distanciaKm: v })} w="w-full" placeholder="5.0" />
        </div>
      </div>
      <p className="text-[12.5px] mt-1" style={{ color: TEAL }}>
        Ritmo: <span className="font-bold">{pace ? `${formatMMSS(pace)} /km` : "—"}</span>
      </p>
    </div>
  );
}

function SwimBlock({ swim, setSwim }) {
  const pace = paceSecPer100m(swim.minutos, swim.segundos, Number(swim.distanciaM) || 0);
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TYPE_META.SWIM.color}1F` }}>
          <Pictogram cat="swim" size={24} color={TYPE_META.SWIM.color} />
        </div>
        <div>
          <p className="text-[14.5px] font-semibold" style={{ color: PAPER }}>Sesión de natación</p>
          <p className="text-[12px]" style={{ color: MUTE }}>Distancia, tiempo y ritmo</p>
        </div>
      </div>
      <a href={imageSearchUrl("técnica de natación crol respiración")} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium mb-3 px-2.5 py-1.5 rounded-lg"
        style={{ color: TYPE_META.SWIM.color, background: `${TYPE_META.SWIM.color}15`, border: `1px solid ${TYPE_META.SWIM.color}40` }}>
        <ImageIcon size={13} /> Ver foto real
      </a>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Min</label>
          <NumInput value={swim.minutos} onChange={(v) => setSwim({ ...swim, minutos: v })} w="w-full" placeholder="45" />
        </div>
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Seg</label>
          <NumInput value={swim.segundos} onChange={(v) => setSwim({ ...swim, segundos: v })} w="w-full" placeholder="00" />
        </div>
        <div>
          <label className="text-[10.5px]" style={{ color: MUTE }}>Metros</label>
          <NumInput value={swim.distanciaM} onChange={(v) => setSwim({ ...swim, distanciaM: v })} w="w-full" placeholder="1500" />
        </div>
      </div>
      <p className="text-[12.5px] mb-4" style={{ color: TYPE_META.SWIM.color }}>
        Ritmo: <span className="font-bold">{pace ? `${formatMMSS(pace)} /100m` : "—"}</span>
      </p>

      <div className="pt-3" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="text-[12px] font-semibold mb-2" style={{ color: MUTE }}>MOLESTIA EN HOMBRO IZQUIERDO (OPCIONAL)</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setSwim({ ...swim, molestiaHombro: false, nivelMolestia: 0 })}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold"
            style={{ background: !swim.molestiaHombro ? MUTE + "33" : "transparent", color: !swim.molestiaHombro ? PAPER : MUTE, border: `1px solid ${LINE}` }}>
            Sin molestia
          </button>
          <button onClick={() => setSwim({ ...swim, molestiaHombro: true, nivelMolestia: swim.nivelMolestia || 2 })}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold"
            style={{ background: swim.molestiaHombro ? "#E8845A" : "transparent", color: swim.molestiaHombro ? INK : MUTE, border: `1px solid ${LINE}` }}>
            Hubo molestia
          </button>
        </div>
        {swim.molestiaHombro && (
          <div>
            <label className="text-[11px]" style={{ color: MUTE }}>Nivel (1 leve – 5 fuerte)</label>
            <div className="flex gap-2 mt-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setSwim({ ...swim, nivelMolestia: n })}
                  className="w-9 h-9 rounded-full text-[13px] font-bold"
                  style={{ background: swim.nivelMolestia === n ? "#E8845A" : "transparent", color: swim.nivelMolestia === n ? INK : PAPER, border: `1px solid ${swim.nivelMolestia === n ? "#E8845A" : LINE}` }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Session({ type, exercises, sessions, editingSession, onFinish, onCancel }) {
  const meta = TYPE_META[type];
  const isSwim = type === "SWIM";

  const buildInitialStrength = useCallback(() => {
    if (editingSession) return editingSession.exercises;
    return exercises[type].map((ex) => ({
      id: ex.id, name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({ peso: "", reps: "" })),
    }));
  }, [editingSession, exercises, type]);

  const [strength, setStrength] = useState(buildInitialStrength);
  const [cardio, setCardio] = useState(editingSession?.cardio || { modo: "cinta", minutos: "", segundos: "", distanciaKm: "" });
  const [swim, setSwim] = useState(editingSession?.swim || { minutos: "", segundos: "", distanciaM: "", molestiaHombro: false, nivelMolestia: 0 });
  const [saved, setSaved] = useState(false);

  const updateSet = (exId, idx, field, value) => {
    setStrength((prev) => prev.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  };

  const handleFinish = () => {
    const base = {
      id: editingSession?.id || `${Date.now()}`,
      date: editingSession?.date || todayISO(),
      type,
    };
    const payload = isSwim
      ? { ...base, exercises: [], cardio: null, swim }
      : { ...base, exercises: strength, cardio, swim: null };
    onFinish(payload);
    setSaved(true);
    setTimeout(() => onCancel(), 650);
  };

  const circuito = !isSwim ? exercises[type].filter((e) => e.block === "circuito") : [];
  const hombro = !isSwim ? exercises[type].filter((e) => e.block === "hombro") : [];

  return (
    <div className="px-5 pt-6 pb-32">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onCancel}><ArrowLeft size={20} color={PAPER} /></button>
        <div>
          <h1 className="text-[19px] font-bold" style={{ color: PAPER }}>{meta.label}</h1>
          <p className="text-[12px]" style={{ color: MUTE }}>{formatDate(editingSession?.date || todayISO())}</p>
        </div>
      </div>

      {!isSwim && (
        <>
          <ChecklistBlock title="Calentamiento" items={WARMUP[type]} />

          <p className="text-[11px] tracking-[0.14em] font-semibold mt-4 mb-2" style={{ color: meta.color }}>CIRCUITO DE FUERZA</p>
          {circuito.map((ex) => {
            const exState = strength.find((s) => s.id === ex.id);
            return (
              <ExerciseCard key={ex.id} ex={ex} meta={meta} draftSets={exState.sets}
                onSetChange={(idx, field, val) => updateSet(ex.id, idx, field, val)}
                lastText={lastValueFor(sessions, type, ex.id)} />
            );
          })}

          <p className="text-[11px] tracking-[0.14em] font-semibold mt-4 mb-2" style={{ color: meta.color }}>HOMBRO / CORE</p>
          {hombro.map((ex) => {
            const exState = strength.find((s) => s.id === ex.id);
            return (
              <ExerciseCard key={ex.id} ex={ex} meta={meta} draftSets={exState.sets}
                onSetChange={(idx, field, val) => updateSet(ex.id, idx, field, val)}
                lastText={lastValueFor(sessions, type, ex.id)} />
            );
          })}

          <p className="text-[11px] tracking-[0.14em] font-semibold mt-4 mb-2" style={{ color: meta.color }}>CARDIO</p>
          <CardioBlock cardio={cardio} setCardio={setCardio} />

          <ChecklistBlock title="Estiramiento final" items={COOLDOWN[type]} />
        </>
      )}

      {isSwim && <SwimBlock swim={swim} setSwim={setSwim} />}

      <div className="mt-5">
        {saved ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: `${TEAL}22`, color: TEAL }}>
            <CheckCircle2 size={18} /><span className="font-semibold text-[14px]">Entreno guardado</span>
          </div>
        ) : (
          <PrimaryButton onClick={handleFinish} icon={Save} color={meta.color} full>
            {editingSession ? "Guardar cambios" : "Finalizar y guardar entreno"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  History screen                                                     */
/* ------------------------------------------------------------------ */
function SessionDetail({ s }) {
  if (s.type === "SWIM") {
    const pace = paceSecPer100m(s.swim.minutos, s.swim.segundos, Number(s.swim.distanciaM) || 0);
    return (
      <div className="px-4 pb-4 text-[13px]" style={{ color: PAPER }}>
        <p>Distancia: <b>{s.swim.distanciaM} m</b></p>
        <p>Tiempo: <b>{s.swim.minutos}:{String(s.swim.segundos || 0).padStart(2, "0")}</b></p>
        <p>Ritmo: <b>{pace ? `${formatMMSS(pace)} /100m` : "—"}</b></p>
        {s.swim.molestiaHombro && <p style={{ color: "#E8845A" }}>Molestia hombro: nivel {s.swim.nivelMolestia}/5</p>}
      </div>
    );
  }
  return (
    <div className="px-4 pb-4">
      {s.exercises.filter((e) => e.sets.some((st) => st.peso || st.reps)).map((e) => (
        <div key={e.id} className="mb-2">
          <p className="text-[13px] font-semibold" style={{ color: PAPER }}>{e.name}</p>
          <p className="text-[12px]" style={{ color: MUTE }}>
            {e.sets.filter((st) => st.peso || st.reps).map((st, i) => `${st.peso || "-"}kg×${st.reps || "-"}`).join("  ·  ")}
          </p>
        </div>
      ))}
      {s.cardio && (
        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
          <p className="text-[13px] font-semibold" style={{ color: PAPER }}>Carrera ({s.cardio.modo})</p>
          <p className="text-[12px]" style={{ color: MUTE }}>
            {s.cardio.minutos}:{String(s.cardio.segundos || 0).padStart(2, "0")} · {s.cardio.distanciaKm} km · {(() => {
              const p = paceSecPerKm(s.cardio.minutos, s.cardio.segundos, Number(s.cardio.distanciaKm) || 0);
              return p ? `${formatMMSS(p)}/km` : "—";
            })()}
          </p>
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ sessions, onEdit, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="px-5 pt-8 pb-6">
      <p className="text-[12px] tracking-[0.18em] font-semibold" style={{ color: TEAL }}>HISTORIAL</p>
      <h1 className="text-[24px] font-bold mt-1 mb-5" style={{ color: PAPER }}>Sesiones registradas</h1>

      {sorted.length === 0 && <p className="text-[13px]" style={{ color: MUTE }}>Aún no hay entrenos guardados.</p>}

      <div className="flex flex-col gap-2.5">
        {sorted.map((s) => {
          const meta = TYPE_META[s.type];
          const open = openId === s.id;
          return (
            <div key={s.id} className="rounded-2xl overflow-hidden" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
              <button className="w-full flex items-center gap-3 p-3.5" onClick={() => setOpenId(open ? null : s.id)}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }} />
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold" style={{ color: PAPER }}>{meta.label}</p>
                  <p className="text-[12px]" style={{ color: MUTE }}>{formatDate(s.date)}</p>
                </div>
                {open ? <ChevronUp size={17} color={MUTE} /> : <ChevronDown size={17} color={MUTE} />}
              </button>
              {open && (
                <>
                  <SessionDetail s={s} />
                  <div className="flex gap-2 px-4 pb-4">
                    <GhostButton icon={Pencil} onClick={() => onEdit(s)} color={meta.color}>Editar</GhostButton>
                    <GhostButton icon={Trash2} onClick={() => onDelete(s.id)} color="#C1594A">Eliminar</GhostButton>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress screen                                                     */
/* ------------------------------------------------------------------ */
function ProgressScreen({ sessions, exercises }) {
  const strengthOptions = useMemo(() => {
    const map = new Map();
    [...exercises.A, ...exercises.B].forEach((e) => map.set(e.id, e.name));
    return Array.from(map.entries());
  }, [exercises]);

  const [metric, setMetric] = useState(strengthOptions[0]?.[0] ? `ex:${strengthOptions[0][0]}` : "run");

  const chartData = useMemo(() => {
    if (metric.startsWith("ex:")) {
      const exId = metric.slice(3);
      return sessions
        .filter((s) => s.exercises?.some((e) => e.id === exId))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => {
          const ex = s.exercises.find((e) => e.id === exId);
          const weights = ex.sets.map((st) => Number(st.peso)).filter((n) => !isNaN(n) && n > 0);
          return { date: formatDate(s.date), valor: weights.length ? Math.max(...weights) : null };
        })
        .filter((d) => d.valor != null);
    }
    if (metric === "run") {
      return sessions
        .filter((s) => s.cardio && s.cardio.distanciaKm)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => {
          const p = paceSecPerKm(s.cardio.minutos, s.cardio.segundos, Number(s.cardio.distanciaKm));
          return { date: formatDate(s.date), cinta: s.cardio.modo === "cinta" ? p : null, exterior: s.cardio.modo === "exterior" ? p : null };
        });
    }
    if (metric === "swim") {
      return sessions
        .filter((s) => s.type === "SWIM" && s.swim?.distanciaM)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => ({ date: formatDate(s.date), valor: paceSecPer100m(s.swim.minutos, s.swim.segundos, Number(s.swim.distanciaM)) }));
    }
    if (metric === "volume") {
      return sessions
        .filter((s) => s.exercises?.length)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => {
          const vol = s.exercises.reduce((sum, e) => sum + e.sets.reduce((ss, st) => ss + (Number(st.peso) || 0) * (Number(st.reps) || 0), 0), 0);
          return { date: formatDate(s.date), valor: vol, tipo: s.type };
        });
    }
    if (metric === "shoulder") {
      return sessions
        .filter((s) => s.type === "SWIM" && s.swim?.molestiaHombro)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => ({ date: formatDate(s.date), nivel: s.swim.nivelMolestia }));
    }
    return [];
  }, [metric, sessions]);

  const isPace = metric === "run" || metric === "swim";

  return (
    <div className="px-5 pt-8 pb-6">
      <p className="text-[12px] tracking-[0.18em] font-semibold" style={{ color: TEAL }}>PROGRESO</p>
      <h1 className="text-[24px] font-bold mt-1 mb-5" style={{ color: PAPER }}>Tu evolución</h1>

      <select value={metric} onChange={(e) => setMetric(e.target.value)}
        className="w-full mb-6 rounded-xl px-3 py-3 text-[14px] font-medium outline-none"
        style={{ background: PANEL, border: `1px solid ${LINE}`, color: PAPER }}>
        <optgroup label="Fuerza">
          {strengthOptions.map(([id, name]) => <option key={id} value={`ex:${id}`}>{name}</option>)}
        </optgroup>
        <optgroup label="Cardio">
          <option value="run">Ritmo de carrera (min/km)</option>
          <option value="swim">Ritmo de natación (min/100m)</option>
          <option value="volume">Volumen total por sesión</option>
          <option value="shoulder">Molestia de hombro (natación)</option>
        </optgroup>
      </select>

      <div className="rounded-2xl p-4" style={{ background: PANEL, border: `1px solid ${LINE}`, height: 280 }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-6">
            <p className="text-[13px]" style={{ color: MUTE }}>Todavía no hay suficientes registros para esta gráfica. Sigue anotando tus entrenos y aparecerá aquí.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {metric === "shoulder" ? (
              <BarChart data={chartData}>
                <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={MUTE} fontSize={11} />
                <YAxis stroke={MUTE} fontSize={11} domain={[0, 5]} allowDecimals={false} />
                <Tooltip contentStyle={{ background: PANEL_2, border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 12 }} labelStyle={{ color: PAPER }} />
                <Bar dataKey="nivel" fill="#E8845A" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : metric === "run" ? (
              <LineChart data={chartData}>
                <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={MUTE} fontSize={11} />
                <YAxis stroke={MUTE} fontSize={11} tickFormatter={formatMMSS} reversed />
                <Tooltip formatter={(v) => formatMMSS(v) + "/km"} contentStyle={{ background: PANEL_2, border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 12 }} labelStyle={{ color: PAPER }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="cinta" name="Cinta" stroke={TEAL} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="exterior" name="Exterior" stroke={CORAL} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            ) : metric === "volume" ? (
              <BarChart data={chartData}>
                <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={MUTE} fontSize={11} />
                <YAxis stroke={MUTE} fontSize={11} />
                <Tooltip contentStyle={{ background: PANEL_2, border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 12 }} labelStyle={{ color: PAPER }} />
                <Bar dataKey="valor" fill={TEAL} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={MUTE} fontSize={11} />
                <YAxis stroke={MUTE} fontSize={11} tickFormatter={isPace ? formatMMSS : undefined} reversed={isPace} />
                <Tooltip formatter={(v) => isPace ? formatMMSS(v) + (metric === "swim" ? "/100m" : "") : v}
                  contentStyle={{ background: PANEL_2, border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 12 }} labelStyle={{ color: PAPER }} />
                <Line type="monotone" dataKey="valor" stroke={TEAL} strokeWidth={2.5} dot={{ r: 3.5, fill: TEAL }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {metric.startsWith("ex:") && chartData.length > 0 && (
        <p className="text-[13px] mt-4 text-center" style={{ color: TEAL }}>
          Última carga: <b>{chartData[chartData.length - 1].valor} kg</b> — si te sale fácil en 2 sesiones seguidas, prueba a subir 1–2 kg.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("home");
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [sessions, setSessions] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [managingType, setManagingType] = useState(null);

  useEffect(() => {
    (async () => {
      const cfg = await loadJSON("exercises-config", null);
      const logs = await loadJSON("sessions", []);
      if (cfg) setExercises(cfg); else await saveJSON("exercises-config", DEFAULT_EXERCISES);
      setSessions(logs);
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) saveJSON("exercises-config", exercises); }, [exercises, ready]);
  useEffect(() => { if (ready) saveJSON("sessions", sessions); }, [sessions, ready]);

  const startSession = (type) => { setActiveType(type); setEditingSession(null); setScreen("session"); };
  const editSession = (s) => { setActiveType(s.type); setEditingSession(s); setScreen("session"); };
  const finishSession = (payload) => {
    setSessions((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      return exists ? prev.map((p) => (p.id === payload.id ? payload : p)) : [...prev, payload];
    });
  };
  const deleteSession = (id) => setSessions((prev) => prev.filter((p) => p.id !== id));

  if (!ready) {
    return <div style={{ background: INK, height: "100vh" }} className="flex items-center justify-center">
      <p style={{ color: MUTE }} className="text-[13px]">Cargando…</p>
    </div>;
  }

  return (
    <div style={{ background: INK, minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <div className="max-w-md mx-auto">
        {screen === "home" && <Home sessions={sessions} onStart={startSession} onManage={(t) => setManagingType(t)} />}
        {screen === "history" && <HistoryScreen sessions={sessions} onEdit={editSession} onDelete={deleteSession} />}
        {screen === "progress" && <ProgressScreen sessions={sessions} exercises={exercises} />}
        {screen === "session" && (
          <Session type={activeType} exercises={exercises} sessions={sessions} editingSession={editingSession}
            onFinish={finishSession} onCancel={() => { setScreen(editingSession ? "history" : "home"); setEditingSession(null); }} />
        )}
        {managingType && (
          <div className="fixed inset-0 z-50" style={{ background: INK }}>
            <div className="max-w-md mx-auto">
              <ManageRoutine type={managingType} exercises={exercises} setExercises={setExercises} onClose={() => setManagingType(null)} />
            </div>
          </div>
        )}
      </div>
      {screen !== "session" && !managingType && <TabBar screen={screen} setScreen={setScreen} />}
    </div>
  );
}
