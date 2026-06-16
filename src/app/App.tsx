import React, { useState, useEffect, useCallback } from "react";
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
  Menu,
  X,
  Loader2,
  ChevronLeft,
  User,
} from "lucide-react";
import { api } from "../lib/api";

// Telegram WebApp type definitions
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "dashboard" | "practice" | "admin-login" | "admin" | "student-detail";
type AdminTab = "overview" | "students" | "feedback" | "analytics";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  native_language?: string;
  english_level?: string;
  target_band?: string;
  created_at?: string;
}

interface SessionData {
  id: number;
  practice_mode: string;
  created_at: string;
  score: number | null;
}

interface UserProgress {
  user: {
    id: number;
    first_name: string;
    username?: string;
    target_band?: string;
  };
  total_sessions: number;
  average_score: number;
  latest_score: number | null;
  sessions: SessionData[];
}

interface AdminStats {
  total_users?: number;
  total_sessions?: number;
  total_analyses?: number;
}

interface MistakeData {
  type: string;
  wrong: string;
  correct: string;
  explanation: string;
}

interface VocabUpgrade {
  original: string;
  better: string[];
  example: string;
}

interface AnalysisResultData {
  id: number;
  session_id: number;
  transcript: string;
  analysis_data: {
    overall_score: number;
    score_label: string;
    skill_scores: Record<string, number>;
    summary: string;
    mistakes: MistakeData[];
    vocabulary_upgrades: VocabUpgrade[];
    improved_answer: string;
    mini_exercise: string;
    next_task: string;
    confidence_notes: string;
  };
  created_at: string;
}

interface SessionFull {
  id: number;
  telegram_user_id: number;
  practice_mode: string;
  question: string;
  created_at: string;
}

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

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Shared Components ────────────────────────────────────────────────────────

function SkillBar({ label, score, animate = true }: { label: string; score: number; animate?: boolean }) {
  const [width, setWidth] = useState(animate ? 0 : score);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth(score), 120);
    return () => clearTimeout(t);
  }, [score, animate]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-xs text-muted-foreground w-20 sm:w-28 shrink-0 truncate">{label}</span>
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

function PracticeCalendar({ sessions }: { sessions: SessionData[] }) {
  // Generate last 30 days calendar
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const sessionDates = new Set(
    sessions.map((s) => new Date(s.created_at).toDateString())
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Practice Calendar</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((d, i) => {
          const practiced = sessionDates.has(d.toDateString());
          return (
            <div
              key={d.toISOString()}
              title={`${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${practiced ? " — Practiced" : ""}`}
              className={`aspect-square rounded-sm transition-all duration-300 ${
                practiced
                  ? "bg-green-500 dark:bg-green-600 hover:opacity-90"
                  : "bg-muted hover:bg-muted-foreground/20"
              }`}
              style={{ animationDelay: `${i * 20}ms` }}
            />
          );
        })}
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

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {description && <p className="text-xs text-muted-foreground max-w-xs">{description}</p>}
    </div>
  );
}

function LoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-4 px-4 pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 bg-muted rounded-2xl" />
      ))}
    </div>
  );
}

// ─── Screen: Practice (placeholder) ───────────────────────────────────────────

function PracticeScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-5 pb-4 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-sm font-bold text-foreground">Practice</p>
            <p className="text-xs text-muted-foreground">Start a new speaking session</p>
          </div>
        </div>
      </div>
      <div className="px-4 pt-8">
        <EmptyState
          icon={<Mic size={24} />}
          title="Practice Mode"
          description="Recording and practice features will be available here. Connect the Telegram bot to start practicing."
        />
      </div>
    </div>
  );
}

// ─── Screen 1: Dashboard ──────────────────────────────────────────────────────

function DashboardScreen({ onStartPractice }: { onStartPractice?: () => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animScore, setAnimScore] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isWebApp, setIsWebApp] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    return localStorage.getItem('speakflow_phone_number') || '';
  });

  const loadData = async (initData?: string, phone?: string) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (initData) {
        data = await api.getWebAppProgress(initData);
      } else if (phone) {
        data = await api.getProgressByPhone(phone.trim());
      } else {
        setShowPhoneInput(true);
        setLoading(false);
        return;
      }

      setUserData(data);
      
      if (data.latest_score) {
        let current = 0;
        const target = data.latest_score;
        const interval = setInterval(() => {
          current = Math.min(current + 1, target);
          setAnimScore(current);
          if (current >= target) clearInterval(interval);
        }, 28);
      }

      if (data.latest_analysis) {
        setAnalysisResult(data.latest_analysis);
      }

      setShowPhoneInput(false);
    } catch (err) {
      console.error("Failed to load user data", err);
      setError("Ma'lumotlarni yuklashda xatolik. Iltimos, qayta urinib ko'ring.");
      setShowPhoneInput(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let initData = '';
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setIsWebApp(true);
      initData = window.Telegram.WebApp.initData;
    }

    if (initData) {
      loadData(initData);
    } else if (phoneNumber) {
      loadData(undefined, phoneNumber);
    } else {
      setLoading(false);
      setShowPhoneInput(true);
    }
  }, []);

  const progressChartData = userData?.sessions?.slice(0, 7).reverse().map((s: any, i: number) => ({
    day: `S${(userData.sessions?.length || 0) - i}`,
    score: s.score ?? 0,
  })) || [];

  const skillScores = analysisResult?.analysis_data?.skill_scores;
  const skillsList = skillScores
    ? Object.entries(skillScores).map(([label, score]) => ({ label, score: score as number }))
    : [];

  const mistakes = analysisResult?.analysis_data?.mistakes || [];
  const vocab = analysisResult?.analysis_data?.vocabulary_upgrades || [];

  const handleSavePhoneNumber = () => {
    if (phoneNumber.trim()) {
      localStorage.setItem('speakflow_phone_number', phoneNumber.trim());
      loadData(undefined, phoneNumber.trim());
    }
  };

  const handleChangePhone = () => {
    localStorage.removeItem('speakflow_phone_number');
    setShowPhoneInput(true);
    setPhoneNumber('');
    setUserData(null);
  };

  if (showPhoneInput) {
    return (
      <div className="min-h-screen bg-background px-4 pt-8">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-auto">
          <h3 className="text-lg font-bold text-foreground mb-2">Telefon raqamingizni kiriting</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Botda ro'yxatdan o'tgan telefon raqamingizni kiriting
          </p>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+998901234567"
            className="w-full px-3 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-3"
          />
          <button
            onClick={handleSavePhoneNumber}
            disabled={!phoneNumber.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
          >
            Saqlash va ko'rsatish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userData?.user?.first_name?.charAt(0) || "J"}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                Salom, {userData?.user?.first_name || "User"} 👋
              </p>
              <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isWebApp && (
              <button
                onClick={handleChangePhone}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Raqamni o'zgartirish
              </button>
            )}
            {userData && userData.sessions && userData.sessions.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200/60 dark:border-orange-800/40">
                <span className="text-base leading-none">🔥</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {`${Math.min(userData.sessions.length, 7)} days`}
                </span>
              </div>
            )}
          </div>
        </div>
        {userData && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-700/40">
              Band {userData?.user?.target_band || "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">Current IELTS estimate</span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <div className="px-4 pt-8">
          <EmptyState
            icon={<AlertCircle size={24} />}
            title="Failed to load data"
            description={error}
          />
          <button
            onClick={() => window.location.reload()}
            className="mx-auto block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
          {/* Today's Focus */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={12} className="opacity-75" />
              <span className="text-xs font-semibold opacity-75 uppercase tracking-wider">Today's Focus</span>
            </div>
            <p className="text-base font-bold leading-snug mb-4">
              Work on your grammar — practice regularly!
            </p>
            <button 
              onClick={onStartPractice} 
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/10 transition-all rounded-xl px-4 py-2.5 text-sm font-semibold backdrop-blur-sm"
            >
              Start Practice <ArrowRight size={14} />
            </button>
          </div>

          {/* Progress Chart */}
          {progressChartData.length > 0 ? (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
                <div className="text-xs text-muted-foreground tabular-nums">
                  Now: <span className="text-blue-600 dark:text-blue-400 font-bold">{animScore || userData?.latest_score || 0}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Last {progressChartData.length} sessions</p>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={progressChartData} margin={{ top: 4, right: 6, bottom: 0, left: -24 }}>
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
          ) : (
            <div className="bg-card border border-border rounded-2xl p-4">
              <EmptyState
                icon={<TrendingUp size={20} />}
                title="No sessions yet"
                description="Start practicing to see your progress chart here."
              />
            </div>
          )}

          {/* Skill Breakdown */}
          {skillsList.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">Skill Breakdown</h3>
              <div className="space-y-3.5">
                {skillsList.map((s) => <SkillBar key={s.label} {...s} />)}
              </div>
            </div>
          )}

          {/* Practice Stats */}
          <div className="flex gap-2">
            <StatMiniCard icon={<Mic size={16} />} value={String(userData?.total_sessions || 0)} label="audios" />
            <StatMiniCard icon={<Clock size={16} />} value={userData && userData.sessions ? `${Math.round((userData.sessions.length * 3.2) / 24 * 10) / 10 || 0}h` : "3.2h"} label="total time" />
            <StatMiniCard icon={<Calendar size={16} />} value={String(userData?.sessions?.length || 12)} label="days active" />
          </div>

          {/* Practice Calendar */}
          {userData && userData.sessions && userData.sessions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <PracticeCalendar sessions={userData.sessions} />
            </div>
          )}

          {/* Common Mistakes */}
          {mistakes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Common Mistakes</h3>
              <div className="space-y-2">
                {mistakes.map((m: any, i: number) => (
                  <MistakeCard key={i} wrong={m.wrong} correct={m.correct} tag={m.type} />
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {vocab.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Words to Level Up</h3>
              <div className="space-y-2">
                {vocab.map((v: any, i: number) => (
                  <VocabCard key={i} original={v.original} better={v.better} />
                ))}
              </div>
            </div>
          )}

          {!loading && mistakes.length === 0 && vocab.length === 0 && skillsList.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="No analysis data yet"
                description="Complete a practice session to get detailed feedback on your speaking."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Screen 2: Admin Login ─────────────────────────────────────────────────────

function AdminLoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
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
                placeholder="admin@speakflow.ai"
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
    { id: "students", label: "Students", icon: <Users size={15} /> },
    { id: "feedback", label: "Feedback Review", icon: <MessageSquare size={15} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={15} /> },
  ];

  const handleSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-none truncate">SpeakFlow</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
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

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-12 left-2 z-30 p-2 rounded-lg bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border shadow-xl animate-in slide-in-from-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 shrink-0 h-screen sticky top-10 bg-card border-r border-border flex-col">
        {sidebarContent}
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-w-0 ${
              activeTab === item.id
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="truncate text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Admin: Overview Tab ───────────────────────────────────────────────────────

function AdminOverview({ onSelectStudent }: { onSelectStudent: (id: number) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, usersData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminUsers(),
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Failed to load admin data", err);
        setError("Failed to load admin data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statsCards = [
    {
      label: "Total Students",
      value: stats?.total_users?.toString() || "0",
      icon: <Users size={17} />,
      colorText: "text-blue-600 dark:text-blue-400",
      colorBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Sessions",
      value: stats?.total_sessions?.toString() || "0",
      icon: <Activity size={17} />,
      colorText: "text-green-600 dark:text-green-400",
      colorBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Analyses Done",
      value: stats?.total_analyses?.toString() || "0",
      icon: <TrendingUp size={17} />,
      colorText: "text-amber-600 dark:text-amber-400",
      colorBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Active Students",
      value: users.length.toString(),
      icon: <AlertCircle size={17} />,
      colorText: "text-red-500 dark:text-red-400",
      colorBg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="flex-1 min-w-0 pb-20 lg:pb-6">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All students at a glance</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 sm:h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-64 sm:h-80 bg-muted rounded-xl" />
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <EmptyState
              icon={<AlertCircle size={24} />}
              title="Could not load data"
              description={error}
            />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {statsCards.map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:shadow-sm transition-shadow">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${s.colorBg} ${s.colorText} flex items-center justify-center mb-2 sm:mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Students Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Students</h2>
                <span className="text-xs text-muted-foreground">{users.length} total</span>
              </div>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["Name", "Level", "Target", "Joined", ""].map((h) => (
                          <th key={h} className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => onSelectStudent(s.id)}
                          className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 sm:px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {s.first_name?.charAt(0) || "?"}
                              </div>
                              <span className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                {s.first_name} {s.last_name || ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-muted text-foreground text-xs font-semibold">
                              {s.english_level || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-3.5 text-muted-foreground text-xs">
                            {s.target_band || "N/A"}
                          </td>
                          <td className="px-4 sm:px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                            {s.created_at ? formatDate(s.created_at) : "N/A"}
                          </td>
                          <td className="px-4 sm:px-5 py-3.5">
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground group-hover:text-foreground">
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={<Users size={20} />}
                    title="No students yet"
                    description="Students will appear here once they start using the bot."
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Admin: Student Detail ─────────────────────────────────────────────────────

function StudentDetail({ studentId, onBack }: { studentId: number; onBack: () => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [sessions, setSessions] = useState<SessionFull[]>([]);
  const [results, setResults] = useState<AnalysisResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, sessionsData, resultsData] = await Promise.all([
          api.getAdminUsers(),
          api.getAdminSessions(),
          api.getAdminResults(),
        ]);
        setUsers(usersData);
        setSessions(sessionsData);
        setResults(resultsData);
      } catch (err) {
        console.error("Failed to load student detail data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  const student = users.find((u) => u.id === studentId);
  const studentSessions = sessions.filter((s) => s.telegram_user_id === studentId);
  const studentResults = results
    .filter((r) => studentSessions.some((s) => s.id === r.session_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const latestResult = studentResults[0];
  const skillScores = latestResult?.analysis_data?.skill_scores;
  const radarData = skillScores
    ? Object.entries(skillScores).map(([skill, score]) => ({ skill, score, fullMark: 100 }))
    : [];

  const progressChartData = studentResults
    .slice()
    .reverse()
    .map((r, i) => ({
      day: `Day ${i + 1}`,
      score: r.analysis_data.overall_score,
    }));

  const recentSessionsFormatted = studentResults.slice(0, 5).map((r) => ({
    date: formatDate(r.created_at),
    mode: r.analysis_data.score_label || "Practice",
    score: r.analysis_data.overall_score,
  }));

  const feedbackItems = studentResults.slice(0, 5).map((r) => ({
    id: r.id,
    student: student ? `${student.first_name} ${student.last_name || ""}`.trim() : "Unknown",
    date: formatDate(r.created_at),
    duration: "—",
    goal: student?.target_band || "General",
    score: r.analysis_data.overall_score,
    summary: r.analysis_data.summary,
    mistakes: r.analysis_data.mistakes.map((m) => m.wrong),
    status: "needs-review" as const,
  }));

  const [reviewStates, setReviewStates] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});

  if (loading) {
    return (
      <div className="flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 pb-24 lg:pb-6">
      <div className="p-4 sm:p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors font-medium"
        >
          <ChevronLeft size={14} /> Back to Overview
        </button>

        {!student ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <EmptyState
              icon={<User size={24} />}
              title="Student not found"
              description="This student could not be found in the database."
            />
          </div>
        ) : (
          <>
            {/* Profile + Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                    {initials(`${student.first_name} ${student.last_name || ""}`)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-foreground text-base truncate">
                      {student.first_name} {student.last_name || ""}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {student.english_level ? `Level ${student.english_level}` : "No level set"}
                      {student.target_band ? ` • Target: ${student.target_band}` : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Joined", value: student.created_at ? formatDate(student.created_at) : "N/A" },
                    { label: "Streak", value: `🔥 ${Math.min(studentSessions.length, 7)} days` },
                    {
                      label: "Score",
                      value: latestResult ? String(latestResult.analysis_data.overall_score) : "N/A",
                      className: latestResult ? scoreColor(latestResult.analysis_data.overall_score) + " font-bold" : "",
                    },
                    { label: "Sessions", value: String(studentSessions.length) },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-xs text-muted-foreground mb-0.5">{row.label}</p>
                      <p className={`text-sm font-semibold text-foreground ${row.className ?? ""}`}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {progressChartData.length > 0 ? "Score Progress" : "No data yet"}
                </h3>
                {progressChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={progressChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={Math.max(1, Math.floor(progressChartData.length / 5))}
                      />
                      <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#2563EB" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[150px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Complete sessions to see progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Radar + Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {radarData.length > 0 ? "Skill Radar" : "Skills"}
                </h3>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
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
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No skill data available</p>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {recentSessionsFormatted.length > 0 ? "Recent Sessions" : "Sessions"}
                </h3>
                {recentSessionsFormatted.length > 0 ? (
                  <div className="space-y-1">
                    {recentSessionsFormatted.map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="text-sm font-medium text-foreground truncate">{session.mode}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{session.date}</p>
                        </div>
                        <span className={`text-sm font-bold tabular-nums shrink-0 ${scoreColor(session.score)}`}>{session.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No sessions yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Cards */}
            {feedbackItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Recent Feedback</h3>
                <div className="space-y-3">
                  {feedbackItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.date}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.duration} • {item.goal}</p>
                        </div>
                        <span className={`text-base font-bold tabular-nums shrink-0 ${scoreColor(item.score)}`}>{item.score}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.summary}</p>
                      {item.mistakes.length > 0 && (
                        <div className="space-y-1.5 mb-4 p-3 bg-muted/50 rounded-lg">
                          {item.mistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-red-500 text-xs font-bold mt-0.5 shrink-0">✗</span>
                              <span className="text-xs text-muted-foreground line-through">{m}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Admin: Feedback Review ────────────────────────────────────────────────────

function FeedbackReview() {
  const [results, setResults] = useState<AnalysisResultData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [sessions, setSessions] = useState<SessionFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [resultsData, usersData, sessionsData] = await Promise.all([
          api.getAdminResults(),
          api.getAdminUsers(),
          api.getAdminSessions(),
        ]);
        setResults(resultsData);
        setUsers(usersData);
        setSessions(sessionsData);
      } catch (err) {
        console.error("Failed to load feedback data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const feedbackItems = results.slice(0, 20).map((r) => {
    const session = sessions.find((s) => s.id === r.session_id);
    const user = session ? users.find((u) => u.id === session.telegram_user_id) : undefined;
    const userName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Unknown";
    const status = statuses[r.id] || "needs-review";

    return {
      id: r.id,
      student: userName,
      date: formatDate(r.created_at),
      goal: user?.target_band || "General",
      score: r.analysis_data.overall_score,
      summary: r.analysis_data.summary,
      status,
    };
  });

  useEffect(() => {
    if (results.length > 0 && Object.keys(statuses).length === 0) {
      setStatuses(Object.fromEntries(results.map((r) => [r.id, "needs-review"])));
    }
  }, [results]);

  const filters = [
    { id: "all", label: "All" },
    { id: "needs-review", label: "Needs Review" },
    { id: "wrong-analysis", label: "Wrong Analysis" },
    { id: "good", label: "Good" },
  ];

  const filtered = feedbackItems.filter((f) =>
    filter === "all" ? true : f.status === filter
  );

  return (
    <div className="flex-1 min-w-0 pb-24 lg:pb-6">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Feedback Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verify AI-generated feedback for accuracy</p>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : feedbackItems.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="No feedback data"
              description="Analysis results will appear here once students complete practice sessions."
            />
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    filter === f.id
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                  {f.id !== "all" && (
                    <span className="ml-1.5 opacity-70">
                      ({feedbackItems.filter((fi) => fi.status === f.id).length})
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
                        <th key={h} className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 sm:px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {initials(item.student)}
                            </div>
                            <span className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                              {item.student}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-4 text-muted-foreground text-xs whitespace-nowrap">{item.date}</td>
                        <td className="px-4 sm:px-5 py-4 text-xs text-muted-foreground">{item.goal}</td>
                        <td className="px-4 sm:px-5 py-4">
                          <span className={`font-bold text-sm tabular-nums ${scoreColor(item.score)}`}>{item.score}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-4 max-w-[200px]">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                            statusBadgeClass(item.status)
                          }`}>
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <button
                            onClick={() => {
                              const next = item.status === "good" ? "needs-review" : item.status === "needs-review" ? "wrong-analysis" : "good";
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
          </>
        )}
      </div>
    </div>
  );
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

// ─── Admin: Analytics placeholder ─────────────────────────────────────────────

function AdminAnalytics() {
  const [results, setResults] = useState<AnalysisResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const resultsData = await api.getAdminResults();
        setResults(resultsData);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregate scores by month
  const monthlyData = results.reduce<Record<string, number[]>>((acc, r) => {
    try {
      const month = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!acc[month]) acc[month] = [];
      acc[month].push(r.analysis_data.overall_score);
    } catch { /* ignore */ }
    return acc;
  }, {});

  const trendData = Object.entries(monthlyData)
    .map(([month, scores]) => ({
      month,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .slice(-6);

  const scoreDistribution = results.reduce<Record<string, number>>((acc, r) => {
    const score = r.analysis_data.overall_score;
    if (score >= 70) acc.high = (acc.high || 0) + 1;
    else if (score >= 50) acc.medium = (acc.medium || 0) + 1;
    else acc.low = (acc.low || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = results.length || 1;
  const riskData = [
    { label: "High (70+)", count: scoreDistribution.high || 0, color: "bg-green-500", pct: Math.round(((scoreDistribution.high || 0) / total) * 100) },
    { label: "Medium (50-69)", count: scoreDistribution.medium || 0, color: "bg-amber-500", pct: Math.round(((scoreDistribution.medium || 0) / total) * 100) },
    { label: "Low (0-49)", count: scoreDistribution.low || 0, color: "bg-red-500", pct: Math.round(((scoreDistribution.low || 0) / total) * 100) },
  ];

  return (
    <div className="flex-1 min-w-0 pb-24 lg:pb-6">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cohort progress and engagement trends</p>
        </div>

        {loading ? (
          <LoadingSkeleton count={2} />
        ) : results.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <EmptyState
              icon={<BarChart2 size={24} />}
              title="No data yet"
              description="Analytics will populate as students complete practice sessions."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {trendData.length > 0 ? "Cohort Score Trend" : "Score Trend"}
              </h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                    <Line type="monotone" dataKey="avg" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Insufficient data for trend</p>
                </div>
              )}
            </div>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Score Distribution</h3>
              {riskData.map((r) => (
                <div key={r.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{r.label}</span>
                    <span className="text-muted-foreground">{r.count} results</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
        <span className="text-xs text-muted-foreground font-semibold mr-1 sm:mr-1.5 shrink-0">SpeakFlow</span>
        {[
          { label: "📱 Dashboard", action: () => { setView("dashboard"); } },
          { label: "🔐 Admin", action: () => { setView("admin-login"); } },
          { label: "🖥 Overview", action: () => { setView("admin"); setAdminTab("overview"); setSelectedStudent(null); } },
          { label: "👤 Student", action: () => { handleSelectStudent(1); } },
          { label: "📋 Feedback", action: () => { setView("admin"); setAdminTab("feedback"); setSelectedStudent(null); } },
        ].map((s) => {
          const isActive =
            (s.label.includes("Dashboard") && view === "dashboard") ||
            (s.label.includes("Admin") && view === "admin-login") ||
            (s.label.includes("Overview") && isAdmin && adminTab === "overview" && view === "admin") ||
            (s.label.includes("Student") && view === "student-detail") ||
            (s.label.includes("Feedback") && isAdmin && adminTab === "feedback");

          return (
            <button
              key={s.label}
              onClick={s.action}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
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
          className="ml-auto p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Content */}
      <div className="pt-10">
        {view === "dashboard" && (
          <div className="max-w-[400px] mx-auto bg-background min-h-screen border-x border-border/50 shadow-sm">
            <DashboardScreen onStartPractice={() => setView("practice")} />
          </div>
        )}

        {view === "practice" && (
          <div className="bg-background min-h-screen">
            <PracticeScreen onBack={() => setView("dashboard")} />
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
            <div className="flex-1 min-w-0">
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
          </div>
        )}
      </div>
    </div>
  );
}