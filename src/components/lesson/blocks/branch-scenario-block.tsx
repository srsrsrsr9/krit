"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { GitBranch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Choice {
  id: string;
  label: string;
  nextNodeId?: string;
  outcome?: string;
}
interface Node {
  id: string;
  body: string;
  choices: Choice[];
}
export interface BranchScenarioBlockProps {
  title?: string;
  startNodeId: string;
  nodes: Node[];
}

export function BranchScenarioBlock({ title, startNodeId, nodes }: BranchScenarioBlockProps) {
  const [currentId, setCurrentId] = useState(startNodeId);
  const [terminalOutcome, setTerminalOutcome] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([startNodeId]);
  const playSound = useGameSound();

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  );
  const current = nodeMap[currentId];

  function choose(choice: Choice) {
    playSound("click");
    if (choice.nextNodeId && nodeMap[choice.nextNodeId]) {
      setCurrentId(choice.nextNodeId);
      setHistory((h) => [...h, choice.nextNodeId!]);
    } else {
      setTerminalOutcome(choice.outcome ?? "You've reached the end of this path.");
    }
  }

  function restart() {
    setCurrentId(startNodeId);
    setTerminalOutcome(null);
    setHistory([startNodeId]);
  }

  return (
    <div className="not-prose overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md dark:from-indigo-950/30 dark:to-violet-950/20">
      <header className="flex items-center gap-2 border-b border-indigo-300/30 bg-indigo-500/10 px-5 py-3">
        <GitBranch className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            Branching scenario
          </div>
          {title && <div className="font-display text-sm font-semibold">{title}</div>}
        </div>
        <div className="ml-auto text-xs font-mono text-muted-foreground">
          step {history.length}
        </div>
      </header>

      <div className="px-5 py-5">
        {terminalOutcome ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-indigo-300/40 bg-background p-4 shadow-sm">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                Outcome
              </div>
              <div className="prose-krit prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{terminalOutcome}</ReactMarkdown>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={restart} className="gap-1" type="button">
              <RefreshCw className="h-3.5 w-3.5" /> Try another path
            </Button>
          </motion.div>
        ) : current ? (
          <NodeView node={current} onChoose={choose} />
        ) : null}
      </div>
    </div>
  );
}

function NodeView({ node, onChoose }: { node: Node; onChoose: (c: Choice) => void }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="rounded-xl border border-indigo-300/40 bg-background p-4 shadow-sm">
        <div className="prose-krit prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{node.body}</ReactMarkdown>
        </div>
      </div>
      <div className="space-y-2">
        {node.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChoose(c)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 border-indigo-300/50 bg-background px-4 py-3 text-left text-sm font-medium shadow-sm transition-all",
              "hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md active:scale-[0.98] dark:hover:bg-indigo-950/30",
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
              {node.choices.indexOf(c) + 1}
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
