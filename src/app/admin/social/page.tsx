"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Send, Calendar, Image, Video, Link2,
  Edit, Trash2, Eye, Clock, CheckCircle2, TrendingUp,
  Users, Heart, MessageSquare, Share2
} from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", icon: "📘", connected: true, handle: "@NBHAgency", followers: "2.4K" },
  { id: "instagram", name: "Instagram", icon: "📸", connected: true, handle: "@nbh_agency", followers: "5.1K" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", connected: true, handle: "NBH Agency", followers: "1.8K" },
  { id: "tiktok", name: "TikTok", icon: "🎵", connected: false, handle: "@nbh", followers: "—" },
  { id: "youtube", name: "YouTube", icon: "▶️", connected: false, handle: "NBH Agency", followers: "—" },
  { id: "twitter", name: "Twitter/X", icon: "🐦", connected: true, handle: "@NBHAgency", followers: "980" },
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

const analytics = [
  { platform: "Instagram", reach: "12.4K", engagement: "4.2%", followers: "+124", icon: "📸" },
  { platform: "Facebook", reach: "8.9K", engagement: "2.8%", followers: "+45", icon: "📘" },
  { platform: "LinkedIn", reach: "6.2K", engagement: "5.1%", followers: "+89", icon: "💼" },
  { platform: "Twitter/X", reach: "3.1K", engagement: "1.9%", followers: "+12", icon: "🐦" },
];

export default function SocialMediaPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook", "instagram", "linkedin"]);
  const [postContent, setPostContent] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ניהול רשתות חברתיות</h2>
          <p className="text-muted-foreground">
            {connectedCount} פלטפורמות מחוברות · {scheduledPosts.filter(p => p.status === "scheduled").length} פוסטים מתוזמנים
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Calendar className="h-4 w-4" />
                    תזמן
                  </Button>
                  <Button className="flex-1 gap-2" disabled={!postContent || selectedPlatforms.length === 0}>
                    <Send className="h-4 w-4" />
                    פרסם עכשיו ({selectedPlatforms.length})
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
                      <p className="text-xs font-semibold">NBH Agency</p>
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
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                      post.status === "scheduled" ? "bg-blue-50" : "bg-gray-50"
                    }`}>
                      {post.status === "scheduled"
                        ? <Clock className="h-4 w-4 text-blue-600" />
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
                        {post.image && <Badge variant="secondary" className="text-xs">📷 תמונה</Badge>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.scheduledFor}
                        </span>
                        <Badge
                          variant={post.status === "scheduled" ? "info" : "secondary"}
                          className="text-xs"
                        >
                          {post.status === "scheduled" ? "מתוזמן" : "טיוטה"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {analytics.map((a) => (
              <Card key={a.platform}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{a.icon}</span>
                      <p className="font-semibold">{a.platform}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">{a.reach}</p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{a.engagement}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{a.followers}</p>
                      <p className="text-xs text-muted-foreground">עוקבים חדשים</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
