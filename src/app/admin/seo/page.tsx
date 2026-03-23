"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, XCircle, Loader2, Sparkles, Globe,
  BarChart2, Link2, Clock, Smartphone, Monitor
} from "lucide-react";

interface SEOReport {
  url: string;
  score: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  issues: SEOIssue[];
  keywords: { word: string; density: number; inTitle: boolean; inH1: boolean }[];
  backlinks: number;
  loadTime: number;
  mobileScore: number;
  aiSummary: string;
  recommendations: string[];
}

interface SEOIssue {
  type: "error" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  fix: string;
}

const mockReport: SEOReport = {
  url: "https://example-client.co.il",
  score: 67,
  performance: 72,
  accessibility: 89,
  bestPractices: 81,
  issues: [
    { type: "error", category: "Meta Tags", title: "חסר Meta Description", description: "אין תיאור לעמוד הראשי", impact: "high", fix: 'הוסף <meta name="description" content="..."> עם 150-160 תווים' },
    { type: "error", category: "תמונות", title: "8 תמונות ללא Alt Text", description: "תמונות לא נגישות למנועי חיפוש", impact: "high", fix: "הוסף alt attribute לכל תמונה עם תיאור רלוונטי" },
    { type: "warning", category: "מהירות", title: "LCP גבוה - 4.2 שניות", description: "Largest Contentful Paint איטי מדי (max: 2.5s)", impact: "high", fix: "דחס תמונות, השתמש ב-Next.js Image component, הוסף CDN" },
    { type: "warning", category: "כותרות", title: "H1 כפול", description: "יש שתי תגיות H1 בעמוד", impact: "medium", fix: "השאר H1 אחד בלבד לכל עמוד" },
    { type: "warning", category: "קישורים", title: "12 קישורים שבורים", description: "קישורים פנימיים שמובילים ל-404", impact: "medium", fix: "תקן או הסר את הקישורים הבאים..." },
    { type: "info", category: "Schema", title: "חסר Schema Markup", description: "JSON-LD יכול לשפר rich snippets", impact: "low", fix: "הוסף Organization ו-LocalBusiness schema" },
  ],
  keywords: [
    { word: "עיצוב אתרים", density: 3.2, inTitle: true, inH1: true },
    { word: "פיתוח אתרים", density: 2.8, inTitle: false, inH1: false },
    { word: "Next.js", density: 1.5, inTitle: false, inH1: false },
    { word: "ישראל", density: 1.1, inTitle: false, inH1: false },
  ],
  backlinks: 234,
  loadTime: 4.2,
  mobileScore: 61,
  aiSummary: "האתר מציג ביצועים בינוניים עם 3 בעיות קריטיות שדורשות תיקון מיידי. הבעיה הגדולה ביותר היא מהירות טעינה גבוהה שפוגעת ב-ranking. עם תיקונים ממוקדים ניתן לשפר את ה-score מ-67 ל-85+ תוך שבועיים.",
  recommendations: [
    "תיקון meta description יכול לשפר CTR ב-15-20%",
    "כיווץ תמונות יכול לשפר מהירות ב-40%",
    "תיקון H1 הכפול - שיפור מיידי ב-ranking",
    "הוסף SSL ל-subdomains (כבר יש לדומיין הראשי)",
    "הגדל backlinks ע״י guest posting + local directories",
  ]
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "text-green-600" : score >= 70 ? "text-yellow-600" : score >= 50 ? "text-orange-600" : "text-red-600";
  const ringColor = score >= 90 ? "#22c55e" : score >= 70 ? "#eab308" : score >= 50 ? "#f97316" : "#ef4444";
  const circumference = 2 * Math.PI * 28;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="transform -rotate-90" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="28" fill="none"
            stroke={ringColor} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function SEOPage() {
  const [url, setUrl] = useState("https://example-client.co.il");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SEOReport | null>(mockReport);

  const handleAnalyze = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    setReport(mockReport);
    setLoading(false);
  };

  const issueIcon = { error: <XCircle className="h-4 w-4 text-red-500" />, warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />, info: <CheckCircle2 className="h-4 w-4 text-blue-500" /> };
  const impactColor = { high: "text-red-600 bg-red-50", medium: "text-yellow-600 bg-yellow-50", low: "text-blue-600 bg-blue-50" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            AI SEO Analyzer
          </h2>
          <p className="text-muted-foreground">ניתוח מלא של כל אתר עם המלצות AI</p>
        </div>
        <Badge className="gap-1.5 bg-gradient-to-r from-green-600 to-teal-600 text-white border-0">
          <Sparkles className="h-3 w-3" />
          Powered by AI
        </Badge>
      </div>

      {/* URL Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-md border bg-background px-3">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://client-site.co.il"
                className="border-0 p-0 focus-visible:ring-0 text-sm"
                dir="ltr"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="gap-2 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "מנתח..." : "נתח אתר"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {["nbh.co.il", "fashion-brand.co.il", "techstartup.co.il"].map(site => (
              <button
                key={site}
                onClick={() => setUrl(`https://${site}`)}
                className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
              >
                {site}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="font-medium">AI מנתח את האתר...</p>
            <p className="text-sm text-muted-foreground">בדיקת מהירות, SEO, נגישות, ועוד 47 פרמטרים</p>
          </CardContent>
        </Card>
      )}

      {report && !loading && (
        <>
          {/* Scores */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-full sm:col-span-1 lg:col-span-2">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="transform -rotate-90" width="112" height="112" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="56" cy="56" r="48" fill="none"
                      stroke={report.score >= 80 ? "#22c55e" : report.score >= 60 ? "#eab308" : "#ef4444"}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - report.score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{report.score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg">SEO Score</p>
                  <p className="text-sm text-muted-foreground mb-3">{url}</p>
                  <div className="space-y-1">
                    {[
                      { label: "בעיות קריטיות", value: report.issues.filter(i => i.type === "error").length, color: "text-red-600" },
                      { label: "אזהרות", value: report.issues.filter(i => i.type === "warning").length, color: "text-yellow-600" },
                      { label: "Backlinks", value: report.backlinks, color: "text-blue-600" },
                    ].map(s => (
                      <div key={s.label} className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className={`font-bold ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-4">
                  <ScoreGauge score={report.performance} label="Performance" />
                  <ScoreGauge score={report.accessibility} label="Accessibility" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="text-center rounded-lg bg-muted/50 p-2">
                    <Monitor className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{report.bestPractices}</p>
                    <p className="text-xs text-muted-foreground">Desktop</p>
                  </div>
                  <div className="text-center rounded-lg bg-muted/50 p-2">
                    <Smartphone className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className={`text-lg font-bold ${report.mobileScore < 70 ? "text-red-600" : ""}`}>{report.mobileScore}</p>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                  </div>
                  <div className="col-span-2 text-center rounded-lg bg-muted/50 p-2">
                    <p className={`text-lg font-bold ${report.loadTime > 3 ? "text-red-600" : "text-green-600"}`}>
                      {report.loadTime}s
                    </p>
                    <p className="text-xs text-muted-foreground">Load Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4 flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-1">AI סיכום</p>
                <p className="text-sm text-purple-800">{report.aiSummary}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Issues */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  בעיות שנמצאו ({report.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.issues.map((issue, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      {issueIcon[issue.type]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{issue.title}</span>
                          <Badge variant="secondary" className="text-xs">{issue.category}</Badge>
                          <span className={`text-xs rounded px-1.5 py-0.5 font-medium ${impactColor[issue.impact]}`}>
                            {issue.impact === "high" ? "גבוה" : issue.impact === "medium" ? "בינוני" : "נמוך"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                      </div>
                    </div>
                    <div className="text-xs bg-muted rounded p-2 font-mono text-muted-foreground">
                      💡 {issue.fix}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Keywords + Recommendations */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    ניתוח מילות מפתח
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.keywords.map((kw, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{kw.word}</span>
                            {kw.inTitle && <span className="text-xs bg-blue-100 text-blue-700 rounded px-1">Title</span>}
                            {kw.inH1 && <span className="text-xs bg-green-100 text-green-700 rounded px-1">H1</span>}
                          </div>
                          <div className="h-1.5 rounded-full bg-muted mt-1">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(kw.density * 15, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{kw.density}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    המלצות AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 text-sm p-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  📄 הורד דוח PDF
                </Button>
                <Button className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  שלח ללקוח
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
