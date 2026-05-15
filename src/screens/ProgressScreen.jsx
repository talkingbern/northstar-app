import { useState, useEffect, useCallback } from "react";
import {
  getHabits, getHabitLog, getTaskLog, getNotes, getGoals,
  getCompletionForDay, getBestWorstHabitInRange, getBestWorstDayInRange,
  formatDate, getDaysInRange, subtractDays, today, getOnboardedAt, getTasks
} from "../store";

const AREA_COLORS      = { health:"#3B6D11", career:"#185FA5", hobbies:"#854F0B", relationships:"#8B1A1A", family:"#0D6B5E", lifestyle:"#4B2E8A" };
const AREA_COLORS_DARK = { health:"#97C459", career:"#7AAEDF", hobbies:"#EF9F27", relationships:"#E57373", family:"#4DB6AC", lifestyle:"#B39DDB" };
const AREA_LABELS      = { health:"Health & Fitness", career:"Career & Finance", hobbies:"Hobbies & Growth", relationships:"Relationships", family:"Family & Friends", lifestyle:"Lifestyle" };
const AREA_ICONS       = { health:"🏃", career:"💼", hobbies:"🎯", relationships:"❤️", family:"👥", lifestyle:"🏡" };

function pctColor(pct) { return pct>=75?"#3B6D11":pct>=40?"#854F0B":"#C0392B"; }
function pctColorDark(pct) { return pct>=75?"#97C459":pct>=40?"#EF9F27":"#E57373"; }

// ── Ring chart (donut) ────────────────────────────────────────────────────────
function RingChart({ pct, color, size=52, strokeWidth=5 }) {
  const r = size/2 - strokeWidth;
  const cx = size/2, cy = size/2;
  const circ = 2 * Math.PI * r;
  const dash = (pct/100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={strokeWidth}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}/>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={size<44?9:size<56?11:12} fontWeight="500" fill={color}>{pct}%</text>
    </svg>
  );
}

// ── Line graph ────────────────────────────────────────────────────────────────
function LineGraph({ pcts, accentColor }) {
  const W=320,H=110,PAD={t:10,r:10,b:24,l:28};
  const gW=W-PAD.l-PAD.r, gH=H-PAD.t-PAD.b, n=pcts.length;
  if (n<2) return <div style={{height:60,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#888"}}>Check off habits to see your trend</div>;
  const px=i=>PAD.l+(i/Math.max(n-1,1))*gW;
  const py=v=>PAD.t+gH-(v/100)*gH;
  const gc="rgba(128,128,128,0.1)", tc="rgba(128,128,128,0.5)";
  let grid="",xl="";
  [0,25,50,75,100].forEach(v=>{const y=py(v);grid+=`<line x1="${PAD.l}" y1="${y}" x2="${W-PAD.r}" y2="${y}" stroke="${gc}" stroke-width="0.5"/><text x="${PAD.l-4}" y="${y}" font-size="8" fill="${tc}" text-anchor="end" dominant-baseline="central">${v}</text>`;});
  const step=n<=7?1:Math.ceil(n/6);
  for(let i=0;i<n;i+=step) xl+=`<text x="${px(i)}" y="${H-6}" font-size="8" fill="${tc}" text-anchor="middle">${i+1}</text>`;
  const area=`M${px(0)},${py(pcts[0])} `+pcts.map((v,i)=>`L${px(i)},${py(v)}`).join(" ")+` L${px(n-1)},${py(0)} L${px(0)},${py(0)} Z`;
  const line=`M${px(0)},${py(pcts[0])} `+pcts.map((v,i)=>`L${px(i)},${py(v)}`).join(" ");
  const dots=pcts.map((v,i)=>`<circle cx="${px(i)}" cy="${py(v)}" r="2.5" fill="${accentColor}"/>`).join("");
  return <div dangerouslySetInnerHTML={{__html:`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto"><defs><linearGradient id="lg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25"/><stop offset="100%" stop-color="${accentColor}" stop-opacity="0.02"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#lg5)"/><path d="${line}" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}${xl}</svg>`}}/>;
}

// ── History screen ────────────────────────────────────────────────────────────
function HistoryScreen({ theme, onBack }) {
  const [tab, setTab]       = useState("daily");
  const [selected, setSelected] = useState(null);
  const S = theme;
  const todayStr    = today();
  const onboardedAt = getOnboardedAt() || todayStr;

  const habits   = getHabits();
  const habitLog = getHabitLog();
  const taskLog  = getTaskLog();
  const notes    = getNotes();

  function hColor(h) { return S.isDark?(AREA_COLORS_DARK[h.area]||"#97C459"):(AREA_COLORS[h.area]||"#3B6D11"); }
  function dayPctColor(pct) { return S.isDark ? pctColorDark(pct) : pctColor(pct); }

  // Matte background tint for day boxes
  function dayBoxBg(pct, isSelected, isFuture, isPreOnboarding) {
    if (isSelected) return S.accent;
    if (isFuture || isPreOnboarding) return "transparent";
    if (pct >= 75) return S.isDark ? "rgba(151,196,89,0.12)" : "rgba(59,109,17,0.08)";
    if (pct >= 40) return S.isDark ? "rgba(239,159,39,0.12)" : "rgba(133,79,11,0.08)";
    if (pct > 0)   return S.isDark ? "rgba(229,115,115,0.12)" : "rgba(192,57,43,0.08)";
    return S.card;
  }

  function getLast30Days() {
    return Array.from({length:30},(_,i)=>{ const d=new Date();d.setDate(d.getDate()-(29-i));return formatDate(d); });
  }
  function getLast8Weeks() {
    return Array.from({length:8},(_,w)=>{
      const end=new Date();end.setDate(end.getDate()-w*7);
      const start=new Date(end);start.setDate(start.getDate()-6);
      const s=formatDate(start),e=formatDate(end);
      return {startStr:s,endStr:e,days:getDaysInRange(s,e),label:`${start.getDate()} ${start.toLocaleString("default",{month:"short"})}`};
    }).reverse();
  }
  function getLast6Months() {
    return Array.from({length:6},(_,m)=>{
      const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-(5-m));
      const y=d.getFullYear(),mo=d.getMonth();
      const s=`${y}-${String(mo+1).padStart(2,"0")}-01`;
      const e=formatDate(new Date(y,mo+1,0));
      return {startStr:s,endStr:e,days:getDaysInRange(s,e),label:d.toLocaleString("default",{month:"short",year:"numeric"})};
    });
  }

  function getDayStats(dateStr) {
    const dl=habitLog[dateStr]||{};
    const done=habits.filter(h=>dl[h.id]).length;
    const pct=habits.length>0?Math.round((done/habits.length)*100):0;
    return {
      pct, done, total:habits.length,
      tasksCompleted: taskLog[dateStr]||[],
      dayNotes: notes.filter(n=>n.date===dateStr),
      habitDetails: habits.map(h=>({...h,done:!!dl[h.id],color:hColor(h)}))
    };
  }

  function getRangeStats(days) {
    // Only count days after onboarding
    const validDays = days.filter(d=>d>=onboardedAt&&d<=todayStr);
    if(!validDays.length||!habits.length) return {pct:0,best:null,worst:null,bestDay:null,worstDay:null};
    const {best,worst}=getBestWorstHabitInRange(validDays[0],validDays[validDays.length-1]);
    const {best:bestDay,worst:worstDay}=getBestWorstDayInRange(validDays[0],validDays[validDays.length-1]);
    const pcts=validDays.map(d=>getCompletionForDay(d));
    const pct=Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length);
    return {pct,best,worst,bestDay,worstDay};
  }

  const sectionLbl = label => <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"14px 16px 8px"}}>{label}</div>;

  // ── Daily tab ────────────────────────────────────────────────────────────────
  const DailyTab = () => {
    const days30 = getLast30Days();
    return (<div>
      {sectionLbl("Last 30 days — tap a day")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,padding:"0 16px"}}>
        {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:S.textHint,paddingBottom:4}}>{d}</div>)}
        {/* offset for May 2026 starting Thursday */}
        {Array.from({length:3}).map((_,i)=><div key={"o"+i}/>)}
        {days30.map(ds=>{
          const isFuture   = ds > todayStr;
          const isPreBoard = ds < onboardedAt;
          const pct        = (!isFuture && !isPreBoard) ? getCompletionForDay(ds) : 0;
          const isSel      = selected===ds;
          const col        = dayPctColor(pct);
          const bg         = dayBoxBg(pct, isSel, isFuture, isPreBoard);
          return (
            <div key={ds} onClick={()=>!isFuture&&!isPreBoard&&setSelected(isSel?null:ds)}
              style={{aspectRatio:"1",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2,cursor:(isFuture||isPreBoard)?"default":"pointer",background:bg,border:`0.5px solid ${isSel?S.accent:S.border}`,opacity:isFuture?0.2:isPreBoard?0.35:1,transition:"background 0.15s"}}>
              <span style={{fontSize:10,fontWeight:500,color:isSel?S.accentBg:S.textPrimary}}>{new Date(ds+"T12:00").getDate()}</span>
              {!isFuture&&!isPreBoard&&habits.length>0&&(
                <div style={{width:16,height:16}}>
                  <RingChart pct={pct} color={isSel?S.accentBg:col} size={16} strokeWidth={2.5}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected&&(()=>{
        const {pct,done,total,tasksCompleted,dayNotes,habitDetails}=getDayStats(selected);
        const label=new Date(selected+"T12:00").toLocaleDateString("default",{weekday:"long",month:"long",day:"numeric"});
        return (
          <div style={{margin:"14px 16px 0",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:500,color:S.textPrimary}}>{label}</div>
                <div style={{fontSize:12,color:S.textSecondary,marginTop:2}}>{done} of {total} habits · {pct}%</div>
              </div>
              <RingChart pct={pct} color={dayPctColor(pct)} size={58}/>
            </div>
            <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:S.textHint,marginBottom:8}}>Habits</div>
            {habitDetails.map(h=>(
              <div key={h.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:h.done?h.color:S.missDot,border:h.done?"none":`1px solid ${S.missBorder}`,flexShrink:0}}/>
                <span style={{fontSize:13,color:h.done?S.textPrimary:S.textHint,textDecoration:h.done?"none":"line-through"}}>{h.name}</span>
              </div>
            ))}
            {tasksCompleted.length>0&&(
              <>
                <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:S.textHint,margin:"10px 0 8px"}}>Tasks completed</div>
                {tasksCompleted.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{fontSize:12,color:S.accent}}>✓</span><span style={{fontSize:13,color:S.textPrimary}}>{t.name}</span></div>)}
              </>
            )}
            {dayNotes.length>0&&(
              <>
                <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:S.textHint,margin:"10px 0 8px"}}>Notes</div>
                {dayNotes.map(n=><div key={n.id} style={{fontSize:13,color:S.textSecondary,fontStyle:"italic",padding:"8px 10px",background:S.surface,borderRadius:6,marginBottom:5,lineHeight:1.5}}>{n.text}</div>)}
              </>
            )}
          </div>
        );
      })()}
    </div>);
  };

  // ── Weekly tab ────────────────────────────────────────────────────────────────
  const WeeklyTab = () => {
    const weeks = getLast8Weeks();
    return (<div>
      {sectionLbl("Last 8 weeks — tap a week")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 16px"}}>
        {weeks.map(w=>{
          const {pct}=getRangeStats(w.days);
          const isSel=selected===w.startStr;
          const col=dayPctColor(pct);
          return (
            <div key={w.startStr} onClick={()=>setSelected(isSel?null:w.startStr)}
              style={{background:isSel?S.accent:S.card,border:`0.5px solid ${isSel?S.accent:S.border}`,borderRadius:10,padding:"10px 0",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",gap:6}}>
              <RingChart pct={pct} color={isSel?S.accentBg:col} size={52}/>
              <span style={{fontSize:10,color:isSel?S.accentBg:S.textSecondary}}>{w.label}</span>
            </div>
          );
        })}
      </div>
      {selected&&(()=>{
        const week=weeks.find(w=>w.startStr===selected);
        if(!week) return null;
        const {pct,best,worst,bestDay,worstDay}=getRangeStats(week.days);
        const s=new Date(week.startStr+"T12:00"),e=new Date(week.endStr+"T12:00");
        const lbl=`${s.toLocaleDateString("default",{month:"short",day:"numeric"})} – ${e.toLocaleDateString("default",{month:"short",day:"numeric"})}`;
        const validDays=week.days.filter(d=>d>=onboardedAt&&d<=todayStr);
        return (
          <div style={{margin:"14px 16px 0",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:16}}>
            <div style={{fontSize:15,fontWeight:500,color:S.textPrimary,marginBottom:4}}>{lbl}</div>
            <div style={{fontSize:12,color:S.textSecondary,marginBottom:14}}>{pct}% average completion</div>
            <div style={{display:"flex",gap:6,marginBottom:14,justifyContent:"space-between"}}>
              {week.days.map(d=>{
                const isValid=d>=onboardedAt&&d<=todayStr;
                const dp=isValid?getCompletionForDay(d):0;
                const dl=new Date(d+"T12:00").toLocaleDateString("default",{weekday:"short"});
                return (
                  <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:isValid?1:0.3}}>
                    <RingChart pct={dp} color={dayPctColor(dp)} size={38}/>
                    <span style={{fontSize:9,color:S.textHint}}>{dl}</span>
                  </div>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:"🏆 Best habit",  val:best?`${best.habit.name} (${best.pct}%)`:"-"},
                {label:"📉 Worst habit", val:worst?`${worst.habit.name} (${worst.pct}%)`:"-"},
                {label:"⭐ Best day",    val:bestDay?`${new Date(bestDay.date+"T12:00").toLocaleDateString("default",{weekday:"short"})} (${bestDay.pct}%)`:"-"},
                {label:"😓 Worst day",  val:worstDay?`${new Date(worstDay.date+"T12:00").toLocaleDateString("default",{weekday:"short"})} (${worstDay.pct}%)`:"-"},
              ].map(s=>(
                <div key={s.label} style={{background:S.surface,borderRadius:8,padding:"10px 11px"}}>
                  <div style={{fontSize:11,color:S.textHint,marginBottom:3}}>{s.label}</div>
                  <div style={{fontSize:12,fontWeight:500,color:S.textPrimary,lineHeight:1.3}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>);
  };

  // ── Monthly tab ───────────────────────────────────────────────────────────────
  const MonthlyTab = () => {
    const months = getLast6Months();
    return (<div>
      {sectionLbl("Last 6 months — tap a month")}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"0 16px"}}>
        {months.map(m=>{
          const {pct}=getRangeStats(m.days);
          const isSel=selected===m.startStr;
          const col=dayPctColor(pct);
          return (
            <div key={m.startStr} onClick={()=>setSelected(isSel?null:m.startStr)}
              style={{background:isSel?S.accent:S.card,border:`0.5px solid ${isSel?S.accent:S.border}`,borderRadius:10,padding:"12px 0",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",gap:8}}>
              <RingChart pct={pct} color={isSel?S.accentBg:col} size={56}/>
              <span style={{fontSize:11,color:isSel?S.accentBg:S.textSecondary}}>{m.label}</span>
            </div>
          );
        })}
      </div>
      {selected&&(()=>{
        const month=months.find(m=>m.startStr===selected);
        if(!month) return null;
        const {pct,best,worst,bestDay,worstDay}=getRangeStats(month.days);
        const weeks=[];for(let i=0;i<month.days.length;i+=7) weeks.push(month.days.slice(i,i+7));
        return (
          <div style={{margin:"14px 16px 0",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:16}}>
            <div style={{fontSize:15,fontWeight:500,color:S.textPrimary,marginBottom:4}}>{month.label}</div>
            <div style={{fontSize:12,color:S.textSecondary,marginBottom:14}}>{pct}% average completion</div>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              {weeks.map((wDays,i)=>{
                const validDays=wDays.filter(d=>d>=onboardedAt&&d<=todayStr);
                const wp=validDays.map(d=>getCompletionForDay(d));
                const wa=wp.length>0?Math.round(wp.reduce((a,b)=>a+b,0)/wp.length):0;
                return (
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:validDays.length>0?1:0.3}}>
                    <RingChart pct={wa} color={dayPctColor(wa)} size={52}/>
                    <span style={{fontSize:10,color:S.textHint}}>Wk {i+1}</span>
                  </div>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:"🏆 Best habit",  val:best?`${best.habit.name} (${best.pct}%)`:"-"},
                {label:"📉 Worst habit", val:worst?`${worst.habit.name} (${worst.pct}%)`:"-"},
                {label:"⭐ Best day",    val:bestDay?`${new Date(bestDay.date+"T12:00").toLocaleDateString("default",{month:"short",day:"numeric"})} (${bestDay.pct}%)`:"-"},
                {label:"😓 Worst day",  val:worstDay?`${new Date(worstDay.date+"T12:00").toLocaleDateString("default",{month:"short",day:"numeric"})} (${worstDay.pct}%)`:"-"},
              ].map(s=>(
                <div key={s.label} style={{background:S.surface,borderRadius:8,padding:"10px 11px"}}>
                  <div style={{fontSize:11,color:S.textHint,marginBottom:3}}>{s.label}</div>
                  <div style={{fontSize:12,fontWeight:500,color:S.textPrimary,lineHeight:1.3}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>);
  };

  return (
    <div style={{background:S.bg,minHeight:"100vh",paddingBottom:40}}>
      <div style={{background:S.card,borderBottom:`0.5px solid ${S.border}`,padding:"14px 20px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <button onClick={onBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:S.textPrimary,padding:0,lineHeight:1}}>←</button>
          <h1 style={{fontSize:22,fontWeight:500,color:S.textPrimary}}>History</h1>
        </div>
        <p style={{fontSize:13,color:S.textSecondary,marginLeft:34}}>Tap any period to see your stats</p>
      </div>
      <div style={{display:"flex",background:S.card,borderBottom:`0.5px solid ${S.border}`}}>
        {[["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>{setTab(id);setSelected(null);}} style={{flex:1,padding:"10px 0",textAlign:"center",fontSize:13,fontWeight:500,color:tab===id?S.accent:S.textHint,borderBottom:`2px solid ${tab===id?S.accent:"transparent"}`,cursor:"pointer",userSelect:"none"}}>{lbl}</div>
        ))}
      </div>
      {tab==="daily"  && <DailyTab/>}
      {tab==="weekly" && <WeeklyTab/>}
      {tab==="monthly"&& <MonthlyTab/>}
      <div style={{height:24}}/>
    </div>
  );
}

// ── Goal progress calculation ─────────────────────────────────────────────────
function calcGoalProgress(areaId, habits, habitLog, tasks, rangeDays) {
  // Habits in this area for range
  const areaHabits = habits.filter(h=>h.area===areaId);
  const habitChecks = areaHabits.reduce((s,h)=>s+rangeDays.filter(d=>habitLog[d]&&habitLog[d][h.id]).length, 0);
  const habitTotal  = areaHabits.length * rangeDays.length;

  // Tasks in this area completed vs expected
  // Expected: average completed tasks per day * 365
  const completedTasks = tasks.filter(t=>t.done && t.area===areaId).length;
  const daysSinceOnboard = rangeDays.length || 1;
  const avgTasksPerDay = completedTasks / daysSinceOnboard;
  const projectedAnnualTasks = avgTasksPerDay * 365;
  // Annual target is habit checks + projected tasks
  const annualHabitTarget = areaHabits.length * 365;
  const annualTarget = annualHabitTarget + Math.max(projectedAnnualTasks, 1);
  const annualDone   = habitChecks * (365 / Math.max(rangeDays.length, 1)) + completedTasks;

  return Math.min(100, Math.round((annualDone / annualTarget) * 100));
}

// ── Main Progress screen ──────────────────────────────────────────────────────
export default function ProgressScreen({ theme }) {
  const [tab, setTab]             = useState("week");
  const [habits, setHabits]       = useState([]);
  const [habitLog, setHabitLog]   = useState({});
  const [tasks, setTasks]         = useState([]);
  const [goals, setGoals]         = useState({});
  const [showHistory, setShowHistory]   = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [expandedHabit, setExpandedHabit]   = useState(null);
  const S = theme;

  const reload = useCallback(() => {
    setHabits(getHabits());
    setHabitLog(getHabitLog());
    setTasks(getTasks());
    setGoals(getGoals());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload, tab]);

  if (showHistory) return <HistoryScreen theme={theme} onBack={()=>{setShowHistory(false);reload();}}/>;

  function hColor(h)   { return S.isDark?(AREA_COLORS_DARK[h.area]||"#97C459"):(AREA_COLORS[h.area]||"#3B6D11"); }
  function aFill(area) { return S.isDark?(AREA_COLORS_DARK[area]||"#97C459"):(AREA_COLORS[area]||"#3B6D11"); }

  const todayStr   = today();
  const onboardedAt = getOnboardedAt() || subtractDays(30);
  const rangeStart = tab==="week" ? subtractDays(6) : subtractDays(29);
  // Only count days after onboarding
  const rangeDays  = getDaysInRange(rangeStart, todayStr).filter(d=>d>=onboardedAt);

  const totalChecks = habits.length * rangeDays.length;
  const doneChecks  = habits.reduce((s,h)=>s+rangeDays.filter(d=>habitLog[d]&&habitLog[d][h.id]).length, 0);
  const habitRate   = totalChecks>0 ? Math.round((doneChecks/totalChecks)*100) : 0;

  let bestStreak=0, bestStreakName="—";
  habits.forEach(h=>{
    let s=0;
    const allDays=Object.keys(habitLog).sort();
    for(let i=allDays.length-1;i>=0;i--){if(habitLog[allDays[i]]&&habitLog[allDays[i]][h.id]) s++; else break;}
    if(s>bestStreak){bestStreak=s;bestStreakName=h.name;}
  });

  const dailyPcts = rangeDays.map(d=>{
    const done=habits.filter(h=>habitLog[d]&&habitLog[d][h.id]).length;
    return habits.length>0?Math.round((done/habits.length)*100):0;
  });

  const areaBreakdown = (() => {
    const areas={};
    habits.forEach(h=>{
      if(!areas[h.area]) areas[h.area]={done:0,total:0};
      rangeDays.forEach(d=>{ areas[h.area].total++; if(habitLog[d]&&habitLog[d][h.id]) areas[h.area].done++; });
    });
    return Object.entries(areas).map(([area,d])=>({
      area, pct:d.total>0?Math.round((d.done/d.total)*100):0, label:AREA_LABELS[area]||area
    })).sort((a,b)=>b.pct-a.pct);
  })();

  // Goal progress per area — using proper extrapolation calculation
  const goalProgress = areaBreakdown.map(a=>{
    const areaGoals = goals[a.area] || {};
    const has1yr = (areaGoals["1yr"]||[]).length > 0;
    const has6mo = (areaGoals["6mo"]||[]).length > 0;
    const goalLabel = has1yr ? "1-year goal" : "5-year vision";
    const goalText  = has1yr
      ? (areaGoals["1yr"][0]?.text || "")
      : has6mo ? (areaGoals["6mo"][0]?.text || "") : "";
    const pct = calcGoalProgress(a.area, habits, habitLog, tasks, rangeDays);
    return { ...a, pct, goalLabel, goalText };
  });

  const accentColor = S.isDark?"#97C459":"#3B6D11";
  const hasData = habits.length > 0 && rangeDays.length > 0;
  const periodLabel = tab==="week"?"this week":"this month";

  return (
    <div>
      <div style={{background:S.card,borderBottom:`0.5px solid ${S.border}`,padding:"14px 20px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:11,fontWeight:500,letterSpacing:"0.12em",color:S.textHint,textTransform:"uppercase"}}>Northstar</span>
          <button onClick={S.toggleTheme} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1.5px solid ${S.themeBtnBorder}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:500,color:S.themeBtnText,cursor:"pointer"}}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{fontSize:22,fontWeight:500,color:S.textPrimary}}>Progress</h1>
        <p style={{fontSize:13,color:S.textSecondary,marginTop:1}}>Your journey so far</p>
      </div>

      <div style={{display:"flex",background:S.card,borderBottom:`0.5px solid ${S.border}`}}>
        {[["week","This week"],["month","This month"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>{setTab(id);setExpandedHabit(null);}} style={{flex:1,padding:"10px 0",textAlign:"center",fontSize:13,fontWeight:500,color:tab===id?S.accent:S.textHint,borderBottom:`2px solid ${tab===id?S.accent:"transparent"}`,cursor:"pointer",userSelect:"none"}}>{lbl}</div>
        ))}
      </div>

      {!hasData && (
        <div style={{textAlign:"center",padding:"40px 20px",color:S.textHint}}>
          <div style={{fontSize:32,marginBottom:12}}>📊</div>
          <div style={{fontSize:14,color:S.textSecondary}}>Check off habits on the Today screen to see your progress here.</div>
        </div>
      )}

      {hasData && (<>
        {/* Big stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"14px 16px 0"}}>
          <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:26,fontWeight:500,color:S.textPrimary}}>{habitRate}<span style={{fontSize:13,color:S.textHint}}>%</span></div>
            <div style={{fontSize:12,color:S.textSecondary,marginTop:4}}>Habit rate {periodLabel}</div>
            <div style={{fontSize:11,color:S.textHint,marginTop:2}}>{doneChecks} of {totalChecks} completed</div>
          </div>
          <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:26,fontWeight:500,color:S.textPrimary}}>{bestStreak}<span style={{fontSize:13,color:S.textHint}}>d</span></div>
            <div style={{fontSize:12,color:S.textSecondary,marginTop:4}}>Best streak</div>
            <div style={{fontSize:11,color:S.textHint,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bestStreakName}</div>
          </div>
        </div>

        {/* History button */}
        <div style={{margin:"10px 16px 0"}}>
          <button onClick={()=>setShowHistory(true)} style={{width:"100%",padding:"11px 14px",background:S.card,border:`0.5px solid ${S.borderMed}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontFamily:"inherit"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:18}}>📅</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:500,color:S.textPrimary}}>View history</div>
                <div style={{fontSize:11,color:S.textHint}}>Daily, weekly & monthly breakdown</div>
              </div>
            </div>
            <span style={{fontSize:16,color:S.textHint}}>›</span>
          </button>
        </div>

        {/* Line graph */}
        <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"10px 16px 0",padding:14}}>
          <div style={{fontSize:13,fontWeight:500,color:S.textPrimary,marginBottom:12}}>Daily completion — last {tab==="week"?"7":"30"} days</div>
          <LineGraph pcts={dailyPcts} accentColor={accentColor}/>
        </div>

        {/* Habit summaries */}
        <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"10px 16px 0",padding:14}}>
          <div style={{fontSize:13,fontWeight:500,color:S.textPrimary,marginBottom:4}}>Habits</div>
          {habits.map((h,i)=>{
            const last7=Array.from({length:7},(_,j)=>{const d=new Date();d.setDate(d.getDate()-6+j);const k=formatDate(d);return !!(habitLog[k]&&habitLog[k][h.id]);});
            let streak=0;
            const allDays=Object.keys(habitLog).sort();
            for(let j=allDays.length-1;j>=0;j--){if(habitLog[allDays[j]]&&habitLog[allDays[j]][h.id])streak++;else break;}
            const color=hColor(h), isExp=expandedHabit===h.id;
            const slicePct=rangeDays.length>0?Math.round(rangeDays.filter(d=>habitLog[d]&&habitLog[d][h.id]).length/rangeDays.length*100):0;
            let best=0,cur=0;
            Object.keys(habitLog).sort().forEach(d=>{if(habitLog[d]&&habitLog[d][h.id]){cur++;best=Math.max(best,cur);}else cur=0;});
            return (
              <div key={h.id} style={{borderBottom:i<habits.length-1?`0.5px solid ${S.border}`:"none"}}>
                <div onClick={()=>setExpandedHabit(isExp?null:h.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <div style={{flex:1,fontSize:13,color:S.textPrimary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</div>
                  <div style={{display:"flex",gap:3}}>
                    {last7.map((d,j)=><div key={j} style={{width:10,height:10,borderRadius:2,background:d?color:S.missDot,border:d?"none":`1px solid ${S.missBorder}`}}/>)}
                  </div>
                  <span style={{fontSize:11,color:S.textHint,marginLeft:4,whiteSpace:"nowrap"}}>{streak}d</span>
                  <span style={{fontSize:13,color:S.textHint,transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"none"}}>⌄</span>
                </div>
                {isExp&&(
                  <div style={{padding:"8px 0 12px 18px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                      {[{n:`${slicePct}%`,l:periodLabel},{n:`${streak}d`,l:"Current streak"},{n:`${best}d`,l:"Best streak"}].map(s=>(
                        <div key={s.l} style={{background:S.surface,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontSize:16,fontWeight:500,color:S.textPrimary}}>{s.n}</div>
                          <div style={{fontSize:10,color:S.textSecondary,marginTop:2}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:S.textSecondary,marginBottom:5}}>Last 30 days</div>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {Array.from({length:30},(_,j)=>{const d=new Date();d.setDate(d.getDate()-29+j);const k=formatDate(d);const done=!!(habitLog[k]&&habitLog[k][h.id]);return <div key={j} style={{width:14,height:14,borderRadius:3,background:done?color:S.missDot,border:done?"none":`1px solid ${S.missBorder}`}}/>;  })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Area breakdown — habit completion only */}
        {areaBreakdown.length>0&&(
          <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"10px 16px 0",padding:14}}>
            <div style={{fontSize:13,fontWeight:500,color:S.textPrimary,marginBottom:10}}>Habit completion by area</div>
            {areaBreakdown.map(a=>(
              <div key={a.area} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:S.textSecondary,marginBottom:4}}><span>{a.label}</span><span>{a.pct}%</span></div>
                <div style={{height:6,background:S.surface,borderRadius:3}}><div style={{height:6,borderRadius:3,background:aFill(a.area),width:`${a.pct}%`,transition:"width 0.4s"}}/></div>
              </div>
            ))}
          </div>
        )}

        {/* Goal progress — separate, with proper calculation */}
        <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"10px 16px 0",padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:tooltipVisible?8:12}}>
            <div style={{fontSize:13,fontWeight:500,color:S.textPrimary}}>Progress toward goals</div>
            <button onClick={()=>setTooltipVisible(v=>!v)} style={{width:16,height:16,borderRadius:"50%",border:`1px solid ${S.borderMed}`,background:"none",fontSize:10,color:S.textHint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",fontWeight:500}}>?</button>
          </div>
          {tooltipVisible&&(
            <div style={{background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:12,color:S.textSecondary,lineHeight:1.5,marginBottom:12}}>
              Progress is estimated by extrapolating your current habit completion rate and task completion to a full year, then comparing that to what would be needed to reach your goal. It updates as you complete more habits and tasks.
            </div>
          )}
          {goalProgress.length===0
            ? <div style={{fontSize:13,color:S.textHint}}>Set goals on the Goals screen and complete habits to see progress here.</div>
            : goalProgress.map(a=>(
              <div key={a.area} style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:7,background:S.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{AREA_ICONS[a.area]||"⭐"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:12,color:S.textPrimary,fontWeight:500}}>{a.label}</div>
                      <div style={{fontSize:11,color:S.textHint,flexShrink:0,marginLeft:8}}>{a.pct}%</div>
                    </div>
                    <div style={{fontSize:10,color:S.accent,marginTop:1,marginBottom:4}}>→ {a.goalLabel}</div>
                    {a.goalText&&<div style={{fontSize:11,color:S.textHint,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{a.goalText}</div>}
                    <div style={{height:4,background:S.surface,borderRadius:2}}><div style={{height:4,borderRadius:2,background:aFill(a.area),width:`${a.pct}%`,transition:"width 0.4s"}}/></div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </>)}
      <div style={{height:16}}/>
    </div>
  );
}
