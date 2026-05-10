import { useState, useEffect } from "react";
import { getHabits, addHabit, deleteHabit, getUser, setUser, setOnboarded } from "../store";

const AREAS = [
  { id: "health", label: "Health & Fitness", color: "#3B6D11", darkColor: "#97C459" },
  { id: "career", label: "Career & Finance", color: "#185FA5", darkColor: "#7AAEDF" },
  { id: "hobbies", label: "Hobbies & Growth", color: "#854F0B", darkColor: "#EF9F27" },
  { id: "relationships", label: "Relationships", color: "#8B1A1A", darkColor: "#E57373" },
  { id: "family", label: "Family & Friends", color: "#0D6B5E", darkColor: "#4DB6AC" },
  { id: "lifestyle", label: "Lifestyle", color: "#4B2E8A", darkColor: "#B39DDB" },
];

export default function SettingsScreen({ theme, onBack }) {
  const [habits, setHabits] = useState([]);
  const [username, setUsername] = useState("");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitArea, setNewHabitArea] = useState("health");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const S = theme;

  useEffect(() => {
    setHabits(getHabits());
    setUsername(getUser().name || "");
  }, []);

  function areaColor(id) { const a = AREAS.find(x => x.id === id); return a ? (S.isDark ? a.darkColor : a.color) : S.accent; }
  function areaLabel(id) { return AREAS.find(x => x.id === id)?.label || id; }

  function handleAddHabit() {
    if (!newHabitName.trim()) return;
    addHabit({ name: newHabitName.trim(), area: newHabitArea });
    setHabits(getHabits());
    setNewHabitName(""); setShowAddHabit(false);
  }

  function handleDeleteHabit(id) {
    deleteHabit(id);
    setHabits(getHabits());
    setDeleteConfirm(null);
  }

  function handleSaveUsername() {
    setUser({ name: username.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div style={{ background: S.bg, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: S.card, borderBottom: `0.5px solid ${S.border}`, padding: "14px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: S.textPrimary, padding: 0, lineHeight: 1 }}>←</button>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: S.textPrimary }}>Settings</h1>
        </div>
      </div>

      {/* Profile */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: S.textHint, textTransform: "uppercase", padding: "18px 20px 8px" }}>Profile</div>
      <div style={{ background: S.card, border: `0.5px solid ${S.border}`, borderRadius: 12, margin: "0 16px", padding: "14px" }}>
        <div style={{ fontSize: 12, color: S.textSecondary, marginBottom: 6 }}>Your name</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your first name" style={{ flex: 1, background: S.surface, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", color: S.textPrimary }} />
          <button onClick={handleSaveUsername} style={{ padding: "9px 14px", background: S.accent, color: S.accentBg, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: S.textHint, textTransform: "uppercase", padding: "18px 20px 8px" }}>Appearance</div>
      <div style={{ background: S.card, border: `0.5px solid ${S.border}`, borderRadius: 12, margin: "0 16px", padding: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: S.textPrimary }}>Dark mode</div>
            <div style={{ fontSize: 12, color: S.textSecondary, marginTop: 2 }}>Currently {S.isDark ? "on" : "off"}</div>
          </div>
          <div onClick={S.toggleTheme} style={{ width: 44, height: 26, borderRadius: 13, background: S.isDark ? S.accent : S.surface, border: `1px solid ${S.borderMed}`, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: S.isDark ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: S.isDark ? S.accentBg : S.card, border: `0.5px solid ${S.borderMed}`, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </div>

      {/* Habits */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: S.textHint, textTransform: "uppercase", padding: "18px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>My Habits</span>
        <button onClick={() => setShowAddHabit(v => !v)} style={{ fontSize: 12, color: S.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
          {showAddHabit ? "✕ Cancel" : "+ Add habit"}
        </button>
      </div>

      <div style={{ background: S.card, border: `0.5px solid ${S.border}`, borderRadius: 12, margin: "0 16px", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: S.surface, borderBottom: `0.5px solid ${S.border}` }}>
          <p style={{ fontSize: 12, color: S.textSecondary, lineHeight: 1.5 }}>⚠️ Habits are the foundation of your app. Deleting a habit removes its entire history and streak. Edit with care.</p>
        </div>

        {habits.length === 0 && <div style={{ padding: "16px 14px", fontSize: 13, color: S.textHint, textAlign: "center" }}>No habits yet — add your first one.</div>}

        {habits.map((h, i) => {
          const color = areaColor(h.area);
          return (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < habits.length - 1 ? `0.5px solid ${S.border}` : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: S.textPrimary }}>{h.name}</div>
                <div style={{ fontSize: 11, color: S.textHint, marginTop: 1 }}>{areaLabel(h.area)} · 🔥 {h.streak || 0}d streak</div>
              </div>
              <button onClick={() => setDeleteConfirm(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textHint, fontSize: 14 }}>🗑</button>
            </div>
          );
        })}
      </div>

      {showAddHabit && (
        <div style={{ background: S.card, border: `0.5px solid ${S.borderMed}`, borderRadius: 12, margin: "10px 16px 0", padding: "13px 14px" }}>
          <div style={{ fontSize: 12, color: S.textSecondary, marginBottom: 8 }}>New habit — will appear every day</div>
          <input value={newHabitName} onChange={e => setNewHabitName(e.target.value)} placeholder="e.g. Meditate, Cold shower, Practice guitar..." autoFocus style={{ width: "100%", background: S.surface, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, padding: "10px 11px", fontSize: 13, fontFamily: "inherit", color: S.textPrimary, marginBottom: 8 }} />
          <select value={newHabitArea} onChange={e => setNewHabitArea(e.target.value)} style={{ width: "100%", background: S.surface, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, padding: "9px 10px", fontSize: 12, fontFamily: "inherit", color: S.textPrimary, marginBottom: 10 }}>
            {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <button onClick={handleAddHabit} style={{ width: "100%", padding: 10, background: S.accent, color: S.accentBg, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Add habit</button>
        </div>
      )}

      {/* Reset */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: S.textHint, textTransform: "uppercase", padding: "18px 20px 8px" }}>Danger zone</div>
      <div style={{ background: S.card, border: `0.5px solid ${S.border}`, borderRadius: 12, margin: "0 16px" }}>
        <div style={{ padding: "14px" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#C0392B", marginBottom: 4 }}>Reset all data</div>
          <div style={{ fontSize: 12, color: S.textSecondary, marginBottom: 12 }}>This clears everything — your vision, goals, habits, tasks, history, and notes. This cannot be undone.</div>
          <button onClick={() => setShowResetConfirm(true)} style={{ padding: "9px 16px", background: "none", border: `1px solid #C0392B`, borderRadius: 8, fontSize: 13, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>Reset app</button>
        </div>
      </div>

      {/* Delete habit modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: S.card, borderRadius: "16px 16px 0 0", padding: 20, width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: S.textPrimary, marginBottom: 6 }}>Delete this habit?</div>
            <div style={{ fontSize: 13, color: S.textSecondary, lineHeight: 1.5, marginBottom: 16 }}>This removes the habit and all its streak history permanently. Are you sure?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 10, background: S.surface, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, fontSize: 13, color: S.textPrimary, cursor: "pointer", fontFamily: "inherit" }}>Keep it</button>
              <button onClick={() => handleDeleteHabit(deleteConfirm)} style={{ flex: 1, padding: 10, background: "#C0392B", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Delete anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: S.card, borderRadius: "16px 16px 0 0", padding: 20, width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#C0392B", marginBottom: 6 }}>Reset everything?</div>
            <div style={{ fontSize: 13, color: S.textSecondary, lineHeight: 1.5, marginBottom: 16 }}>This deletes your vision, goals, habits, history, notes — everything. It cannot be undone. You'll go back to onboarding.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: 10, background: S.surface, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, fontSize: 13, color: S.textPrimary, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleReset} style={{ flex: 1, padding: 10, background: "#C0392B", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Yes, reset</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
