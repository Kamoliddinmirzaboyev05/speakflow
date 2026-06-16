import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  Copy,
  Check,
  ChevronRight,
  Users,
  TrendingUp,
  Clock,
  Mic,
  Calendar,
  BarChart2,
  MessageSquare,
  LogOut,
  Eye,
  ThumbsUp,
  AlertTriangle,
  XCircle,
  Moon,
  Sun,
  ArrowRight,
  Target,
  Activity,
  AlertCircle,
  Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "dashboard" | "admin-login" | "admin" | "student-detail";
type AdminTab = "overview" | "students" | "feedback" | "analytics";

// ─── Data ─────────────────────────────────────────────────────────────────────

const progressData = [
  { day: "Mon", score: 52 },
  { day: "Tue", score: 55 },
  { day: "Wed", score: 58 },
  { day: "Thu", score: 61 },
  { day: "Fri", score: 60 },
  { day: "Sat", score: 65 },
  { day: "Sun", score: 68 },
];

const skills = [
  { label: "Fluency", score: 72 },
  { label: "Grammar", score: 58 },
  { label: "Vocabulary", score: 65 },
  { label: "Pronunciation", score: 48 },
  { label: "Task Response", score: 71 },
];

const mistakes = [
  { wrong: "I am agree", correct: "I agree", tag: "Grammar" },
  { wrong: "He can to speak", correct: "He can speak", tag: "Grammar" },
  { wrong: "I have been went", correct: "I went / I have been", tag: "Tense" },
];

const vocabCards = [
  { original: "very good", better: ["effective", "impressive", "excellent"] },
  { original: "bad", better: ["inadequate", "poor", "substandard"] },
  { original: "big", better: ["substantial", "significant", "considerable"] },
];

const calendarData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  practiced: [1,2,3,5,6,7,8,10,12,13,14,15,17,18,20,21,22,24,25,26,27,28,30].includes(i + 1),
}));

const students = [
  { id: 1, name: "Jasur Toshmatov", goal: "IELTS", level: "B2", lastActive: "2h ago", audios: 24, score: 68, progress: 12, risk: "active" },
  { id: 2, name: "Malika Yusupova", goal: "Business", level: "B1", lastActive: "1d ago", audios: 18, score: 61, progress: 8, risk: "active" },
  { id: 3, name: "Bobur Nazarov", goal: "General", level: "A2", lastActive: "3d ago", audios: 9, score: 44, progress: 3, risk: "slowing" },
  { id: 4, name: "Nilufar Karimova", goal: "IELTS", level: "C1", lastActive: "5d ago", audios: 31, score: 74, progress: 15, risk: "active" },
  { id: 5, name: "Sherzod Umarov", goal: "General", level: "A1", lastActive: "8d ago", audios: 4, score: 38, progress: -2, risk: "inactive" },
  { id: 6, name: "Dildora Rahimova", goal: "Business", level: "B2", lastActive: "2d ago", audios: 21, score: 65, progress: 7, risk: "slowing" },
];

const radarData = [
  { skill: "Fluency", score: 72, fullMark: 100 },
  { skill: "Grammar", score: 58, fullMark: 100 },
  { skill: "Vocabulary", score: 65, fullMark: 100 },
  { skill: "Pronunciation", score: 48, fullMark: 100 },
  { skill: "Task Response", score: 71, fullMark: 100 },
];

const studentProgressData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.min(80, 45 + Math.floor(i * 0.85) + (i % 3 === 0 ? -2 : i % 5 === 0 ? 3 : 1)),
}));

const recentSessions = [
  { date: "Jun 15, 2026", mode: "IELTS Speaking", score: 68 },
  { date: "Jun 13, 2026", mode: "Conversation", score: 65 },
  { date: "Jun 11, 2026", mode: "IELTS Speaking", score: 62 },
  { date: "Jun 9, 2026", mode: "Grammar Drill", score: 60 },
  { date: "Jun 7, 2026", mode: "Conversation", score: 58 },
];

const feedbackItems = [
  {
    id: 1,
    student: "Jasur Toshmatov",
    date: "Jun 15, 2026",
    duration: "4:32",
    goal: "IELTS",
    score: 68,
    summary: "Good fluency on familiar topics, struggles with complex sentence structures and conditional forms.",
    mistakes: ["I am agree with this", "He can to speak English well"],
    status: "needs-review",
  },
  {
    id: 2,
    student: "Malika Yusupova",
    date: "Jun 14, 2026",
    duration: "3:18",
    goal: "Business",
    score: 61,
    summary: "Vocabulary range is improving. Occasional tense errors. Professional tone is consistent.",
    mistakes: ["We have discussed about it yesterday"],
    status: "good",
  },
  {
    id: 3,
    student: "Bobur Nazarov",
    date: "Jun 13, 2026",
    duration: "2:45",
    goal: "General",
    score: 44,
    summary: "Limited vocabulary range. Needs significant work on basic grammar and pronunciation.",
    mistakes: ["I have been went to school", "She don't like it"],
    status: "wrong-analysis",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function skillBarColor(score: number) {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function riskBadgeClass(risk: string) {
  switch (risk) {
    case "active": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "slowing": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "inactive": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function riskLabel(risk: string) {
  switch (risk) {
    case "active": return "Active";
    case "slowing": return "Slowing";
    case "inactive": return "Inactive";
    default: return risk;
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "good": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "needs-review": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "wrong-analysis": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "good": return "Good";
    case "needs-review": return "Needs Review";
    case "wrong-analysis": return "Wrong Analysis";
    default: return status;
  }
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

// ─── Shared Components ────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskBadgeClass(risk)}`}>
      {riskLabel(risk)}
    </span>
  );
}

function SkillBar({ label, score, animate = true }: { label: string; score: number; animate?: boolean }) {
  const [width, setWidth] = useState(animate ? 0 : score);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth(score), 120);
    return () => clearTimeout(t);
  }, [score, animate]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${skillBarColor(score)}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-7 text-right tabular-nums ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

function MistakeCard({ wrong, correct, tag }: { wrong: string; correct: string; tag: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-red-500 font-bold text-sm shrink-0">✗</span>
        <span className="text-sm text-red-500 line-through leading-snug">{wrong}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400 font-bold text-sm shrink-0">✓</span>
        <span className="text-sm font-semibold text-foreground leading-snug">{correct}</span>
      </div>
      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
        {tag}
      </span>
    </div>
  );
}

function VocabCard({ original, better }: { original: string; better: string[] }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(better.join(", ")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Instead of</span>
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          {copied
            ? <Check size={13} className="text-green-500" />
            : <Copy size={13} className="text-muted-foreground" />}
        </button>
      </div>
      <p className="text-sm text-muted-foreground line-through">{original}</p>
      <div className="flex flex-wrap gap-1.5">
        {better.map((word) => (
          <span key={word} className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatMiniCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex-1 bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 min-w-0">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-base font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function PracticeCalendar({ data }: { data: { day: number; practiced: boolean }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Practice Calendar</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {data.map((d, i) => (
          <div
            key={d.day}
            title={`Day ${d.day}`}
            className={`aspect-square rounded-sm transition-all duration-300 ${
              d.practiced
                ? "bg-green-500 dark:bg-green-600 hover:opacity-90"
                : "bg-muted hover:bg-muted-foreground/20"
            }`}
            style={{ animationDelay: `${i * 20}ms` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          <span className="text-xs text-muted-foreground">Practiced</span>
        </div>
      </div>
    </div>
  );
}

function AdminReviewButtons({
  value,
  onChange,
  comment,
  onCommentChange,
}: {
  value: string;
  onChange: (v: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {[
          {
            id: "good",
            label: "Good",
            icon: <ThumbsUp size={11} />,
            active: "bg-green-500 text-white shadow-sm",
            idle: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50",
          },
          {
            id: "needs-review",
            label: "Needs Review",
            icon: <AlertTriangle size={11} />,
            active: "bg-amber-500 text-white shadow-sm",
            idle: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50",
          },
          {
            id: "wrong-analysis",
            label: "Wrong Analysis",
            icon: <XCircle size={11} />,
            active: "bg-red-500 text-white shadow-sm",
            idle: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50",
          },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => onChange(value === btn.id ? "" : btn.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              value === btn.id ? btn.active : btn.idle
            }`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
      {value && (
        <input
          type="text"
          placeholder="Add a comment (optional)..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
        />
      )}
    </div>
  );
}

// ─── Screen 1: Dashboard ──────────────────────────────────────────────────────

function DashboardScreen() {
  const [animScore, setAnimScore] = useState(45);

  useEffect(() => {
    let current = 45;
    const interval = setInterval(() => {
      current = Math.min(current + 1, 68);
      setAnimScore(current);
      if (current >= 68) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JT
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Salom, Jasur 👋</p>
              <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200/60 dark:border-orange-800/40">
              <span className="text-base leading-none">🔥</span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">7 days</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-700/40">
            Band 5.5–6.0
          </span>
          <span className="text-xs text-muted-foreground">Current IELTS estimate</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Today's Focus */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={12} className="opacity-75" />
            <span className="text-xs font-semibold opacity-75 uppercase tracking-wider">Today's Focus</span>
          </div>
          <p className="text-base font-bold leading-snug mb-4">
            Work on your grammar — avoid double verbs
          </p>
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/10 transition-all rounded-xl px-4 py-2.5 text-sm font-semibold backdrop-blur-sm">
            Start Practice <ArrowRight size={14} />
          </button>
        </div>

        {/* Progress Chart */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
            <div className="text-xs text-muted-foreground tabular-nums">
              Started: <span className="text-foreground font-semibold">45</span>
              <span className="mx-1 opacity-40">→</span>
              Now: <span className="text-blue-600 dark:text-blue-400 font-bold">{animScore}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Last 7 sessions</p>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={progressData} margin={{ top: 4, right: 6, bottom: 0, left: -24 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Inter" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Inter" }}
                tickLine={false}
                axisLine={false}
                domain={[40, 80]}
                ticks={[40, 55, 70]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "Inter",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                itemStyle={{ color: "#2563EB" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#2563EB", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Skill Breakdown</h3>
          <div className="space-y-3.5">
            {skills.map((s) => <SkillBar key={s.label} {...s} />)}
          </div>
        </div>

        {/* Practice Stats */}
        <div className="flex gap-2">
          <StatMiniCard icon={<Mic size={16} />} value="24" label="audios" />
          <StatMiniCard icon={<Clock size={16} />} value="3.2h" label="total time" />
          <StatMiniCard icon={<Calendar size={16} />} value="12" label="days active" />
        </div>

        {/* Practice Calendar */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <PracticeCalendar data={calendarData} />
        </div>

        {/* Common Mistakes */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Common Mistakes</h3>
          <div className="space-y-2">
            {mistakes.map((m) => <MistakeCard key={m.wrong} {...m} />)}
          </div>
        </div>

        {/* Vocabulary Upgrades */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Words to Level Up</h3>
          <div className="space-y-2">
            {vocabCards.map((v) => <VocabCard key={v.original} {...v} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Admin Login ─────────────────────────────────────────────────────

function AdminLoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@speakflow.ai");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">SpeakFlow</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Admin Panel</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 text-white font-semibold rounded-xl transition-all text-sm shadow-sm shadow-blue-500/20 mt-1"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-5">SpeakFlow Admin Only</p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Sidebar ─────────────────────────────────────────────────────────────

function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
}: {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  onLogout: () => void;
}) {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
    { id: "students", label: "Students", icon: <Users size={15} /> },
    { id: "feedback", label: "Feedback Review", icon: <MessageSquare size={15} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={15} /> },
  ];

  return (
    <div className="w-56 shrink-0 h-screen sticky top-10 bg-card border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">SpeakFlow</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@speakflow.ai</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Admin: Overview Tab ───────────────────────────────────────────────────────

function AdminOverview({ onSelectStudent }: { onSelectStudent: (id: number) => void }) {
  const stats = [
    {
      label: "Total Students",
      value: "10",
      icon: <Users size={17} />,
      colorText: "text-blue-600 dark:text-blue-400",
      colorBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Active (7 days)",
      value: "7",
      icon: <Activity size={17} />,
      colorText: "text-green-600 dark:text-green-400",
      colorBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Inactive",
      value: "3",
      icon: <AlertCircle size={17} />,
      colorText: "text-red-500 dark:text-red-400",
      colorBg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: "Avg Progress",
      value: "+12%",
      icon: <TrendingUp size={17} />,
      colorText: "text-amber-600 dark:text-amber-400",
      colorBg: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto min-w-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All students at a glance — Jun 2026</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${s.colorBg} ${s.colorText} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Students</h2>
          <span className="text-xs text-muted-foreground">{students.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Name", "Goal", "Level", "Last Active", "Audios", "Score", "Progress", "Risk", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectStudent(s.id)}
                  className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(s.name)}
                      </div>
                      <span className="font-semibold text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{s.goal}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-foreground text-xs font-semibold">{s.level}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{s.lastActive}</td>
                  <td className="px-5 py-3.5 text-foreground text-xs tabular-nums">{s.audios}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold tabular-nums ${scoreColor(s.score)}`}>{s.score}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold tabular-nums ${s.progress >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {s.progress >= 0 ? "+" : ""}{s.progress}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><RiskBadge risk={s.risk} /></td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground group-hover:text-foreground">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin: Student Detail ─────────────────────────────────────────────────────

function StudentDetail({ studentId, onBack }: { studentId: number; onBack: () => void }) {
  const student = students.find((s) => s.id === studentId) || students[0];
  const [reviewStates, setReviewStates] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});

  return (
    <div className="flex-1 p-6 overflow-auto min-w-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors font-medium"
      >
        ← Back to Overview
      </button>

      {/* Profile + Chart */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-sm">
              {initials(student.name)}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">{student.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{student.goal} • Level {student.level}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Joined", value: "Jan 15, 2026" },
              { label: "Streak", value: "🔥 7 days" },
              { label: "Score", value: String(student.score), className: scoreColor(student.score) + " font-bold" },
              { label: "Audios", value: String(student.audios) },
            ].map((row) => (
              <div key={row.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{row.label}</p>
                <p className={`text-sm font-semibold text-foreground ${row.className ?? ""}`}>{row.value}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <RiskBadge risk={student.risk} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">30-Day Progress</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={studentProgressData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval={5}
              />
              <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[40, 80]} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#2563EB" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Sessions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Inter" }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Sessions</h3>
          <div className="space-y-1">
            {recentSessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{session.mode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{session.date}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${scoreColor(session.score)}`}>{session.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Feedback</h3>
        <div className="space-y-3">
          {feedbackItems.slice(0, 2).map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.date}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.duration} • {item.goal}</p>
                </div>
                <span className={`text-base font-bold tabular-nums ${scoreColor(item.score)}`}>{item.score}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.summary}</p>
              <div className="space-y-1.5 mb-4 p-3 bg-muted/50 rounded-lg">
                {item.mistakes.map((m, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-500 text-xs font-bold mt-0.5 shrink-0">✗</span>
                    <span className="text-xs text-muted-foreground line-through">{m}</span>
                  </div>
                ))}
              </div>
              <AdminReviewButtons
                value={reviewStates[item.id] ?? ""}
                onChange={(v) => setReviewStates((p) => ({ ...p, [item.id]: v }))}
                comment={comments[item.id] ?? ""}
                onCommentChange={(v) => setComments((p) => ({ ...p, [item.id]: v }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin: Feedback Review ────────────────────────────────────────────────────

function FeedbackReview() {
  const [filter, setFilter] = useState("all");
  const [statuses, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(feedbackItems.map((f) => [f.id, f.status]))
  );

  const filters = [
    { id: "all", label: "All" },
    { id: "needs-review", label: "Needs Review" },
    { id: "wrong-analysis", label: "Wrong Analysis" },
    { id: "good", label: "Good" },
  ];

  const filtered = feedbackItems.filter((f) =>
    filter === "all" ? true : statuses[f.id] === filter
  );

  return (
    <div className="flex-1 p-6 overflow-auto min-w-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Feedback Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Verify AI-generated feedback for accuracy</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({feedbackItems.filter((fi) => statuses[fi.id] === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Student", "Date", "Goal", "Score", "Summary", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(item.student)}
                      </div>
                      <span className="font-semibold text-foreground text-xs">{item.student}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-xs whitespace-nowrap">{item.date}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{item.goal}</td>
                  <td className="px-5 py-4">
                    <span className={`font-bold text-sm tabular-nums ${scoreColor(item.score)}`}>{item.score}</span>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadgeClass(statuses[item.id])}`}>
                      {statusLabel(statuses[item.id])}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        const next = statuses[item.id] === "good" ? "needs-review" : statuses[item.id] === "needs-review" ? "wrong-analysis" : "good";
                        setStatuses((p) => ({ ...p, [item.id]: next }));
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold whitespace-nowrap"
                    >
                      Review <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No items match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin: Analytics placeholder ─────────────────────────────────────────────

function AdminAnalytics() {
  return (
    <div className="flex-1 p-6 overflow-auto min-w-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Cohort progress and engagement trends</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cohort Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={[
                { month: "Jan", avg: 49 }, { month: "Feb", avg: 52 }, { month: "Mar", avg: 55 },
                { month: "Apr", avg: 58 }, { month: "May", avg: 61 }, { month: "Jun", avg: 65 },
              ]}
              margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            >
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[40, 80]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="avg" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">Risk Distribution</h3>
          {[
            { label: "Active", count: 4, color: "bg-green-500", pct: 57 },
            { label: "Slowing", count: 2, color: "bg-amber-500", pct: 29 },
            { label: "Inactive", count: 1, color: "bg-red-500", pct: 14 },
          ].map((r) => (
            <div key={r.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{r.label}</span>
                <span className="text-muted-foreground">{r.count} students</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const isAdmin = view === "admin" || view === "student-detail";

  function handleSelectStudent(id: number) {
    setSelectedStudent(id);
    setView("student-detail");
    setAdminTab("students");
  }

  function handleAdminTabChange(tab: AdminTab) {
    setAdminTab(tab);
    setView("admin");
    setSelectedStudent(null);
  }

  return (
    <div className="font-['Inter'] antialiased">
      {/* Demo nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-3 py-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-semibold mr-1.5">SpeakFlow Demo</span>
        {[
          { label: "📱 Dashboard", action: () => { setView("dashboard"); } },
          { label: "🔐 Admin Login", action: () => { setView("admin-login"); } },
          { label: "🖥 Admin Overview", action: () => { setView("admin"); setAdminTab("overview"); setSelectedStudent(null); } },
          { label: "👤 Student Detail", action: () => { handleSelectStudent(1); } },
          { label: "📋 Feedback", action: () => { setView("admin"); setAdminTab("feedback"); setSelectedStudent(null); } },
        ].map((s) => {
          const isActive =
            (s.label.includes("Dashboard") && view === "dashboard") ||
            (s.label.includes("Login") && view === "admin-login") ||
            (s.label.includes("Overview") && isAdmin && adminTab === "overview" && view === "admin") ||
            (s.label.includes("Student") && view === "student-detail") ||
            (s.label.includes("Feedback") && isAdmin && adminTab === "feedback");

          return (
            <button
              key={s.label}
              onClick={s.action}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          );
        })}
        <button
          onClick={() => setDark(!dark)}
          className="ml-auto p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Content */}
      <div className="pt-10">
        {view === "dashboard" && (
          <div className="max-w-[390px] mx-auto bg-background min-h-screen border-x border-border/50 shadow-sm">
            <DashboardScreen />
          </div>
        )}

        {view === "admin-login" && (
          <AdminLoginScreen onLogin={() => { setView("admin"); setAdminTab("overview"); }} />
        )}

        {(isAdmin) && (
          <div className="flex min-h-[calc(100vh-40px)]">
            <AdminSidebar
              activeTab={adminTab}
              setActiveTab={handleAdminTabChange}
              onLogout={() => setView("admin-login")}
            />
            {view === "admin" && adminTab === "overview" && (
              <AdminOverview onSelectStudent={handleSelectStudent} />
            )}
            {view === "admin" && adminTab === "students" && (
              <AdminOverview onSelectStudent={handleSelectStudent} />
            )}
            {view === "admin" && adminTab === "feedback" && <FeedbackReview />}
            {view === "admin" && adminTab === "analytics" && <AdminAnalytics />}
            {view === "student-detail" && selectedStudent !== null && (
              <StudentDetail
                studentId={selectedStudent}
                onBack={() => { setView("admin"); setAdminTab("overview"); setSelectedStudent(null); }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
