import React, { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, X, FolderOpen } from "lucide-react";
import { formatHistoricalDate, parseHistoricalDate } from "../core/historicalDate.ts";

export const humanize = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());

export const displayDate = (value: string) => {
  if (!value) return "Date not recorded";
  const historical = parseHistoricalDate(value);
  if (historical?.era === "BCE" || (historical && historical.year < 1000)) {
    return formatHistoricalDate(value);
  }
  const d = new Date(value.length === 10 ? value + "T12:00:00" : value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <FolderOpen size={32} />
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function ExpandableSection({
  title,
  summary,
  children,
  open = false,
}: {
  title: string;
  summary?: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="expandable-section" open={open || undefined}>
      <summary>
        <span>
          <strong>{title}</strong>
          {summary && <small>{summary}</small>}
        </span>
        <ChevronDown size={20} />
      </summary>
      <div className="expanded-content">{children}</div>
    </details>
  );
}
export function FollowTrail({
  items,
}: {
  items: { label: string; action: () => void }[];
}) {
  return (
    <div className="follow-trail">
      <p className="eyebrow">Follow this trail</p>
      {items.map((item) => (
        <button key={item.label} onClick={item.action}>
          {item.label}
          <ArrowRight size={19} />
        </button>
      ))}
    </div>
  );
}
export function ContextInspector({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <aside
      className="context-inspector"
      ref={ref}
      tabIndex={-1}
      aria-label={title}
    >
      <div className="inspector-heading">
        <p className="eyebrow">Selected detail</p>
        <button
          className="icon-button"
          aria-label="Close details"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <h2>{title}</h2>
      {children}
    </aside>
  );
}
