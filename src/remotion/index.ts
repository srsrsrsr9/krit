"use client";

import { SqlExecutionOrder } from "./sql-execution-order";
import { JoinFlow } from "./join-flow";
import { GroupByCollapse } from "./group-by-collapse";
import type { ComponentType } from "react";

/**
 * Registry of every Remotion composition the platform can play.
 * Block JSON references compositions by string id.
 */
export const COMPOSITIONS: Record<string, {
  Component: ComponentType<Record<string, unknown>>;
  defaultDurationFrames: number;
  defaultFps: number;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
}> = {
  sqlExecutionOrder: {
    Component: SqlExecutionOrder as ComponentType<Record<string, unknown>>,
    defaultDurationFrames: 360,
    defaultFps: 30,
    defaultWidth: 1280,
    defaultHeight: 720,
    description: "Animates how SQL clauses are written vs executed.",
  },
  joinFlow: {
    Component: JoinFlow as ComponentType<Record<string, unknown>>,
    defaultDurationFrames: 270,
    defaultFps: 30,
    defaultWidth: 1280,
    defaultHeight: 720,
    description: "Two tables combine; matching rows highlight, result animates in.",
  },
  groupByCollapse: {
    Component: GroupByCollapse as ComponentType<Record<string, unknown>>,
    defaultDurationFrames: 270,
    defaultFps: 30,
    defaultWidth: 1280,
    defaultHeight: 720,
    description: "Many rows collapse into one-per-group with aggregates.",
  },
};

export type CompositionId = keyof typeof COMPOSITIONS;
