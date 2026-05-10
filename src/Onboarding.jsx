import { useState } from "react";
import { setUser, setOnboarded, saveVision, saveGoals, addHabit, addTask } from "./store";

const AREAS = [
  { id:"career",        title:"Career & Finance",        icon:"💼", bg:"#EAF3DE", prompt:"Picture your ideal professional life in 5 years.", placeholder:"e.g. I am working as a software engineer earning €60k+, doing work I find meaningful..." },
  { id:"relationships", title:"Intimate Relationships",  icon:"❤️", bg:"#FBEAF0", prompt:"Describe the relationship you want to be in.", placeholder:"e.g. I am in a committed relationship built on trust and shared goals..." },
  { id:"health",        title:"Health & Fitness",        icon:"🏃", bg:"#E1F5EE", prompt:"How do you feel in your body? What are you physically capable of?", placeholder:"e.g. I wake up with energy, run 3x per week, have completed a half-marathon..." },
  { id:"family",        title:"Family & Friends",        icon:"👥", bg:"#E6F1FB", prompt:"What does your social world look like in 5 years?", placeholder:"e.g. I see family regularly and have a small group of close, reliable friends..." },
  { id:"hobbies",       title:"Hobbies & Growth",        icon:"🎯", bg:"#FAEEDA", prompt:"What skills have you built? What do you do for joy?", placeholder:"e.g. I speak conversational Spanish, play guitar, and read 20+ books a year..." },
  { id:"lifestyle",     title:"Lifestyle & Environment", icon:"🏡", bg:"#EEEDFE", prompt:"Where are you living? What does a typical day feel like?", placeholder:"e.g. I live in my own apartment, my mornings are calm and intentional..." },
];

const HABIT_SUGGESTIONS = [
  { name:"Wake up by 8:00 am",        area:"health" },
  { name:"Read for 30 mins",           area:"hobbies" },
  { name:"Exercise",                   area:"health" },
  { name:"Journal",                    area:"hobbies" },
  { name:"Limit screen time to 1 hr",  area:"lifestyle" },
  { name:"Eat well",                   area:"health" },
  { name:"Meditate",                   area:"health" },
  { name:"Cold shower",                area:"health" },
  { name:"Study / learn something new",area:"hobbies" },
  { name:"Connect with a friend",      area:"family" },
];

const TOTAL_STEPS = 6;

function ProgressDots({ step, total, accent }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ width:i===step?20:7, height:7, borderRadius:4, background:i<=step?accent:"rgba(128,128,128,0.2)", transition:"all 0.3s" }} />
      ))}
    </div>
  );
}

export default function Onboarding({ theme, onComplete }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [visions, setVisions] = useState({});
  const [currentArea, setCurrentArea] = useState(0);
  const [goalInputs, setGoalInputs] = useState({});
  // Habits: track selected suggestions + custom additions (stored locally, not yet in store)
  const [selectedHabits, setSelectedHabits] = useState(new Set());
  const [customHabits, setCustomHabits] = useState([]); // [{name, area}]
  const [customHabitName, setCustomHabitName] = useState("");
  const [customHabitArea, setCustomHabitArea] = useState("health");
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskArea, setTaskArea] = useState("health");
  const [taskDue, setTaskDue] = useState("today");

  const T = theme;
  const areaLabels = { health:"Health & Fitness", career:"Career & Finance", hobbies:"Hobbies & Growth", relationships:"Relationships", family:"Family & Friends", lifestyle:"Lifestyle" };

  function next() { setStep(s=>s+1); }
  function back() { setStep(s=>s-1); }

  function finish() {
    setUser({ name: username.trim() || "Friend" });
    // Save vision
    Object.entries(visions).forEach(([aId, text]) => { if (text?.trim()) saveVision(aId, text.trim()); });
    // Save goals
    const goalsObj = {};
    AREAS.forEach(area => {
      const key = area.id + "_1yr";
      const text = goalInputs[key]?.trim();
      if (text) goalsObj[area.id] = { "1yr": [{ text, label:"1 year" }] };
    });
    saveGoals(goalsObj);
    // Save habits — selected suggestions + custom ones
    HABIT_SUGGESTIONS.filter(h => selectedHabits.has(h.name)).forEach(h => addHabit(h));
    customHabits.forEach(h => addHabit(h));
    // Save tasks
    tasks.forEach(t => addTask(t));
    setOnboarded(true);
    onComplete();
  }

  function addCustomHabit() {
    if (!customHabitName.trim()) return;
    const h = { name: customHabitName.trim(), area: customHabitArea };
    setCustomHabits(prev => [...prev, h]);
    setCustomHabitName("");
  }

  function removeCustomHabit(idx) {
    setCustomHabits(prev => prev.filter((_,i)=>i!==idx));
  }

  const wrap = (children) => (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", transition:"background 0.2s" }}>
      <div style={{ width:"100%", maxWidth:480 }}>{children}</div>
    </div>
  );

  // ── Step 0: Welcome ──────────────────────────────────────────────────────────
  if (step===0) return wrap(<>
    <div style={{ textAlign:"center", marginBottom:32 }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🌟</div>
      <h1 style={{ fontSize:28, fontWeight:600, color:T.textPrimary, marginBottom:10, fontFamily:"'DM Serif Display',serif" }}>Welcome to Northstar</h1>
      <p style={{ fontSize:15, color:T.textSecondary, lineHeight:1.65 }}>Your personal guide for turning vision into daily action. Let's take 3 minutes to set you up.</p>
    </div>
    <ProgressDots step={0} total={TOTAL_STEPS} accent={T.accent} />
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:500, color:T.textSecondary, marginBottom:6 }}>What should we call you?</div>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your first name" autoFocus onKeyDown={e=>e.key==="Enter"&&username.trim()&&next()} style={{ width:"100%", background:T.card, border:`1px solid ${T.borderMed}`, borderRadius:10, padding:"12px 14px", fontSize:16, color:T.textPrimary, fontFamily:"inherit" }} />
    </div>
    <button onClick={next} disabled={!username.trim()} style={{ width:"100%", padding:14, background:username.trim()?T.accent:T.surface, color:username.trim()?T.accentBg:T.textHint, border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:username.trim()?"pointer":"default", fontFamily:"inherit", transition:"all 0.2s" }}>
      Let's begin →
    </button>
  </>);

  // ── Step 1: Vision ────────────────────────────────────────────────────────────
  if (step===1) {
    const area = AREAS[currentArea];
    const isLast = currentArea===AREAS.length-1;
    return wrap(<>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <button onClick={()=>{ if(currentArea>0) setCurrentArea(a=>a-1); else back(); }} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:T.textSecondary, padding:0 }}>←</button>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:T.textHint, textTransform:"uppercase" }}>Step 1 of 4 — Your Vision</div>
      </div>
      <ProgressDots step={1} total={TOTAL_STEPS} accent={T.accent} />
      {/* area progress */}
      <div style={{ display:"flex", gap:4, marginBottom:20 }}>
        {AREAS.map((_,i)=><div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<currentArea?T.accent:i===currentArea?T.accent:T.surface, opacity:i<currentArea?0.5:1 }} />)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{area.icon}</div>
        <div>
          <h2 style={{ fontSize:18, fontWeight:600, color:T.textPrimary }}>{area.title}</h2>
          <p style={{ fontSize:12, color:T.textSecondary }}>{currentArea+1} of {AREAS.length}</p>
        </div>
      </div>
      <div style={{ background:T.surface, borderRadius:10, padding:"10px 12px", marginBottom:14, borderLeft:`3px solid ${T.accent}` }}>
        <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.5 }}>{area.prompt}</p>
      </div>
      <textarea
        value={visions[area.id]||""}
        onChange={e=>setVisions(v=>({...v,[area.id]:e.target.value}))}
        placeholder={area.placeholder}
        style={{ width:"100%", minHeight:100, background:T.card, border:`1px solid ${T.borderMed}`, borderRadius:10, padding:"12px 14px", fontSize:14, fontFamily:"inherit", color:T.textPrimary, lineHeight:1.6, resize:"vertical", marginBottom:12 }}
      />
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>{ if(!isLast) setCurrentArea(a=>a+1); else next(); }} style={{ flex:1, padding:12, background:"none", border:`1px solid ${T.borderMed}`, borderRadius:10, fontSize:14, color:T.textSecondary, cursor:"pointer", fontFamily:"inherit" }}>Skip</button>
        <button onClick={()=>{ if(isLast) next(); else setCurrentArea(a=>a+1); }} style={{ flex:2, padding:12, background:T.accent, color:T.accentBg, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          {isLast?"Next: Goals →":"Next area →"}
        </button>
      </div>
    </>);
  }

  // ── Step 2: Goals ─────────────────────────────────────────────────────────────
  if (step===2) return wrap(<>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:T.textSecondary, padding:0 }}>←</button>
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:T.textHint, textTransform:"uppercase" }}>Step 2 of 4 — Goals</div>
    </div>
    <ProgressDots step={2} total={TOTAL_STEPS} accent={T.accent} />
    <h2 style={{ fontSize:20, fontWeight:600, color:T.textPrimary, marginBottom:6 }}>Set your 1-year goals</h2>
    <p style={{ fontSize:13, color:T.textSecondary, marginBottom:18, lineHeight:1.5 }}>For each life area, set one concrete target for this year. You can add more detail later.</p>
    {AREAS.map(area=>{
      const key = area.id+"_1yr";
      return (
        <div key={area.id} style={{ background:T.card, border:`0.5px solid ${T.border}`, borderRadius:10, marginBottom:10, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:`0.5px solid ${T.border}` }}>
            <div style={{ width:28, height:28, borderRadius:6, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{area.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:T.textPrimary }}>{area.title}</div>
              {visions[area.id] && <div style={{ fontSize:11, color:T.textHint, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{visions[area.id].slice(0,50)}…</div>}
            </div>
          </div>
          <div style={{ padding:"10px 14px" }}>
            <input
              value={goalInputs[key]||""}
              onChange={e=>setGoalInputs(g=>({...g,[key]:e.target.value}))}
              placeholder={`1-year goal for ${area.title.split(" & ")[0]}...`}
              style={{ width:"100%", background:T.surface, border:`0.5px solid ${T.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:13, color:T.textPrimary, fontFamily:"inherit" }}
            />
          </div>
        </div>
      );
    })}
    <button onClick={next} style={{ width:"100%", marginTop:8, padding:14, background:T.accent, color:T.accentBg, border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Next: Habits →</button>
    <button onClick={next} style={{ width:"100%", marginTop:8, padding:10, background:"none", border:"none", fontSize:13, color:T.textHint, cursor:"pointer", fontFamily:"inherit" }}>Skip for now</button>
  </>);

  // ── Step 3: Habits ────────────────────────────────────────────────────────────
  if (step===3) {
    const allHabits = [
      ...HABIT_SUGGESTIONS.map(h=>({...h, isCustom:false})),
      ...customHabits.map(h=>({...h, isCustom:true})),
    ];
    return wrap(<>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:T.textSecondary, padding:0 }}>←</button>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:T.textHint, textTransform:"uppercase" }}>Step 3 of 4 — Daily Habits</div>
      </div>
      <ProgressDots step={3} total={TOTAL_STEPS} accent={T.accent} />
      <h2 style={{ fontSize:20, fontWeight:600, color:T.textPrimary, marginBottom:6 }}>Choose your daily habits</h2>
      <p style={{ fontSize:13, color:T.textSecondary, marginBottom:4, lineHeight:1.5 }}>These show up every single day. Choose carefully — quality over quantity.</p>
      <p style={{ fontSize:12, color:T.accent, marginBottom:18, fontWeight:500 }}>{selectedHabits.size + customHabits.length} selected</p>

      {allHabits.map((h,i)=>{
        const isSelected = h.isCustom ? true : selectedHabits.has(h.name);
        return (
          <div key={h.name+i} onClick={()=>{
            if(h.isCustom) return; // custom habits always included, remove via X
            setSelectedHabits(s=>{ const n=new Set(s); isSelected?n.delete(h.name):n.add(h.name); return n; });
          }} style={{ display:"flex", alignItems:"center", gap:12, background:T.card, border:`1px solid ${isSelected?T.accent:T.border}`, borderRadius:10, padding:"12px 14px", marginBottom:8, cursor:"pointer", transition:"border-color 0.15s", userSelect:"none" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${isSelected?T.accent:T.borderMed}`, background:isSelected?T.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
              {isSelected && <span style={{ color:T.accentBg, fontSize:12 }}>✓</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:T.textPrimary }}>{h.name}</div>
              <div style={{ fontSize:11, color:T.textHint, marginTop:1 }}>{areaLabels[h.area]||h.area}</div>
            </div>
            {h.isCustom && (
              <button onClick={e=>{e.stopPropagation();removeCustomHabit(i-HABIT_SUGGESTIONS.length);}} style={{ background:"none", border:"none", cursor:"pointer", color:T.textHint, fontSize:14 }}>✕</button>
            )}
          </div>
        );
      })}

      {/* Add custom */}
      <div style={{ background:T.card, border:`0.5px solid ${T.border}`, borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
        <div style={{ fontSize:12, color:T.textSecondary, marginBottom:8 }}>Add a custom habit</div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <input value={customHabitName} onChange={e=>setCustomHabitName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomHabit()} placeholder="e.g. Practice guitar" style={{ flex:1, background:T.surface, border:`0.5px solid ${T.borderMed}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:T.textPrimary, fontFamily:"inherit" }} />
          <button onClick={addCustomHabit} style={{ padding:"8px 14px", background:T.accent, color:T.accentBg, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add</button>
        </div>
        <select value={customHabitArea} onChange={e=>setCustomHabitArea(e.target.value)} style={{ width:"100%", background:T.surface, border:`0.5px solid ${T.borderMed}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.textPrimary, fontFamily:"inherit" }}>
          {Object.entries(areaLabels).map(([id,lbl])=><option key={id} value={id}>{lbl}</option>)}
        </select>
      </div>

      <button onClick={next} style={{ width:"100%", padding:14, background:T.accent, color:T.accentBg, border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Next: Tasks →</button>
    </>);
  }

  // ── Step 4: Tasks ─────────────────────────────────────────────────────────────
  if (step===4) return wrap(<>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:T.textSecondary, padding:0 }}>←</button>
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:T.textHint, textTransform:"uppercase" }}>Step 4 of 4 — First Tasks</div>
    </div>
    <ProgressDots step={4} total={TOTAL_STEPS} accent={T.accent} />
    <h2 style={{ fontSize:20, fontWeight:600, color:T.textPrimary, marginBottom:6 }}>Add your first tasks</h2>
    <p style={{ fontSize:13, color:T.textSecondary, marginBottom:18, lineHeight:1.5 }}>Tasks are one-off things to get done. Unlike habits, they don't repeat every day.</p>

    {tasks.map((t,i)=>(
      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:T.card, border:`0.5px solid ${T.border}`, borderRadius:10, padding:"11px 14px", marginBottom:8 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:T.blue, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:T.textPrimary }}>{t.name}</div>
          <div style={{ fontSize:11, color:T.textHint }}>Due: {t.due}</div>
        </div>
        <button onClick={()=>setTasks(ts=>ts.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:T.textHint, fontSize:14 }}>✕</button>
      </div>
    ))}

    <div style={{ background:T.card, border:`0.5px solid ${T.border}`, borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
      <input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="Task name..." style={{ width:"100%", background:T.surface, border:`0.5px solid ${T.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:13, color:T.textPrimary, fontFamily:"inherit", marginBottom:8 }} />
      <select value={taskArea} onChange={e=>setTaskArea(e.target.value)} style={{ width:"100%", background:T.surface, border:`0.5px solid ${T.borderMed}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.textPrimary, fontFamily:"inherit", marginBottom:8 }}>
        {Object.entries(areaLabels).map(([id,lbl])=><option key={id} value={id}>{lbl}</option>)}
      </select>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        {[["today","Today"],["this week","This week"],["end of month","This month"]].map(([val,lbl])=>(
          <div key={val} onClick={()=>setTaskDue(val)} style={{ padding:"5px 11px", borderRadius:20, fontSize:12, border:`1px solid ${taskDue===val?T.blue:T.borderMed}`, color:taskDue===val?T.blue:T.textSecondary, background:taskDue===val?T.blueBg:T.surface, cursor:"pointer", userSelect:"none" }}>{lbl}</div>
        ))}
      </div>
      <button onClick={()=>{ if(taskName.trim()){ setTasks(ts=>[...ts,{name:taskName.trim(),area:taskArea,due:taskDue}]); setTaskName(""); }}} style={{ width:"100%", padding:10, background:T.blue, color:T.blueBg, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add task</button>
    </div>

    <button onClick={next} style={{ width:"100%", padding:14, background:T.accent, color:T.accentBg, border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
      {tasks.length>0?"Finish setup →":"Skip for now →"}
    </button>
  </>);

  // ── Step 5: Done ──────────────────────────────────────────────────────────────
  if (step===5) return wrap(<>
    <ProgressDots step={5} total={TOTAL_STEPS} accent={T.accent} />
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:20 }}>🌟</div>
      <h1 style={{ fontSize:26, fontWeight:600, color:T.textPrimary, marginBottom:12, fontFamily:"'DM Serif Display',serif" }}>You're all set, {username||"friend"}.</h1>
      <p style={{ fontSize:15, color:T.textSecondary, lineHeight:1.7, marginBottom:16 }}>Your vision is set. Your goals are defined. Your habits are chosen.</p>
      <p style={{ fontSize:14, color:T.textHint, lineHeight:1.6, marginBottom:12, fontStyle:"italic" }}>"The secret to your existence is right in front of you — it manifests as all the things you know you should do but are avoiding."</p>
      <p style={{ fontSize:13, color:T.accent, fontWeight:500, marginBottom:36 }}>— Jordan Peterson</p>
      <button onClick={finish} style={{ width:"100%", padding:16, background:T.accent, color:T.accentBg, border:"none", borderRadius:12, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Start my journey →</button>
    </div>
  </>);

  return null;
}
