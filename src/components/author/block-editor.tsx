"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContentBlock } from "@/lib/content/blocks";
import { BlockRenderer } from "@/components/lesson/block-renderer";
import { cn } from "@/lib/utils";

type BlockType = ContentBlock["type"];

const BLOCK_LABEL: Record<BlockType, string> = {
  heading: "Heading",
  markdown: "Markdown",
  callout: "Callout",
  code: "Code",
  image: "Image",
  video: "Video",
  quiz: "Quiz",
  reflect: "Reflect",
  keyTakeaways: "Key takeaways",
  tryIt: "Try it",
  remotion: "Animation",
  animatedTimeline: "Timeline",
  sortableSteps: "Sortable",
  joinExplorer: "JOIN explorer",
  sqlPlayground: "SQL playground",
};

function newBlock(type: BlockType): ContentBlock {
  switch (type) {
    case "heading": return { type: "heading", level: 2, text: "Section heading" };
    case "markdown": return { type: "markdown", md: "Write here." };
    case "callout": return { type: "callout", tone: "info", title: "", md: "Useful note." };
    case "code": return { type: "code", lang: "sql", code: "SELECT 1;" };
    case "image": return { type: "image", src: "https://", alt: "" };
    case "video": return { type: "video", provider: "youtube", src: "" };
    case "quiz": return { type: "quiz", prompt: "What is…", multi: false, choices: [
      { id: "a", label: "Option A", correct: true, explain: "" },
      { id: "b", label: "Option B", correct: false, explain: "" },
    ] };
    case "reflect": return { type: "reflect", prompt: "How does this apply to your work?" };
    case "keyTakeaways": return { type: "keyTakeaways", points: ["First takeaway"] };
    case "tryIt": return { type: "tryIt", instruction: "Now you try.", lang: "sql", starter: "", expected: "" };
    case "remotion": return { type: "remotion", composition: "sqlExecutionOrder", durationFrames: 360, fps: 30, width: 1280, height: 720, props: {} };
    case "animatedTimeline": return { type: "animatedTimeline", steps: [{ label: "Step one", body: "What happens" }, { label: "Step two", body: "What happens next" }] };
    case "sortableSteps": return { type: "sortableSteps", prompt: "Drag into the right order.", items: [{ id: "a", label: "First" }, { id: "b", label: "Second" }] };
    case "joinExplorer": return { type: "joinExplorer", left: { name: "left", keyColumn: "id", rows: [{ id: 1 }] }, right: { name: "right", keyColumn: "id", rows: [{ id: 1 }] } };
    case "sqlPlayground": return { type: "sqlPlayground", prompt: "Write a query.", tables: [{ name: "t", columns: ["id"], rows: [[1]] }] };
  }
}

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
}) {
  const [preview, setPreview] = useState(false);

  function update(i: number, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } as ContentBlock : b)));
  }
  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function add(type: BlockType) {
    onChange([...blocks, newBlock(type)]);
  }

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Preview</Badge>
          <Button size="sm" variant="outline" onClick={() => setPreview(false)} className="gap-1">
            <EyeOff className="h-4 w-4" /> Back to editor
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <BlockRenderer blocks={blocks} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{blocks.length} block{blocks.length === 1 ? "" : "s"}</span>
        <Button size="sm" variant="outline" onClick={() => setPreview(true)} className="gap-1">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>

      {blocks.map((b, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{BLOCK_LABEL[b.type]}</Badge>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronDown className="h-4 w-4" /></button>
                <button onClick={() => remove(i)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <BlockFields block={b} onChange={(patch) => update(i, patch)} />
          </CardContent>
        </Card>
      ))}

      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Add block</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BLOCK_LABEL) as BlockType[]).map((t) => (
            <Button key={t} size="sm" variant="outline" onClick={() => add(t)} className="gap-1">
              <Plus className="h-3 w-3" /> {BLOCK_LABEL[t]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (patch: Partial<ContentBlock>) => void }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-2 md:grid-cols-[80px_1fr]">
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={block.level} onChange={(e) => onChange({ level: parseInt(e.target.value, 10) as 1 | 2 | 3 })}>
            <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
          </select>
          <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} />
        </div>
      );
    case "markdown":
      return <Textarea rows={5} value={block.md} onChange={(e) => onChange({ md: e.target.value })} className="font-mono text-sm" />;
    case "callout":
      return (
        <div className="space-y-2">
          <div className="grid gap-2 md:grid-cols-[120px_1fr]">
            <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={block.tone} onChange={(e) => onChange({ tone: e.target.value as "info" | "tip" | "warn" | "success" })}>
              <option value="info">Info</option><option value="tip">Tip</option><option value="warn">Warn</option><option value="success">Success</option>
            </select>
            <Input placeholder="Title (optional)" value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <Textarea rows={3} value={block.md} onChange={(e) => onChange({ md: e.target.value })} className="font-mono text-sm" />
        </div>
      );
    case "code":
      return (
        <div className="space-y-2">
          <Input value={block.lang} onChange={(e) => onChange({ lang: e.target.value })} placeholder="Language" className="max-w-xs" />
          <Textarea rows={6} value={block.code} onChange={(e) => onChange({ code: e.target.value })} className="font-mono text-xs" />
          <Input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption (optional)" />
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <Input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="Image URL" />
          <Input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt text" />
          <Input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption (optional)" />
        </div>
      );
    case "video":
      return (
        <div className="space-y-2">
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={block.provider} onChange={(e) => onChange({ provider: e.target.value as "youtube" | "vimeo" | "url" })}>
            <option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="url">Direct URL</option>
          </select>
          <Input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="Video URL or ID" />
        </div>
      );
    case "quiz":
      return (
        <div className="space-y-2">
          <Textarea rows={2} value={block.prompt} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="Question" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={block.multi} onChange={(e) => onChange({ multi: e.target.checked })} /> Allow multiple correct answers</label>
          <div className="space-y-1.5">
            {block.choices.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <input type={block.multi ? "checkbox" : "radio"} name={`q-${block.prompt}`} checked={c.correct} onChange={(e) => {
                  const next = block.multi ? block.choices.map((x, idx) => idx === i ? { ...x, correct: e.target.checked } : x)
                    : block.choices.map((x, idx) => ({ ...x, correct: idx === i }));
                  onChange({ choices: next });
                }} className="mt-2.5" />
                <div className="flex-1 space-y-1">
                  <Input value={c.label} onChange={(e) => onChange({ choices: block.choices.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x) })} placeholder="Choice text" />
                  <Input value={c.explain ?? ""} onChange={(e) => onChange({ choices: block.choices.map((x, idx) => idx === i ? { ...x, explain: e.target.value } : x) })} placeholder="Explanation (shown on reveal)" className="text-xs" />
                </div>
                <button onClick={() => onChange({ choices: block.choices.filter((_, idx) => idx !== i) })} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" type="button" onClick={() => {
            const id = String.fromCharCode(97 + block.choices.length);
            onChange({ choices: [...block.choices, { id, label: "", correct: false, explain: "" }] });
          }}>Add choice</Button>
        </div>
      );
    case "reflect":
      return <Textarea rows={2} value={block.prompt} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="Reflection prompt" />;
    case "keyTakeaways":
      return (
        <div className="space-y-2">
          {block.points.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={p} onChange={(e) => onChange({ points: block.points.map((x, idx) => idx === i ? e.target.value : x) })} />
              <button onClick={() => onChange({ points: block.points.filter((_, idx) => idx !== i) })} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button size="sm" variant="outline" type="button" onClick={() => onChange({ points: [...block.points, ""] })}>Add point</Button>
        </div>
      );
    case "tryIt":
      return (
        <div className="space-y-2">
          <Textarea rows={2} value={block.instruction} onChange={(e) => onChange({ instruction: e.target.value })} placeholder="What to try" />
          <Input value={block.lang ?? "sql"} onChange={(e) => onChange({ lang: e.target.value })} placeholder="Language" className="max-w-xs" />
          <Textarea rows={3} value={block.starter ?? ""} onChange={(e) => onChange({ starter: e.target.value })} placeholder="Starter code (optional)" className="font-mono text-xs" />
          <Textarea rows={3} value={block.expected ?? ""} onChange={(e) => onChange({ expected: e.target.value })} placeholder="Reference solution (optional)" className="font-mono text-xs" />
        </div>
      );
    case "remotion":
    case "animatedTimeline":
    case "sortableSteps":
    case "joinExplorer":
    case "sqlPlayground":
      // Rich editors for these block types are scoped for the AI authoring
      // step. For now, raw JSON edit so existing content can be tweaked.
      return <RawJsonField block={block} onChange={onChange} />;
  }
}

function RawJsonField({ block, onChange }: { block: ContentBlock; onChange: (patch: Partial<ContentBlock>) => void }) {
  const [text, setText] = useState(JSON.stringify(block, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Rich editor for {block.type} coming with AI authoring. For now you can edit the raw JSON.
      </div>
      <Textarea
        rows={10}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value) as ContentBlock;
            setErr(null);
            // Replace whole block with patch keys.
            onChange(parsed as Partial<ContentBlock>);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "invalid JSON");
          }
        }}
        className="font-mono text-xs"
      />
      {err && <div className="text-xs text-destructive">{err}</div>}
    </div>
  );
}
