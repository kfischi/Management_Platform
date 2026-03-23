"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe, Shield, AlertTriangle, CheckCircle2,
  Clock, Bell, Plus, ExternalLink, RefreshCw, X, Zap
} from "lucide-react";

interface DomainRecord {
  id: string;
  domain: string;
  client: string;
  registrar: string;
  expiresAt: string;
  daysUntilExpiry: number;
  sslExpiresAt: string;
  sslDaysLeft: number;
  sslIssuer: string;
  status: "healthy" | "expiring" | "critical" | "expired";
  sslStatus: "valid" | "expiring" | "expired" | "invalid";
  dns: { type: string; name: string; value: string; ttl: number }[];
  uptime: number;
  responseTime: number;
}

const domains: DomainRecord[] = [
  {
    id: "d1", domain: "wma.co.il", client: "WMA Agency (אנחנו)",
    registrar: "Namecheap", expiresAt: "2027-03-15", daysUntilExpiry: 357,
    sslExpiresAt: "2026-06-22", sslDaysLeft: 91, sslIssuer: "Let's Encrypt",
    status: "healthy", sslStatus: "valid",
    dns: [
      { type: "A", name: "@", value: "76.76.21.21", ttl: 300 },
      { type: "CNAME", name: "www", value: "wma.co.il", ttl: 300 },
      { type: "MX", name: "@", value: "aspmx.l.google.com", ttl: 3600 },
    ],
    uptime: 99.98, responseTime: 245
  },
  {
    id: "d2", domain: "fashion-brand.co.il", client: "Fashion Brand",
    registrar: "GoDaddy", expiresAt: "2026-04-02", daysUntilExpiry: 10,
    sslExpiresAt: "2026-04-05", sslDaysLeft: 13, sslIssuer: "Let's Encrypt",
    status: "critical", sslStatus: "expiring",
    dns: [
      { type: "A", name: "@", value: "104.18.28.100", ttl: 300 },
      { type: "CNAME", name: "www", value: "fashion-brand.netlify.app", ttl: 300 },
    ],
    uptime: 99.95, responseTime: 312
  },
  {
    id: "d3", domain: "techstartup.co.il", client: "TechStartup IL",
    registrar: "Namecheap", expiresAt: "2026-09-18", daysUntilExpiry: 179,
    sslExpiresAt: "2026-08-01", sslDaysLeft: 130, sslIssuer: "Cloudflare",
    status: "healthy", sslStatus: "valid",
    dns: [
      { type: "A", name: "@", value: "172.67.74.41", ttl: 300 },
    ],
    uptime: 100, responseTime: 189
  },
  {
    id: "d4", domain: "law-firm.co.il", client: "Law Firm",
    registrar: "Wix", expiresAt: "2026-03-28", daysUntilExpiry: 5,
    sslExpiresAt: "2026-03-25", sslDaysLeft: 2, sslIssuer: "Let's Encrypt",
    status: "critical", sslStatus: "expiring",
    dns: [
      { type: "A", name: "@", value: "185.199.108.153", ttl: 3600 },
    ],
    uptime: 98.2, responseTime: 890
  },
  {
    id: "d5", domain: "restaurant-chain.co.il", client: "Restaurant Chain",
    registrar: "Namecheap", expiresAt: "2027-01-10", daysUntilExpiry: 293,
    sslExpiresAt: "2026-10-15", sslDaysLeft: 206, sslIssuer: "Let's Encrypt",
    status: "healthy", sslStatus: "valid",
    dns: [
      { type: "A", name: "@", value: "76.76.21.21", ttl: 300 },
      { type: "TXT", name: "@", value: "v=spf1 include:sendgrid.net ~all", ttl: 3600 },
    ],
    uptime: 99.99, responseTime: 203
  },
  {
    id: "d6", domain: "old-client-expired.com", client: "לקוח ישן",
    registrar: "GoDaddy", expiresAt: "2026-03-01", daysUntilExpiry: -22,
    sslExpiresAt: "2026-03-01", sslDaysLeft: -22, sslIssuer: "Let's Encrypt",
    status: "expired", sslStatus: "expired",
    dns: [],
    uptime: 0, responseTime: 0
  },
];

const statusConfig = {
  healthy: { label: "תקין", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
  expiring: { label: "יפוג בקרוב", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500", icon: Clock },
  critical: { label: "דחוף!", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", icon: AlertTriangle },
  expired: { label: "פג תוקף", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", icon: X },
};

export default function DomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(domains[1]);

  const criticalDomains = domains.filter(d => d.status === "critical" || d.daysUntilExpiry < 30);
  const healthyCount = domains.filter(d => d.status === "healthy").length;
  const expiredCount = domains.filter(d => d.status === "expired").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            ניהול דומיינים & SSL
          </h2>
          <p className="text-muted-foreground">
            {domains.length} דומיינים · {healthyCount} תקינים · {criticalDomains.length} דורשים טיפול
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענן הכל
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            הוסף דומיין
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalDomains.length > 0 && (
        <Card className="border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-800 mb-1">⚠️ {criticalDomains.length} דומיינים דורשים טיפול מיידי!</p>
                <div className="space-y-1">
                  {criticalDomains.map(d => (
                    <p key={d.id} className="text-sm text-red-700">
                      <span className="font-medium">{d.domain}</span>
                      {" — "}
                      {d.daysUntilExpiry <= 0
                        ? `פג תוקף לפני ${Math.abs(d.daysUntilExpiry)} ימים!`
                        : `יפוג תוך ${d.daysUntilExpiry} ימים`
                      }
                      {d.sslDaysLeft <= 14 && ` · SSL יפוג תוך ${d.sslDaysLeft} ימים`}
                    </p>
                  ))}
                </div>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-1 shrink-0">
                <Zap className="h-3.5 w-3.5" />
                שלח התראות
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "תקינים", value: healthyCount, color: "text-green-600", bg: "bg-green-50" },
          { label: "מתפוגגים", value: domains.filter(d => d.status === "critical").length, color: "text-red-600", bg: "bg-red-50" },
          { label: "SSL תקף", value: domains.filter(d => d.sslStatus === "valid").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "ממוצע Uptime", value: `${(domains.filter(d => d.uptime > 0).reduce((s, d) => s + d.uptime, 0) / domains.filter(d => d.uptime > 0).length).toFixed(1)}%`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Domain List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {domains.map(domain => {
                const config = statusConfig[domain.status];
                const Icon = config.icon;
                const isSelected = selectedDomain?.id === domain.id;

                return (
                  <div
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-accent/30 ${isSelected ? "bg-accent/50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                        <span className="font-semibold">{domain.domain}</span>
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${config.bg} ${config.color} border-0`}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground block">{domain.client}</span>
                        <span>{domain.registrar}</span>
                      </div>
                      <div>
                        <div className={`flex items-center gap-1 ${domain.daysUntilExpiry < 30 ? "text-red-600 font-semibold" : ""}`}>
                          <Globe className="h-3 w-3" />
                          {domain.daysUntilExpiry <= 0
                            ? `פג לפני ${Math.abs(domain.daysUntilExpiry)} ימים`
                            : `${domain.daysUntilExpiry} ימים`
                          }
                        </div>
                        <span>דומיין</span>
                      </div>
                      <div>
                        <div className={`flex items-center gap-1 ${domain.sslDaysLeft < 30 ? "text-red-600 font-semibold" : ""}`}>
                          <Shield className="h-3 w-3" />
                          {domain.sslDaysLeft <= 0 ? "פג!" : `${domain.sslDaysLeft} ימים`}
                        </div>
                        <span>SSL</span>
                      </div>
                      {domain.uptime > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {domain.uptime}%
                          </div>
                          <span>{domain.responseTime}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Domain Detail */}
        {selectedDomain && (
          <div className="space-y-4">
            <Card className={`border-2 ${statusConfig[selectedDomain.status].border}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedDomain.domain}</CardTitle>
                  <Badge className={`${statusConfig[selectedDomain.status].bg} ${statusConfig[selectedDomain.status].color} border-0`}>
                    {statusConfig[selectedDomain.status].label}
                  </Badge>
                </div>
                <CardDescription>{selectedDomain.client} · {selectedDomain.registrar}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Domain Expiry */}
                <div className={`rounded-lg p-3 ${selectedDomain.daysUntilExpiry < 30 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium text-sm">תוקף דומיין</span>
                  </div>
                  <p className={`text-lg font-bold ${selectedDomain.daysUntilExpiry < 30 ? "text-red-700" : "text-green-700"}`}>
                    {selectedDomain.expiresAt}
                    {" "}
                    ({selectedDomain.daysUntilExpiry > 0
                      ? `נותרו ${selectedDomain.daysUntilExpiry} ימים`
                      : `פג לפני ${Math.abs(selectedDomain.daysUntilExpiry)} ימים`
                    })
                  </p>
                  {selectedDomain.daysUntilExpiry < 30 && (
                    <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-xs">
                      חדש עכשיו ב-{selectedDomain.registrar}
                    </Button>
                  )}
                </div>

                {/* SSL */}
                <div className={`rounded-lg p-3 ${selectedDomain.sslDaysLeft < 30 ? "bg-orange-50 border border-orange-200" : "bg-blue-50 border border-blue-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium text-sm">תעודת SSL</span>
                    <span className="text-xs text-muted-foreground">({selectedDomain.sslIssuer})</span>
                  </div>
                  <p className={`font-semibold ${selectedDomain.sslDaysLeft < 30 ? "text-orange-700" : "text-blue-700"}`}>
                    {selectedDomain.sslExpiresAt} ({selectedDomain.sslDaysLeft} ימים)
                  </p>
                  {selectedDomain.sslDaysLeft < 30 && (
                    <Button size="sm" variant="outline" className="mt-2 text-xs">
                      חדש SSL (Let's Encrypt)
                    </Button>
                  )}
                </div>

                {/* Performance */}
                {selectedDomain.uptime > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold text-green-600">{selectedDomain.uptime}%</p>
                      <p className="text-xs text-muted-foreground">Uptime 30 יום</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold">{selectedDomain.responseTime}ms</p>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                    </div>
                  </div>
                )}

                {/* DNS Records */}
                {selectedDomain.dns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">DNS Records</p>
                    <div className="space-y-1">
                      {selectedDomain.dns.map((record, i) => (
                        <div key={i} className="font-mono text-xs p-1.5 rounded bg-muted/50 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] shrink-0">{record.type}</Badge>
                          <span className="text-muted-foreground">{record.name}</span>
                          <span className="truncate">{record.value}</span>
                          <span className="text-muted-foreground shrink-0">{record.ttl}s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                    <Bell className="h-3 w-3" />
                    הגדר התראה
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                    <RefreshCw className="h-3 w-3" />
                    בדוק עכשיו
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monitor Settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  הגדרות ניטור
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { label: "התרא 30 יום לפני פקיעה", enabled: true },
                  { label: "בדיקת uptime כל דקה", enabled: true },
                  { label: "התראה ב-WhatsApp", enabled: true },
                  { label: "התראה ב-Email", enabled: true },
                  { label: "חידוש SSL אוטומטי", enabled: false },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1">
                    <span className="text-sm">{s.label}</span>
                    <div className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${s.enabled ? "bg-green-500" : "bg-gray-300"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${s.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
