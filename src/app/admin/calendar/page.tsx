"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Plus, Facebook, Instagram,
  Linkedin, Twitter, Video, Image, Type, Sparkles, Clock
} from "lucide-react";

type PostStatus = "published" | "scheduled" | "draft";

interface ScheduledPost {
  id: string;
  date: number;
  time: string;
  content: string;
  platforms: string[];
  status: PostStatus;
  type: "text" | "image" | "video" | "reel";
  image?: string;
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-600",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  linkedin: "bg-blue-700",
  twitter: "bg-sky-500",
  tiktok: "bg-black",
};

const platformIcons: Record<string, string> = {
  facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦", tiktok: "🎵"
};

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-3 w-3" />,
  image: <Image className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  reel: <span className="text-[10px] font-bold">R</span>,
};

// Mock posts for March 2026
const mockPosts: ScheduledPost[] = [
  { id: "p1", date: 23, time: "09:00", content: "🚀 השקנו פלטפורמה חדשה!", platforms: ["facebook", "instagram", "linkedin"], status: "scheduled", type: "image" },
  { id: "p2", date: 23, time: "18:00", content: "טיפ של היום: כיצד לשפר את ה-SEO", platforms: ["linkedin", "twitter"], status: "scheduled", type: "text" },
  { id: "p3", date: 24, time: "12:00", content: "✨ Case Study - לקוח חדש!", platforms: ["instagram"], status: "draft", type: "reel" },
  { id: "p4", date: 25, time: "09:00", content: "מה זה Next.js ולמה כולם מדברים עליו?", platforms: ["linkedin", "facebook"], status: "scheduled", type: "text" },
  { id: "p5", date: 26, time: "17:00", content: "Behind the scenes 🎬", platforms: ["instagram", "tiktok"], status: "scheduled", type: "video" },
  { id: "p6", date: 27, time: "10:00", content: "שבת שלום! 🌟 הפוסט השבועי שלנו", platforms: ["facebook", "instagram"], status: "published", type: "image" },
  { id: "p7", date: 28, time: "09:00", content: "5 כלים שכל בעל עסק חייב להכיר", platforms: ["linkedin", "facebook", "twitter"], status: "draft", type: "text" },
  { id: "p8", date: 30, time: "11:00", content: "חודש חדש - מטרות חדשות! 🎯", platforms: ["instagram", "linkedin", "facebook"], status: "draft", type: "image" },
];

const DAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(23);
  const [view, setView] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => mockPosts.filter(p => p.date === day);

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const statusColor: Record<PostStatus, string> = {
    published: "bg-green-500",
    scheduled: "bg-blue-500",
    draft: "bg-gray-400",
  };

  const statusLabel: Record<PostStatus, string> = {
    published: "פורסם",
    scheduled: "מתוזמן",
    draft: "טיוטה",
  };

  const totalScheduled = mockPosts.filter(p => p.status === "scheduled").length;
  const totalPublished = mockPosts.filter(p => p.status === "published").length;
  const totalDraft = mockPosts.filter(p => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">לוח תוכן</h2>
          <p className="text-muted-foreground">
            {totalScheduled} מתוזמנים · {totalPublished} פורסמו · {totalDraft} טיוטות
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "month" ? "week" : "month")}>
            {view === "month" ? "שבועי" : "חודשי"}
          </Button>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI מלא את הלוח
          </Button>
          <Button variant="outline" className="gap-2">
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
                const isToday = day === 23; // March 23 2026 = today

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
                    <Button size="sm" className="gap-1 h-7 text-xs">
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
                              <span className="text-xs font-medium">{post.time}</span>
                              <span className="text-xs text-muted-foreground">{typeIcons[post.type]}</span>
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
              {mockPosts
                .filter(p => p.date >= 23 && p.status === "scheduled")
                .slice(0, 4)
                .map(post => (
                  <div key={post.id} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${statusColor[post.status]}`} />
                    <span className="text-muted-foreground shrink-0">{post.date}/3 {post.time}</span>
                    <span className="truncate">{post.content.slice(0, 30)}...</span>
                    <div className="flex gap-0.5 shrink-0">
                      {post.platforms.map(p => (
                        <span key={p} className="text-xs">{platformIcons[p]}</span>
                      ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
