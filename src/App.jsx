import { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import VisionScreen from "./screens/VisionScreen";
import GoalsScreen from "./screens/GoalsScreen";
import HabitsScreen from "./screens/HabitsScreen";
import ProgressScreen from "./screens/ProgressScreen";
import InspirationScreen from "./screens/InspirationScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { isOnboarded, getThemePref, setThemePref, getUser, seedDemoData } from "./store";

const NAV = [
  { id: "vision",   label: "Vision",   icon: "👁"  },
  { id: "goals",    label: "Goals",    icon: "🎯"  },
  { id: "habits",   label: "Today",    icon: "✓"   },
  { id: "progress", label: "Progress", icon: "📈"  },
  { id: "inspire",  label: "Inspire",  icon: "⚡"  },
];

export default function App() {
  const [onboarded, setOnboarded] = useState(null); // null = loading
  const [screen, setScreen] = useState("habits");
  const [isDark, setIsDark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const dark = getThemePref();
    setIsDark(dark);
    const ob = isOnboarded();
    setOnboarded(ob);
    if (ob) seedDemoData(); // seed only if already onboarded (first-timer seeds via onboarding)
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    setThemePref(next);
  }

  const theme = {
    isDark, toggleTheme,
    bg:              isDark ? "#181816" : "#F4F3EF",
    card:            isDark ? "#222220" : "#FFFFFF",
    surface:         isDark ? "#2A2A28" : "#EEEDE8",
    border:          isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)",
    borderMed:       isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.16)",
    textPrimary:     isDark ? "#EEEDE8" : "#1C1C1A",
    textSecondary:   isDark ? "#A8A7A2" : "#5F5E5A",
    textHint:        isDark ? "#6A6A66" : "#9A9890",
    accent:          isDark ? "#97C459" : "#3B6D11",
    accentBg:        isDark ? "#1E3A08" : "#EAF3DE",
    accentTxt:       isDark ? "#C0DD97" : "#27500A",
    blue:            isDark ? "#7AAEDF" : "#185FA5",
    blueBg:          isDark ? "#0A2E50" : "#E6F1FB",
    amber:           isDark ? "#EF9F27" : "#854F0B",
    amberBg:         isDark ? "#3A2005" : "#FAEEDA",
    themeBtnBorder:  isDark ? "#97C459" : "rgba(0,0,0,0.22)",
    themeBtnText:    isDark ? "#97C459" : "#1C1C1A",
    navBg:           isDark ? "#222220" : "#FFFFFF",
    missDot:         isDark ? "#555552" : "#B0ADA8",
    missBorder:      isDark ? "#777774" : "#8A8780",
  };

  // Loading state
  if (onboarded === null) return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 40 }}>🌟</span>
    </div>
  );

  // Onboarding
  if (!onboarded) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <Onboarding theme={theme} onComplete={() => { setOnboarded(true); setScreen("habits"); }} />
    </>
  );

  const SCREENS = {
    vision:   <VisionScreen   theme={theme} navigate={setScreen} />,
    goals:    <GoalsScreen    theme={theme} navigate={setScreen} />,
    habits:   <HabitsScreen   theme={theme} navigate={setScreen} onOpenSettings={() => setShowSettings(true)} />,
    progress: <ProgressScreen theme={theme} navigate={setScreen} />,
    inspire:  <InspirationScreen theme={theme} navigate={setScreen} />,
  };

  const user = getUser();

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {showSettings ? (
        <SettingsScreen theme={theme} onBack={() => setShowSettings(false)} />
      ) : (
        <div style={{ paddingBottom: 72 }}>
          {SCREENS[screen]}
        </div>
      )}

      {/* Bottom Nav */}
      {!showSettings && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: theme.navBg, borderTop: `0.5px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 16px", zIndex: 100, transition: "background 0.2s" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setScreen(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 10px" }}>
              <span style={{ fontSize: 20, opacity: screen === item.id ? 1 : 0.38 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: screen === item.id ? theme.accent : theme.textHint }}>{item.label}</span>
            </button>
          ))}
          {/* Settings gear */}
          <button onClick={() => setShowSettings(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 10px" }}>
            <span style={{ fontSize: 20, opacity: 0.38 }}>⚙️</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: theme.textHint }}>Settings</span>
          </button>
        </div>
      )}
    </div>
  );
}
