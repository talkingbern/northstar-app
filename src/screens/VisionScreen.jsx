import { useState, useEffect } from "react";
import { getVision, saveVision } from "../store";

const AREAS = [
  { id: "career",        title: "Career & Finance",        icon: "💼", bg: "#EAF3DE", prompt: "Picture your ideal professional life in 5 years.", placeholder: "e.g. I am working as a software engineer earning €60k+, doing work I find meaningful..." },
  { id: "relationships", title: "Intimate Relationships",  icon: "❤️", bg: "#FBEAF0", prompt: "Describe the relationship you want to be in.", placeholder: "e.g. I am in a committed relationship built on trust and shared goals..." },
  { id: "health",        title: "Health & Fitness",        icon: "🏃", bg: "#E1F5EE", prompt: "How do you feel in your body? What are you physically capable of?", placeholder: "e.g. I wake up with energy, run 3x per week, have completed a half-marathon..." },
  { id: "family",        title: "Family & Friends",        icon: "👥", bg: "#E6F1FB", prompt: "What does your social world look like in 5 years?", placeholder: "e.g. I see family regularly and have a small group of close, reliable friends..." },
  { id: "hobbies",       title: "Hobbies & Growth",        icon: "🎯", bg: "#FAEEDA", prompt: "What skills have you built? What do you do for joy?", placeholder: "e.g. I speak conversational Spanish, play guitar, and read 20+ books a year..." },
  { id: "lifestyle",     title: "Lifestyle & Environment", icon: "🏡", bg: "#EEEDFE", prompt: "Where are you living? What does a typical day feel like?", placeholder: "e.g. I live in my own apartment, my mornings are calm and intentional..." },
];

export default function VisionScreen({ theme, navigate }) {
  const [visions, setVisions] = useState({});
  const [openId, setOpenId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savedFeedback, setSavedFeedback] = useState(null);

  // Load from store on mount
  useEffect(() => {
    const stored = getVision();
    setVisions(stored);
    setDrafts(stored);
  }, []);

  const completed = AREAS.filter(a => visions[a.id]?.length > 10).length;
  const S = theme;

  function handleSave(id) {
    const text = (drafts[id] || "").trim();
    if (text.length < 5) return;
    saveVision(id, text);
    setVisions(v => ({ ...v, [id]: text }));
    setSavedFeedback(id);
    setTimeout(() => setSavedFeedback(null), 1500);
    setOpenId(null);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: S.card, borderBottom: `0.5px solid ${S.border}`, padding: "14px 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: S.textHint, textTransform: "uppercase" }}>Northstar</span>
          <button onClick={S.toggleTheme} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1.5px solid ${S.themeBtnBorder}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: S.themeBtnText, cursor: "pointer" }}>
            {S.isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: S.textPrimary }}>My Vision</h1>
        <p style={{ fontSize: 13, color: S.textSecondary, marginTop: 2 }}>Who do you want to be in 5 years?</p>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: S.textSecondary, marginBottom: 5 }}>
            <span>Vision complete</span><span>{completed} of 6 areas</span>
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2 }}>
            <div style={{ height: 4, background: S.accent, borderRadius: 2, width: `${(completed / 6) * 100}%`, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>

      {/* Quote */}
      <div style={{ margin: "12px 16px 0", padding: "12px 14px", background: S.surface, borderRadius: 10, borderLeft: `2px solid ${S.accent}` }}>
        <p style={{ fontSize: 13, color: S.textSecondary, fontStyle: "italic", lineHeight: 1.6 }}>"A goal without a plan is just a wish."</p>
        <span style={{ fontSize: 11, color: S.textHint }}>— Antoine de Saint-Exupéry</span>
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: S.textHint, textTransform: "uppercase", padding: "18px 20px 8px" }}>6 Life Areas</div>

      {AREAS.map(area => {
        const isOpen = openId === area.id;
        const saved = visions[area.id];
        const justSaved = savedFeedback === area.id;
        return (
          <div key={area.id} style={{ background: S.card, border: `0.5px solid ${isOpen ? S.accent : S.border}`, borderRadius: 12, margin: "0 16px 10px", overflow: "hidden", transition: "border-color 0.2s" }}>
            <div onClick={() => setOpenId(isOpen ? null : area.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", cursor: "pointer", userSelect: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: area.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{area.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: S.textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                  {area.title}
                  {saved && <span style={{ width: 7, height: 7, borderRadius: "50%", background: S.accent, display: "inline-block", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 12, color: S.textSecondary, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {saved ? saved.slice(0, 50) + (saved.length > 50 ? "…" : "") : "Tap to set your vision"}
                </div>
              </div>
              <span style={{ fontSize: 15, color: S.textHint, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.22s", flexShrink: 0 }}>⌄</span>
            </div>

            {isOpen && (
              <div style={{ padding: "0 14px 14px", borderTop: `0.5px solid ${S.border}` }}>
                <div style={{ margin: "12px 0 10px", padding: "9px 11px", background: S.surface, borderLeft: `2px solid ${S.accent}`, borderRadius: "0 6px 6px 0" }}>
                  <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: S.accent, marginBottom: 2 }}>Guided prompt</div>
                  <p style={{ fontSize: 12, color: S.textSecondary, lineHeight: 1.5 }}>{area.prompt}</p>
                </div>
                <textarea
                  value={drafts[area.id] || ""}
                  onChange={e => setDrafts(d => ({ ...d, [area.id]: e.target.value }))}
                  placeholder={area.placeholder}
                  style={{ width: "100%", minHeight: 90, background: S.card, border: `0.5px solid ${S.borderMed}`, borderRadius: 8, padding: "10px 11px", fontSize: 13, fontFamily: "inherit", color: S.textPrimary, lineHeight: 1.55, resize: "vertical" }}
                />
                <button onClick={() => handleSave(area.id)} style={{ width: "100%", marginTop: 10, padding: 10, background: justSaved ? S.surface : S.accent, color: justSaved ? S.accent : S.accentBg, border: `1px solid ${S.accent}`, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                  {justSaved ? "✓ Saved" : "Save this area"}
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ height: 16 }} />
    </div>
  );
}
