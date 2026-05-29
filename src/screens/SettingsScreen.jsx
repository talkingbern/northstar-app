import { useState, useEffect } from "react";
import { getHabits, addHabit, deleteHabit, getUser, setUser, getVision, saveVision } from "../store";
import NorthstarLogo from "../NorthstarLogo";

const AREAS = [
  { id:"career",        title:"Career & Finance",        icon:"💼", bg:"#1E3A08", prompt:"Picture your ideal professional life in 4 years.", placeholder:"e.g. I am working as a software engineer earning €60k+..." },
  { id:"relationships", title:"Intimate Relationships",  icon:"❤️", bg:"#3A0A1A", prompt:"Describe the relationship you want to be in.", placeholder:"e.g. I am in a committed relationship built on trust..." },
  { id:"health",        title:"Health & Fitness",        icon:"🏃", bg:"#0A2A1A", prompt:"How do you feel in your body? What are you capable of?", placeholder:"e.g. I wake up with energy, run 3x per week..." },
  { id:"family",        title:"Family & Friends",        icon:"👥", bg:"#0A1A3A", prompt:"What does your social world look like in 4 years?", placeholder:"e.g. I see family regularly and have close friends..." },
  { id:"hobbies",       title:"Hobbies & Growth",        icon:"🎯", bg:"#2A1A05", prompt:"What skills have you built? What do you do for joy?", placeholder:"e.g. I speak Spanish, play guitar, read 20+ books a year..." },
  { id:"lifestyle",     title:"Lifestyle & Environment", icon:"🏡", bg:"#1A0A2A", prompt:"Where are you living? What does a typical day feel like?", placeholder:"e.g. I live in my own apartment, mornings are calm..." },
];

const HABIT_AREAS = [
  { id:"health",        label:"Health & Fitness" },
  { id:"career",        label:"Career & Finance" },
  { id:"hobbies",       label:"Hobbies & Growth" },
  { id:"relationships", label:"Relationships" },
  { id:"family",        label:"Family & Friends" },
  { id:"lifestyle",     label:"Lifestyle" },
];

export default function SettingsScreen({ theme, onBack }) {
  const [habits, setHabits]             = useState([]);
  const [username, setUsername]         = useState("");
  const [visions, setVisions]           = useState({});
  const [visionDrafts, setVisionDrafts] = useState({});
  const [openVisionArea, setOpenVisionArea] = useState(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitArea, setNewHabitArea] = useState("health");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(null);
  const S = theme;

  useEffect(() => {
    setHabits(getHabits());
    setUsername(getUser().name || "");
    const v = getVision();
    setVisions(v);
    setVisionDrafts(v);
  }, []);

  function areaColor(id) {
    const colors = { health:S.isDark?"#97C459":"#3B6D11", career:S.isDark?"#7AAEDF":"#185FA5", hobbies:S.isDark?"#EF9F27":"#854F0B", relationships:S.isDark?"#E57373":"#8B1A1A", family:S.isDark?"#4DB6AC":"#0D6B5E", lifestyle:S.isDark?"#B39DDB":"#4B2E8A" };
    return colors[id] || S.accent;
  }
  function areaLabel(id) { return HABIT_AREAS.find(x=>x.id===id)?.label||id; }

  function handleAddHabit() {
    if(!newHabitName.trim()) return;
    addHabit({ name:newHabitName.trim(), area:newHabitArea });
    setHabits(getHabits());
    setNewHabitName(""); setShowAddHabit(false);
  }
  function handleDeleteHabit(id) { deleteHabit(id); setHabits(getHabits()); setDeleteConfirm(null); }
  function handleSaveUsername() {
    setUser({ name:username.trim() });
    setSavedFeedback("username");
    setTimeout(()=>setSavedFeedback(null), 2000);
  }
  function handleSaveVision(areaId) {
    const text = (visionDrafts[areaId]||"").trim();
    saveVision(areaId, text);
    setVisions(v=>({...v,[areaId]:text}));
    setSavedFeedback(areaId);
    setTimeout(()=>setSavedFeedback(null), 2000);
    setOpenVisionArea(null);
  }
  function handleReset() { localStorage.clear(); window.location.reload(); }

  return (
    <div style={{ background:S.bg, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:S.textPrimary, padding:0, lineHeight:1 }}>←</button>
          <NorthstarLogo size={18} isDark={S.isDark}/>
          <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>Settings</h1>
        </div>
      </div>

      {/* Profile */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>Profile</div>
      <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"0 16px", padding:14 }}>
        <div style={{ fontSize:12, color:S.textSecondary, marginBottom:6 }}>Your name</div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your first name" style={{ flex:1, background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:13, fontFamily:"inherit", color:S.textPrimary }}/>
          <button onClick={handleSaveUsername} style={{ padding:"9px 14px", background:S.accent, color:S.accentBg, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            {savedFeedback==="username"?"✓ Saved":"Save"}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>Appearance</div>
      <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"0 16px", padding:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:500, color:S.textPrimary }}>Dark mode</div>
            <div style={{ fontSize:12, color:S.textSecondary, marginTop:2 }}>Currently {S.isDark?"on":"off"}</div>
          </div>
          <div onClick={S.toggleTheme} style={{ width:44, height:26, borderRadius:13, background:S.isDark?S.accent:S.surface, border:`1px solid ${S.borderMed}`, position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
            <div style={{ position:"absolute", top:3, left:S.isDark?21:3, width:18, height:18, borderRadius:"50%", background:S.isDark?S.accentBg:S.card, border:`0.5px solid ${S.borderMed}`, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
          </div>
        </div>
      </div>

      {/* Vision editing */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>My Vision — 4 Years</div>
      <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"0 16px", overflow:"hidden" }}>
        {AREAS.map((area,i) => {
          const isOpen = openVisionArea===area.id;
          const text = visions[area.id];
          const hasVision = text&&text.length>5;
          return (
            <div key={area.id} style={{ borderBottom:i<AREAS.length-1?`0.5px solid ${S.border}`:"none" }}>
              <div onClick={()=>setOpenVisionArea(isOpen?null:area.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 14px", cursor:"pointer", userSelect:"none" }}>
                <div style={{ width:30, height:30, borderRadius:7, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{area.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary }}>{area.title}</div>
                  <div style={{ fontSize:11, color:hasVision?S.textSecondary:S.textHint, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontStyle:hasVision?"normal":"italic" }}>
                    {hasVision?text.slice(0,50)+(text.length>50?"…":""):"Not set yet"}
                  </div>
                </div>
                <span style={{ fontSize:14, color:S.textHint, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}>⌄</span>
              </div>
              {isOpen&&(
                <div style={{ padding:"0 14px 14px" }}>
                  <div style={{ padding:"8px 10px", background:S.surface, marginBottom:8, borderLeft:`2px solid ${S.accent}`, borderRadius:"0 6px 6px 0" }}>
                    <p style={{ fontSize:12, color:S.textSecondary, lineHeight:1.5 }}>{area.prompt}</p>
                  </div>
                  <textarea
                    value={visionDrafts[area.id]||""}
                    onChange={e=>setVisionDrafts(d=>({...d,[area.id]:e.target.value}))}
                    placeholder={area.placeholder}
                    style={{ width:"100%", minHeight:80, background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:13, fontFamily:"inherit", color:S.textPrimary, lineHeight:1.55, resize:"vertical", marginBottom:8 }}
                  />
                  <button onClick={()=>handleSaveVision(area.id)} style={{ padding:"9px 16px", background:savedFeedback===area.id?S.surface:S.accent, color:savedFeedback===area.id?S.accent:S.accentBg, border:`1px solid ${S.accent}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>
                    {savedFeedback===area.id?"✓ Saved":"Save"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Habits */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>My Habits</span>
        <button onClick={()=>setShowAddHabit(v=>!v)} style={{ fontSize:12, color:S.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
          {showAddHabit?"✕ Cancel":"+ Add habit"}
        </button>
      </div>

      <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"0 16px", overflow:"hidden" }}>
        <div style={{ padding:"10px 14px", background:S.surface, borderBottom:`0.5px solid ${S.border}` }}>
          <p style={{ fontSize:12, color:S.textSecondary, lineHeight:1.5 }}>⚠️ Deleting a habit removes its entire streak history. Edit with care.</p>
        </div>
        {habits.length===0&&<div style={{ padding:"16px 14px", fontSize:13, color:S.textHint, textAlign:"center" }}>No habits yet — add your first one.</div>}
        {habits.map((h,i) => (
          <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderBottom:i<habits.length-1?`0.5px solid ${S.border}`:"none" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:areaColor(h.area), flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:S.textPrimary }}>{h.name}</div>
              <div style={{ fontSize:11, color:S.textHint, marginTop:1 }}>{areaLabel(h.area)} · 🔥 {h.streak||0}d streak</div>
            </div>
            <button onClick={()=>setDeleteConfirm(h.id)} style={{ background:"none", border:"none", cursor:"pointer", color:S.textHint, fontSize:14 }}>🗑</button>
          </div>
        ))}
      </div>

      {showAddHabit&&(
        <div style={{ background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:12, margin:"10px 16px 0", padding:"13px 14px" }}>
          <div style={{ fontSize:12, color:S.textSecondary, marginBottom:8 }}>New habit — appears every day</div>
          <input value={newHabitName} onChange={e=>setNewHabitName(e.target.value)} placeholder="e.g. Meditate, Cold shower, Practice guitar..." autoFocus style={{ width:"100%", background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"10px 11px", fontSize:13, fontFamily:"inherit", color:S.textPrimary, marginBottom:8 }}/>
          <select value={newHabitArea} onChange={e=>setNewHabitArea(e.target.value)} style={{ width:"100%", background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 10px", fontSize:12, fontFamily:"inherit", color:S.textPrimary, marginBottom:10 }}>
            {HABIT_AREAS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <button onClick={handleAddHabit} style={{ width:"100%", padding:10, background:S.accent, color:S.accentBg, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add habit</button>
        </div>
      )}

      {/* Danger zone */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>Danger zone</div>
      <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"0 16px", padding:14 }}>
        <div style={{ fontSize:14, fontWeight:500, color:"#C0392B", marginBottom:4 }}>Reset all data</div>
        <div style={{ fontSize:12, color:S.textSecondary, marginBottom:12 }}>Clears everything — vision, goals, habits, history, notes. You'll go back to onboarding.</div>
        <button onClick={()=>setShowResetConfirm(true)} style={{ padding:"9px 16px", background:"none", border:`1px solid #C0392B`, borderRadius:8, fontSize:13, color:"#C0392B", cursor:"pointer", fontFamily:"inherit" }}>Reset app</button>
      </div>

      {/* Delete habit modal */}
      {deleteConfirm&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50, display:"flex", alignItems:"flex-end" }}>
          <div style={{ background:S.card, borderRadius:"16px 16px 0 0", padding:20, width:"100%" }}>
            <div style={{ fontSize:16, fontWeight:500, color:S.textPrimary, marginBottom:6 }}>Delete this habit?</div>
            <div style={{ fontSize:13, color:S.textSecondary, lineHeight:1.5, marginBottom:16 }}>This removes the habit and all its streak history permanently.</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1, padding:10, background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, fontSize:13, color:S.textPrimary, cursor:"pointer", fontFamily:"inherit" }}>Keep it</button>
              <button onClick={()=>handleDeleteHabit(deleteConfirm)} style={{ flex:1, padding:10, background:"#C0392B", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Delete anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50, display:"flex", alignItems:"flex-end" }}>
          <div style={{ background:S.card, borderRadius:"16px 16px 0 0", padding:20, width:"100%" }}>
            <div style={{ fontSize:16, fontWeight:500, color:"#C0392B", marginBottom:6 }}>Reset everything?</div>
            <div style={{ fontSize:13, color:S.textSecondary, lineHeight:1.5, marginBottom:16 }}>This deletes your vision, goals, habits, history, notes — everything. You'll go back to onboarding including the intro video.</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setShowResetConfirm(false)} style={{ flex:1, padding:10, background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, fontSize:13, color:S.textPrimary, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={handleReset} style={{ flex:1, padding:10, background:"#C0392B", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Yes, reset</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ height:24 }}/>
    </div>
  );
}
