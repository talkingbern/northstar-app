import { useState, useEffect, useRef } from "react";
import { setUser, setOnboarded, saveVision, saveGoals, addHabit, addTask, hasSeenVideo, markVideoSeen } from "./store";
import NorthstarLogo from "./NorthstarLogo";

const AREAS = [
  { id:"career",        title:"Career & Finance",        icon:"💼", bg:"#1E3A08", prompt:"Picture your ideal professional life in 4 years.", placeholder:"e.g. I am working as a software engineer earning €60k+, doing work I find meaningful..." },
  { id:"relationships", title:"Intimate Relationships",  icon:"❤️", bg:"#3A0A1A", prompt:"Describe the relationship you want to be in.", placeholder:"e.g. I am in a committed relationship built on trust and shared goals..." },
  { id:"health",        title:"Health & Fitness",        icon:"🏃", bg:"#0A2A1A", prompt:"How do you feel in your body? What are you physically capable of?", placeholder:"e.g. I wake up with energy, run 3x per week, have completed a half-marathon..." },
  { id:"family",        title:"Family & Friends",        icon:"👥", bg:"#0A1A3A", prompt:"What does your social world look like in 4 years?", placeholder:"e.g. I see family regularly and have a small group of close, reliable friends..." },
  { id:"hobbies",       title:"Hobbies & Growth",        icon:"🎯", bg:"#2A1A05", prompt:"What skills have you built? What do you do for joy?", placeholder:"e.g. I speak conversational Spanish, play guitar, and read 20+ books a year..." },
  { id:"lifestyle",     title:"Lifestyle & Environment", icon:"🏡", bg:"#1A0A2A", prompt:"Where are you living? What does a typical day feel like?", placeholder:"e.g. I live in my own apartment, my mornings are calm and intentional..." },
];

const HABIT_SUGGESTIONS = [
  { name:"Wake up by 8:00 am",         area:"health" },
  { name:"Read for 30 mins",            area:"hobbies" },
  { name:"Exercise",                    area:"health" },
  { name:"Journal",                     area:"hobbies" },
  { name:"Limit screen time to 1 hr",   area:"lifestyle" },
  { name:"Eat well",                    area:"health" },
  { name:"Meditate",                    area:"health" },
  { name:"Cold shower",                 area:"health" },
  { name:"Study / learn something new", area:"hobbies" },
  { name:"Connect with a friend",       area:"family" },
];

const TOTAL_STEPS = 6;
const VIDEO_ID = "2xdaH5a16PA"; // YouTube Shorts

function ProgressDots({ step, total, accent }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ width:i===step?20:7, height:7, borderRadius:4, background:i<=step?accent:"rgba(255,255,255,0.15)", transition:"all 0.3s" }}/>
      ))}
    </div>
  );
}

// ── Video intro screen ────────────────────────────────────────────────────────
function VideoIntro({ onComplete }) {
  const [phase, setPhase] = useState("video"); // video | logo | done
  const [showSkip, setShowSkip] = useState(false);
  const [logoScale, setLogoScale] = useState(1);
  const [logoMoved, setLogoMoved] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const skipTimer = useRef(null);

  useEffect(() => {
    // Show skip button after 2 seconds
    skipTimer.current = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(skipTimer.current);
  }, []);

  function handleSkip() {
    clearTimeout(skipTimer.current);
    transitionToLogo();
  }

  function transitionToLogo() {
    // Fade out video
    setOpacity(0);
    setTimeout(() => {
      setPhase("logo");
      setOpacity(1);
      // After logo appears, animate it moving up
      setTimeout(() => {
        setLogoScale(0.55);
        setLogoMoved(true);
        setTimeout(() => {
          setTextVisible(true);
          setTimeout(() => {
            onComplete();
          }, 900);
        }, 600);
      }, 800);
    }, 600);
  }

  if (phase === "logo") {
    return (
      <div style={{ minHeight:"100vh", background:"#181816", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:logoMoved?"flex-start":"center", padding:"0 20px", transition:"justify-content 0.6s", paddingTop:logoMoved?60:0 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", transition:"all 0.7s cubic-bezier(0.4,0,0.2,1)", transform:`scale(${logoScale})`, opacity:opacity }}>
          <NorthstarLogo size={120} isDark={true}/>
        </div>
        {textVisible && (
          <div style={{ marginTop:16, fontSize:32, fontWeight:600, color:"#EEEDE8", fontFamily:"'DM Serif Display',serif", letterSpacing:"-0.02em", animation:"fadeIn 0.5s ease", opacity:textVisible?1:0, transition:"opacity 0.5s" }}>
            Northstar
          </div>
        )}
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#000", position:"relative", overflow:"hidden", transition:"opacity 0.6s", opacity:opacity }}>
      {/* YouTube embed - autoplay, muted for autoplay policy, fullscreen feel */}
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=0&controls=0&loop=1&playlist=${VIDEO_ID}&rel=0&modestbranding=1&playsinline=1`}
          style={{ width:"100%", height:"100%", border:"none", objectFit:"cover" }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Tap anywhere overlay — tap shows skip button */}
      <div onClick={() => setShowSkip(true)} style={{ position:"absolute", inset:0, zIndex:2 }}/>

      {/* Skip button */}
      {showSkip && (
        <button onClick={handleSkip} style={{ position:"absolute", bottom:40, right:24, zIndex:10, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:24, padding:"10px 20px", fontSize:14, color:"white", cursor:"pointer", fontFamily:"inherit", backdropFilter:"blur(4px)" }}>
          Skip →
        </button>
      )}
    </div>
  );
}

export default function Onboarding({ theme, onComplete }) {
  const [showVideo, setShowVideo]           = useState(!hasSeenVideo());
  const [splashDone, setSplashDone]         = useState(hasSeenVideo());
  const [step, setStep]                     = useState(0);
  const [username, setUsername]             = useState("");
  const [visions, setVisions]               = useState({});
  const [currentArea, setCurrentArea]       = useState(0);
  const [goalInputs, setGoalInputs]         = useState({});
  const [selectedHabits, setSelectedHabits] = useState(new Set());
  const [customHabits, setCustomHabits]     = useState([]);
  const [customHabitName, setCustomHabitName] = useState("");
  const [customHabitArea, setCustomHabitArea] = useState("health");
  const [tasks, setTasks]                   = useState([]);
  const [taskName, setTaskName]             = useState("");
  const [taskArea, setTaskArea]             = useState("health");
  const [taskDue, setTaskDue]               = useState("today");

  const T = theme;
  const areaLabels = { health:"Health & Fitness", career:"Career & Finance", hobbies:"Hobbies & Growth", relationships:"Relationships", family:"Family & Friends", lifestyle:"Lifestyle" };

  function handleVideoComplete() {
    markVideoSeen();
    setShowVideo(false);
    setSplashDone(true);
  }

  function next() { setStep(s => s + 1); }
  function back() { setStep(s => s - 1); }

  function finish() {
    setUser({ name: username.trim() || "Friend" });
    Object.entries(visions).forEach(([aId, text]) => { if(text?.trim()) saveVision(aId, text.trim()); });
    const goalsObj = {};
    AREAS.forEach(area => {
      const text = goalInputs[area.id + "_1yr"]?.trim();
      if(text) goalsObj[area.id] = { "1yr": [{ text, label:"1 year" }] };
    });
    saveGoals(goalsObj);
    HABIT_SUGGESTIONS.filter(h => selectedHabits.has(h.name)).forEach(h => addHabit(h));
    customHabits.forEach(h => addHabit(h));
    tasks.forEach(t => addTask(t));
    setOnboarded(true);
    onComplete();
  }

  function addCustomHabit() {
    if(!customHabitName.trim()) return;
    setCustomHabits(prev => [...prev, { name:customHabitName.trim(), area:customHabitArea }]);
    setCustomHabitName("");
  }

  // Show video intro first
  if (showVideo) return <VideoIntro onComplete={handleVideoComplete}/>;

  const wrap = children => (
    <div style={{ minHeight:"100vh", background:"#181816", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
      <div style={{ width:"100%", maxWidth:480 }}>{children}</div>
    </div>
  );

  // ── Step 0: Intro ─────────────────────────────────────────────────────────────
  if (step === 0) return wrap(<>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      {/* Logo at top */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:20 }}>
        <NorthstarLogo size={36} isDark={true}/>
        <span style={{ fontSize:28, fontWeight:600, color:"#EEEDE8", fontFamily:"'DM Serif Display',serif", letterSpacing:"-0.02em" }}>Northstar</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24, textAlign:"left" }}>
        {[
          { icon:null, isLogo:true, label:"Define your vision",       sub:"Who do you want to be in 4 years, across every area of life" },
          { icon:null, isGoal:true, label:"Set real goals",           sub:"Break your vision into milestones you can actually reach" },
          { icon:null, isCheck:true,label:"Build daily discipline",   sub:"Habits and tasks that move you forward, tracked every day" },
        ].map((item, i) => (
          <div key={item.label} style={{ display:"flex", gap:12, alignItems:"flex-start", background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ flexShrink:0, marginTop:1 }}>
              {i === 0 && <svg width="20" height="20" viewBox="0 0 100 100" fill="none"><path d="M50 4 L54 44 L90 50 L54 56 L50 92 L46 56 L10 50 L46 44 Z" fill="#97C459"/></svg>}
              {i === 1 && <svg width="20" height="20" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="42" stroke="#97C459" strokeWidth="8" fill="none"/><circle cx="50" cy="50" r="26" stroke="#97C459" strokeWidth="8" fill="none"/><circle cx="50" cy="50" r="8" fill="#97C459"/></svg>}
              {i === 2 && <svg width="20" height="20" viewBox="0 0 100 100" fill="none"><rect x="12" y="12" width="76" height="76" rx="10" stroke="#97C459" strokeWidth="8" fill="none"/><path d="M30 50 L44 64 L70 36" stroke="#97C459" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#EEEDE8" }}>{item.label}</div>
              <div style={{ fontSize:12, color:"#A8A7A2", marginTop:2 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <ProgressDots step={0} total={TOTAL_STEPS} accent="#97C459"/>

    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:13, fontWeight:500, color:"#A8A7A2", marginBottom:6 }}>What should we call you?</div>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Your first name"
        autoFocus
        onKeyDown={e => e.key === "Enter" && username.trim() && next()}
        style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"12px 14px", fontSize:16, color:"#EEEDE8", fontFamily:"inherit" }}
      />
    </div>
    <button onClick={next} disabled={!username.trim()} style={{ width:"100%", padding:14, background:username.trim()?"#97C459":"rgba(255,255,255,0.08)", color:username.trim()?"#1E3A08":"#6A6A66", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:username.trim()?"pointer":"default", fontFamily:"inherit", transition:"all 0.2s" }}>
      Let's begin →
    </button>
  </>);

  // ── Step 1: Vision ────────────────────────────────────────────────────────────
  if (step === 1) {
    const area = AREAS[currentArea];
    const isLast = currentArea === AREAS.length - 1;
    return wrap(<>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <button onClick={() => { if(currentArea > 0) setCurrentArea(a => a-1); else back(); }} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#A8A7A2", padding:0 }}>←</button>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:"#6A6A66", textTransform:"uppercase" }}>Step 1 of 4 — Your Vision</div>
      </div>
      <ProgressDots step={1} total={TOTAL_STEPS} accent="#97C459"/>

      {currentArea === 0 && (
        <div style={{ background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 16px", marginBottom:16, borderLeft:"3px solid #97C459", borderRadius:"0 12px 12px 0" }}>
          <p style={{ fontSize:14, color:"#EEEDE8", lineHeight:1.7, fontStyle:"italic", marginBottom:8 }}>"If you could have what you wanted and needed, what might that look like?"</p>
          <span style={{ fontSize:12, fontWeight:500, color:"#97C459" }}>— Jordan Peterson</span>
        </div>
      )}

      <div style={{ display:"flex", gap:4, marginBottom:16 }}>
        {AREAS.map((_,i) => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=currentArea?"#97C459":"rgba(255,255,255,0.1)", opacity:i<currentArea?0.5:1 }}/>)}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{area.icon}</div>
        <div>
          <h2 style={{ fontSize:18, fontWeight:600, color:"#EEEDE8" }}>{area.title}</h2>
          <p style={{ fontSize:12, color:"#6A6A66" }}>{currentArea+1} of {AREAS.length}</p>
        </div>
      </div>

      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 12px", marginBottom:14, borderLeft:"3px solid #97C459" }}>
        <p style={{ fontSize:13, color:"#A8A7A2", lineHeight:1.5 }}>{area.prompt}</p>
      </div>

      <textarea
        value={visions[area.id] || ""}
        onChange={e => setVisions(v => ({ ...v, [area.id]: e.target.value }))}
        placeholder={area.placeholder}
        style={{ width:"100%", minHeight:100, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 14px", fontSize:14, fontFamily:"inherit", color:"#EEEDE8", lineHeight:1.6, resize:"vertical", marginBottom:12 }}
      />
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => { if(!isLast) setCurrentArea(a=>a+1); else next(); }} style={{ flex:1, padding:12, background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, fontSize:14, color:"#A8A7A2", cursor:"pointer", fontFamily:"inherit" }}>Skip</button>
        <button onClick={() => { if(isLast) next(); else setCurrentArea(a=>a+1); }} style={{ flex:2, padding:12, background:"#97C459", color:"#1E3A08", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          {isLast ? "Next: Goals →" : "Next area →"}
        </button>
      </div>
    </>);
  }

  // ── Step 2: Goals ─────────────────────────────────────────────────────────────
  if (step === 2) return wrap(<>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#A8A7A2", padding:0 }}>←</button>
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:"#6A6A66", textTransform:"uppercase" }}>Step 2 of 4 — Goals</div>
    </div>
    <ProgressDots step={2} total={TOTAL_STEPS} accent="#97C459"/>
    <h2 style={{ fontSize:20, fontWeight:600, color:"#EEEDE8", marginBottom:6 }}>Set your 1-year goals</h2>
    <p style={{ fontSize:13, color:"#A8A7A2", marginBottom:6, lineHeight:1.5 }}>For each life area, set one concrete target for this year.</p>
    <div style={{ background:"rgba(151,196,89,0.1)", border:"0.5px solid rgba(151,196,89,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:10 }}>
      <span style={{ fontSize:15, flexShrink:0 }}>💡</span>
      <p style={{ fontSize:12, color:"#A8A7A2", lineHeight:1.5 }}>You can add <strong style={{color:"#97C459"}}>6-month</strong> and <strong style={{color:"#97C459"}}>custom timeframe goals</strong> anytime from the Goals screen.</p>
    </div>
    {AREAS.map(area => {
      const key = area.id + "_1yr";
      return (
        <div key={area.id} style={{ background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:10, marginBottom:10, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:"0.5px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width:28, height:28, borderRadius:6, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{area.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#EEEDE8" }}>{area.title}</div>
              {visions[area.id] && <div style={{ fontSize:11, color:"#6A6A66", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{visions[area.id].slice(0,50)}…</div>}
            </div>
          </div>
          <div style={{ padding:"10px 14px" }}>
            <input
              value={goalInputs[key] || ""}
              onChange={e => setGoalInputs(g => ({ ...g, [key]: e.target.value }))}
              placeholder={`1-year goal for ${area.title.split(" & ")[0]}...`}
              style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 11px", fontSize:13, color:"#EEEDE8", fontFamily:"inherit" }}
            />
          </div>
        </div>
      );
    })}
    <button onClick={next} style={{ width:"100%", marginTop:8, padding:14, background:"#97C459", color:"#1E3A08", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Next: Habits →</button>
    <button onClick={next} style={{ width:"100%", marginTop:8, padding:10, background:"none", border:"none", fontSize:13, color:"#6A6A66", cursor:"pointer", fontFamily:"inherit" }}>Skip for now</button>
  </>);

  // ── Step 3: Habits ────────────────────────────────────────────────────────────
  if (step === 3) {
    const allHabits = [...HABIT_SUGGESTIONS.map(h => ({...h, isCustom:false})), ...customHabits.map(h => ({...h, isCustom:true}))];
    return wrap(<>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#A8A7A2", padding:0 }}>←</button>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:"#6A6A66", textTransform:"uppercase" }}>Step 3 of 4 — Daily Habits</div>
      </div>
      <ProgressDots step={3} total={TOTAL_STEPS} accent="#97C459"/>
      <h2 style={{ fontSize:20, fontWeight:600, color:"#EEEDE8", marginBottom:6 }}>Choose your daily habits</h2>
      <p style={{ fontSize:13, color:"#A8A7A2", marginBottom:4, lineHeight:1.5 }}>These show up every single day. Choose carefully.</p>
      <p style={{ fontSize:12, color:"#97C459", marginBottom:16, fontWeight:500 }}>{selectedHabits.size + customHabits.length} selected</p>
      {allHabits.map((h, i) => {
        const isSel = h.isCustom ? true : selectedHabits.has(h.name);
        return (
          <div key={h.name+i} onClick={() => { if(h.isCustom) return; setSelectedHabits(s => { const n=new Set(s); isSel?n.delete(h.name):n.add(h.name); return n; }); }}
            style={{ display:"flex", alignItems:"center", gap:12, background:isSel?"rgba(151,196,89,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${isSel?"#97C459":"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"12px 14px", marginBottom:8, cursor:"pointer", transition:"all 0.15s", userSelect:"none" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${isSel?"#97C459":"rgba(255,255,255,0.2)"}`, background:isSel?"#97C459":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
              {isSel && <span style={{ color:"#1E3A08", fontSize:12 }}>✓</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#EEEDE8" }}>{h.name}</div>
              <div style={{ fontSize:11, color:"#6A6A66", marginTop:1 }}>{areaLabels[h.area] || h.area}</div>
            </div>
            {h.isCustom && <button onClick={e => { e.stopPropagation(); setCustomHabits(prev => prev.filter((_,j) => j !== i - HABIT_SUGGESTIONS.length)); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#6A6A66", fontSize:14 }}>✕</button>}
          </div>
        );
      })}
      <div style={{ background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#A8A7A2", marginBottom:8 }}>Add a custom habit</div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <input value={customHabitName} onChange={e => setCustomHabitName(e.target.value)} onKeyDown={e => e.key==="Enter" && addCustomHabit()} placeholder="e.g. Practice guitar" style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#EEEDE8", fontFamily:"inherit" }}/>
          <button onClick={addCustomHabit} style={{ padding:"8px 14px", background:"#97C459", color:"#1E3A08", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add</button>
        </div>
        <select value={customHabitArea} onChange={e => setCustomHabitArea(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:"#EEEDE8", fontFamily:"inherit" }}>
          {Object.entries(areaLabels).map(([id,lbl]) => <option key={id} value={id}>{lbl}</option>)}
        </select>
      </div>
      <button onClick={next} style={{ width:"100%", padding:14, background:"#97C459", color:"#1E3A08", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Next: Tasks →</button>
    </>);
  }

  // ── Step 4: Tasks ─────────────────────────────────────────────────────────────
  if (step === 4) return wrap(<>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={back} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#A8A7A2", padding:0 }}>←</button>
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:"#6A6A66", textTransform:"uppercase" }}>Step 4 of 4 — First Tasks</div>
    </div>
    <ProgressDots step={4} total={TOTAL_STEPS} accent="#97C459"/>
    <h2 style={{ fontSize:20, fontWeight:600, color:"#EEEDE8", marginBottom:6 }}>Add your first tasks</h2>
    <p style={{ fontSize:13, color:"#A8A7A2", marginBottom:18, lineHeight:1.5 }}>Tasks are one-off things to get done. Unlike habits they don't repeat every day.</p>
    {tasks.map((t, i) => (
      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"11px 14px", marginBottom:8 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#7AAEDF", flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:"#EEEDE8" }}>{t.name}</div>
          <div style={{ fontSize:11, color:"#6A6A66" }}>Due: {t.due}</div>
        </div>
        <button onClick={() => setTasks(ts => ts.filter((_,j) => j!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:"#6A6A66", fontSize:14 }}>✕</button>
      </div>
    ))}
    <div style={{ background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
      <input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task name..." style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 11px", fontSize:13, color:"#EEEDE8", fontFamily:"inherit", marginBottom:8 }}/>
      <select value={taskArea} onChange={e => setTaskArea(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:"#EEEDE8", fontFamily:"inherit", marginBottom:8 }}>
        {Object.entries(areaLabels).map(([id,lbl]) => <option key={id} value={id}>{lbl}</option>)}
      </select>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        {[["today","Today"],["this week","This week"],["end of month","This month"]].map(([val,lbl]) => (
          <div key={val} onClick={() => setTaskDue(val)} style={{ padding:"5px 11px", borderRadius:20, fontSize:12, border:`1px solid ${taskDue===val?"#7AAEDF":"rgba(255,255,255,0.12)"}`, color:taskDue===val?"#7AAEDF":"#A8A7A2", background:taskDue===val?"rgba(122,174,223,0.15)":"rgba(255,255,255,0.04)", cursor:"pointer", userSelect:"none" }}>{lbl}</div>
        ))}
      </div>
      <button onClick={() => { if(taskName.trim()){ setTasks(ts => [...ts, {name:taskName.trim(),area:taskArea,due:taskDue}]); setTaskName(""); }}} style={{ width:"100%", padding:10, background:"#7AAEDF", color:"#0A2E50", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add task</button>
    </div>
    <button onClick={next} style={{ width:"100%", padding:14, background:"#97C459", color:"#1E3A08", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
      {tasks.length > 0 ? "Finish setup →" : "Skip for now →"}
    </button>
  </>);

  // ── Step 5: Done ──────────────────────────────────────────────────────────────
  if (step === 5) return wrap(<>
    <ProgressDots step={5} total={TOTAL_STEPS} accent="#97C459"/>
    <div style={{ textAlign:"center" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
        <NorthstarLogo size={72} isDark={true}/>
      </div>
      <h1 style={{ fontSize:26, fontWeight:600, color:"#EEEDE8", marginBottom:12, fontFamily:"'DM Serif Display',serif" }}>You're all set, {username || "friend"}.</h1>
      <p style={{ fontSize:15, color:"#A8A7A2", lineHeight:1.7, marginBottom:16 }}>Your vision is set. Your goals are defined. Your habits are chosen.</p>
      <p style={{ fontSize:14, color:"#6A6A66", lineHeight:1.6, marginBottom:12, fontStyle:"italic" }}>"The secret to your existence is right in front of you — it manifests as all the things you know you should do but are avoiding."</p>
      <p style={{ fontSize:13, color:"#97C459", fontWeight:500, marginBottom:36 }}>— Jordan Peterson</p>
      <button onClick={finish} style={{ width:"100%", padding:16, background:"#97C459", color:"#1E3A08", border:"none", borderRadius:12, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Start my journey →</button>
    </div>
  </>);

  return null;
}
