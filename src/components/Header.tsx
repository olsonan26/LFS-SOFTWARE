import React, { useEffect, useRef, useState } from "react";
import {
  Home,
  Users,
  Route,
  CalendarDays,
  LineChart,
  FileText,
  Image,
  Printer,
  Search,
  Plus,
  ChevronDown,
  Compass,
  Settings2,
  Menu,
  X,
  FolderOpen,
  Crosshair,
  FileCheck2,
  HelpCircle,
  Database,
  ShieldCheck,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { UserProfile, CaseRecord } from "../types";

export type NavTab =
  | "HOME"
  | "TRAIL"
  | "CASES"
  | "PEOPLE"
  | "ANALYSIS"
  | "CHRONOLOGY"
  | "CHART"
  | "EVIDENCE"
  | "DOCUMENTS"
  | "MEDIA"
  | "HYPOTHESES"
  | "RESEARCH"
  | "REPORTS"
  | "METHODOLOGY"
  | "BLIND";
export type ReadingSize = "normal" | "large" | "xlarge";
export const PAGE_NAMES: Record<NavTab, string> = {
  HOME: "Investigation Hub",
  CASES: "Cases",
  TRAIL: "Case Trail",
  PEOPLE: "People",
  ANALYSIS: "Pattern Analysis",
  CHRONOLOGY: "Timeline",
  CHART: "Lettrology Chart",
  EVIDENCE: "Evidence",
  DOCUMENTS: "Documents",
  MEDIA: "Media",
  HYPOTHESES: "Open Questions",
  RESEARCH: "Research",
  REPORTS: "Reports",
  METHODOLOGY: "Methodology",
  BLIND: "Blind Study",
};
interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (u: UserProfile) => void;
  activeCase: CaseRecord;
  allCases: CaseRecord[];
  setActiveCase: (c: CaseRecord) => void;
  onOpenNewCaseModal: () => void;
  onOpenNewPersonModal: () => void;
  onOpenNewEventModal: () => void;
  onOpenTutorial: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fontScale: ReadingSize;
  onSetFontScale: (s: ReadingSize) => void;
  theme: "dark" | "light";
  onSetTheme: (theme: "dark" | "light") => void;
}
const mainItems: { id: NavTab; icon: typeof Home; label: string }[] = [
  { id: "HOME", icon: Home, label: "Home" },
  { id: "CASES", icon: FolderOpen, label: "Cases" },
  { id: "TRAIL", icon: Route, label: "Case Trail" },
  { id: "PEOPLE", icon: Users, label: "People" },
  { id: "CHRONOLOGY", icon: CalendarDays, label: "Timeline" },
  { id: "CHART", icon: LineChart, label: "Chart" },
  { id: "DOCUMENTS", icon: FileText, label: "Documents" },
  { id: "MEDIA", icon: Image, label: "Media" },
  { id: "REPORTS", icon: Printer, label: "Reports" },
];
const extraItems: { id: NavTab; icon: typeof Home }[] = [
  { id: "ANALYSIS", icon: Crosshair },
  { id: "EVIDENCE", icon: FileCheck2 },
  { id: "HYPOTHESES", icon: HelpCircle },
  { id: "RESEARCH", icon: Database },
  { id: "BLIND", icon: EyeOff },
  { id: "METHODOLOGY", icon: ShieldCheck },
];
export function Header(p: HeaderProps) {
  const [menu, setMenu] = useState<"reading" | "add" | "user" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [more, setMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const go = (id: NavTab) => {
    p.setActiveTab(id);
    setMobileOpen(false);
  };
  const toggle = (name: typeof menu) => setMenu(menu === name ? null : name);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <aside
        className={`app-sidebar no-print ${mobileOpen ? "is-open" : ""}`}
        aria-label="Application sidebar"
      >
        <button
          className="brand"
          onClick={() => go("HOME")}
          aria-label="Forensic Lettrology home"
        >
          <Route size={29} />
          <span>
            Forensic
            <br />
            <strong>Lettrology</strong>
          </span>
        </button>
        <div className="sidebar-section-label">Workspace</div>
        <nav aria-label="Main navigation">
          {mainItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`nav-item ${p.activeTab === id ? "is-active" : ""}`}
              onClick={() => go(id)}
              aria-current={p.activeTab === id ? "page" : undefined}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button
          className="nav-item more-toggle"
          onClick={() => setMore(!more)}
          aria-expanded={more}
        >
          <Settings2 size={21} />
          <span>More tools</span>
          <ChevronDown size={17} />
        </button>
        {(more || extraItems.some((x) => x.id === p.activeTab)) && (
          <nav className="extra-navigation" aria-label="Research tools">
            {extraItems.map(({ id, icon: Icon }) => (
              <button
                className={`nav-item ${p.activeTab === id ? "is-active" : ""}`}
                key={id}
                onClick={() => go(id)}
                aria-current={p.activeTab === id ? "page" : undefined}
              >
                <Icon size={19} />
                <span>{PAGE_NAMES[id]}</span>
              </button>
            ))}
          </nav>
        )}
        <div className="sidebar-footer">
          <button className="nav-item" onClick={p.onOpenTutorial}>
            <Compass size={21} />
            <span>Guided tour</span>
          </button>
          <p>
            Follow the evidence.
            <br />
            Explore the patterns.
          </p>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <header className="app-topbar no-print" ref={ref}>
        <button
          className="icon-button mobile-menu"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronDown size={13} className="breadcrumb-arrow" />
          <strong>{PAGE_NAMES[p.activeTab]}</strong>
        </div>
        <div className="topbar-actions">
          <div className="popover-anchor">
            <button
              className="quiet-button"
              onClick={() => toggle("reading")}
              aria-expanded={menu === "reading"}
            >
              <Settings2 size={19} />
              <span>Reading</span>
            </button>
            {menu === "reading" && (
              <section
                className="utility-popover"
                aria-label="Reading preferences"
              >
                <h3>Reading comfort</h3>
                <label htmlFor="text-size">Text size</label>
                <select
                  id="text-size"
                  value={p.fontScale}
                  onChange={(e) =>
                    p.onSetFontScale(e.target.value as ReadingSize)
                  }
                >
                  <option value="normal">Standard</option>
                  <option value="large">Large — recommended</option>
                  <option value="xlarge">Extra large</option>
                </select>
                <label>Appearance</label>
                <div className="segmented">
                  <button
                    aria-pressed={p.theme === "dark"}
                    onClick={() => p.onSetTheme("dark")}
                  >
                    <Moon size={17} />
                    Dark
                  </button>
                  <button
                    aria-pressed={p.theme === "light"}
                    onClick={() => p.onSetTheme("light")}
                  >
                    <Sun size={17} />
                    Light
                  </button>
                </div>
                <p className="muted">
                  Your reading preferences are remembered.
                </p>
              </section>
            )}
          </div>
          <div className="popover-anchor">
            <button
              className="quiet-button"
              onClick={() => toggle("add")}
              aria-expanded={menu === "add"}
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
            {menu === "add" && (
              <div className="utility-popover compact">
                {[
                  ["New case", p.onOpenNewCaseModal],
                  ["New person", p.onOpenNewPersonModal],
                  ["New event", p.onOpenNewEventModal],
                ].map(([label, action]) => (
                  <button
                    key={label as string}
                    onClick={() => {
                      setMenu(null);
                      (action as () => void)();
                    }}
                  >
                    {label as string}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="popover-anchor">
            <button
              className="account-button"
              onClick={() => toggle("user")}
              aria-expanded={menu === "user"}
              aria-label="Choose researcher"
            >
              <span className="avatar small">
                {p.currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="account-name">
                {p.currentUser.name.split(" ")[0]}
              </span>
              <ChevronDown size={14} />
            </button>
            {menu === "user" && (
              <div className="utility-popover compact">
                <h3>Researcher</h3>
                {p.allUsers.map((u) => (
                  <button
                    key={u.userId}
                    onClick={() => {
                      p.setCurrentUser(u);
                      setMenu(null);
                    }}
                  >
                    {u.name}
                    <small>{u.role}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      {!["HOME", "CASES"].includes(p.activeTab) && (
        <div className="case-context no-print">
          <label htmlFor="active-case">Current case</label>
          <select
            id="active-case"
            value={p.activeCase.caseId}
            onChange={(e) => {
              const c = p.allCases.find((c) => c.caseId === e.target.value);
              if (c) p.setActiveCase(c);
            }}
          >
            {p.allCases.map((c) => (
              <option key={c.caseId} value={c.caseId}>
                {c.title}
              </option>
            ))}
          </select>
          <button className="text-button" onClick={() => go("CASES")}>
            All cases
          </button>
        </div>
      )}
    </>
  );
}
