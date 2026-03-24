"use client";

import * as React from "react";
import {
  X, Play, Save, ZoomIn, ZoomOut, Maximize2, Trash2,
  ChevronDown, ChevronRight, Settings2, Plus, AlertCircle,
  CheckCircle2, Clock, Loader2,
} from "lucide-react";
import {
  ALL_NODES, NODES_BY_TYPE, CATEGORY_META,
  type NodeTypeDef, type ConfigField, type NodeCategory,
} from "@/app/admin/automations/node-definitions";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export interface WFNode {
  id: string;
  type: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
  label?: string;
}

export interface WFEdge {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
}

export interface WorkflowData {
  nodes: WFNode[];
  edges: WFEdge[];
}

interface WorkflowCanvasProps {
  initialData?: WorkflowData;
  onSave?: (data: WorkflowData) => Promise<void>;
  onRun?: (data: WorkflowData) => Promise<void>;
  readOnly?: boolean;
}

/* ─────────────────────────────────────────────
   Node Palette (left sidebar)
───────────────────────────────────────────── */

const CATEGORIES: NodeCategory[] = ["trigger", "action", "ai", "logic"];

function NodePalette({ onDragStart }: { onDragStart: (type: string) => void }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    trigger: true, action: true, ai: true, logic: false,
  });

  return (
    <div className="w-56 shrink-0 border-r bg-slate-950 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">צמתים</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const nodes = ALL_NODES.filter((n) => n.category === cat);
          const isOpen = open[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => setOpen((p) => ({ ...p, [cat]: !p[cat] }))}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <span>{meta.label}</span>
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              {isOpen && (
                <div className="space-y-0.5 pb-1">
                  {nodes.map((node) => (
                    <PaletteItem key={node.type} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaletteItem({ node, onDragStart }: { node: NodeTypeDef; onDragStart: (type: string) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(node.type)}
      className="mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors group"
    >
      <span className="text-base leading-none">{node.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-300 group-hover:text-white truncate">{node.label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Config Panel (right sidebar)
───────────────────────────────────────────── */

function ConfigPanel({
  node,
  typeDef,
  onChange,
  onClose,
  onDelete,
}: {
  node: WFNode;
  typeDef: NodeTypeDef;
  onChange: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = React.useState<Record<string, unknown>>(node.config);

  function update(key: string, value: unknown) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="w-72 shrink-0 border-l bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeDef.icon}</span>
          <div>
            <p className="text-sm font-semibold text-white">{typeDef.label}</p>
            <p className="text-xs text-slate-400">{typeDef.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {typeDef.configFields.map((field) => (
          <ConfigFieldInput
            key={field.key}
            field={field}
            value={local[field.key] ?? field.default ?? ""}
            onChange={(v) => update(field.key, v)}
          />
        ))}

        {typeDef.configFields.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">אין הגדרות לצומת זה</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-800 px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          מחק צומת
        </button>
      </div>
    </div>
  );
}

function ConfigFieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const strVal = String(value ?? "");

  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === "toggle" ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onChange(!value)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              value ? "bg-indigo-600" : "bg-slate-700"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              value ? "translate-x-4" : "translate-x-0.5"
            )} />
          </div>
          <span className="text-xs text-slate-400">{value ? "מופעל" : "כבוי"}</span>
        </label>
      ) : field.type === "textarea" || field.type === "template" || field.type === "code" ? (
        <textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === "code" ? 4 : 3}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none font-mono"
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          value={strVal}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
      )}
      {field.hint && <p className="mt-1 text-xs text-slate-500">{field.hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Canvas Node Card
───────────────────────────────────────────── */

const NODE_W = 200;
const NODE_H = 72;

interface CanvasNodeProps {
  node: WFNode;
  typeDef: NodeTypeDef;
  selected: boolean;
  onClick: () => void;
  onDragMove: (x: number, y: number) => void;
  onPortMouseDown: (nodeId: string, portId: string, side: "output" | "input", x: number, y: number) => void;
}

function CanvasNode({ node, typeDef, selected, onClick, onDragMove, onPortMouseDown }: CanvasNodeProps) {
  const dragStart = React.useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-port]")) return;
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: node.x, ny: node.y };

    function onMove(me: MouseEvent) {
      if (!dragStart.current) return;
      onDragMove(
        dragStart.current.nx + me.clientX - dragStart.current.mx,
        dragStart.current.ny + me.clientY - dragStart.current.my,
      );
    }
    function onUp() {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="cursor-pointer select-none"
    >
      {/* Shadow */}
      <rect x={2} y={4} width={NODE_W} height={NODE_H} rx={10} fill="rgba(0,0,0,0.4)" />

      {/* Body */}
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={10}
        fill={selected ? "#1e1b4b" : "#1e293b"}
        stroke={selected ? "#6366f1" : "#334155"}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Header bar */}
      <rect
        width={NODE_W}
        height={28}
        rx={10}
        fill="url(#nodeHeaderGrad)"
        className={typeDef.color}
      />
      <rect width={NODE_W} height={6} y={22} fill="url(#nodeHeaderGrad)" />

      {/* Icon + label */}
      <text x={10} y={18} fontSize={13} dominantBaseline="middle">{typeDef.icon}</text>
      <text
        x={28}
        y={14}
        fontSize={11}
        fontWeight="600"
        fill="white"
        dominantBaseline="middle"
      >
        {(node.label ?? typeDef.label).slice(0, 20)}
      </text>

      {/* Description */}
      <text x={10} y={50} fontSize={9} fill="#94a3b8" dominantBaseline="middle">
        {typeDef.description.slice(0, 32)}
      </text>

      {/* Input ports */}
      {typeDef.inputs.map((port, i) => {
        const px = 0;
        const py = NODE_H / 2 + (i - (typeDef.inputs.length - 1) / 2) * 16;
        return (
          <g key={port.id} data-port="input">
            <circle
              cx={px}
              cy={py}
              r={5}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth={1.5}
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortMouseDown(node.id, port.id, "input", node.x + px, node.y + py);
              }}
              className="cursor-crosshair hover:stroke-indigo-400"
            />
          </g>
        );
      })}

      {/* Output ports */}
      {typeDef.outputs.map((port, i) => {
        const px = NODE_W;
        const py = NODE_H / 2 + (i - (typeDef.outputs.length - 1) / 2) * 16;
        return (
          <g key={port.id} data-port="output">
            <circle
              cx={px}
              cy={py}
              r={5}
              fill="#6366f1"
              stroke="#818cf8"
              strokeWidth={1.5}
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortMouseDown(node.id, port.id, "output", node.x + px, node.y + py);
              }}
              className="cursor-crosshair hover:fill-indigo-400"
            />
            <text x={px - 2} y={py - 8} fontSize={8} fill="#64748b" textAnchor="middle">
              {port.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Edge (bezier)
───────────────────────────────────────────── */

function EdgePath({
  x1, y1, x2, y2, selected,
  onClick,
}: {
  x1: number; y1: number; x2: number; y2: number;
  selected: boolean;
  onClick: () => void;
}) {
  const dx = Math.abs(x2 - x1) * 0.5;
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
      <path
        d={d}
        fill="none"
        stroke={selected ? "#6366f1" : "#475569"}
        strokeWidth={selected ? 2 : 1.5}
        strokeDasharray={selected ? undefined : undefined}
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main WorkflowCanvas
───────────────────────────────────────────── */

function nodePortCoords(node: WFNode, portId: string, side: "output" | "input") {
  const typeDef = NODES_BY_TYPE[node.type];
  if (!typeDef) return { x: node.x, y: node.y };
  const ports = side === "output" ? typeDef.outputs : typeDef.inputs;
  const idx = ports.findIndex((p) => p.id === portId);
  const count = ports.length;
  const py = NODE_H / 2 + (idx - (count - 1) / 2) * 16;
  const px = side === "output" ? NODE_W : 0;
  return { x: node.x + px, y: node.y + py };
}

export function WorkflowCanvas({ initialData, onSave, onRun, readOnly = false }: WorkflowCanvasProps) {
  const [nodes, setNodes] = React.useState<WFNode[]>(initialData?.nodes ?? []);
  const [edges, setEdges] = React.useState<WFEdge[]>(initialData?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [draggingNodeType, setDraggingNodeType] = React.useState<string | null>(null);
  const [connecting, setConnecting] = React.useState<{
    nodeId: string; portId: string; x: number; y: number; mx: number; my: number;
  } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 40, y: 40 });
  const [saving, setSaving] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [runStatus, setRunStatus] = React.useState<"idle" | "success" | "error">("idle");
  const svgRef = React.useRef<SVGSVGElement>(null);
  const panStart = React.useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedNodeDef = selectedNode ? NODES_BY_TYPE[selectedNode.type] : null;

  function addNode(type: string, x: number, y: number) {
    const def = NODES_BY_TYPE[type];
    if (!def) return;
    const defaultConfig: Record<string, unknown> = {};
    def.configFields.forEach((f) => { if (f.default !== undefined) defaultConfig[f.key] = f.default; });
    setNodes((prev) => [...prev, {
      id: `node_${Date.now()}`,
      type,
      x: (x - pan.x) / zoom - NODE_W / 2,
      y: (y - pan.y) / zoom - NODE_H / 2,
      config: defaultConfig,
    }]);
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!draggingNodeType) return;
    const rect = svgRef.current!.getBoundingClientRect();
    addNode(draggingNodeType, e.clientX - rect.left, e.clientY - rect.top);
    setDraggingNodeType(null);
  }

  function handleSvgMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    function onMove(me: MouseEvent) {
      if (!panStart.current) return;
      setPan({
        x: panStart.current.px + me.clientX - panStart.current.mx,
        y: panStart.current.py + me.clientY - panStart.current.my,
      });
    }
    function onUp() {
      panStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleSvgMouseMove(e: React.MouseEvent) {
    if (!connecting) return;
    const rect = svgRef.current!.getBoundingClientRect();
    setConnecting((c) => c ? { ...c, mx: e.clientX - rect.left, my: e.clientY - rect.top } : null);
  }

  function handleSvgMouseUp() {
    setConnecting(null);
  }

  function handlePortMouseDown(
    nodeId: string, portId: string, side: "output" | "input", wx: number, wy: number
  ) {
    if (readOnly) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = wx * zoom + pan.x;
    const sy = wy * zoom + pan.y;
    setConnecting({ nodeId, portId, x: sx, y: sy, mx: sx, my: sy });
  }

  function handlePortMouseUp(nodeId: string, portId: string, side: "output" | "input") {
    if (!connecting || connecting.nodeId === nodeId) { setConnecting(null); return; }
    const isSourceOutput = NODES_BY_TYPE[nodes.find(n => n.id === connecting.nodeId)!?.type]
      ?.outputs.some(p => p.id === connecting.portId);
    const isTargetInput = side === "input";
    if (isSourceOutput && isTargetInput) {
      const newEdge: WFEdge = {
        id: `edge_${Date.now()}`,
        sourceNodeId: connecting.nodeId,
        sourcePort: connecting.portId,
        targetNodeId: nodeId,
        targetPort: portId,
      };
      setEdges((prev) => [...prev, newEdge]);
    }
    setConnecting(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try { await onSave({ nodes, edges }); } finally { setSaving(false); }
  }

  async function handleRun() {
    if (!onRun) return;
    setRunning(true);
    setRunStatus("idle");
    try {
      await onRun({ nodes, edges });
      setRunStatus("success");
      setTimeout(() => setRunStatus("idle"), 3000);
    } catch {
      setRunStatus("error");
      setTimeout(() => setRunStatus("idle"), 3000);
    } finally {
      setRunning(false);
    }
  }

  // ESC to deselect
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setSelectedNodeId(null); setSelectedEdgeId(null); }
      if (e.key === "Delete" && selectedNodeId) {
        setNodes((n) => n.filter((x) => x.id !== selectedNodeId));
        setEdges((es) => es.filter((e) => e.sourceNodeId !== selectedNodeId && e.targetNodeId !== selectedNodeId));
        setSelectedNodeId(null);
      }
      if (e.key === "Delete" && selectedEdgeId) {
        setEdges((es) => es.filter((e) => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNodeId, selectedEdgeId]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {nodes.length} צמתים · {edges.length} חיבורים
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="rounded-md border border-slate-700 p-1.5 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
            className="rounded-md border border-slate-700 p-1.5 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }}
            className="rounded-md border border-slate-700 p-1.5 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          {!readOnly && (
            <>
              <div className="h-4 w-px bg-slate-700" />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-400 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                שמור
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  runStatus === "success" ? "bg-green-600 text-white" :
                  runStatus === "error" ? "bg-red-600 text-white" :
                  "bg-indigo-600 hover:bg-indigo-500 text-white"
                )}
              >
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                 runStatus === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                 runStatus === "error" ? <AlertCircle className="h-3.5 w-3.5" /> :
                 <Play className="h-3.5 w-3.5" />}
                {runStatus === "success" ? "הצליח!" : runStatus === "error" ? "נכשל" : "הפעל"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        {!readOnly && (
          <NodePalette onDragStart={(type) => setDraggingNodeType(type)} />
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full"
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onWheel={handleWheel}
            style={{ cursor: "grab" }}
          >
            <defs>
              <pattern id="grid" width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse"
                x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)}>
                <circle cx={0} cy={0} r={0.8} fill="#334155" />
              </pattern>
              <marker id="arrowhead" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>

            {/* Grid background */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {edges.map((edge) => {
                const srcNode = nodes.find((n) => n.id === edge.sourceNodeId);
                const tgtNode = nodes.find((n) => n.id === edge.targetNodeId);
                if (!srcNode || !tgtNode) return null;
                const src = nodePortCoords(srcNode, edge.sourcePort, "output");
                const tgt = nodePortCoords(tgtNode, edge.targetPort, "input");
                return (
                  <EdgePath
                    key={edge.id}
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    selected={selectedEdgeId === edge.id}
                    onClick={() => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
                  />
                );
              })}

              {/* In-progress connection line */}
              {connecting && (() => {
                const cx = (connecting.mx - pan.x) / zoom;
                const cy = (connecting.my - pan.y) / zoom;
                const dx = Math.abs(cx - connecting.x / zoom) * 0.5;
                return (
                  <path
                    d={`M ${connecting.x / zoom} ${connecting.y / zoom} C ${connecting.x / zoom + dx} ${connecting.y / zoom}, ${cx - dx} ${cy}, ${cx} ${cy}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="5,3"
                    pointerEvents="none"
                  />
                );
              })()}

              {/* Nodes */}
              {nodes.map((node) => {
                const typeDef = NODES_BY_TYPE[node.type];
                if (!typeDef) return null;
                return (
                  <CanvasNode
                    key={node.id}
                    node={node}
                    typeDef={typeDef}
                    selected={selectedNodeId === node.id}
                    onClick={() => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
                    onDragMove={(x, y) => {
                      setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, x, y } : n));
                    }}
                    onPortMouseDown={handlePortMouseDown}
                  />
                );
              })}
            </g>
          </svg>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center space-y-2">
                <div className="text-4xl">⚡</div>
                <p className="text-sm font-medium text-slate-400">גרור צמת מהסרגל שמאל</p>
                <p className="text-xs text-slate-600">או לחץ + כדי להוסיף צומת</p>
              </div>
            </div>
          )}

          {/* Quick add button */}
          {!readOnly && (
            <button
              onClick={() => {
                const types = ["trigger_webhook", "action_send_whatsapp", "ai_claude"];
                const type = types[nodes.length % types.length];
                addNode(type, 200, 150);
              }}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-medium text-white shadow-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              הוסף צומת
            </button>
          )}
        </div>

        {/* Config panel */}
        {selectedNode && selectedNodeDef && !readOnly && (
          <ConfigPanel
            node={selectedNode}
            typeDef={selectedNodeDef}
            onChange={(config) => {
              setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, config } : n));
            }}
            onClose={() => setSelectedNodeId(null)}
            onDelete={() => {
              setNodes((n) => n.filter((x) => x.id !== selectedNode.id));
              setEdges((es) => es.filter((e) => e.sourceNodeId !== selectedNode.id && e.targetNodeId !== selectedNode.id));
              setSelectedNodeId(null);
            }}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-slate-800 bg-slate-950">
        <span className="text-xs text-slate-600">
          גרור צמתים · חבר פורטים · לחץ Delete למחיקה
        </span>
        {connecting && (
          <span className="text-xs text-indigo-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            מחבר...
          </span>
        )}
      </div>
    </div>
  );
}
