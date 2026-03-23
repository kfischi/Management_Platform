"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Send, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";

const mockTickets = [
  { id: "t1", subject: "עדכון תמונת ראשי", status: "resolved", date: "לפני שבוע", priority: "רגיל" },
  { id: "t2", subject: "הוספת עמוד 'אודות'", status: "in_progress", date: "לפני 2 ימים", priority: "רגיל" },
  { id: "t3", subject: "בעיה בטופס יצירת קשר", status: "open", date: "לפני יום", priority: "דחוף" },
];

export default function ClientSupportPage() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" }> = {
    resolved: { label: "נפתר ✓", variant: "success" },
    in_progress: { label: "בטיפול", variant: "warning" },
    open: { label: "פתוח", variant: "info" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תמיכה</h2>
          <p className="text-muted-foreground">WMA Agency כאן לעזור לך</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewTicket(!showNewTicket)}>
          <Plus className="h-4 w-4" />
          פנייה חדשה
        </Button>
      </div>

      {/* Contact Options */}
      <div className="grid gap-3 sm:grid-cols-3">
        <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 hover:border-green-400">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="font-semibold text-sm">WhatsApp</p>
              <p className="text-xs text-muted-foreground">מענה מהיר תוך דקות</p>
              <Badge variant="success" className="mt-2 text-xs">פעיל עכשיו</Badge>
            </CardContent>
          </Card>
        </a>
        <a href="mailto:support@wma.co.il">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">📧</div>
              <p className="font-semibold text-sm">אימייל</p>
              <p className="text-xs text-muted-foreground">support@wma.co.il</p>
              <Badge variant="info" className="mt-2 text-xs">תגובה תוך 24 שעות</Badge>
            </CardContent>
          </Card>
        </a>
        <a href="tel:+972501234567">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold text-sm">שיחה</p>
              <p className="text-xs text-muted-foreground">050-1234567</p>
              <Badge variant="secondary" className="mt-2 text-xs">א׳-ה׳ 09:00-18:00</Badge>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">פנייה חדשה</CardTitle>
            <CardDescription>תאר את הבעיה ואנו נחזור אליך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              placeholder="נושא הפנייה"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option>בקשת שינוי תוכן</option>
              <option>בעיה טכנית</option>
              <option>עדכון עיצוב</option>
              <option>הוספת עמוד</option>
              <option>אחר</option>
            </select>
            <textarea
              placeholder="תאר את הבקשה או הבעיה בפירוט..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewTicket(false)}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!subject || !message}
              >
                <Send className="h-4 w-4" />
                שלח פנייה
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            פניות קודמות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockTickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              return (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {ticket.status === "resolved" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : ticket.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-yellow-500 shrink-0 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{ticket.subject}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ticket.date}</span>
                        {ticket.priority === "דחוף" && (
                          <Badge variant="destructive" className="text-xs">דחוף</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="text-xs shrink-0">{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
