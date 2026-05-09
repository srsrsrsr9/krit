import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Course } from "@/lib/content/course";
import type { ContentBlock } from "@/lib/content/blocks";

/**
 * Long-form, print-optimised version of a course. Renders the entire course
 * as a magazine-style "field guide" that learners can save as a PDF via the
 * browser's print dialog. Krit-branded throughout.
 *
 * Design constraints:
 * - No interactivity. Every interactive block becomes static prose.
 * - Page breaks at lesson boundaries.
 * - Readable on screen AND printed; same component, no separate render.
 */
export function CourseFieldGuide({ course }: { course: Course }) {
  return (
    <article className="mx-auto max-w-3xl rounded-md bg-white px-8 py-12 text-slate-900 shadow-sm print:max-w-none print:rounded-none print:px-0 print:py-0 print:shadow-none">
      {/* Cover */}
      <header className="mb-12 break-after-page">
        <KritWordmark />
        <div className="mt-12 mb-3 font-mono text-[10px] tracking-[0.24em] text-amber-700">
          A KRIT FIELD GUIDE
        </div>
        <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            {course.subtitle}
          </p>
        )}
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-200 pt-6 font-mono text-[10px] tracking-[0.18em] text-slate-500">
          {course.audience && (
            <div>
              <div className="mb-1 text-slate-400">FOR</div>
              <div className="text-slate-900">{course.audience}</div>
            </div>
          )}
          <div>
            <div className="mb-1 text-slate-400">LENGTH</div>
            <div className="text-slate-900">~{course.estimatedMinutes} min · {course.lessons.length} lessons</div>
          </div>
          {course.cast.length > 0 && (
            <div className="col-span-2">
              <div className="mb-1 text-slate-400">THE CAST</div>
              <div className="text-slate-900">
                {course.cast.map((c) => (
                  <span key={c.id} className="mr-3 inline-block">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-slate-500"> · {c.role}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Lessons */}
      {course.lessons.map((lesson, i) => (
        <section key={lesson.slug} className="mb-16 break-before-page first:break-before-auto">
          <div className="mb-2 font-mono text-[10px] tracking-[0.22em] text-amber-700">
            LESSON {String(i + 1).padStart(2, "0")} · {lesson.estimatedMinutes} MIN
          </div>
          <h2 className="font-display text-3xl font-black leading-tight tracking-tight">
            {lesson.title}
          </h2>
          {lesson.subtitle && (
            <p className="mt-2 text-base text-slate-600">{lesson.subtitle}</p>
          )}
          <div className="my-6 h-[2px] w-16 bg-amber-500" />

          <div className="prose prose-slate max-w-none">
            {lesson.blocks.map((block, bi) => (
              <PrintBlock key={bi} block={block} />
            ))}
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="mt-16 border-t-2 border-slate-900 pt-6 font-mono text-[10px] tracking-[0.18em] text-slate-500 print:break-before-page">
        <div className="mb-1">A KRIT FIELD GUIDE · KRIT.IO</div>
        <div>{course.title} · Generated for offline review</div>
      </footer>
    </article>
  );
}

// ── Krit wordmark ────────────────────────────────────────────────────────────

function KritWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 font-display text-base font-black text-slate-900">
        K
      </div>
      <span className="font-display text-lg font-black tracking-tight text-slate-900">krit</span>
    </div>
  );
}

// ── PrintBlock — turn every block type into static prose ─────────────────────

function PrintBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${Math.min(3, block.level + 1)}` as "h2" | "h3" | "h4";
      return <Tag className="mt-6 font-display tracking-tight">{block.text}</Tag>;
    }

    case "callout":
      return (
        <div className="my-5 border-l-4 border-amber-500 bg-amber-50 px-4 py-3">
          {block.title && <p className="m-0 font-bold leading-snug">{block.title}</p>}
          {block.title && <div className="mt-2" />}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.md}</ReactMarkdown>
        </div>
      );

    case "markdown":
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.md}</ReactMarkdown>;

    case "code":
      return (
        <pre className="my-4 overflow-x-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs">
          <code>{block.code}</code>
        </pre>
      );

    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt} className="my-5 rounded border border-slate-200" />;

    case "video":
      return (
        <div className="my-5 rounded border border-slate-200 bg-slate-50 p-3 text-xs italic text-slate-500">
          [Video: {block.caption || block.src}]
        </div>
      );

    case "revealCard":
      return (
        <Beat label="Reframe">
          <p className="m-0 italic text-slate-600">It looks like:</p>
          <p className="mt-1 mb-3">{block.front}</p>
          <p className="m-0 italic text-amber-700">But really:</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.back}</ReactMarkdown>
        </Beat>
      );

    case "comicStrip":
      return (
        <Beat label="Story beat" title={block.title}>
          {block.frames.map((f, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                {f.character.toUpperCase()}
              </span>
              <span className="italic">"{f.bubble}"</span>
              {f.caption && <div className="ml-2 mt-0.5 text-xs text-slate-500">— {f.caption}</div>}
            </div>
          ))}
        </Beat>
      );

    case "panelComic":
      return (
        <Beat label="Comic strip" title={block.title}>
          {block.panels.map((p, i) => (
            <div key={i} className="mb-3 last:mb-0">
              {p.narration && (
                <div className="mb-1 inline-block bg-amber-200 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.1em] text-slate-900">
                  {p.narration}
                </div>
              )}
              {p.dialog?.map((d, j) => (
                <div key={j} className="ml-1">
                  <span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                    {(d.speaker ?? "—").toUpperCase()}
                  </span>
                  <span className="italic">"{d.text}"</span>
                </div>
              ))}
              {p.sfxAfter && (
                <div className="mt-1 font-display text-base font-black italic text-rose-600">
                  {p.sfxAfter}
                </div>
              )}
            </div>
          ))}
        </Beat>
      );

    case "embedAnimation":
      return (
        <div className="my-4 rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-xs italic text-slate-500">
          [Animation in the app: {block.caption || block.src}]
        </div>
      );

    case "quiz":
    case "timedChallenge": {
      const correct = block.choices.filter((c) => c.correct);
      return (
        <Beat label={block.type === "timedChallenge" ? "Timed challenge" : "Quick check"}>
          <p className="m-0 font-bold">{block.prompt}</p>
          <p className="m-0 mt-2 italic text-slate-600">Answer{correct.length > 1 ? "s" : ""}:</p>
          <ul className="m-0 list-disc pl-5">
            {correct.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong>
                {c.explain && <span className="text-slate-600"> — {c.explain}</span>}
              </li>
            ))}
          </ul>
        </Beat>
      );
    }

    case "skillProof": {
      if (block.choices && block.choices.length > 0) {
        const correct = block.choices.find((c) => c.correct);
        return (
          <Beat label={`Prove it · ${block.skill}`}>
            <p className="m-0 font-bold">{block.instruction}</p>
            {correct && (
              <>
                <p className="m-0 mt-2 italic text-slate-600">Best framing:</p>
                <p className="m-0">{correct.label}</p>
                {correct.explain && <p className="m-0 mt-1 text-sm text-slate-600">{correct.explain}</p>}
              </>
            )}
          </Beat>
        );
      }
      return (
        <Beat label={`Prove it · ${block.skill}`}>
          <p className="m-0 font-bold">{block.instruction}</p>
          {block.referenceAnswer && (
            <>
              <p className="m-0 mt-2 italic text-slate-600">Reference answer:</p>
              <p className="m-0">{block.referenceAnswer}</p>
            </>
          )}
        </Beat>
      );
    }

    case "dragClassify":
      return (
        <Beat label="Sort">
          <p className="m-0 font-bold">{block.prompt}</p>
          {block.bins.map((bin) => {
            const items = block.items.filter((it) => it.correctBinId === bin.id);
            if (items.length === 0) return null;
            return (
              <div key={bin.id} className="mt-3">
                <div className="mb-1 inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.14em] text-slate-700">
                  {bin.label.toUpperCase()}
                </div>
                <ul className="m-0 list-disc pl-5">
                  {items.map((it) => (
                    <li key={it.id}>
                      {it.label}
                      {it.comment && <span className="text-slate-600"> — {it.comment}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Beat>
      );

    case "scaleSlider": {
      const goodBand = block.bands.find((b) => b.tone === "good");
      return (
        <Beat label="Calibrate">
          <p className="m-0 font-bold">{block.prompt}</p>
          <p className="m-0 mt-2 italic text-slate-600">Productive zone:</p>
          {goodBand ? (
            <p className="m-0">
              <strong>{goodBand.lo}–{goodBand.hi}{block.unit ?? ""}</strong> — {goodBand.body}
            </p>
          ) : (
            <p className="m-0 italic text-slate-500">No clear "good" band; reasoning depends on context.</p>
          )}
        </Beat>
      );
    }

    case "cardSwipe":
      return (
        <Beat label="Swipe deck">
          <p className="m-0 font-bold">{block.prompt}</p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1 pr-2 text-left font-mono text-[10px] tracking-[0.14em] text-slate-500">CARD</th>
                <th className="py-1 pr-2 text-left font-mono text-[10px] tracking-[0.14em] text-slate-500">CALL</th>
                <th className="py-1 text-left font-mono text-[10px] tracking-[0.14em] text-slate-500">WHY</th>
              </tr>
            </thead>
            <tbody>
              {block.cards.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 align-top">{c.title}</td>
                  <td className="py-1.5 pr-2 align-top">
                    <strong>{c.correctSide === "right" ? block.rightLabel : block.leftLabel}</strong>
                  </td>
                  <td className="py-1.5 align-top text-slate-600">{c.explain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Beat>
      );

    case "branchScenario": {
      const startNode = block.nodes.find((n) => n.id === block.startNodeId);
      if (!startNode) return null;
      return (
        <Beat label="Branching scenario" title={block.title}>
          <p className="m-0 font-bold">{startNode.body}</p>
          <ul className="m-0 list-disc pl-5">
            {startNode.choices.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong>
                {c.outcome && <span className="text-slate-600"> → {c.outcome}</span>}
                {c.nextNodeId && !c.outcome && <span className="text-slate-500 italic"> (branches further in app)</span>}
              </li>
            ))}
          </ul>
        </Beat>
      );
    }

    case "chatScenario":
      return (
        <Beat label="Coach scenario">
          {block.intro.map((line, i) => (
            <p key={i} className="m-0 mb-1 italic text-slate-700">{line}</p>
          ))}
          <ul className="m-0 mt-2 list-disc pl-5">
            {block.scenarios.map((sc) => {
              const bucket = block.buckets.find((b) => b.id === sc.correctBucketId);
              return (
                <li key={sc.id} className="mb-1.5">
                  <em>"{sc.situation}"</em>
                  <br />
                  <strong>→ {bucket?.label}</strong>
                  <span className="text-slate-600"> — {sc.explain}</span>
                </li>
              );
            })}
          </ul>
        </Beat>
      );

    case "bossBattle":
      return (
        <Beat label="Capstone challenge" title={block.title}>
          <p className="m-0 italic text-slate-600">{block.setup}</p>
          <ol className="m-0 mt-2 list-decimal pl-5">
            {block.stages.map((stage) => {
              const correct = stage.options.find((o) => o.correct);
              return (
                <li key={stage.id} className="mb-2">
                  <strong>{stage.prompt}</strong>
                  {correct && (
                    <div className="mt-0.5">
                      → <strong>{correct.label}</strong>
                      <span className="text-slate-600"> — {correct.explain}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Beat>
      );

    case "fieldNotes":
      return (
        <Beat label="Field notes" title={block.title}>
          <div className="mb-1 font-mono text-[10px] tracking-[0.14em] text-slate-500">
            {block.source.toUpperCase()}{block.date ? ` · ${block.date.toUpperCase()}` : ""}
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.story}</ReactMarkdown>
          <p className="m-0 mt-2">
            <strong>Takeaway:</strong> {block.takeaway}
          </p>
        </Beat>
      );

    case "reflect":
      return (
        <Beat label="Reflect">
          <p className="m-0 italic">{block.prompt}</p>
          <div className="mt-3 space-y-1">
            <div className="h-px w-full bg-slate-300" />
            <div className="h-px w-full bg-slate-300" />
            <div className="h-px w-full bg-slate-300" />
            <div className="h-px w-3/4 bg-slate-300" />
          </div>
        </Beat>
      );

    case "keyTakeaways":
      return (
        <div className="my-6 rounded-md border-2 border-amber-400 bg-amber-50 p-5">
          <div className="mb-3 font-mono text-[10px] font-bold tracking-[0.18em] text-amber-700">
            TAKE THESE HOME
          </div>
          <ul className="m-0 list-disc pl-5">
            {block.points.map((p, i) => (
              <li key={i} className="mb-1.5">{p}</li>
            ))}
          </ul>
        </div>
      );

    // Blocks not meaningful in print — render lightweight placeholder.
    case "lessonMeta":
    case "remotion":
    case "animatedTimeline":
    case "sortableSteps":
    case "joinExplorer":
    case "sqlPlayground":
    case "svgFigure":
    case "culturalAside":
    case "tryIt":
    case "hotspotReveal":
      return (
        <div className="my-4 rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-xs italic text-slate-500">
          [Interactive in the app: {block.type}]
        </div>
      );
  }
}

// ── Beat — uniform "story beat" container in the field guide ────────────────

function Beat({
  label,
  title,
  children,
}: { label: string; title?: string; children: React.ReactNode }) {
  return (
    <div className="my-5 border-l-2 border-slate-300 pl-4">
      <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.18em] text-slate-500">
        {label.toUpperCase()}
        {title && <span className="ml-2 text-slate-700"> · {title}</span>}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
