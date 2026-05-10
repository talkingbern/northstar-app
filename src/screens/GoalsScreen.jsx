import { useState, useEffect } from "react";
import { getGoals, saveGoals, getVision } from "../store";

const AREAS = [
  { id: "career",        title: "Career & Finance",        icon: "💼", bg: "#EAF3DE" },
  { id: "relationships", title: "Intimate Relationships",  icon: "❤️", bg: "#FBEAF0" },
  { id: "health",        title: "Health & Fitness",        icon: "🏃", bg: "#E1F5EE" },
  { id: "family",        title: "Family & Friends",        icon: "👥", bg: "#E6F1FB" },
  { id: "hobbies",       title: "Hobbies & Growth",        icon: "🎯", bg: "#FAEEDA" },
  { id: "lifestyle",     title: "Lifestyle & Environment", icon: "🏡", bg: "#EEEDFE" },
];

const PH = {
  "1yr":   { career:"e.g. Land a developer role earning €40k+", health:"e.g. Complete a half-marathon under 2 hours", hobbies:"e.g. Reach conversational Spanish", relationships:"e.g. Be in a committed relationship", family:"e.g. See family at least monthly", lifestyle:"e.g. Move into my own apartment" },
  "6mo":   { career:"e.g. Build 3 portfolio projects", health:"e.g. Run 5km under 28 mins consistently", hobbies:"e.g. Complete a Spanish course", relationships:"e.g. Put myself out there", family:"e.g. Plan a family trip", lifestyle:"e.g. Save €3,000 toward moving" },
  "custom":{ career:"e.g. Present at a conference", health:"e.g. Complete a marathon event", hobbies:"e.g. Perform at an open mic", relationships:"e.g. Take a trip together", family:"e.g. Organise a family reunion", lifestyle:"e.g. Redecorate my space" },
};

const SMART_TIPS = {
  "Specific":   "Name exactly what you will achieve — avoid vague language like 'get better at'.",
  "Measurable": "Add a number: a distance, income, date, or count. If you can't measure it, you can't track it.",
  "Ambitious":  "Make it stretch you. A goal that's too easy won't motivate.",
  "Time-bound": "Attach a deadline. Deadlines create urgency and force backward planning.",
};

const TIERS = [
  { id:"1yr",   label:"1 year",   badgeBgKey:"accentBg", badgeColorKey:"accentTxt", btnBgKey:"accent",  btnColorKey:"accentBg" },
  { id:"6mo",   label:"6 months", badgeBgKey:"blueBg",   badgeColorKey:"blue",      btnBgKey:"blue",    btnColorKey:"blueBg"  },
  { id:"custom",label:"Custom",   badgeBgKey:"amberBg",  badgeColorKey:"amber",     btnBgKey:"amber",   btnColorKey:"amberBg" },
];
const DOT_COLORS = { "1yr":"accent", "6mo":"blue", "custom":"amber" };

export default function GoalsScreen({ theme }) {
  const [goals, setGoals] = useState({});
  const [visions, setVisions] = useState({});
  const [openArea, setOpenArea] = useState(null);
  const [openForms, setOpenForms] = useState({});
  const [inputs, setInputs] = useState({});
  const [customN, setCustomN] = useState({});
  const [customU, setCustomU] = useState({});
  const [activeTip, setActiveTip] = useState(null);
  const S = theme;

  useEffect(() => {
    setGoals(getGoals());
    setVisions(getVision());
  }, []);

  function getAreaGoals(aId, tier) { return (goals[aId] || {})[tier] || []; }

  function persistGoals(next) {
    setGoals(next);
    saveGoals(next);
  }

  function saveGoal(aId, tier) {
    const key = aId + tier;
    const text = (inputs[key] || "").trim();
    if (text.length < 5) return;
    const label = tier === "1yr" ? "1 year" : tier === "6mo" ? "6 months" : `${customN[aId]||"3"} ${customU[aId]||"months"}`;
    const next = { ...goals, [aId]: { ...(goals[aId]||{}), [tier]: [...getAreaGoals(aId,tier), { text, label }] }};
    persistGoals(next);
    setInputs(i => ({ ...i, [key]:"" }));
    setOpenForms(f => ({ ...f, [key]:false }));
  }

  function delGoal(aId, tier, idx) {
    const next = { ...goals, [aId]: { ...(goals[aId]||{}), [tier]: getAreaGoals(aId,tier).filter((_,i)=>i!==idx) }};
    persistGoals(next);
  }

  const totalGoals = Object.values(goals).reduce((s,a)=>s+Object.values(a).reduce((s2,arr)=>s2+arr.length,0),0);
  const activeAreas = Object.values(goals).filter(a=>Object.values(a).some(arr=>arr.length>0)).length;

  return (
    <div>
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.12em", color:S.textHint, textTransform:"uppercase" }}>Northstar</span>
          <button onClick={S.toggleTheme} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1.5px solid ${S.themeBtnBorder}`, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:500, color:S.themeBtnText, cursor:"pointer" }}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>My Goals</h1>
        <p style={{ fontSize:13, color:S.textSecondary, marginTop:2 }}>Each life area is your 5-year destination</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"14px 16px 0" }}>
        {[{num:totalGoals,lbl:"Goals set"},{num:activeAreas,lbl:"Areas active"}].map(s=>(
          <div key={s.lbl} style={{ background:S.surface, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>{s.num}</div>
            <div style={{ fontSize:12, color:S.textSecondary, marginTop:1 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"18px 20px 8px" }}>Goals by life area</div>

      {AREAS.map(area=>{
        const isOpen = openArea===area.id;
        const aGoals = goals[area.id]||{};
        const totalInArea = Object.values(aGoals).reduce((s,a)=>s+a.length,0);
        const visionText = visions[area.id];

        return (
          <div key={area.id} style={{ background:S.card, border:`0.5px solid ${isOpen?S.borderMed:S.border}`, borderRadius:12, margin:"0 16px 10px", overflow:"hidden" }}>
            <div onClick={()=>setOpenArea(isOpen?null:area.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"13px 14px", cursor:"pointer", userSelect:"none" }}>
              <div style={{ width:34, height:34, borderRadius:8, background:area.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{area.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, color:S.textPrimary }}>{area.title}</div>
                <div style={{ display:"flex", gap:4, marginTop:5, flexWrap:"wrap", alignItems:"center" }}>
                  {totalInArea===0
                    ? <span style={{ fontSize:10, color:S.textHint }}>No goals yet</span>
                    : TIERS.map(t=>getAreaGoals(area.id,t.id).map((_,i)=>(
                        <div key={t.id+i} style={{ width:7, height:7, borderRadius:"50%", background:S[DOT_COLORS[t.id]] }} />
                      )))
                  }
                  {totalInArea>0 && <span style={{ fontSize:10, color:S.textHint, marginLeft:2 }}>{totalInArea} goal{totalInArea!==1?"s":""}</span>}
                </div>
              </div>
              <span style={{ fontSize:15, color:S.textHint, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.22s", flexShrink:0 }}>⌄</span>
            </div>

            {isOpen && (
              <div style={{ borderTop:`0.5px solid ${S.border}` }}>
                {/* Vision strip */}
                <div style={{ margin:"12px 14px 0", padding:"9px 11px", background:S.surface, borderLeft:`2px solid ${S.accent}`, borderRadius:"0 6px 6px 0" }}>
                  <div style={{ fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.09em", color:S.accent, marginBottom:2 }}>5-year vision</div>
                  <p style={{ fontSize:12, color:S.textSecondary, fontStyle:"italic", lineHeight:1.5 }}>
                    {visionText || "Complete your vision on the Vision screen to see it here."}
                  </p>
                </div>

                {/* Ladder */}
                <div style={{ padding:"12px 14px 14px" }}>
                  {TIERS.map((tier,ti)=>{
                    const formKey = area.id+tier.id;
                    const isFormOpen = openForms[formKey];
                    const tierGoals = getAreaGoals(area.id,tier.id);
                    return (
                      <div key={tier.id}>
                        {ti>0 && <div style={{ display:"flex", justifyContent:"center", margin:"-2px 0" }}><div style={{ width:1, height:14, background:S.borderMed }} /></div>}
                        <div style={{ marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                            <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:500, background:S[tier.badgeBgKey], color:S[tier.badgeColorKey], whiteSpace:"nowrap" }}>{tier.label}</span>
                            <div style={{ flex:1, height:0.5, background:S.borderMed }} />
                          </div>
                          {tierGoals.map((g,i)=>(
                            <div key={i} style={{ background:S.surface, borderRadius:8, padding:"9px 11px", marginBottom:6, display:"flex", gap:9, alignItems:"flex-start" }}>
                              <div style={{ width:7, height:7, borderRadius:"50%", background:S[DOT_COLORS[tier.id]], flexShrink:0, marginTop:4 }} />
                              <div style={{ flex:1, fontSize:13, color:S.textPrimary, lineHeight:1.45 }}>{g.text}</div>
                              <button onClick={()=>delGoal(area.id,tier.id,i)} style={{ background:"none", border:"none", cursor:"pointer", color:S.textHint, fontSize:13, flexShrink:0 }}>✕</button>
                            </div>
                          ))}
                          {!isFormOpen ? (
                            <button onClick={()=>setOpenForms(f=>({...f,[formKey]:true}))} style={{ width:"100%", padding:8, background:"none", border:`0.5px dashed ${S.borderMed}`, borderRadius:8, fontSize:12, color:S.textHint, cursor:"pointer", fontFamily:"inherit" }}>
                              + Add {tier.label} goal
                            </button>
                          ):(
                            <div style={{ background:S.surface, borderRadius:8, padding:11 }}>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:9 }}>
                                {Object.keys(SMART_TIPS).map(w=>(
                                  <span key={w} onClick={()=>setActiveTip(activeTip===formKey+w?null:formKey+w)} style={{ fontSize:11, padding:"3px 9px", borderRadius:20, background:S.card, border:`0.5px solid ${S.borderMed}`, color:S.textSecondary, cursor:"pointer", userSelect:"none" }}>{w}</span>
                                ))}
                              </div>
                              {activeTip?.startsWith(formKey) && (
                                <div style={{ fontSize:12, color:S.textSecondary, background:S.card, borderRadius:6, padding:"7px 9px", marginBottom:8, borderLeft:`2px solid ${S.accent}` }}>
                                  {SMART_TIPS[activeTip.replace(formKey,"")]}
                                </div>
                              )}
                              {tier.id==="custom" && (
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                                  <span style={{ fontSize:12, color:S.textSecondary }}>Time until goal:</span>
                                  <input type="number" min={1} max={120} defaultValue={3} onChange={e=>setCustomN(n=>({...n,[area.id]:e.target.value}))} style={{ width:52, background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:6, padding:"5px 8px", fontSize:13, color:S.textPrimary, fontFamily:"inherit", textAlign:"center" }} />
                                  <select onChange={e=>setCustomU(u=>({...u,[area.id]:e.target.value}))} style={{ background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:6, padding:"5px 8px", fontSize:12, color:S.textPrimary, fontFamily:"inherit" }}>
                                    <option>weeks</option><option defaultValue>months</option><option>years</option>
                                  </select>
                                </div>
                              )}
                              <textarea
                                value={inputs[formKey]||""}
                                onChange={e=>setInputs(i=>({...i,[formKey]:e.target.value}))}
                                placeholder={PH[tier.id][area.id]||"Write your goal..."}
                                style={{ width:"100%", background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 10px", fontSize:13, fontFamily:"inherit", color:S.textPrimary, minHeight:58, resize:"vertical", lineHeight:1.5 }}
                              />
                              <div style={{ display:"flex", gap:7, marginTop:10 }}>
                                <button onClick={()=>setOpenForms(f=>({...f,[formKey]:false}))} style={{ padding:"9px 13px", background:"none", border:`0.5px solid ${S.borderMed}`, borderRadius:8, fontSize:13, color:S.textSecondary, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                                <button onClick={()=>saveGoal(area.id,tier.id)} style={{ flex:1, padding:9, background:S[tier.btnBgKey], color:S[tier.btnColorKey], border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Save goal</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ height:16 }} />
    </div>
  );
}
