import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { Routes, Route } from "react-router-dom";
import StudentPage from "./StudentPage";
import {
  normalizeProgramDays,
  serializeProgramDays,
  createProgramExercise,
  countExercises,
  genWdId,
} from "./workoutData";
import {
  Search,
  Plus,
  X,
  LayoutDashboard,
  Users,
  ClipboardList,
  Activity,
  TrendingUp,
  BookOpen,
  Menu,
  ArrowLeft,
  Dumbbell,
  UserPlus,
  Trash2,
  Edit2,
  Save,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Play,
  Upload,
  Film,
  Image,
  FileVideo,
  ZoomIn,
} from "lucide-react";
// CONSTANTS & DATA// 

const BRAND = {
  name: "امیر احمدی",
  title: "Amir Ahmadi Coaching",
  sub: "پنل مدیریت مربیگری",
  gold: "#D4AF37",
  goldDark: "#B8902A",
  goldLight: "#E8C766",
  bg: "#0A0A0B",
  surface: "#141416",
  surface2: "#1A1A1C",
  border: "#2A2A2D",
  borderLight: "#3A3A3D",
  text: "#F5F0E6",
  textMuted: "#8A8A8F",
  textSub: "#C9C9CC",
  red: "#C25450",
  green: "#7FA876",
  yellow: "#D4AF37",
};

const MUSCLE_GROUPS = [
  { id: "chest", fa: "سینه", icon: "💪", en: "Chest" },
  { id: "lats", fa: "زیربغل", icon: "🦾", en: "Lats" },
  { id: "traps", fa: "کول", icon: "🔺", en: "Traps" },
  { id: "shoulders", fa: "سرشانه", icon: "⚡", en: "Shoulders" },
  { id: "rear-delts", fa: "پشت سرشانه", icon: "🔻", en: "Rear Delts" },
  { id: "biceps", fa: "جلو بازو", icon: "💪", en: "Biceps" },
  { id: "triceps", fa: "پشت بازو", icon: "🔧", en: "Triceps" },
  { id: "forearms", fa: "ساعد", icon: "✊", en: "Forearms" },
  { id: "quads", fa: "چهارسر ران", icon: "🦵", en: "Quads" },
  { id: "hamstrings", fa: "پشت پا", icon: "🦵", en: "Hamstrings" },
  { id: "glutes", fa: "باسن", icon: "🍑", en: "Glutes" },
  { id: "calves", fa: "ساق پا", icon: "🦶", en: "Calves" },
  { id: "abs", fa: "شکم", icon: "🔥", en: "Abs" },
  { id: "cardio", fa: "هوازی", icon: "🏃", en: "Cardio" },
];

const EXERCISES = [
  // CHEST
  { id: "e1", name: "پرس سینه هالتر", muscle: "chest", secondary: "پشت بازو، سرشانه", difficulty: "متوسط", equipment: "هالتر، نیمکت", desc: "حرکت پایه برای توسعه قدرت و حجم عضلات سینه.", tips: "کتف‌ها را ثابت و جمع نگه دارید؛ هالتر را به سمت خط زیر سینه پایین بیاورید.", mistakes: "باز شدن بیش از حد آرنج‌ها، خم شدن کمر.", hasVideo: true },
  { id: "e2", name: "پرس سینه دمبل شیب مثبت", muscle: "chest", secondary: "سرشانه جلو", difficulty: "متوسط", equipment: "دمبل، نیمکت شیب‌دار", desc: "تمرکز بیشتر روی بخش بالایی عضله سینه.", tips: "شیب نیمکت بین ۱۵ تا ۳۰ درجه.", mistakes: "افزایش بیش از حد شیب که فشار را به سرشانه منتقل می‌کند.", hasVideo: true },
  { id: "e3", name: "کراس‌اور کابل", muscle: "chest", secondary: "—", difficulty: "آسان", equipment: "دستگاه کراس‌اور", desc: "حرکت ایزوله برای فرم‌دهی و کات عضله سینه.", tips: "در انتهای حرکت کمی توقف و انقباض ایجاد کنید.", mistakes: "استفاده از وزنه بیش از حد.", hasVideo: true },
  { id: "e3b", name: "پشت بازو دیپ روی میله", muscle: "chest", secondary: "پشت بازو", difficulty: "متوسط", equipment: "دیپ استیشن", desc: "حرکت ترکیبی برای سینه پایین.", tips: "تنه را به جلو خم کنید تا تاکید روی سینه باشد.", mistakes: "کمر صاف ماندن که فشار را به پشت بازو منتقل می‌کند.", hasVideo: true },
  { id: "e3c", name: "فلای دمبل خوابیده", muscle: "chest", secondary: "—", difficulty: "آسان", equipment: "دمبل، نیمکت", desc: "کشش عمیق عضله سینه.", tips: "آرنج را کمی خم نگه دارید.", mistakes: "وزنه بیش از حد که به شانه فشار می‌آورد.", hasVideo: false },
  // LATS
  { id: "e4", name: "زیربغل هالتر خم", muscle: "lats", secondary: "کول، جلو بازو", difficulty: "سخت", equipment: "هالتر", desc: "از قدرتمندترین حرکات برای ضخامت پشت.", tips: "کمر را صاف و زاویه تنه را ثابت نگه دارید.", mistakes: "گرد شدن کمر، استفاده از تکانه بدن.", hasVideo: true },
  { id: "e5", name: "زیربغل سیم‌کش از جلو", muscle: "lats", secondary: "جلو بازو", difficulty: "آسان", equipment: "دستگاه سیم‌کش", desc: "حرکت عالی برای عرض دادن به زیربغل.", tips: "میله را به سمت بالای سینه بکشید.", mistakes: "خم شدن زیاد به عقب.", hasVideo: true },
  { id: "e6", name: "بارفیکس دست باز", muscle: "lats", secondary: "جلو بازو، ساعد", difficulty: "سخت", equipment: "میله بارفیکس", desc: "حرکت ترکیبی برای عرض و قدرت زیربغل.", tips: "حرکت را کنترل‌شده و کامل اجرا کنید.", mistakes: "نیم‌رپ زدن، استفاده از تکانه پا.", hasVideo: true },
  { id: "e6b", name: "زیربغل دمبل تک‌دستی", muscle: "lats", secondary: "جلو بازو", difficulty: "متوسط", equipment: "دمبل، نیمکت", desc: "ایزوله کردن هر طرف به تنهایی.", tips: "پشت را صاف نگه دارید.", mistakes: "چرخاندن بدن.", hasVideo: true },
  { id: "e6c", name: "سیم‌کش از پشت سر", muscle: "lats", secondary: "کول", difficulty: "متوسط", equipment: "دستگاه سیم‌کش", desc: "تمرکز روی قسمت بالای زیربغل.", tips: "گردن را جلو نبرید.", mistakes: "فشار به گردن.", hasVideo: false },
  // SHOULDERS
  { id: "e8", name: "پرس سرشانه هالتر ایستاده", muscle: "shoulders", secondary: "پشت بازو، شکم", difficulty: "متوسط", equipment: "هالتر", desc: "حرکت پایه برای قدرت و حجم سرشانه.", tips: "هسته بدن را منقبض نگه دارید.", mistakes: "قوس بیش از حد کمر.", hasVideo: true },
  { id: "e9", name: "نشر از جانب دمبل", muscle: "shoulders", secondary: "—", difficulty: "آسان", equipment: "دمبل", desc: "ایزوله سر میانی دلتوئید برای عرض شانه.", tips: "آرنج‌ها را کمی خم کنید.", mistakes: "بالا بردن بیش از حد دست از سطح شانه.", hasVideo: true },
  { id: "e9b", name: "پرس سرشانه دمبل نشسته", muscle: "shoulders", secondary: "پشت بازو", difficulty: "متوسط", equipment: "دمبل، نیمکت", desc: "کنترل بهتر نسبت به حالت ایستاده.", tips: "کمر را به نیمکت تکیه دهید.", mistakes: "عجله در اجرا.", hasVideo: true },
  { id: "e9c", name: "نشر جلو دمبل", muscle: "shoulders", secondary: "—", difficulty: "آسان", equipment: "دمبل", desc: "سر جلویی دلتوئید.", tips: "در سطح شانه متوقف شوید.", mistakes: "استفاده از تکانه.", hasVideo: false },
  // REAR DELTS
  { id: "e10", name: "نشر خم به جلو", muscle: "rear-delts", secondary: "کول", difficulty: "متوسط", equipment: "دمبل", desc: "تمرکز روی سر خلفی دلتوئید.", tips: "تنه را ثابت نگه دارید.", mistakes: "تکان دادن تنه.", hasVideo: true },
  { id: "e10b", name: "فیس پول کابل", muscle: "rear-delts", secondary: "کول، پشت سرشانه", difficulty: "متوسط", equipment: "دستگاه سیم‌کش", desc: "حرکت مرکب برای پشت سرشانه و کول.", tips: "آرنج‌ها بالاتر از شانه باشند.", mistakes: "وزنه بیش از حد.", hasVideo: true },
  // BICEPS
  { id: "e11", name: "جلو بازو هالتر ایستاده", muscle: "biceps", secondary: "ساعد", difficulty: "آسان", equipment: "هالتر", desc: "حرکت کلاسیک برای حجم جلو بازو.", tips: "آرنج‌ها را ثابت در کنار بدن نگه دارید.", mistakes: "تکان دادن بدن و استفاده از کول.", hasVideo: true },
  { id: "e12", name: "جلو بازو دمبل چکشی", muscle: "biceps", secondary: "ساعد", difficulty: "آسان", equipment: "دمبل", desc: "هدف‌گیری براکیالیس و ساعد.", tips: "مچ را در حالت نیمه‌چرخش ثابت نگه دارید.", mistakes: "چرخش مچ در طول حرکت.", hasVideo: true },
  { id: "e12b", name: "جلو بازو کابل تک‌دستی", muscle: "biceps", secondary: "—", difficulty: "آسان", equipment: "دستگاه سیم‌کش", desc: "انقباض مداوم جلو بازو.", tips: "آرنج ثابت باشد.", mistakes: "دور شدن آرنج از بدن.", hasVideo: false },
  { id: "e12c", name: "جلو بازو روی میز لاری", muscle: "biceps", secondary: "—", difficulty: "متوسط", equipment: "هالتر یا دمبل، میز لاری", desc: "ایزوله کامل عضله جلو بازو.", tips: "کمر پشتی میز را کامل بگیرید.", mistakes: "رها کردن کنترل در پایین.", hasVideo: true },
  // TRICEPS
  { id: "e13", name: "پشت بازو سیم‌کش", muscle: "triceps", secondary: "—", difficulty: "آسان", equipment: "دستگاه سیم‌کش", desc: "حرکت ایزوله محبوب برای پشت بازو.", tips: "آرنج‌ها را در کنار بدن ثابت نگه دارید.", mistakes: "دور شدن آرنج از بدن.", hasVideo: true },
  { id: "e13b", name: "اسکال کراشر هالتر", muscle: "triceps", secondary: "—", difficulty: "متوسط", equipment: "هالتر، نیمکت", desc: "حرکت پایه برای حجم پشت بازو.", tips: "آرنج‌ها ثابت و رو به بالا باشند.", mistakes: "باز کردن آرنج به بیرون.", hasVideo: true },
  { id: "e13c", name: "پشت بازو دمبل پشت سر", muscle: "triceps", secondary: "—", difficulty: "آسان", equipment: "دمبل", desc: "کشش بلند سر بلند عضله.", tips: "آرنج نزدیک به سر باشد.", mistakes: "افتادن آرنج.", hasVideo: false },
  // FOREARMS
  { id: "e14b", name: "رست مچ دست هالتر", muscle: "forearms", secondary: "—", difficulty: "آسان", equipment: "هالتر", desc: "تقویت ساعد.", tips: "دامنه حرکت کامل.", mistakes: "وزنه سنگین که مچ را آسیب می‌زند.", hasVideo: false },
  // QUADS
  { id: "e14", name: "اسکوات هالتر", muscle: "quads", secondary: "باسن، پشت پا", difficulty: "سخت", equipment: "هالتر، اسکوات ریک", desc: "ملکه حرکات پایین‌تنه؛ قدرت و حجم کامل.", tips: "زانوها هم‌راستا با نوک پا و کمر صاف.", mistakes: "افتادن زانو به داخل، بلند شدن پاشنه.", hasVideo: true },
  { id: "e15", name: "پرس پا دستگاه", muscle: "quads", secondary: "باسن", difficulty: "متوسط", equipment: "دستگاه پرس پا", desc: "گزینه امن‌تر برای حجم چهارسر.", tips: "زانو را تا نزدیک قفسه سینه پایین ببرید.", mistakes: "قفل کردن کامل زانو در بالا.", hasVideo: true },
  { id: "e15b", name: "اکستنشن پا دستگاه", muscle: "quads", secondary: "—", difficulty: "آسان", equipment: "دستگاه اکستنشن", desc: "ایزوله چهارسر.", tips: "در بالا انقباض را نگه دارید.", mistakes: "لگد زدن به جای کنترل.", hasVideo: false },
  { id: "e15c", name: "لانج دمبل", muscle: "quads", secondary: "باسن، پشت پا", difficulty: "متوسط", equipment: "دمبل", desc: "حرکت عملکردی پایین‌تنه.", tips: "زانو از روی نوک پا جلو نرود.", mistakes: "خم شدن تنه.", hasVideo: true },
  // HAMSTRINGS
  { id: "e16", name: "ددلیفت رومانیایی", muscle: "hamstrings", secondary: "باسن، کمر", difficulty: "سخت", equipment: "هالتر", desc: "بهترین حرکت برای رشد پشت پا و باسن.", tips: "هالتر نزدیک به ساق پا حرکت کند.", mistakes: "گرد شدن کمر، دور شدن هالتر.", hasVideo: true },
  { id: "e16b", name: "کرل پا دستگاه خوابیده", muscle: "hamstrings", secondary: "—", difficulty: "آسان", equipment: "دستگاه کرل پا", desc: "ایزوله پشت پا.", tips: "انقباض در بالا را حس کنید.", mistakes: "عجله در اجرا.", hasVideo: false },
  // GLUTES
  { id: "e17", name: "هیپ تراست", muscle: "glutes", secondary: "پشت پا", difficulty: "متوسط", equipment: "هالتر، نیمکت", desc: "موثرترین حرکت ایزوله برای رشد باسن.", tips: "در بالا باسن را کاملاً منقبض کنید.", mistakes: "قوس دادن بیش از حد کمر.", hasVideo: true },
  { id: "e17b", name: "گلوت کیک‌بک کابل", muscle: "glutes", secondary: "—", difficulty: "آسان", equipment: "دستگاه سیم‌کش", desc: "ایزوله باسن.", tips: "ثبات لگن را حفظ کنید.", mistakes: "چرخش لگن.", hasVideo: false },
  // CALVES
  { id: "e18", name: "ساق پا ایستاده", muscle: "calves", secondary: "—", difficulty: "آسان", equipment: "دستگاه ساق پا", desc: "حرکت پایه برای رشد عضله ساق.", tips: "دامنه حرکت کامل، از کشش تا انقباض.", mistakes: "حرکت نیم‌دامنه و سریع.", hasVideo: false },
  { id: "e18b", name: "ساق پا نشسته", muscle: "calves", secondary: "—", difficulty: "آسان", equipment: "دستگاه ساق پا نشسته", desc: "تمرکز روی عضله سولئوس.", tips: "وزن ثابت روی نوک پا.", mistakes: "جهش به جای کنترل.", hasVideo: false },
  // ABS
  { id: "e19", name: "کرانچ شکم", muscle: "abs", secondary: "—", difficulty: "آسان", equipment: "بدون وسیله", desc: "حرکت پایه برای تقویت شکم.", tips: "تمرکز روی انقباض شکم نه کشیدن گردن.", mistakes: "کشیدن گردن با دست‌ها.", hasVideo: true },
  { id: "e19b", name: "پلانک", muscle: "abs", secondary: "شانه، باسن", difficulty: "متوسط", equipment: "بدون وسیله", desc: "ثبات کور.", tips: "خط مستقیم از سر تا پاشنه.", mistakes: "افتادن باسن یا بالا بردن بیش از حد.", hasVideo: false },
  { id: "e19c", name: "لگ ریز", muscle: "abs", secondary: "—", difficulty: "متوسط", equipment: "بدون وسیله", desc: "شکم پایین.", tips: "کمر کاملاً به زمین بچسبد.", mistakes: "قوس کمر.", hasVideo: false },
  { id: "e19d", name: "کرانچ سیم‌کش", muscle: "abs", secondary: "—", difficulty: "آسان", equipment: "دستگاه سیم‌کش", desc: "اضافه وزنه برای رشد شکم.", tips: "از لگن خم نشوید.", mistakes: "کشیدن با گردن.", hasVideo: true },
  // TRAPS
  { id: "e7", name: "شراگ هالتر", muscle: "traps", secondary: "ساعد", difficulty: "آسان", equipment: "هالتر", desc: "حرکت مستقیم برای رشد عضله کول.", tips: "شانه‌ها را مستقیم به سمت بالا ببرید.", mistakes: "چرخش شانه.", hasVideo: false },
  { id: "e7b", name: "شراگ دمبل", muscle: "traps", secondary: "ساعد", difficulty: "آسان", equipment: "دمبل", desc: "دامنه حرکت بیشتر.", tips: "در بالا انقباض را نگه دارید.", mistakes: "انداختن وزنه پایین.", hasVideo: false },
  // CARDIO
  { id: "e20", name: "دویدن تناوبی HIIT", muscle: "cardio", secondary: "کل بدن", difficulty: "متوسط", equipment: "تردمیل", desc: "ترکیب دوره‌های شدت بالا و ریکاوری.", tips: "نسبت کار به استراحت را متناسب با سطح آمادگی تنظیم کنید.", mistakes: "عدم گرم کردن کافی.", hasVideo: false },
  { id: "e21", name: "دوچرخه ثابت", muscle: "cardio", secondary: "پا", difficulty: "آسان", equipment: "دوچرخه ثابت", desc: "هوازی کم‌فشار.", tips: "مقاومت مناسب.", mistakes: "زانو مستقیم در پایین.", hasVideo: false },
  { id: "e22", name: "طناب زدن", muscle: "cardio", secondary: "ساق، شانه", difficulty: "متوسط", equipment: "طناب", desc: "کالری‌سوزی بالا.", tips: "ریتم یکنواخت.", mistakes: "پریدن خیلی بلند.", hasVideo: false },
];

const ADVANCED_TECHNIQUES = [
  "هیچکدام", "دراپ ست", "دابل دراپ ست", "تریپل دراپ ست", "سوپرست",
  "جاینت ست", "رست پاز", "مایورپ", "فورسد رپ", "نگاتیو",
  "فیلر", "فیلر ست", "ست تا ناتوانی", "ست هرمی", "ست هرمی معکوس", "FST-7",
];

const DIFFICULTY_COLOR = {
  "آسان": BRAND.green,
  "متوسط": BRAND.yellow,
  "سخت": BRAND.red,
};

const GOALS = ["کاهش چربی", "افزایش حجم", "قدرت", "استقامت", "تناسب اندام", "ریکاوری", "بدنسازی طبیعی"];
const LEVELS = ["مبتدی", "متوسط", "پیشرفته", "حرفه‌ای"];
const GENDERS = ["مرد", "زن"];
const DAYS_OF_WEEK = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

let _uid = 0;
const genId = () => `id-${Date.now()}-${_uid++}`;

// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const LS = {
  get: (key, def) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST / NOTIFICATION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toasts, dismiss }) {
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => dismiss(t.id)} style={{
          background: t.type === "success" ? "#1A2E1A" : t.type === "error" ? "#2E1A1A" : "#1A1E2E",
          border: `1px solid ${t.type === "success" ? BRAND.green : t.type === "error" ? BRAND.red : BRAND.gold}`,
          borderRadius: 10, padding: "10px 18px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: BRAND.text,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)", minWidth: 220, maxWidth: 380,
        }}>
          {t.type === "success" ? <CheckCircle size={15} color={BRAND.green} /> : t.type === "error" ? <AlertCircle size={15} color={BRAND.red} /> : <Info size={15} color={BRAND.gold} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "success") => {
    const id = genId();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, show, dismiss };
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const toast = useToast();

  // global state
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [workoutLogs, setWorkoutLogs] =
    useState(() => LS.get("aac_workout_logs", []));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const { data: clients } =
      await supabase
        .from("client")
        .select("*");

    const { data: workouts } =
      await supabase
        .from("workouts")
        .select("*");

    setStudents(
  (clients || []).map(c => ({
    ...c,
    createdAt: c.created_at
  }))
);
    setPrograms(
  (workouts || []).map(w => ({
    id: w.id,
    studentId: w.client_id,
    name: w.title,
    days: normalizeProgramDays(w.data),
    createdAt: w.created_at
  }))
);
  }

  // navigation
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  // persist on change
    useEffect(() => LS.set("aac_workout_logs", workoutLogs), [workoutLogs]);

  const addStudent = useCallback(async (data) => {
  const s = {
    ...data,
    age: data.age ? Number(data.age) : null,
    active: true,
  };
  // Remove camelCase fields that don't exist in DB
  delete s.createdAt;

  const { data: inserted, error } =
    await supabase
      .from("client")
      .insert([s])
      .select();

  if (error) {
    console.log(error);
    toast.show("خطا در ذخیره شاگرد");
    return;
  }

  const mapped = { ...inserted[0], createdAt: inserted[0].created_at };
  setStudents(p => [mapped, ...p]);

  toast.show("شاگرد ذخیره شد ✓");

  return mapped;

}, [toast]);

  const updateStudent = useCallback(async (id, data) => {

  const { data: updated, error } = await supabase
    .from("client")
    .update(data)
    .eq("id", id)
    .select();

  if (error) {
    console.log(error);
    toast.show("خطا در ویرایش شاگرد");
    return;
  }

  setStudents(p =>
  p.map(s =>
    s.id === id
      ? (updated?.[0] || s)
      : s
  )
);

  toast.show("اطلاعات ذخیره شد ✓");

}, [toast]);

  const deleteStudent = useCallback(async (id) => {
    const { error } = await supabase.from("client").delete().eq("id", id);
    if (error) { toast.show("خطا در حذف شاگرد", "error"); return; }
    setStudents(p => p.filter(s => s.id !== id));
    setPrograms(p => p.filter(pr => pr.studentId !== id));
    setSelectedStudentId(prev => prev === id ? null : prev);
    toast.show("شاگرد حذف شد", "error");
  }, [toast]);

  // ── PROGRAM CRUD ──
  const saveProgram = useCallback(async (programData) => {

  const serializedDays = serializeProgramDays(programData.days);

  if (programData.id) {

    const { data: updated, error } = await supabase
      .from("workouts")
      .update({
        title: programData.name,
        data: serializedDays
      })
      .eq("id", programData.id)
      .select();

    if (error) {
      console.log(error);
      toast.show("خطا در ذخیره برنامه");
      return;
    }

    const u = updated[0];
    const mapped = { id: u.id, studentId: u.client_id, name: u.title, days: normalizeProgramDays(u.data), createdAt: u.created_at };
    setPrograms(p =>
      p.map(pr => pr.id === programData.id ? mapped : pr)
    );

    toast.show("برنامه ذخیره شد ✓");

  } else {

  const { data: inserted, error } = await supabase
    .from("workouts")
    .insert([{
      client_id: programData.studentId,
      title: programData.name,
      data: serializedDays
    }])
    .select();
    if (error) {
      console.log(error);
      toast.show("خطا در ایجاد برنامه");
      return;
    }

    const ins = inserted[0];
    const mapped = { id: ins.id, studentId: ins.client_id, name: ins.title, days: normalizeProgramDays(ins.data), createdAt: ins.created_at };
    setPrograms(p => [mapped, ...p]);

    toast.show("برنامه جدید ایجاد شد ✓");

    return mapped;
  }

}, [toast]);
const deleteProgram = useCallback(async (id) => {

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
    toast.show("خطا در حذف برنامه");
    return;
  }

  setPrograms(p => p.filter(pr => pr.id !== id));

  toast.show("برنامه حذف شد ✓");

}, [toast]);

  // ── WORKOUT LOG ──
  const addWorkoutLog = useCallback((log) => {
    const l = { ...log, id: genId(), loggedAt: new Date().toISOString() };
    setWorkoutLogs(p => [l, ...p]);
    toast.show("تمرین ثبت شد ✓");
  }, [toast]);

  const deleteWorkoutLog = useCallback((id) => {
    setWorkoutLogs(p => p.filter(l => l.id !== id));
    toast.show("تمرین حذف شد", "error");
  }, [toast]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  const nav = (p, extra = {}) => {
    setPage(p);
    if (extra.studentId !== undefined) setSelectedStudentId(extra.studentId);
    if (extra.programId !== undefined) setSelectedProgramId(extra.programId);
    // Reset programId when going to program-builder without specifying a program (new program)
    if (p === "program-builder" && extra.programId === undefined) setSelectedProgramId(null);
  };

  const [customExercises, setCustomExercises] = useState(() => LS.get("aac_custom_exercises", []));
  useEffect(() => LS.set("aac_custom_exercises", customExercises), [customExercises]);
  const addCustomExercise = useCallback((ex) => {
    // If the form already assigned an id (from storage upload), use it; otherwise generate one.
    const e = { ...ex, id: ex.id || `custom-${genId()}`, isCustom: true };
    setCustomExercises(p => [e, ...p]);
    toast.show("حرکت جدید اضافه شد ✓");
  }, [toast]);
  const updateCustomExercise = useCallback((id, data) => {
    setCustomExercises(p => p.map(e => e.id === id ? { ...e, ...data, hasVideo: !!(data.videoUrl?.trim() || data.video2Url?.trim()) } : e));
    toast.show("حرکت ویرایش شد ✓");
  }, [toast]);
  const deleteCustomExercise = useCallback((id) => {
    setCustomExercises(p => p.filter(e => e.id !== id));
    toast.show("حرکت حذف شد", "error");
  }, [toast]);

  const allExercises = useMemo(() => [...customExercises, ...EXERCISES], [customExercises]);

  const ctx = { students, programs, workoutLogs, allExercises, customExercises, addStudent, updateStudent, deleteStudent, saveProgram, deleteProgram, addWorkoutLog, deleteWorkoutLog, addCustomExercise, updateCustomExercise, deleteCustomExercise, nav, selectedStudent, selectedProgram, toast };

  return (
    <Routes>
      <Route path="/student/:id" element={<StudentPage />} />
      <Route path="*" element={
        <div dir="rtl" style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "'Vazirmatn', sans-serif", display: "flex" }}>
          <style>{globalCSS}</style>

          {/* SIDEBAR */}
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} page={page} nav={nav} />

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginRight: sidebarOpen ? 240 : 64, transition: "margin 0.25s ease" }}>
            {/* TOP BAR */}
            <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} page={page} selectedStudent={selectedStudent} nav={nav} />

            {/* PAGE CONTENT */}
            <main style={{ flex: 1, padding: "20px", overflow: "auto" }}>
              {page === "dashboard" && <DashboardPage ctx={ctx} />}
              {page === "students" && <StudentsPage ctx={ctx} />}
              {page === "student-detail" && selectedStudent && <StudentDetailPage ctx={ctx} />}
              {page === "student-detail" && !selectedStudent && (
                <div style={{ padding: 40, textAlign: "center", color: BRAND.textMuted }}>
                  <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>شاگرد یافت نشد</div>
                  <button onClick={() => nav("students")} style={{ ...btnStyle("outline"), marginTop: 16 }}>بازگشت به شاگردان</button>
                </div>
              )}
              {page === "program-builder" && <ProgramBuilderPage ctx={ctx} />}
              {page === "workout-logs" && <WorkoutLogsPage ctx={ctx} />}
              {page === "progress" && <ProgressPage ctx={ctx} />}
              {page === "exercise-bank" && <ExerciseBankPage ctx={ctx} />}
            </main>
          </div>

          <Toast toasts={toast.toasts} dismiss={toast.dismiss} />
        </div>
      } />
    </Routes>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "students", label: "شاگردان", icon: Users },
  { id: "program-builder", label: "طراحی برنامه", icon: ClipboardList },
  { id: "workout-logs", label: "ثبت تمرینات", icon: Activity },
  { id: "progress", label: "پیشرفت", icon: TrendingUp },
  { id: "exercise-bank", label: "بانک حرکات", icon: BookOpen },
];

function Sidebar({ open, page, nav }) {
  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0,
      width: open ? 240 : 64,
      background: BRAND.surface,
      borderLeft: `1px solid ${BRAND.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease",
      zIndex: 100, overflow: "hidden",
    }}>
      {/* Brand */}
      <div style={{ padding: open ? "18px 16px" : "18px 12px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(145deg, ${BRAND.goldLight}, ${BRAND.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Dumbbell size={18} color="#0A0A0B" />
        </div>
        {open && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.text, whiteSpace: "nowrap" }}>Amir Ahmadi</div>
            <div style={{ fontSize: 11, color: BRAND.gold, whiteSpace: "nowrap" }}>Coaching Panel</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id || (page === "student-detail" && item.id === "students");
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => nav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: open ? "10px 12px" : "10px", borderRadius: 10,
              background: active ? `${BRAND.gold}18` : "transparent",
              border: active ? `1px solid ${BRAND.gold}40` : "1px solid transparent",
              color: active ? BRAND.gold : BRAND.textMuted,
              cursor: "pointer", textAlign: "right", whiteSpace: "nowrap", width: "100%",
              transition: "all 0.15s",
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {open && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BRAND.border}` }}>
          <div style={{ fontSize: 11, color: BRAND.textMuted, textAlign: "center" }}>
            Amir Ahmadi Coaching © ۱۴۰۴
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOP BAR
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_TITLES = {
  dashboard: "داشبورد",
  students: "مدیریت شاگردان",
  "student-detail": "پروفایل شاگرد",
  "program-builder": "طراحی برنامه تمرینی",
  "workout-logs": "ثبت تمرینات",
  progress: "گزارش پیشرفت",
  "exercise-bank": "بانک حرکات",
};

function TopBar({ sidebarOpen, setSidebarOpen, page, selectedStudent, nav }) {
  return (
    <header style={{ background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
      <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}>
        <Menu size={20} />
      </button>

      {page === "student-detail" && (
        <button onClick={() => nav("students")} style={{ background: "transparent", border: "none", color: BRAND.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, padding: "4px 8px" }}>
          <ArrowLeft size={15} /> بازگشت
        </button>
      )}

      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{PAGE_TITLES[page]}</div>
        {page === "student-detail" && selectedStudent && (
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>{selectedStudent.name}</div>
        )}
      </div>

      <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11, color: BRAND.textMuted, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green }} />
          ذخیره محلی فعال
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPage({ ctx }) {
  const { students, programs, workoutLogs, nav } = ctx;
  const activeStudents = students.filter(s => s.active).length;
  const recentLogs = workoutLogs.slice(0, 5);

  const statsCards = [
    { label: "کل شاگردان", value: students.length, icon: Users, color: BRAND.gold, sub: `${activeStudents} فعال` },
    { label: "برنامه‌های طراحی‌شده", value: programs.length, icon: ClipboardList, color: "#7FA876", sub: "ذخیره‌شده" },
    { label: "تمرینات ثبت‌شده", value: workoutLogs.length, icon: Activity, color: "#5E9BD4", sub: "جلسه" },
    { label: "اندازه‌گیری‌ها", value: students.reduce((a, s) => a + (s.measurements?.length || 0), 0), icon: TrendingUp, color: "#C25450", sub: "دیتاپوینت" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.surface} 0%, #1A1812 100%)`, border: `1px solid ${BRAND.gold}30`, borderRadius: 18, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            خوش آمدی، <span style={{ color: BRAND.gold }}>امیر</span> 👋
          </div>
          <div style={{ color: BRAND.textMuted, fontSize: 13 }}>
            {new Date().toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => nav("students")} style={btnStyle("outline")}>
            <Users size={15} /> مشاهده شاگردان
          </button>
          <button onClick={() => nav("program-builder")} style={btnStyle("primary")}>
            <Plus size={15} /> برنامه جدید
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: BRAND.textMuted, marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 11, color: BRAND.textMuted, marginTop: 2 }}>{card.sub}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Students */}
        <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>شاگردان اخیر</span>
            <button onClick={() => nav("students")} style={{ background: "transparent", border: "none", color: BRAND.gold, cursor: "pointer", fontSize: 12 }}>مشاهده همه</button>
          </div>
          {students.length === 0 ? (
            <EmptyState icon={Users} text="هنوز شاگردی ثبت نشده است" action={() => nav("students")} actionLabel="افزودن اولین شاگرد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {students.slice(0, 4).map(s => (
                <div key={s.id} onClick={() => nav("student-detail", { studentId: s.id })} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: BRAND.surface2, cursor: "pointer", border: `1px solid ${BRAND.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${BRAND.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: BRAND.gold, flexShrink: 0 }}>
                    {s.name?.[0] || "؟"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{s.goal} · {s.level}</div>
                  </div>
                  <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: s.active ? `${BRAND.green}20` : `${BRAND.red}20`, color: s.active ? BRAND.green : BRAND.red }}>
                    {s.active ? "فعال" : "غیرفعال"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Programs */}
        <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>برنامه‌های اخیر</span>
            <button onClick={() => nav("program-builder")} style={{ background: "transparent", border: "none", color: BRAND.gold, cursor: "pointer", fontSize: 12 }}>برنامه جدید +</button>
          </div>
          {programs.length === 0 ? (
            <EmptyState icon={ClipboardList} text="هنوز برنامه‌ای طراحی نشده" action={() => nav("program-builder")} actionLabel="طراحی برنامه" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {programs.slice(0, 4).map(pr => {
                const stu = ctx.students.find(s => s.id === pr.studentId);
                return (
                  <div key={pr.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: BRAND.surface2, border: `1px solid ${BRAND.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BRAND.gold}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ClipboardList size={16} color={BRAND.gold} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.name}</div>
                      <div style={{ fontSize: 11, color: BRAND.textMuted }}>{stu ? stu.name : "بدون شاگرد"} · {pr.days?.length || 0} روز</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENTS PAGE — full CRUD
// ─────────────────────────────────────────────────────────────────────────────

function StudentsPage({ ctx }) {
  const { students, programs, addStudent, deleteStudent, nav } = ctx;
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterGoal, setFilterGoal] = useState("همه");
  const [filterLevel, setFilterLevel] = useState("همه");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    let res = [...students];
    if (search.trim()) res = res.filter(s => s.name?.includes(search) || s.phone?.includes(search));
    if (filterGoal !== "همه") res = res.filter(s => s.goal === filterGoal);
    if (filterLevel !== "همه") res = res.filter(s => s.level === filterLevel);
    if (sortBy === "newest") res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "name") res.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return res;
  }, [students, search, filterGoal, filterLevel, sortBy]);

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>شاگردان</div>
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>{students.length} شاگرد ثبت‌شده</div>
        </div>
        <button onClick={() => setShowForm(true)} style={btnStyle("primary")}>
          <UserPlus size={15} /> افزودن شاگرد
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={15} color={BRAND.textMuted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو نام یا تلفن..." style={{ background: "transparent", border: "none", color: BRAND.text, fontSize: 13, flex: 1, outline: "none" }} />
        </div>
        <select value={filterGoal} onChange={e => setFilterGoal(e.target.value)} style={selectStyle}>
          <option value="همه">همه هدف‌ها</option>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={selectStyle}>
          <option value="همه">همه سطح‌ها</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="newest">جدیدترین</option>
          <option value="name">نام (الف - ی)</option>
        </select>
      </div>

      {/* Student list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} text={students.length === 0 ? "هنوز شاگردی ثبت نشده است" : "شاگردی با این مشخصات پیدا نشد"} action={students.length === 0 ? () => setShowForm(true) : undefined} actionLabel="افزودن اولین شاگرد" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(s => {
            const progCount = programs.filter(p => p.studentId === s.id).length;
            return (
              <div key={s.id} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "border-color 0.15s" }}
                onClick={() => nav("student-detail", { studentId: s.id })}
                onMouseEnter={e => e.currentTarget.style.borderColor = BRAND.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = BRAND.border}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${BRAND.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: BRAND.gold }}>
                      {s.name?.[0] || "؟"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: BRAND.textMuted }}>{s.phone || "بدون شماره"}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: s.active ? `${BRAND.green}20` : `${BRAND.red}20`, color: s.active ? BRAND.green : BRAND.red, alignSelf: "flex-start" }}>
                    {s.active ? "فعال" : "غیرفعال"}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "سن", value: s.age ? `${s.age} سال` : "—" },
                    { label: "هدف", value: s.goal || "—" },
                    { label: "سطح", value: s.level || "—" },
                  ].map(item => (
                    <div key={item.label} style={{ background: BRAND.surface2, borderRadius: 8, padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, color: BRAND.textMuted }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: BRAND.textMuted }}>
                    <ClipboardList size={12} style={{ marginLeft: 3 }} />
                    {progCount} برنامه
                  </div>
                  <button onClick={e => { e.stopPropagation(); if (confirm(`حذف ${s.name}?`)) deleteStudent(s.id); }} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 4, borderRadius: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <StudentFormModal onClose={() => setShowForm(false)} onSave={(d) => { addStudent(d); setShowForm(false); }} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────

function StudentDetailPage({ ctx }) {
  const { students, selectedStudent: _sel, programs, workoutLogs, updateStudent, deleteStudent, saveProgram, nav } = ctx;
  // Always read from live students array so edits reflect immediately
  const s = students.find(st => st.id === _sel?.id) || _sel;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...s });
  const [tab, setTab] = useState("info"); // info | programs | logs | measurements

  // sync form when s changes externally
  useEffect(() => { if (!editing) setForm({ ...s }); }, [s, editing]);

  const stuPrograms = programs.filter(p => p.studentId === s.id);
  const stuLogs = workoutLogs.filter(l => l.studentId === s.id);

  const handleSave = () => {
    updateStudent(s.id, form);
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Profile Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.surface}, #1A1812)`, border: `1px solid ${BRAND.gold}30`, borderRadius: 18, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${BRAND.gold}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: BRAND.gold, border: `2px solid ${BRAND.gold}` }}>
            {s.name?.[0] || "؟"}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: BRAND.textMuted }}>{s.phone || "بدون شماره"}</div>
          </div>
          <div style={{ marginRight: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(p => !p)} style={btnStyle("outline")}>
              <Edit2 size={14} /> {editing ? "لغو" : "ویرایش"}
            </button>
            {editing && (
              <button onClick={handleSave} style={btnStyle("primary")}>
                <Save size={14} /> ذخیره
              </button>
            )}
            <button onClick={() => nav("program-builder", { studentId: s.id })} style={btnStyle("gold")}>
              <Plus size={14} /> برنامه جدید
            </button>
            <button onClick={() => { if (confirm(`حذف ${s.name}?`)) { deleteStudent(s.id); nav("students"); } }} style={btnStyle("danger")}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { label: "سن", key: "age", type: "number" },
            { label: "وزن (kg)", key: "weight", type: "number" },
            { label: "قد (cm)", key: "height", type: "number" },
            { label: "شماره تماس", key: "phone", type: "text" },
          ].map(f => (
            <div key={f.key} style={{ background: `${BRAND.bg}80`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: BRAND.textMuted, marginBottom: 4 }}>{f.label}</div>
              {editing ? (
                <input type={f.type} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inputStyle, padding: "4px 6px", fontSize: 13 }} />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s[f.key] || "—"}</div>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>هدف</div>
              <select value={form.goal || ""} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} style={selectStyle}>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>سطح</div>
              <select value={form.level || ""} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} style={selectStyle}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>جنسیت</div>
              <select value={form.gender || ""} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={selectStyle}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>یادداشت مربی</div>
              <textarea value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="یادداشت درباره این شاگرد..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BRAND.border}`, marginBottom: 20 }}>
        {[
          { id: "info", label: "اطلاعات" },
          { id: "programs", label: `برنامه‌ها (${stuPrograms.length})` },
          { id: "logs", label: `تمرینات (${stuLogs.length})` },
          { id: "measurements", label: "اندازه‌گیری" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${BRAND.gold}` : "2px solid transparent", color: tab === t.id ? BRAND.gold : BRAND.textMuted, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, transition: "all 0.15s", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "هدف", value: s.goal }, { label: "سطح", value: s.level },
            { label: "جنسیت", value: s.gender }, { label: "تاریخ ثبت‌نام", value: s.createdAt ? new Date(s.createdAt).toLocaleDateString("fa-IR") : "—" },
          ].map(item => (
            <div key={item.label} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value || "—"}</div>
            </div>
          ))}
          {s.notes && (
            <div style={{ gridColumn: "1/-1", background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>یادداشت مربی</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: BRAND.textSub }}>{s.notes}</div>
            </div>
          )}
        </div>
      )}

      {tab === "programs" && (
        <div>
          {stuPrograms.length === 0 ? (
            <EmptyState icon={ClipboardList} text="هنوز برنامه‌ای برای این شاگرد طراحی نشده" action={() => nav("program-builder", { studentId: s.id })} actionLabel="طراحی برنامه" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stuPrograms.map(pr => (
                <div key={pr.id} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${BRAND.gold}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ClipboardList size={18} color={BRAND.gold} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{pr.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{pr.days?.length || 0} روز · {pr.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0)} حرکت</div>
                  </div>
                  <button onClick={() => nav("program-builder", { programId: pr.id, studentId: s.id })} style={btnStyle("outline")}>
                    <Edit2 size={13} /> ویرایش
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "logs" && (
        <div>
          {stuLogs.length === 0 ? (
            <EmptyState icon={Activity} text="هنوز تمرینی ثبت نشده" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stuLogs.slice(0, 10).map(log => (
                <div key={log.id} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{log.programName || "تمرین آزاد"}</div>
                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{new Date(log.loggedAt).toLocaleDateString("fa-IR")}</div>
                  </div>
                  {log.note && <div style={{ fontSize: 12, color: BRAND.textMuted }}>{log.note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "measurements" && (
        <MeasurementsTab student={s} updateStudent={data => updateStudent(s.id, data)} />
      )}
    </div>
  );
}

function MeasurementsTab({ student, updateStudent }) {
  const [measurements, setMeasurements] = useState(student.measurements || []);
  const [showAdd, setShowAdd] = useState(false);
  const [newM, setNewM] = useState({ date: new Date().toISOString().split("T")[0], weight: "", bodyfat: "", chest: "", waist: "", hip: "", arm: "", thigh: "" });

  // Sync when student.measurements changes externally
  useEffect(() => {
    setMeasurements(student.measurements || []);
  }, [student.id, student.measurements]);

  const saveMeasurement = () => {
    const updated = [{ ...newM, id: genId() }, ...measurements];
    setMeasurements(updated);
    updateStudent({ measurements: updated });
    setShowAdd(false);
    setNewM({ date: new Date().toISOString().split("T")[0], weight: "", bodyfat: "", chest: "", waist: "", hip: "", arm: "", thigh: "" });
  };

  const FIELDS = [
    { key: "weight", label: "وزن (kg)" }, { key: "bodyfat", label: "چربی (%)" },
    { key: "chest", label: "سینه (cm)" }, { key: "waist", label: "دور کمر (cm)" },
    { key: "hip", label: "باسن (cm)" }, { key: "arm", label: "بازو (cm)" }, { key: "thigh", label: "ران (cm)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>اندازه‌گیری‌ها</div>
        <button onClick={() => setShowAdd(p => !p)} style={btnStyle("primary")}>
          <Plus size={14} /> ثبت اندازه جدید
        </button>
      </div>

      {showAdd && (
        <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.gold}40`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: BRAND.gold }}>ثبت اندازه جدید</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>تاریخ</div>
              <input type="date" value={newM.date} onChange={e => setNewM(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </div>
            {FIELDS.map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>{f.label}</div>
                <input type="number" value={newM[f.key]} onChange={e => setNewM(p => ({ ...p, [f.key]: e.target.value }))} placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>
          <button onClick={saveMeasurement} style={btnStyle("primary")}>
            <Save size={14} /> ذخیره
          </button>
        </div>
      )}

      {measurements.length === 0 ? (
        <EmptyState icon={BarChart2} text="هنوز اندازه‌گیری ثبت نشده" />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                <th style={thStyle}>تاریخ</th>
                {FIELDS.map(f => <th key={f.key} style={thStyle}>{f.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {measurements.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${BRAND.border}20` }}>
                  <td style={tdStyle}>{m.date}</td>
                  {FIELDS.map(f => <td key={f.key} style={tdStyle}>{m[f.key] || "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROGRAM BUILDER PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ProgramBuilderPage({ ctx }) {
  const { students, programs, allExercises, selectedStudent, selectedProgram, saveProgram, deleteProgram, addCustomExercise, deleteCustomExercise, customExercises, nav } = ctx;

  const makeBlank = (stuId) => ({ name: "", studentId: stuId || "", days: [{ id: genId(), name: "روز اول — پوش", exercises: [] }, { id: genId(), name: "روز دوم — پول", exercises: [] }], notes: "" });

  const [program, setProgram] = useState(() => selectedProgram
    ? { ...selectedProgram, days: selectedProgram.days.map(d => ({ ...d, exercises: [...(d.exercises || [])] })) }
    : makeBlank(selectedStudent?.id));
  const [activeDay, setActiveDay] = useState(program.days[0]?.id);
  const [activeMuscle, setActiveMuscle] = useState("chest");
  const [search, setSearch] = useState("");
  const [detailEx, setDetailEx] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showAddExForm, setShowAddExForm] = useState(false);

  // Re-initialize if selectedProgram or selectedStudent changes (nav from student detail)
  const prevKey = React.useRef(`${selectedProgram?.id}-${selectedStudent?.id}`);
  useEffect(() => {
    const newKey = `${selectedProgram?.id}-${selectedStudent?.id}`;
    if (newKey !== prevKey.current) {
      prevKey.current = newKey;
      if (selectedProgram) {
        const p = { ...selectedProgram, days: selectedProgram.days.map(d => ({ ...d, exercises: [...(d.exercises || [])] })) };
        setProgram(p);
        setActiveDay(p.days[0]?.id);
      } else {
        const blank = makeBlank(selectedStudent?.id);
        setProgram(blank);
        setActiveDay(blank.days[0]?.id);
      }
    }
  }, [selectedProgram, selectedStudent]);

  const currentDay = program.days.find(d => d.id === activeDay);

  const filteredExercises = useMemo(() => allExercises.filter(ex => {
    const matchMuscle = ex.muscle === activeMuscle;
    const matchSearch = !search.trim() || ex.name.includes(search.trim());
    return matchMuscle && matchSearch;
  }), [allExercises, activeMuscle, search]);

  const addExToDay = (exercise) => {
    setProgram(p => ({ ...p, days: p.days.map(d => d.id !== activeDay ? d : { ...d, exercises: [...d.exercises, createProgramExercise(exercise)] }) }));
  };

  const removeEx = (pid) => setProgram(p => ({ ...p, days: p.days.map(d => d.id !== activeDay ? d : { ...d, exercises: d.exercises.filter(e => e.pid !== pid) }) }));

  const updateField = (pid, field, value) => setProgram(p => ({ ...p, days: p.days.map(d => d.id !== activeDay ? d : { ...d, exercises: d.exercises.map(e => e.pid === pid ? { ...e, [field]: value } : e) }) }));

  const addDay = () => { const id = genId(); setProgram(p => ({ ...p, days: [...p.days, { id, name: `روز ${p.days.length + 1}`, exercises: [] }] })); setActiveDay(id); };

  const removeDay = (id) => setProgram(p => { const next = p.days.filter(d => d.id !== id); if (activeDay === id && next.length) setActiveDay(next[0].id); return { ...p, days: next }; });

  const renameDay = (id, name) => setProgram(p => ({ ...p, days: p.days.map(d => d.id === id ? { ...d, name } : d) }));

  const handleSave = () => { saveProgram(program); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const totalExercises = countExercises(program.days);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Program Header */}
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>نام برنامه</div>
          <input value={program.name} onChange={e => setProgram(p => ({ ...p, name: e.target.value }))} placeholder="مثلاً: برنامه PPL — فاز حجم" style={{ ...inputStyle, fontSize: 15, fontWeight: 700 }} />
        </div>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>اختصاص به شاگرد</div>
          <select value={program.studentId} onChange={e => setProgram(p => ({ ...p, studentId: e.target.value }))} style={selectStyle}>
            <option value="">— بدون شاگرد —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>
            {program.days.length} روز · {totalExercises} حرکت
          </div>
          <button onClick={handleSave} style={btnStyle(saved ? "success" : "primary")}>
            <Save size={14} /> {saved ? "ذخیره شد ✓" : "ذخیره برنامه"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 16 }}>
        {/* Exercise Bank */}
        <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 220px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>بانک حرکات</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: BRAND.textMuted }}>{filteredExercises.length} حرکت</span>
              <button onClick={() => setShowAddExForm(p => !p)} style={{ fontSize: 11, background: `${BRAND.gold}20`, border: `1px solid ${BRAND.gold}50`, color: BRAND.gold, borderRadius: 7, padding: "4px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={11} /> جدید
              </button>
            </div>
          </div>

          {showAddExForm && (
            <ExerciseFormModal
              initial={{}}
              onSave={(ex) => { addCustomExercise(ex); setShowAddExForm(false); }}
              onClose={() => setShowAddExForm(false)}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: "8px 12px" }}>
            <Search size={14} color={BRAND.textMuted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی حرکت..." style={{ background: "transparent", border: "none", color: BRAND.text, fontSize: 12, flex: 1, outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {MUSCLE_GROUPS.map(m => (
              <button key={m.id} onClick={() => setActiveMuscle(m.id)} style={{ fontSize: 11, padding: "5px 9px", borderRadius: 16, border: `1px solid ${activeMuscle === m.id ? BRAND.gold : BRAND.border}`, background: activeMuscle === m.id ? BRAND.gold : BRAND.bg, color: activeMuscle === m.id ? "#0A0A0B" : BRAND.textSub, cursor: "pointer", fontWeight: activeMuscle === m.id ? 700 : 400 }}>
                {m.icon} {m.fa}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", paddingInlineEnd: 4 }}>
            {filteredExercises.length === 0 && <div style={{ color: BRAND.textMuted, fontSize: 12, textAlign: "center", padding: 16 }}>حرکتی یافت نشد</div>}
            {filteredExercises.map(ex => (
              <div key={ex.id} style={{ display: "flex", gap: 8, background: BRAND.bg, border: `1px solid ${ex.isCustom ? BRAND.gold + "50" : BRAND.border}`, borderRadius: 10, padding: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${ex.isCustom ? BRAND.gold : BRAND.gold}`, background: "#16140C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14 }}>{MUSCLE_GROUPS.find(m => m.id === ex.muscle)?.icon || "💪"}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    {ex.name}
                    {ex.isCustom && <span style={{ fontSize: 9, background: `${BRAND.gold}30`, color: BRAND.gold, borderRadius: 4, padding: "1px 5px" }}>شخصی</span>}
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.textMuted, display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ color: DIFFICULTY_COLOR[ex.difficulty] || BRAND.textMuted }}>● {ex.difficulty || "—"}</span>
                    <span>·</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.equipment || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                    {!ex.isCustom && (
                      <button onClick={() => setDetailEx(ex)} style={{ fontSize: 10, background: "transparent", border: `1px solid ${BRAND.border}`, color: BRAND.textSub, borderRadius: 6, padding: "3px 7px", cursor: "pointer" }}>
                        <Info size={10} /> جزئیات
                      </button>
                    )}
                    <button onClick={() => addExToDay(ex)} style={{ fontSize: 10, background: BRAND.gold, border: "none", color: "#0A0A0B", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontWeight: 700 }}>
                      <Plus size={10} /> افزودن
                    </button>
                    {ex.isCustom && (
                      <button onClick={() => { if (confirm(`حذف «${ex.name}»?`)) deleteCustomExercise(ex.id); }} style={{ fontSize: 10, background: `${BRAND.red}20`, border: `1px solid ${BRAND.red}40`, color: BRAND.red, borderRadius: 6, padding: "3px 7px", cursor: "pointer" }}>
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Builder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Day Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {program.days.map(d => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 6, background: activeDay === d.id ? "#1A1812" : BRAND.surface, border: `1px solid ${activeDay === d.id ? BRAND.gold : BRAND.border}`, borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}
                onClick={() => setActiveDay(d.id)}>
                <input value={d.name} onChange={e => renameDay(d.id, e.target.value)} onClick={e => e.stopPropagation()} style={{ background: "transparent", border: "none", color: activeDay === d.id ? BRAND.gold : BRAND.text, fontSize: 12, fontWeight: 600, width: 110, outline: "none", cursor: "text" }} />
                {program.days.length > 1 && <X size={12} color={BRAND.textMuted} style={{ cursor: "pointer" }} onClick={e => { e.stopPropagation(); removeDay(d.id); }} />}
              </div>
            ))}
            <button onClick={addDay} style={{ fontSize: 11, background: "transparent", border: `1px dashed ${BRAND.borderLight}`, color: BRAND.textMuted, borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={13} /> روز جدید
            </button>
          </div>

          {/* Exercise Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 280px)", overflowY: "auto", paddingInlineEnd: 4 }}>
            {!currentDay || currentDay.exercises.length === 0 ? (
              <div style={{ border: `1px dashed ${BRAND.border}`, borderRadius: 16, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Dumbbell size={34} color={BRAND.borderLight} />
                <p style={{ color: BRAND.textMuted, fontSize: 13, textAlign: "center", margin: 0 }}>از بانک حرکات سمت راست، حرکات را به این روز اضافه کنید.</p>
              </div>
            ) : (
              currentDay.exercises.map((pe, idx) => (
                <ProgramCard key={pe.pid} index={idx + 1} data={pe} onChange={(field, val) => updateField(pe.pid, field, val)} onRemove={() => removeEx(pe.pid)} />
              ))
            )}
          </div>
        </div>
      </div>

      {detailEx && <ExerciseDetailModal exercise={detailEx} onClose={() => setDetailEx(null)} />}
    </div>
  );
}

function ProgramCard({ index, data, onChange, onRemove }) {
  const [techOpen, setTechOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const hasMedia = !!(data.videoUrl?.trim() || data.imageUrl?.trim() || data.gifUrl?.trim() || data.description?.trim());
  return (
    <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: BRAND.gold, color: "#0A0A0B", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{index}</div>
        <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{data.name}</div>
        {hasMedia && (
          <button onClick={() => setMediaOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 4, background: mediaOpen ? `${BRAND.gold}25` : "transparent", border: `1px solid ${BRAND.gold}50`, color: BRAND.gold, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11 }}>
            <Info size={11} /> ویدیو/تصویر/توضیح
          </button>
        )}
        <button onClick={onRemove} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer" }}><Trash2 size={14} /></button>
      </div>

      {mediaOpen && hasMedia && (
        <div style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: 10, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.imageUrl?.trim() && (
            <img src={data.imageUrl} alt={data.name} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
          )}
          {!data.imageUrl?.trim() && data.gifUrl?.trim() && (
            <img src={data.gifUrl} alt={data.name} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
          )}
          {data.videoUrl?.trim() && (
            <div style={{ fontSize: 11, color: BRAND.textSub, wordBreak: "break-all" }}>
              <Play size={11} style={{ verticalAlign: "middle" }} /> {data.videoUrl}
            </div>
          )}
          {data.description?.trim() && (
            <div style={{ fontSize: 12, color: BRAND.textSub, lineHeight: 1.7 }}>{data.description}</div>
          )}
          <div style={{ fontSize: 10, color: BRAND.textMuted }}>این محتوا برای شاگرد هم نمایش داده می‌شود.</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {[
          { label: "ست", key: "sets", w: 54 }, { label: "تکرار", key: "reps", w: 64 },
          { label: "وزن (kg)", key: "weight", w: 70, placeholder: "—" },
          { label: "استراحت (ث)", key: "rest", w: 80 },
          { label: "تمپو", key: "tempo", w: 70 },
          { label: "RPE", key: "rpe", w: 50 }, { label: "RIR", key: "rir", w: 50 },
        ].map(f => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4, width: f.w }}>
            <label style={{ fontSize: 10, color: BRAND.textMuted }}>{f.label}</label>
            <input value={data[f.key]} placeholder={f.placeholder} onChange={e => onChange(f.key, e.target.value)} style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "6px 8px", color: BRAND.text, fontSize: 12, width: "100%", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <button onClick={() => setTechOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "6px 10px", color: BRAND.textSub, fontSize: 11.5, cursor: "pointer", minWidth: 210, justifyContent: "space-between" }}>
            <span>تکنیک: <strong style={{ color: BRAND.gold }}>{data.technique}</strong></span>
            <ChevronDown size={13} />
          </button>
          {techOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: BRAND.surface2, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: 6, zIndex: 10, maxHeight: 220, overflowY: "auto", minWidth: 210, boxShadow: "0 12px 28px rgba(0,0,0,0.5)" }}>
              {ADVANCED_TECHNIQUES.map(t => (
                <div key={t} onClick={() => { onChange("technique", t); setTechOpen(false); }} style={{ padding: "6px 10px", fontSize: 12, borderRadius: 7, cursor: "pointer", color: t === data.technique ? BRAND.gold : BRAND.textSub, background: t === data.technique ? "#2A260F" : "transparent", fontWeight: t === data.technique ? 700 : 400 }}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
        <input value={data.notes} onChange={e => onChange("notes", e.target.value)} placeholder="توضیح اختصاصی مربی..." style={{ flex: 1, minWidth: 160, background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "6px 10px", color: BRAND.text, fontSize: 12, outline: "none" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WORKOUT LOGS PAGE
// ─────────────────────────────────────────────────────────────────────────────

function WorkoutLogsPage({ ctx }) {
  const { students, programs, workoutLogs, addWorkoutLog, deleteWorkoutLog } = ctx;
  const [showForm, setShowForm] = useState(false);
  const [filterStudent, setFilterStudent] = useState("");
  const [form, setForm] = useState({ studentId: "", programId: "", date: new Date().toISOString().split("T")[0], duration: "", note: "", rating: 3 });

  const stuPrograms = form.studentId ? programs.filter(p => p.studentId === form.studentId) : [];

  const filteredLogs = useMemo(() => {
    if (!filterStudent) return workoutLogs;
    return workoutLogs.filter(l => l.studentId === filterStudent);
  }, [workoutLogs, filterStudent]);

  const handleSubmit = () => {
    if (!form.studentId) return alert("انتخاب شاگرد الزامی است");
    const stu = students.find(s => s.id === form.studentId);
    const pr = programs.find(p => p.id === form.programId);
    addWorkoutLog({ ...form, studentName: stu?.name, programName: pr?.name });
    setShowForm(false);
    setForm({ studentId: "", programId: "", date: new Date().toISOString().split("T")[0], duration: "", note: "", rating: 3 });
  };

  const totalMinutes = filteredLogs.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
  const avgRating = filteredLogs.filter(l => l.rating).length
    ? (filteredLogs.filter(l => l.rating).reduce((a, l) => a + l.rating, 0) / filteredLogs.filter(l => l.rating).length).toFixed(1)
    : "—";

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>ثبت تمرینات</div>
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>{workoutLogs.length} جلسه ثبت‌شده · {totalMinutes} دقیقه کل</div>
        </div>
        <button onClick={() => setShowForm(p => !p)} style={btnStyle("primary")}>
          <Plus size={15} /> ثبت تمرین جدید
        </button>
      </div>

      {/* Quick stats */}
      {workoutLogs.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "کل جلسات", value: workoutLogs.length, color: BRAND.gold },
            { label: "کل زمان (دقیقه)", value: workoutLogs.reduce((a, l) => a + (parseInt(l.duration) || 0), 0) || "—", color: "#5E9BD4" },
            { label: "میانگین کیفیت", value: workoutLogs.filter(l => l.rating).length ? (workoutLogs.filter(l => l.rating).reduce((a, l) => a + l.rating, 0) / workoutLogs.filter(l => l.rating).length).toFixed(1) + " ⭐" : "—", color: BRAND.green },
          ].map((s, i) => (
            <div key={i} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: BRAND.textMuted }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.gold}40`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.gold, marginBottom: 14 }}>ثبت جلسه تمرینی جدید</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>شاگرد *</div>
              <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value, programId: "" }))} style={selectStyle}>
                <option value="">انتخاب شاگرد...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>برنامه</div>
              <select value={form.programId} onChange={e => setForm(p => ({ ...p, programId: e.target.value }))} style={selectStyle} disabled={!form.studentId}>
                <option value="">بدون برنامه مشخص</option>
                {stuPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>تاریخ تمرین</div>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>مدت تمرین (دقیقه)</div>
              <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="مثلاً ۶۰" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>کیفیت تمرین</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setForm(p => ({ ...p, rating: r }))} style={{ background: r <= form.rating ? `${BRAND.gold}30` : BRAND.bg, border: `1px solid ${r <= form.rating ? BRAND.gold : BRAND.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: r <= form.rating ? BRAND.gold : BRAND.textMuted, fontSize: 13 }}>
                  {r} ⭐
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>یادداشت</div>
            <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={2} placeholder="نکات، احساس شاگرد، شرایط خاص..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSubmit} style={btnStyle("primary")}>
              <CheckCircle size={14} /> ثبت تمرین
            </button>
            <button onClick={() => setShowForm(false)} style={btnStyle("outline")}>لغو</button>
          </div>
        </div>
      )}

      {/* Filter */}
      {workoutLogs.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} style={{ ...selectStyle, minWidth: 220 }}>
            <option value="">همه شاگردان</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <EmptyState icon={Activity} text="هنوز تمرینی ثبت نشده است" action={() => setShowForm(true)} actionLabel="ثبت اولین تمرین" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredLogs.map(log => (
            <div key={log.id} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{log.studentName || "نامشخص"}</div>
                  <div style={{ fontSize: 11, color: BRAND.textMuted }}>{log.programName || "تمرین آزاد"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 11, color: BRAND.textMuted }}>{log.date}</div>
                    {log.duration && <div style={{ fontSize: 11, color: BRAND.textMuted }}>{log.duration} دقیقه</div>}
                  </div>
                  <button onClick={() => { if (confirm("حذف این تمرین؟")) deleteWorkoutLog(log.id); }} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 4, borderRadius: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {log.rating && (
                <div style={{ fontSize: 12, color: BRAND.gold, marginBottom: 6 }}>
                  {"⭐".repeat(log.rating)} کیفیت {log.rating}/۵
                </div>
              )}
              {log.note && <div style={{ fontSize: 12, color: BRAND.textSub, lineHeight: 1.6 }}>{log.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROGRESS PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ProgressPage({ ctx }) {
  const { students, workoutLogs } = ctx;
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const student = students.find(s => s.id === selectedStudentId) || null;
  const logs = selectedStudentId ? workoutLogs.filter(l => l.studentId === selectedStudentId) : [];
  const measurements = student?.measurements || [];

  const monthlyData = useMemo(() => {
    if (!logs.length) return [];
    const counts = {};
    logs.forEach(l => {
      const key = l.date ? l.date.slice(0, 7) : l.loggedAt?.slice(0, 7);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [logs]);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>گزارش پیشرفت</div>

      <div style={{ marginBottom: 20 }}>
        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} style={{ ...selectStyle, minWidth: 220 }}>
          <option value="">انتخاب شاگرد...</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {!student || !selectedStudentId ? (
        <EmptyState icon={TrendingUp} text="یک شاگرد انتخاب کنید" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { label: "جلسات تمرین", value: logs.length, icon: Activity, color: BRAND.gold },
              { label: "اندازه‌گیری‌ها", value: measurements.length, icon: BarChart2, color: "#5E9BD4" },
              { label: "میانگین کیفیت", value: logs.filter(l => l.rating).length ? (logs.filter(l => l.rating).reduce((a, l) => a + l.rating, 0) / logs.filter(l => l.rating).length).toFixed(1) + " ⭐" : "—", icon: Star, color: BRAND.green },
              { label: "کل زمان (دقیقه)", value: logs.reduce((a, l) => a + (parseInt(l.duration) || 0), 0) || "—", icon: Clock, color: "#C25450" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 6 }}>{card.label}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
                    <Icon size={20} color={card.color} style={{ opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {monthlyData.length > 0 && (
            <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>فرکانس تمرین ماهانه</div>
              <WorkoutFrequencyChart data={monthlyData} />
            </div>
          )}

          {measurements.length >= 2 && (
            <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>تغییر وزن</div>
              <SimpleWeightChart measurements={measurements} />
            </div>
          )}

          {measurements.length > 0 && (
            <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>تاریخچه اندازه‌گیری</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                      {["تاریخ", "وزن", "چربی%", "سینه", "دور کمر", "باسن", "بازو", "ران"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.slice().reverse().map(m => (
                      <tr key={m.id} style={{ borderBottom: `1px solid ${BRAND.border}20` }}>
                        {[m.date, m.weight, m.bodyfat, m.chest, m.waist, m.hip, m.arm, m.thigh].map((v, i) => (
                          <td key={i} style={tdStyle}>{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {measurements.length === 0 && logs.length === 0 && (
            <EmptyState icon={TrendingUp} text="هنوز داده‌ای برای نمایش وجود ندارد. از بخش پروفایل شاگرد اندازه‌گیری اضافه کنید." />
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutFrequencyChart({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d[1]), 1);
  const W = 560, H = 140, padL = 30, padB = 30, padT = 10, padR = 10;
  const barW = Math.min(40, (W - padL - padR) / data.length - 8);
  const toX = i => padL + i * ((W - padL - padR) / data.length) + (W - padL - padR) / data.length / 2;
  const toY = v => padT + (1 - v / max) * (H - padT - padB);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const x = toX(i);
        const h = ((d[1] / max) * (H - padT - padB));
        const y = toY(d[1]);
        return (
          <g key={i}>
            <rect x={x - barW / 2} y={y} width={barW} height={h} rx={4} fill={`${BRAND.gold}80`} />
            <text x={x} y={y - 4} textAnchor="middle" fontSize="11" fill={BRAND.gold} fontWeight="700">{d[1]}</text>
            <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill={BRAND.textMuted}>{d[0].slice(5)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Simple SVG weight chart
function SimpleWeightChart({ measurements }) {
  const sorted = [...measurements].filter(m => m.weight).sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length < 2) return <div style={{ color: BRAND.textMuted, fontSize: 12 }}>حداقل ۲ نقطه داده نیاز است</div>;

  const weights = sorted.map(m => parseFloat(m.weight));
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const W = 600, H = 160, pad = 40;

  const toX = i => pad + (i / (sorted.length - 1)) * (W - 2 * pad);
  const toY = w => H - pad - ((w - minW) / (maxW - minW)) * (H - 2 * pad);

  const path = sorted.map((m, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(parseFloat(m.weight))}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <path d={path} stroke={BRAND.gold} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {sorted.map((m, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(parseFloat(m.weight))} r="4" fill={BRAND.gold} />
          <text x={toX(i)} y={toY(parseFloat(m.weight)) - 10} textAnchor="middle" fontSize="10" fill={BRAND.textMuted}>{m.weight}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODALS
// ─────────────────────────────────────────────────────────────────────────────

function StudentFormModal({ onClose, onSave, initial = {} }) {
  const [form, setForm] = useState({ name: "", phone: "", age: "", weight: "", height: "", gender: "مرد", goal: "افزایش حجم", level: "مبتدی", notes: "", active: true, ...initial });

  const f = (key) => ({ value: form[key] || "", onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={onClose}>
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 24, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>افزودن شاگرد جدید</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>نام و نام خانوادگی *</div>
            <input {...f("name")} placeholder="مثلاً: علی رضایی" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>شماره تماس</div>
            <input {...f("phone")} placeholder="09..." style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>سن</div>
            <input type="number" {...f("age")} placeholder="سال" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>وزن (kg)</div>
            <input type="number" {...f("weight")} placeholder="کیلوگرم" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>قد (cm)</div>
            <input type="number" {...f("height")} placeholder="سانتیمتر" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>جنسیت</div>
            <select {...f("gender")} style={selectStyle}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>هدف</div>
            <select {...f("goal")} style={selectStyle}>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>سطح</div>
            <select {...f("level")} style={selectStyle}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 4 }}>یادداشت مربی</div>
            <textarea {...f("notes")} rows={3} placeholder="سابقه آسیب‌دیدگی، محدودیت‌ها، اهداف بلندمدت..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => { if (!form.name.trim()) return alert("نام الزامی است"); onSave(form); }} style={btnStyle("primary")}>
            <UserPlus size={14} /> افزودن شاگرد
          </button>
          <button onClick={onClose} style={btnStyle("outline")}>لغو</button>
        </div>
      </div>
    </div>
  );
}

function ExerciseDetailModal({ exercise, onClose, onEdit }) {
  const muscleGroup = MUSCLE_GROUPS.find(m => m.id === exercise.muscle);

  const videoUrl = exercise.videoUrl?.trim() || "";
  const video2Url = exercise.video2Url?.trim() || "";
  const imageUrl = exercise.imageUrl?.trim() || "";
  const gifUrl = exercise.gifUrl?.trim() || "";

  const hasAnyMedia = !!(videoUrl || video2Url || gifUrl || imageUrl);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={onClose}>
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 22, maxWidth: 560, width: "100%", maxHeight: "88vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{exercise.name}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onEdit && (
              <button onClick={onEdit} style={{ ...btnStyle("gold"), fontSize: 12, padding: "5px 10px" }}>
                <Edit2 size={12} /> ویرایش
              </button>
            )}
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer" }}><X size={18} /></button>
          </div>
        </div>

        {/* Media preview grid — coach panel */}
        {hasAnyMedia && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Film size={13} /> رسانه‌های آموزشی
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {videoUrl && (
                <div style={{ background: "#000", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: BRAND.textMuted, padding: "4px 8px", background: BRAND.surface2 }}>🎬 ویدیو ۱</div>
                  <video src={videoUrl} controls style={{ width: "100%", maxHeight: 160, display: "block" }} />
                </div>
              )}
              {video2Url && (
                <div style={{ background: "#000", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: BRAND.textMuted, padding: "4px 8px", background: BRAND.surface2 }}>🎬 ویدیو ۲</div>
                  <video src={video2Url} controls style={{ width: "100%", maxHeight: 160, display: "block" }} />
                </div>
              )}
              {gifUrl && (
                <div style={{ background: BRAND.bg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: BRAND.textMuted, padding: "4px 8px", background: BRAND.surface2 }}>🎞️ GIF</div>
                  <img src={gifUrl} alt={exercise.name} style={{ width: "100%", maxHeight: 160, objectFit: "contain", display: "block" }} />
                </div>
              )}
              {imageUrl && (
                <div style={{ background: BRAND.bg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: BRAND.textMuted, padding: "4px 8px", background: BRAND.surface2 }}>🖼️ تصویر</div>
                  <img src={imageUrl} alt={exercise.name} style={{ width: "100%", maxHeight: 160, objectFit: "contain", display: "block" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {!hasAnyMedia && exercise.hasVideo && (
          <div style={{ background: BRAND.bg, border: `1px dashed ${BRAND.borderLight}`, borderRadius: 12, height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <Play size={26} color={BRAND.gold} fill={BRAND.gold} />
            <span style={{ fontSize: 11, color: BRAND.textMuted }}>پخش ویدیوی آموزشی</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "عضله هدف", value: muscleGroup?.fa },
            { label: "عضله کمکی", value: exercise.secondary },
            { label: "سطح سختی", value: exercise.difficulty },
            { label: "تجهیزات", value: exercise.equipment },
          ].map(item => (
            <div key={item.label} style={{ background: BRAND.bg, borderRadius: 9, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: BRAND.textMuted, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
        {[
          { title: "توضیح", text: exercise.desc, color: BRAND.gold },
          { title: "نکات مهم اجرای صحیح", text: exercise.tips, color: BRAND.green },
          { title: "اشتباهات رایج", text: exercise.mistakes, color: BRAND.red },
        ].map(sec => (
          <div key={sec.title} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: sec.color, marginBottom: 4 }}>{sec.title}</div>
            <p style={{ fontSize: 13, color: BRAND.textSub, lineHeight: 1.7, margin: 0 }}>{sec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXERCISE BANK PAGE (standalone)
// ─────────────────────────────────────────────────────────────────────────────

function ExerciseBankPage({ ctx }) {
  const { allExercises, customExercises, addCustomExercise, updateCustomExercise, deleteCustomExercise } = ctx;
  const [activeMuscle, setActiveMuscle] = useState("chest");
  const [search, setSearch] = useState("");
  const [detailEx, setDetailEx] = useState(null);   // view detail modal
  const [editEx, setEditEx] = useState(null);        // null = closed, {} = new, {id,...} = editing

  const filtered = useMemo(() => allExercises.filter(ex => {
    const matchMuscle = search.trim() ? true : ex.muscle === activeMuscle;
    const matchSearch = !search.trim() || ex.name.includes(search.trim());
    return matchMuscle && matchSearch;
  }), [allExercises, activeMuscle, search]);

  const handleSaveExercise = (data) => {
    if (data.id) {
      updateCustomExercise(data.id, data);
    } else {
      addCustomExercise(data);
    }
    setEditEx(null);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>بانک حرکات</div>
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>{allExercises.length} حرکت · {customExercises.length} حرکت شخصی</div>
        </div>
        <button onClick={() => setEditEx({})} style={btnStyle("primary")}>
          <Plus size={15} /> افزودن حرکت جدید
        </button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: "9px 12px", marginBottom: 14 }}>
        <Search size={15} color={BRAND.textMuted} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی حرکت..." style={{ background: "transparent", border: "none", color: BRAND.text, fontSize: 13, flex: 1, outline: "none" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 0, display: "flex" }}><X size={14} /></button>}
      </div>

      {/* Muscle filter */}
      {!search.trim() && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {MUSCLE_GROUPS.map(m => (
            <button key={m.id} onClick={() => setActiveMuscle(m.id)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, border: `1px solid ${activeMuscle === m.id ? BRAND.gold : BRAND.border}`, background: activeMuscle === m.id ? BRAND.gold : BRAND.surface, color: activeMuscle === m.id ? "#0A0A0B" : BRAND.textSub, cursor: "pointer", fontWeight: activeMuscle === m.id ? 700 : 400 }}>
              {m.icon} {m.fa}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} text="حرکتی یافت نشد" action={() => setEditEx({})} actionLabel="افزودن حرکت جدید" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map(ex => {
            const muscle = MUSCLE_GROUPS.find(m => m.id === ex.muscle);
            const hasVideo = !!(ex.videoUrl?.trim());
            const hasGif = !!(ex.gifUrl?.trim());
            const hasImage = !!(ex.imageUrl?.trim());
            return (
              <div key={ex.id} style={{ background: BRAND.surface, border: `1px solid ${ex.isCustom ? BRAND.gold + "40" : BRAND.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Card top */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${BRAND.gold}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {muscle?.icon || "💪"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</span>
                      {ex.isCustom && <span style={{ fontSize: 9, background: `${BRAND.gold}30`, color: BRAND.gold, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>شخصی</span>}
                      {hasVideo && <span style={{ fontSize: 9, background: `${BRAND.green}25`, color: BRAND.green, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>📹 ویدیو</span>}
                      {hasGif && !hasVideo && <span style={{ fontSize: 9, background: `#5E9BD425`, color: "#5E9BD4", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>🎞️ GIF</span>}
                      {hasImage && !hasVideo && !hasGif && <span style={{ fontSize: 9, background: `${BRAND.textMuted}20`, color: BRAND.textSub, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>🖼️ عکس</span>}
                    </div>
                    <div style={{ fontSize: 11, color: BRAND.textMuted, marginTop: 2 }}>{muscle?.fa} · <span style={{ color: DIFFICULTY_COLOR[ex.difficulty] || BRAND.textMuted }}>{ex.difficulty || "—"}</span></div>
                  </div>
                </div>
                {ex.equipment && <div style={{ fontSize: 11, color: BRAND.textSub, paddingRight: 2 }}>🔧 {ex.equipment}</div>}
                {ex.desc && <div style={{ fontSize: 11, color: BRAND.textMuted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ex.desc}</div>}
                {/* Buttons */}
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button onClick={() => setDetailEx(ex)} style={{ ...btnStyle("outline"), fontSize: 11, padding: "5px 10px" }}>
                    <Info size={11} /> جزئیات
                  </button>
                  {ex.isCustom && (
                    <>
                      <button onClick={() => setEditEx({ ...ex })} style={{ ...btnStyle("gold"), fontSize: 11, padding: "5px 10px" }}>
                        <Edit2 size={11} /> ویرایش
                      </button>
                      <button onClick={() => { if (confirm(`حذف «${ex.name}»?`)) deleteCustomExercise(ex.id); }} style={{ ...btnStyle("danger"), fontSize: 11, padding: "5px 10px" }}>
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {detailEx && <ExerciseDetailModal exercise={detailEx} onClose={() => setDetailEx(null)} onEdit={detailEx.isCustom ? () => { setEditEx({ ...detailEx }); setDetailEx(null); } : null} />}
      {editEx !== null && (
        <ExerciseFormModal
          initial={editEx}
          onSave={handleSaveExercise}
          onClose={() => setEditEx(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIA UPLOAD SLOT — single reusable file uploader for Supabase Storage
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_STORAGE_BUCKET = "exercise-media";

async function uploadMediaToSupabase(file, exerciseId, slot) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `exercises/${exerciseId}/${slot}.${ext}`;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);
  return publicUrl;
}

async function deleteMediaFromSupabase(url) {
  try {
    const marker = `/${SUPABASE_STORAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([path]);
  } catch {}
}

function MediaUploadSlot({ label, slotKey, accept, icon: Icon, currentUrl, exerciseId, onUploaded, onDeleted }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { setPreviewUrl(currentUrl || ""); }, [currentUrl]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const id = exerciseId || `temp-${Date.now()}`;
      const url = await uploadMediaToSupabase(file, id, slotKey);
      setPreviewUrl(url);
      onUploaded(url, slotKey, id);
    } catch (err) {
      setError("خطا در آپلود: " + (err.message || "دوباره تلاش کنید"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;
    if (!confirm("حذف این فایل؟")) return;
    await deleteMediaFromSupabase(previewUrl);
    setPreviewUrl("");
    onDeleted(slotKey);
  };

  const isVideo = slotKey === "video1" || slotKey === "video2";
  const isGif = slotKey === "gif";

  return (
    <div style={{ background: BRAND.bg, border: `1px solid ${previewUrl ? BRAND.green : BRAND.border}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <Icon size={14} color={previewUrl ? BRAND.green : BRAND.textMuted} />
        <span style={{ fontSize: 12, fontWeight: 700, color: previewUrl ? BRAND.green : BRAND.textSub }}>{label}</span>
        {previewUrl && <span style={{ fontSize: 10, color: BRAND.green, marginRight: "auto" }}>✓ آپلود شد</span>}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div style={{ borderRadius: 8, overflow: "hidden", background: "#000", maxHeight: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isVideo ? (
            <video src={previewUrl} controls style={{ width: "100%", maxHeight: 140, display: "block" }} />
          ) : (
            <img src={previewUrl} alt={label} style={{ width: "100%", maxHeight: 140, objectFit: "contain", display: "block" }} />
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          style={{ display: "none" }}
          id={`upload-${slotKey}-${exerciseId || "new"}`}
        />
        <label
          htmlFor={`upload-${slotKey}-${exerciseId || "new"}`}
          style={{ ...btnStyle(previewUrl ? "outline" : "gold"), fontSize: 11, padding: "5px 10px", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}
        >
          <Upload size={11} /> {uploading ? "در حال آپلود..." : previewUrl ? "جایگزینی" : "انتخاب فایل"}
        </label>
        {previewUrl && (
          <button onClick={handleDelete} style={{ ...btnStyle("danger"), fontSize: 11, padding: "5px 10px" }}>
            <Trash2 size={11} /> حذف
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: BRAND.red }}>{error}</div>}
      <div style={{ fontSize: 10, color: BRAND.textMuted }}>{accept.split(",").join(" · ")}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXERCISE FORM MODAL — Add & Edit (with Supabase Storage upload)
// ─────────────────────────────────────────────────────────────────────────────

function ExerciseFormModal({ initial = {}, onSave, onClose }) {
  const isEdit = !!initial.id;
  const blank = { name: "", muscle: "chest", difficulty: "متوسط", equipment: "", secondary: "", desc: "", tips: "", mistakes: "", videoUrl: "", video2Url: "", imageUrl: "", gifUrl: "" };
  const [form, setForm] = useState({ ...blank, ...initial });
  // exerciseId used as folder name in Storage. For new exercises, generate a temp id that becomes stable after first upload.
  const [exerciseId, setExerciseId] = useState(initial.id || `new-${Date.now()}`);

  const f = (key) => ({
    value: form[key] || "",
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const handleUploaded = (url, slot, usedId) => {
    if (!initial.id && usedId !== exerciseId) setExerciseId(usedId);
    const keyMap = { video1: "videoUrl", video2: "video2Url", gif: "gifUrl", image: "imageUrl" };
    const key = keyMap[slot];
    if (key) setForm(p => ({ ...p, [key]: url }));
  };

  const handleDeleted = (slot) => {
    const keyMap = { video1: "videoUrl", video2: "video2Url", gif: "gifUrl", image: "imageUrl" };
    const key = keyMap[slot];
    if (key) setForm(p => ({ ...p, [key]: "" }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert("نام حرکت الزامی است");
    const hasMedia = !!(form.videoUrl || form.video2Url || form.gifUrl || form.imageUrl);
    onSave({ ...form, id: isEdit ? initial.id : exerciseId, hasVideo: !!(form.videoUrl || form.video2Url), hasMedia });
  };

  const label = (text, required) => (
    <div style={{ fontSize: 11, color: BRAND.textMuted, marginBottom: 5 }}>
      {text} {required && <span style={{ color: BRAND.red }}>*</span>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }} onClick={onClose}>
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 24, maxWidth: 600, width: "100%", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? "ویرایش حرکت" : "افزودن حرکت جدید"}</div>
            <div style={{ fontSize: 12, color: BRAND.textMuted, marginTop: 3 }}>رسانه‌ها در Supabase Storage ذخیره می‌شوند</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name */}
          <div>
            {label("نام حرکت", true)}
            <input {...f("name")} placeholder="مثلاً: پرس سینه دمبل" style={inputStyle} />
          </div>

          {/* Muscle + Difficulty */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              {label("گروه عضلانی", true)}
              <select value={form.muscle} onChange={e => setForm(p => ({ ...p, muscle: e.target.value }))} style={selectStyle}>
                {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.fa}</option>)}
              </select>
            </div>
            <div>
              {label("سطح سختی")}
              <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} style={selectStyle}>
                {["آسان", "متوسط", "سخت"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Equipment + Secondary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              {label("تجهیزات")}
              <input {...f("equipment")} placeholder="مثلاً: هالتر، نیمکت" style={inputStyle} />
            </div>
            <div>
              {label("عضله کمکی")}
              <input {...f("secondary")} placeholder="مثلاً: پشت بازو" style={inputStyle} />
            </div>
          </div>

          {/* Description */}
          <div>
            {label("توضیح حرکت")}
            <textarea {...f("desc")} rows={3} placeholder="توضیح کامل حرکت..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Tips + Mistakes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              {label("نکات اجرای صحیح")}
              <textarea {...f("tips")} rows={3} placeholder="نکات فنی مهم..." style={{ ...inputStyle, resize: "vertical", fontSize: 12 }} />
            </div>
            <div>
              {label("اشتباهات رایج")}
              <textarea {...f("mistakes")} rows={3} placeholder="اشتباهات متداول..." style={{ ...inputStyle, resize: "vertical", fontSize: 12 }} />
            </div>
          </div>

          {/* Media Section */}
          <div style={{ background: `${BRAND.gold}08`, border: `1px solid ${BRAND.gold}30`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.gold, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Film size={14} /> رسانه‌های آموزشی حرکت
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MediaUploadSlot
                label="ویدیو ۱"
                slotKey="video1"
                accept="video/mp4,video/webm"
                icon={FileVideo}
                currentUrl={form.videoUrl}
                exerciseId={exerciseId}
                onUploaded={handleUploaded}
                onDeleted={handleDeleted}
              />
              <MediaUploadSlot
                label="ویدیو ۲"
                slotKey="video2"
                accept="video/mp4,video/webm"
                icon={FileVideo}
                currentUrl={form.video2Url}
                exerciseId={exerciseId}
                onUploaded={handleUploaded}
                onDeleted={handleDeleted}
              />
              <MediaUploadSlot
                label="GIF"
                slotKey="gif"
                accept="image/gif"
                icon={Film}
                currentUrl={form.gifUrl}
                exerciseId={exerciseId}
                onUploaded={handleUploaded}
                onDeleted={handleDeleted}
              />
              <MediaUploadSlot
                label="تصویر (Image)"
                slotKey="image"
                accept="image/jpeg,image/png,image/webp"
                icon={Image}
                currentUrl={form.imageUrl}
                exerciseId={exerciseId}
                onUploaded={handleUploaded}
                onDeleted={handleDeleted}
              />
            </div>
            <div style={{ fontSize: 11, color: BRAND.textMuted, marginTop: 10, lineHeight: 1.7 }}>
              📁 فایل‌ها مستقیماً در Supabase Storage ذخیره می‌شوند و در پنل شاگرد نمایش داده خواهند شد.
            </div>
          </div>

        </div>

        {/* Footer buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${BRAND.border}` }}>
          <button onClick={handleSave} style={btnStyle("primary")}>
            <Save size={14} /> {isEdit ? "ذخیره تغییرات" : "افزودن حرکت"}
          </button>
          <button onClick={onClose} style={btnStyle("outline")}>لغو</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, text, action, actionLabel }) {
  return (
    <div style={{ border: `1px dashed ${BRAND.border}`, borderRadius: 16, padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <Icon size={38} color={BRAND.borderLight} />
      <p style={{ color: BRAND.textMuted, fontSize: 13, margin: 0, maxWidth: 300 }}>{text}</p>
      {action && (
        <button onClick={action} style={btnStyle("primary")}>
          <Plus size={14} /> {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle = {
  background: BRAND.bg,
  border: `1px solid ${BRAND.border}`,
  borderRadius: 9,
  padding: "9px 12px",
  color: BRAND.text,
  fontSize: 13,
  width: "100%",
  outline: "none",
  fontFamily: "'Vazirmatn', sans-serif",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
};

const thStyle = {
  textAlign: "right",
  padding: "8px 10px",
  fontSize: 11,
  color: BRAND.textMuted,
  fontWeight: 600,
  background: BRAND.surface2,
};

const tdStyle = {
  padding: "8px 10px",
  fontSize: 12,
  color: BRAND.textSub,
};

function btnStyle(variant) {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'Vazirmatn', sans-serif", transition: "opacity 0.15s", whiteSpace: "nowrap" };
  if (variant === "primary") return { ...base, background: BRAND.gold, color: "#0A0A0B" };
  if (variant === "gold") return { ...base, background: `${BRAND.gold}20`, color: BRAND.gold, border: `1px solid ${BRAND.gold}50` };
  if (variant === "outline") return { ...base, background: "transparent", color: BRAND.textSub, border: `1px solid ${BRAND.border}` };
  if (variant === "danger") return { ...base, background: `${BRAND.red}20`, color: BRAND.red, border: `1px solid ${BRAND.red}40` };
  if (variant === "success") return { ...base, background: `${BRAND.green}25`, color: BRAND.green, border: `1px solid ${BRAND.green}40` };
  return base;
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  input, textarea, select, button { font-family: 'Vazirmatn', sans-serif; }
  input:focus, textarea:focus, select:focus, button:focus { outline: 2px solid ${BRAND.gold}; outline-offset: 1px; }
  ::-webkit-scrollbar { width: 7px; height: 7px; }
  ::-webkit-scrollbar-thumb { background: #2A2A2D; border-radius: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  select option { background: #141416; }
`;
