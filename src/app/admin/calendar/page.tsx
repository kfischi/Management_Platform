"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Plus, Video, Image, Type, Sparkles, Clock, X, Loader2
} from "lucide-react";

type PostStatus = "published" | "scheduled" | "draft" | "failed";

interface ScheduledPost {
  id: string;
  scheduled_at: string | null;
  content: string;
  platforms: string[];
  status: PostStatus;
  post_type: "text" | "image" | "video" | "reel";
}

const platformIcons: Record<string, string> = {
  facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦", tiktok: "🎵"
};

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-3 w-3" />,
  image: <Image className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  reel: <span className="text-[10px] font-bold">R</span>,
};

const ALL_PLATFORMS = ["facebook","instagram","linkedin","twitter","tiktok"];
const ALL_TYPES = ["text","image","video","reel"];

const DAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

/* ─── New Post Modal ─── */
function NewPostModal({ selectedDay, currentDate, onClose, onSave }: { selectedDay: number | null; currentDate: Date; onClose: () => void; onSave: (p: ScheduledPost) => void }) {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [postType, setPostType] = useState("text");
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  const scheduledAt = selectedDay
    ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}T${time}:00`
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, platforms, post_type: postType, scheduled_at: scheduledAt, status: scheduledAt ? "scheduled" : "draft" }) });
    if (res.ok) { onSave(await res.json()); onClose(); } else setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">פוסט חדש {selectedDay ? `— ${selectedDay}/${currentDate.getMonth()+1}` : ""}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="תוכן הפוסט..." required />
          <div className="flex flex-wrap gap-2">
            {ALL_PLATFORMS.map(p => (
              <button key={p} type="button" onClick={() => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${platforms.includes(p) ? "bg-primary text-primary-foreground border-primary" : "bg-white border-slate-200 text-slate-600 hover:bg-accent"}`}>
                {platformIcons[p]} {p}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">סוג</label>
              <select value={postType} onChange={e => setPostType(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">שעה</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              צור פוסט
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/calendar?month=${monthKey}`);
      if (res.ok) setPosts(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, [monthKey]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  function getPostsForDay(day: number) {
    return posts.filter(p => {
      if (!p.scheduled_at) return false;
      const d = new Date(p.scheduled_at);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const statusColor: Record<string, string> = {
    published: "bg-green-500", scheduled: "bg-blue-500", draft: "bg-gray-400", failed: "bg-red-500",
  };
  const statusLabel: Record<string, string> = {
    published: "פורסם", scheduled: "מתוזמן", draft: "טיוטה", failed: "נכשל",
  };

  const totalScheduled = posts.filter(p => p.status === "scheduled").length;
  const totalPublished = posts.filter(p => p.status === "published").length;
  const totalDraft     = posts.filter(p => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">לוח תוכן</h2>
          <p className="text-muted-foreground">
            {loading ? "טוען..." : `${totalScheduled} מתוזמנים · ${totalPublished} פורסמו · ${totalDraft} טיוטות`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => setShowNewPost(true)}>
            <Plus className="h-4 w-4" />
            פוסט חדש
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-3 grid-cols-3">
        {[
          { label: "מתוזמנים", value: totalScheduled, color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
          { label: "פורסמו", value: totalPublished, color: "bg-green-100 text-green-800", dot: "bg-green-500" },
          { label: "טיוטות", value: totalDraft, color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 rounded-lg p-3 ${s.color}`}>
            <div className={`h-3 w-3 rounded-full ${s.dot}`} />
            <span className="font-bold text-lg">{s.value}</span>
            <span className="text-sm">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">
                {MONTHS_HE[month]} {year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_HE.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before start */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px]" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayPosts = getPostsForDay(day);
                const isSelected = selectedDay === day;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[80px] rounded-lg p-1.5 cursor-pointer transition-colors border ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isToday
                        ? "border-primary/30 bg-primary/5"
                        : "border-transparent hover:border-border hover:bg-accent/30"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : ""
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map(post => (
                        <div
                          key={post.id}
                          className={`h-1.5 rounded-full ${statusColor[post.status]}`}
                          title={post.content}
                        />
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 pt-3 border-t">
              {Object.entries(statusColor).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  {statusLabel[status as PostStatus]}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Panel */}
        <div className="space-y-4">
          {selectedDay && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {selectedDay} {MONTHS_HE[month]}
                    </CardTitle>
                    <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => setShowNewPost(true)}>
                      <Plus className="h-3 w-3" />
                      הוסף
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedPosts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPosts.map(post => (
                        <div key={post.id} className="rounded-lg border p-3 hover:bg-accent/30 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                              <span className="text-xs text-muted-foreground">{typeIcons[post.post_type]}</span>
                            </div>
                            <Badge
                              className={`text-[10px] h-4 ${
                                post.status === "published" ? "bg-green-100 text-green-800" :
                                post.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-600"
                              } border-0`}
                            >
                              {statusLabel[post.status]}
                            </Badge>
                          </div>
                          <p className="text-xs line-clamp-2">{post.content}</p>
                          <div className="flex gap-1 mt-2">
                            {post.platforms.map(p => (
                              <span key={p} className="text-sm">{platformIcons[p]}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground mb-3">אין פוסטים ביום זה</p>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                        AI מציע פוסט
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Content Suggestions */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1.5 text-purple-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    הצעות AI ליום זה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { emoji: "💡", text: "שתף טיפ מקצועי - engagement גבוה ביום זה" },
                    { emoji: "📊", text: "פרסם case study - LinkedIn ביצועים מצוינים" },
                    { emoji: "🎥", text: "Reel קצר - Instagram algorithm מעדיף עכשיו" },
                  ].map((s, i) => (
                    <button key={i} className="w-full text-right flex gap-2 rounded-md p-2 hover:bg-purple-100 transition-colors text-xs text-purple-800">
                      <span>{s.emoji}</span>
                      <span>{s.text}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">הפוסטים הקרובים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {posts.filter(p => p.status === "scheduled" && p.scheduled_at && new Date(p.scheduled_at) >= today).slice(0, 4).map(post => {
                const d = post.scheduled_at ? new Date(post.scheduled_at) : null;
                return (
                  <div key={post.id} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${statusColor[post.status]}`} />
                    <span className="text-muted-foreground shrink-0">{d ? `${d.getDate()}/${d.getMonth()+1} ${d.toTimeString().slice(0,5)}` : "—"}</span>
                    <span className="truncate">{post.content.slice(0, 30)}...</span>
                    <div className="flex gap-0.5 shrink-0">
                      {post.platforms.map(p => <span key={p} className="text-xs">{platformIcons[p]}</span>)}
                    </div>
                  </div>
                );
              })}
              {posts.filter(p => p.status === "scheduled").length === 0 && (
                <p className="text-xs text-muted-foreground">אין פוסטים מתוזמנים</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showNewPost && (
        <NewPostModal
          selectedDay={selectedDay}
          currentDate={currentDate}
          onClose={() => setShowNewPost(false)}
          onSave={(p) => { setPosts(prev => [...prev, p]); setShowNewPost(false); }}
        />
      )}
    </div>
  );
}
