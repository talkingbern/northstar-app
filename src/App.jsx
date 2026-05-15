import { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import VisionScreen from "./screens/VisionScreen";
import GoalsScreen from "./screens/GoalsScreen";
import HabitsScreen from "./screens/HabitsScreen";
import ProgressScreen from "./screens/ProgressScreen";
import InspirationScreen from "./screens/InspirationScreen";
import SettingsScreen from "./screens/SettingsScreen";
import {
  isOnboarded, getThemePref, setThemePref, getUser,
  getDueMessages, markMessageRead, shouldShowWeeklyCheckin,
  addWeeklyCheckin, getVision, getOnboardingScore
} from "./store";

const NAV = [
  { id:"vision",   label:"Vision",   icon:"👁"  },
  { id:"goals",    label:"Goals",    icon:"🎯"  },
  { id:"habits",   label:"Today",    icon:"✓"   },
  { id:"progress", label:"Progress", icon:"📈"  },
  { id:"inspire",  label:"Inspire",  icon:"⚡"  },
];

const VISION_AREAS = [
  {id:"career",title:"Career & Finance"},
  {id:"relationships",title:"Relationships"},
  {id:"health",title:"Health & Fitness"},
  {id:"family",title:"Family & Friends"},
  {id:"hobbies",title:"Hobbies & Growth"},
  {id:"lifestyle",title:"Lifestyle"},
];

export default function App() {
  const [onboarded, setOnboarded]         = useState(null);
  const [screen, setScreen]               = useState("habits");
  const [isDark, setIsDark]               = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [dueMessage, setDueMessage]       = useState(null);
  const [showCheckin, setShowCheckin]     = useState(false);
  const [checkinRating, setCheckinRating] = useState(null);
  const [checkinNote, setCheckinNote]     = useState("");
  const [visionReminder, setVisionReminder] = useState(null);

  useEffect(() => {
    setIsDark(getThemePref());
    const ob = isOnboarded();
    setOnboarded(ob);
    if (ob) {
      // Check for due future messages
      const due = getDueMessages();
      if (due.length > 0) setDueMessage(due[0]);
      // Check for weekly check-in
      else if (shouldShowWeeklyCheckin()) setShowCheckin(true);
      // Vision reminder — show a random filled vision area
      else {
        const vision = getVision();
        const filled = VISION_AREAS.filter(a => vision[a.id]?.length > 10);
        if (filled.length > 0) {
          const pick = filled[Math.floor(Math.random() * filled.length)];
          setVisionReminder({ area: pick.title, text: vision[pick.id] });
        }
      }
    }
  }, []);

  function toggleTheme() { const n=!isDark; setIsDark(n); setThemePref(n); }

  const theme = {
    isDark, toggleTheme,
    bg:            isDark?"#181816":"#F4F3EF",
    card:          isDark?"#222220":"#FFFFFF",
    surface:       isDark?"#2A2A28":"#EEEDE8",
    border:        isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.09)",
    borderMed:     isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.16)",
    textPrimary:   isDark?"#EEEDE8":"#1C1C1A",
    textSecondary: isDark?"#A8A7A2":"#5F5E5A",
    textHint:      isDark?"#6A6A66":"#9A9890",
    accent:        isDark?"#97C459":"#3B6D11",
    accentBg:      isDark?"#1E3A08":"#EAF3DE",
    accentTxt:     isDark?"#C0DD97":"#27500A",
    blue:          isDark?"#7AAEDF":"#185FA5",
    blueBg:        isDark?"#0A2E50":"#E6F1FB",
    amber:         isDark?"#EF9F27":"#854F0B",
    amberBg:       isDark?"#3A2005":"#FAEEDA",
    themeBtnBorder:isDark?"#97C459":"rgba(0,0,0,0.22)",
    themeBtnText:  isDark?"#97C459":"#1C1C1A",
    navBg:         isDark?"#222220":"#FFFFFF",
    missDot:       isDark?"#555552":"#B0ADA8",
    missBorder:    isDark?"#777774":"#8A8780",
  };

  const T = theme;

  if (onboarded===null) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:40}}>🌟</span>
    </div>
  );

  if (!onboarded) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <Onboarding theme={T} onComplete={()=>{setOnboarded(true);setScreen("habits");}}/>
    </>
  );

  const SCREENS = {
    vision:   <VisionScreen   theme={T} navigate={setScreen} onOpenSettings={()=>setShowSettings(true)}/>,
    goals:    <GoalsScreen    theme={T} navigate={setScreen}/>,
    habits:   <HabitsScreen   theme={T} navigate={setScreen} onOpenSettings={()=>setShowSettings(true)}/>,
    progress: <ProgressScreen theme={T} navigate={setScreen}/>,
    inspire:  <InspirationScreen theme={T} navigate={setScreen}/>,
  };

  const score = getOnboardingScore();

  return (
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>

      {/* Future message overlay */}
      {dueMessage && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:T.card,borderRadius:16,padding:24,maxWidth:400,width:"100%"}}>
            <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.1em",color:T.accent,marginBottom:8}}>A message from your past self</div>
            <div style={{fontSize:12,color:T.textHint,marginBottom:12}}>Written on {dueMessage.createdAt}</div>
            <div style={{fontSize:16,color:T.textPrimary,lineHeight:1.65,fontStyle:"italic",marginBottom:20}}>"{dueMessage.message}"</div>
            <button onClick={()=>{markMessageRead(dueMessage.id);setDueMessage(null);}} style={{width:"100%",padding:12,background:T.accent,color:T.accentBg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Weekly check-in overlay */}
      {showCheckin && !dueMessage && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:T.card,borderRadius:"16px 16px 0 0",padding:24,width:"100%",maxWidth:480}}>
            <div style={{fontSize:18,fontWeight:600,color:T.textPrimary,marginBottom:4}}>Weekly check-in 🌟</div>
            <div style={{fontSize:13,color:T.textSecondary,marginBottom:20}}>How was your week overall?</div>
            <div style={{display:"flex",gap:10,marginBottom:16,justifyContent:"center"}}>
              {[1,2,3,4,5].map(r=>(
                <div key={r} onClick={()=>setCheckinRating(r)} style={{width:48,height:48,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",background:checkinRating===r?T.accent:T.surface,border:`1px solid ${checkinRating===r?T.accent:T.border}`,transition:"all 0.15s"}}>
                  {["😞","😕","😐","🙂","🌟"][r-1]}
                </div>
              ))}
            </div>
            <textarea value={checkinNote} onChange={e=>setCheckinNote(e.target.value)} placeholder="Any thoughts on the week? (optional)" style={{width:"100%",background:T.surface,border:`0.5px solid ${T.borderMed}`,borderRadius:8,padding:"10px 12px",fontSize:13,fontFamily:"inherit",color:T.textPrimary,minHeight:70,resize:"vertical",marginBottom:12}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowCheckin(false)} style={{padding:"10px 16px",background:"none",border:`0.5px solid ${T.borderMed}`,borderRadius:8,fontSize:13,color:T.textSecondary,cursor:"pointer",fontFamily:"inherit"}}>Skip</button>
              <button onClick={()=>{if(checkinRating){addWeeklyCheckin({rating:checkinRating,note:checkinNote});setShowCheckin(false);}}} style={{flex:1,padding:10,background:T.accent,color:T.accentBg,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save check-in</button>
            </div>
          </div>
        </div>
      )}

      {/* Vision reminder banner */}
      {visionReminder && !dueMessage && !showCheckin && screen==="habits" && (
        <div style={{background:T.surface,borderBottom:`0.5px solid ${T.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,justifyContent:"space-between"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.accent,marginBottom:2}}>Your {visionReminder.area} vision</div>
            <div style={{fontSize:12,color:T.textSecondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>{visionReminder.text}</div>
          </div>
          <button onClick={()=>setVisionReminder(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.textHint,fontSize:16,flexShrink:0,padding:0}}>✕</button>
        </div>
      )}

      {/* Onboarding completion score */}
      {score < 100 && !showSettings && (
        <div onClick={()=>setShowSettings(true)} style={{background:T.isDark?"#1E3A08":"#EAF3DE",padding:"8px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderBottom:`0.5px solid ${T.border}`}}>
          <div style={{flex:1,height:4,background:T.border,borderRadius:2}}>
            <div style={{height:4,borderRadius:2,background:T.accent,width:`${score}%`,transition:"width 0.4s"}}/>
          </div>
          <span style={{fontSize:12,color:T.accent,fontWeight:500,whiteSpace:"nowrap"}}>{score}% set up</span>
        </div>
      )}

      {showSettings ? (
        <SettingsScreen theme={T} onBack={()=>setShowSettings(false)}/>
      ) : (
        <div style={{paddingBottom:72}}>{SCREENS[screen]}</div>
      )}

      {!showSettings && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,borderTop:`0.5px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 16px",zIndex:100,transition:"background 0.2s"}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 10px"}}>
              <span style={{fontSize:20,opacity:screen===item.id?1:0.38}}>{item.icon}</span>
              <span style={{fontSize:10,fontWeight:500,color:screen===item.id?T.accent:T.textHint}}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
