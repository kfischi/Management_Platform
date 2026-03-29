"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Send, Calendar, Image, Video, Link2,
  Edit, Trash2, Eye, Clock, CheckCircle2, TrendingUp,
  Heart, MessageSquare, Share2, Loader2
} from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", icon: "📘", connected: true, handle: "@WMAAgency", followers: "2.4K" },
  { id: "instagram", name: "Instagram", icon: "📸", connected: true, handle: "@nbh_agency", followers: "5.1K" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", connected: true, handle: "WMA Agency", followers: "1.8K" },
  { id: "tiktok", name: "TikTok", icon: "🎵", connected: false, handle: "@nbh", followers: "—" },
  { id: "youtube", name: "YouTube", icon: "▶️", connected: false, handle: "WMA Agency", followers: "—" },
  { id: "twitter", name: "Twitter/X", icon: "🐦", connected: true, handle: "@WMAAgency", followers: "980" },
];

const scheduledPosts = [
  {
    id: "p1",
    content: "🚀 השקנו פלטפורמת ניהול חדשה! כל מה שצריך לנהל סוכנות דיגיטלית - במקום אחד.",
    platforms: ["facebook", "instagram", "linkedin"],
    scheduledFor: "היום 18:00",
    status: "scheduled",
    image: true,
  },
  {
    id: "p2",
    content: "💡 טיפ של היום: כיצד לשפר את ה-SEO של האתר שלך ב-3 צעדים פשוטים",
    platforms: ["linkedin", "twitter"],
    scheduledFor: "מחר 09:00",
    status: "scheduled",
    image: false,
  },
  {
    id: "p3",
    content: "🎉 לקוח חדש הצטרף! ברוכים הבאים לחברת XYZ",
    platforms: ["facebook", "instagram"],
    scheduledFor: "23.3.2026 12:00",
    status: "draft",
    image: true,
  },
];

const platformIcons: Record<string, string> = {
  facebook: "📘", instagram: "📸", linkedin: "💼",
  tiktok: "🎵", youtube: "▶️", twitter: "🐦"
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", facebook: "📘", linkedin: "💼", twitter: "🐦",
};
const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", twitter: "Twitter/X",
};

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  post_type: string;
  status: string;
  scheduled_at: string | null;
  image_url: string | null;
  created_at: string;
}

interface AnalyticsPlatform {
  platform: string;
  totalPosts: number;
  published: number;
  scheduled: number;
  drafts: number;
  thisMonth: number;
  reach: string;
  engagement: string;
  followers: string;
}

interface AnalyticsData {
  platforms: AnalyticsPlatform[];
  summary: { total: number; published: number; scheduled: number; drafts: number; thisMonth: number };
}

export default function SocialMediaPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook", "instagram", "linkedin"]);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/social")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPosts(data); })
      .finally(() => setLoadingPosts(false));

    fetch("/api/admin/social/analytics")
      .then(r => r.json())
      .then(data => { if (data.platforms) setAnalyticsData(data); })
      .catch(() => {});
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  async function savePost(status: "draft" | "scheduled" | "published") {
    if (!postContent.trim() || selectedPlatforms.length === 0) return;
    setSaving(true);
    const res = await fetch("/api/admin/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: postContent,
        platforms: selectedPlatforms,
        status,
        scheduled_at: scheduleDate ? new Date(scheduleDate).toISOString() : null,
      }),
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setPostContent("");
      setScheduleDate("");
    }
    setSaving(false);
  }

  async function deletePost(id: string) {
    await fetch(`/api/admin/social/${id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  const connectedCount = platforms.filter(p => p.connected).length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ניהול רשתות חברתיות</h2>
          <p className="text-muted-foreground">
            {connectedCount} פלטפורמות מחוברות · {scheduledCount} פוסטים מתוזמנים
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          פוסט חדש
        </Button>
      </div>

      {/* Platforms Connection Status */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              platform.connected ? "border-green-200" : "border-dashed opacity-60"
            }`}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{platform.icon}</div>
              <p className="font-medium text-xs">{platform.name}</p>
              {platform.connected ? (
                <>
                  <p className="text-xs text-muted-foreground truncate">{platform.handle}</p>
                  <p className="text-xs font-semibold text-green-600">{platform.followers}</p>
                  <Badge variant="success" className="text-[10px] mt-1">מחובר</Badge>
                </>
              ) : (
                <Button size="sm" variant="outline" className="text-xs mt-1 h-6 w-full">
                  חבר
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="compose">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="compose">✍️ כתוב פוסט</TabsTrigger>
          <TabsTrigger value="scheduled">📅 מתוזמנים</TabsTrigger>
          <TabsTrigger value="analytics">📊 אנליטיקס</TabsTrigger>
        </TabsList>

        {/* Compose */}
        <TabsContent value="compose" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">כתוב פוסט חדש</CardTitle>
                <CardDescription>פרסם בכל הפלטפורמות שבחרת בלחיצה אחת</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selector */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">פרסם ב:</p>
                  <div className="flex flex-wrap gap-2">
                    {platforms.filter(p => p.connected).map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors border ${
                          selectedPlatforms.includes(platform.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-accent"
                        }`}
                      >
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="מה אתה רוצה לשתף היום? ✨"
                  rows={5}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{postContent.length} תווים</span>
                  <span className="flex items-center gap-1">
                    <span>LinkedIn:</span>
                    <span className={postContent.length > 3000 ? "text-red-500" : "text-green-600"}>
                      {3000 - postContent.length} נותרו
                    </span>
                  </span>
                </div>

                {/* Media */}
                <div className="flex gap-2 border-t pt-3">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Image className="h-3.5 w-3.5" />
                    תמונה
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Video className="h-3.5 w-3.5" />
                    וידאו
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link2 className="h-3.5 w-3.5" />
                    קישור
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    ✨ AI כתיבה
                  </Button>
                </div>

                {/* Schedule date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="flex-1 rounded-lg border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    disabled={!postContent.trim() || !scheduleDate || saving}
                    onClick={() => savePost("scheduled")}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                    תזמן
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={!postContent.trim() || selectedPlatforms.length === 0 || saving}
                    onClick={() => savePost("published")}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    פרסם עכשיו ({selectedPlatforms.length})
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    disabled={!postContent.trim() || saving}
                    onClick={() => savePost("draft")}
                  >
                    שמור טיוטה
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">תצוגה מקדימה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">N</div>
                    <div>
                      <p className="text-xs font-semibold">WMA Agency</p>
                      <p className="text-xs text-muted-foreground">עכשיו</p>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {postContent || <span className="text-muted-foreground italic text-xs">הטקסט שלך יופיע כאן...</span>}
                  </p>
                  {postContent && (
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> 0</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 0</span>
                      <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> 0</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">יפורסם ב:</p>
                  {selectedPlatforms.map(id => {
                    const p = platforms.find(pl => pl.id === id);
                    return p ? (
                      <div key={id} className="flex items-center gap-1.5 text-xs">
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-auto" />
                      </div>
                    ) : null;
                  })}
                  {selectedPlatforms.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">לא נבחרו פלטפורמות</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduled */}
        <TabsContent value="scheduled" className="mt-4">
          {loadingPosts ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">אין פוסטים עדיין — צור פוסט ראשון!</div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                        post.status === "scheduled" ? "bg-blue-50" : post.status === "published" ? "bg-green-50" : "bg-gray-50"
                      }`}>
                        {post.status === "scheduled"
                          ? <Clock className="h-4 w-4 text-blue-600" />
                          : post.status === "published"
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <Edit className="h-4 w-4 text-gray-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex gap-1">
                            {post.platforms.map(id => (
                              <span key={id} className="text-base">{platformIcons[id]}</span>
                            ))}
                          </div>
                          {post.scheduled_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.scheduled_at).toLocaleString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                          <Badge
                            variant={post.status === "scheduled" ? "info" : post.status === "published" ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {post.status === "scheduled" ? "מתוזמן" : post.status === "published" ? "פורסם" : "טיוטה"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => deletePost(post.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          {analyticsData && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
              {[
                { label: "סה״כ פוסטים", value: analyticsData.summary.total },
                { label: "פורסמו", value: analyticsData.summary.published },
                { label: "מתוזמנים", value: analyticsData.summary.scheduled },
                { label: "טיוטות", value: analyticsData.summary.drafts },
                { label: "החודש", value: analyticsData.summary.thisMonth },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {(analyticsData?.platforms ?? []).map((a) => (
              <Card key={a.platform}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLATFORM_ICONS[a.platform] ?? "📱"}</span>
                      <p className="font-semibold">{PLATFORM_NAMES[a.platform] ?? a.platform}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">{a.totalPosts}</p>
                      <p className="text-xs text-muted-foreground">פוסטים</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{a.published}</p>
                      <p className="text-xs text-muted-foreground">פורסמו</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{a.thisMonth}</p>
                      <p className="text-xs text-muted-foreground">החודש</p>
                    </div>
                  </div>
                  {a.reach === "—" && (
                    <p className="text-xs text-muted-foreground text-center mt-3 border-t pt-2">
                      חבר חשבון {PLATFORM_NAMES[a.platform]} לקבלת מדדי Reach ו-Engagement
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
