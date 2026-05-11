import { useState, useEffect } from "react";
import { getVision } from "../store";

const AREAS = [
  { id:"career",        title:"Career & Finance",        icon:"💼", bg:"#EAF3DE", empty:"Tap ⚙️ Settings to set your vision for this area." },
  { id:"relationships", title:"Intimate Relationships",  icon:"❤️", bg:"#FBEAF0", empty:"Tap ⚙️ Settings to set your vision for this area." },
  { id:"health",        title:"Health & Fitness",        icon:"🏃", bg:"#E1F5EE", empty:"Tap ⚙️ Settings to set your vision for this area." },
  { id:"family",        title:"Family & Friends",        icon:"👥", bg:"#E6F1FB", empty:"Tap ⚙️ Settings to set your vision for this area." },
  { id:"hobbies",       title:"Hobbies & Growth",        icon:"🎯", bg:"#FAEEDA", empty:"Tap ⚙️ Settings to set your vision for this area." },
  { id:"lifestyle",     title:"Lifestyle & Environment", icon:"🏡", bg:"#EEEDFE", empty:"Tap ⚙️ Settings to set your vision for this area." },
];

export default function VisionScreen({ theme, onOpenSettings }) {
  const [visions, setVisions] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const S = theme;

  useEffect(() => { setVisions(getVision()); }, []);

  const completed = AREAS.filter(a => visions[a.id]?.length > 5).length;

  return (
    <div>
      {/* Header */}
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.12em", color:S.textHint, textTransform:"uppercase" }}>Northstar</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={S.toggleTheme} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1.5px solid ${S.themeBtnBorder}`, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:500, color:S.themeBtnText, cursor:"pointer" }}>
              {S.isDark?"☀️ Light":"🌙 Dark"}
            </button>
            <button onClick={onOpenSettings} style={{ width:32, height:32, borderRadius:"50%", background:S.surface, border:`0.5px solid ${S.borderMed}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer" }}>⚙️</button>
          </div>
        </div>
        <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>My Vision</h1>
        <p style={{ fontSize:13, color:S.textSecondary, marginTop:2 }}>Who do you want to be in 5 years?</p>
        <div style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:S.textSecondary, marginBottom:5 }}>
            <span>Vision complete</span><span>{completed} of 6 areas</span>
          </div>
          <div style={{ height:4, background:S.border, borderRadius:2 }}>
            <div style={{ height:4, background:S.accent, borderRadius:2, width:`${(completed/6)*100}%`, transition:"width 0.4s" }} />
          </div>
        </div>
      </div>

      {/* Edit prompt */}
      <div style={{ margin:"12px 16px 0", padding:"11px 14px", background:S.surface, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, color:S.textSecondary }}>Edit your vision in Settings</span>
        <button onClick={onOpenSettings} style={{ fontSize:12, fontWeight:500, color:S.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Open Settings →</button>
      </div>

      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>6 Life Areas</div>

      {AREAS.map(area=>{
        const text = visions[area.id];
        const isExpanded = expandedId===area.id;
        const hasVision = text && text.length>5;
        return (
          <div key={area.id} style={{ background:S.card, border:`0.5px solid ${hasVision?S.borderMed:S.border}`, borderRadius:12, margin:"0 16px 10px", overflow:"hidden", transition:"border-color 0.2s" }}>
            {/* Header row — tappable to expand/collapse */}
            <div onClick={()=>setExpandedId(isExpanded?null:area.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", cursor:hasVision?"pointer":"default", userSelect:"none" }}>
              <div style={{ width:34, height:34, borderRadius:8, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{area.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, color:S.textPrimary, display:"flex", alignItems:"center", gap:6 }}>
                  {area.title}
                  {hasVision&&<span style={{ width:7, height:7, borderRadius:"50%", background:S.accent, display:"inline-block", flexShrink:0 }} />}
                </div>
                <div style={{ fontSize:12, color:hasVision?S.textSecondary:S.textHint, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontStyle:hasVision?"normal":"italic" }}>
                  {hasVision ? (isExpanded ? "Tap to collapse" : text.slice(0,55)+(text.length>55?"…":"")) : "Not set yet — edit in Settings"}
                </div>
              </div>
              {hasVision&&<span style={{ fontSize:15, color:S.textHint, transform:isExpanded?"rotate(180deg)":"none", transition:"transform 0.22s", flexShrink:0 }}>⌄</span>}
            </div>
            {/* Expanded read-only view */}
            {isExpanded&&hasVision&&(
              <div style={{ padding:"0 14px 14px", borderTop:`0.5px solid ${S.border}` }}>
                <div style={{ marginTop:12, padding:"11px 13px", background:S.surface, borderRadius:8, fontSize:14, color:S.textPrimary, lineHeight:1.65 }}>
                  {text}
                </div>
                <button onClick={e=>{e.stopPropagation();onOpenSettings();}} style={{ marginTop:10, fontSize:12, color:S.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
                  Edit in Settings →
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ height:16 }} />
    </div>
  );
}
