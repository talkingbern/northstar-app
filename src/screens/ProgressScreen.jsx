import { useState, useEffect } from "react";
import {
  getHabits, getHabitLog, getTaskLog, getNotes,
  getCompletionForDay, getBestWorstHabitInRange, getBestWorstDayInRange,
  formatDate, getDaysInRange, subtractDays, today
} from "../store";

const AREA_COLORS = { health:"#3B6D11", career:"#185FA5", hobbies:"#854F0B", relationships:"#8B1A1A", family:"#0D6B5E", lifestyle:"#4B2E8A" };
const AREA_COLORS_DARK = { health:"#97C459", career:"#7AAEDF", hobbies:"#EF9F27", relationships:"#E57373", family:"#4DB6AC", lifestyle:"#B39DDB" };
const AREA_LABELS = { health:"Health & Fitness", career:"Career & Finance", hobbies:"Hobbies & Growth", relationships:"Relationships", family:"Family & Friends", lifestyle:"Lifestyle" };

// ── Pie chart SVG ─────────────────────────────────────────────────────────────
function PieChart({ pct, color, size = 52 }) {
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size < 50 ? 10 : 12} fontWeight="500" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

// ── Line graph SVG ────────────────────────────────────────────────────────────
function LineGraph({ pcts, accentColor }) {
  const W = 320, H = 110, PAD = { t:10, r:10, b:24, l:28 };
  const gW = W - PAD.l - PAD.r, gH = H - PAD.t - PAD.b;
  const n = pcts.length;
  if (n < 2) return <div style={{ height: 60, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#888" }}>Not enough data yet</div>;
  const gridColor = "rgba(128,128,128,0.12)";
  const textColor = "rgba(128,128,128,0.6)";
  const px = i => PAD.l + (i / Math.max(n-1,1)) * gW;
  const py = v => PAD.t + gH - (v / 100) * gH;
  let gridLines = "", xLabels = "";
  [0,25,50,75,100].forEach(v => {
    const y = py(v);
    gridLines += `<line x1="${PAD.l}" y1="${y}" x2="${W-PAD.r}" y2="${y}" stroke="${gridColor}" stroke-width="0.5"/>`;
    gridLines += `<text x="${PAD.l-4}" y="${y}" font-size="8" fill="${textColor}" text-anchor="end" dominant-baseline="central">${v}</text>`;
  });
  const step = n<=7?1:Math.ceil(n/6);
  for (let i=0;i<n;i+=step) xLabels+=`<text x="${px(i)}" y="${H-6}" font-size="8" fill="${textColor}" text-anchor="middle">${i+1}</text>`;
  const areaPath = `M${px(0)},${py(pcts[0])} `+pcts.map((v,i)=>`L${px(i)},${py(v)}`).join(" ")+` L${px(n-1)},${py(0)} L${px(0)},${py(0)} Z`;
  const linePath = `M${px(0)},${py(pcts[0])} `+pcts.map((v,i)=>`L${px(i)},${py(v)}`).join(" ");
  const dots = pcts.map((v,i)=>`<circle cx="${px(i)}" cy="${py(v)}" r="2.5" fill="${accentColor}"/>`).join("");
  return (
    <div dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
      <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25"/><stop offset="100%" stop-color="${accentColor}" stop-opacity="0.02"/></linearGradient></defs>
      ${gridLines}<path d="${areaPath}" fill="url(#lg2)"/><path d="${linePath}" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}${xLabels}
    </svg>` }} />
  );
}

// ── History screen ────────────────────────────────────────────────────────────
function HistoryScreen({ theme, onBack }) {
  const [tab, setTab] = useState("daily");
  const [selectedItem, setSelectedItem] = useState(null);
  const S = theme;
  const todayStr = today();

  const habits = getHabits();
  const habitLog = getHabitLog();
  const taskLog = getTaskLog();
  const notes = getNotes();

  function habitColor(h) { return S.isDark ? (AREA_COLORS_DARK[h.area]||"#97C459") : (AREA_COLORS[h.area]||"#3B6D11"); }

  // Build last 30 days
  function getLast30Days() {
    return Array.from({length:30},(_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-i);
      return formatDate(d);
    }).reverse();
  }

  // Build last 8 weeks
  function getLast8Weeks() {
    const weeks = [];
    for (let w=7;w>=0;w--) {
      const end = new Date(); end.setDate(end.getDate()-w*7);
      const start = new Date(end); start.setDate(start.getDate()-6);
      const startStr = formatDate(start), endStr = formatDate(end);
      const days = getDaysInRange(startStr, endStr);
      const label = `${start.getDate()} ${start.toLocaleString("default",{month:"short"})}`;
      weeks.push({ startStr, endStr, days, label });
    }
    return weeks;
  }

  // Build last 6 months
  function getLast6Months() {
    const months = [];
    for (let m=5;m>=0;m--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-m);
      const year = d.getFullYear(), month = d.getMonth();
      const startStr = `${year}-${String(month+1).padStart(2,"0")}-01`;
      const endD = new Date(year, month+1, 0);
      const endStr = formatDate(endD);
      const label = d.toLocaleString("default",{month:"short",year:"numeric"});
      const days = getDaysInRange(startStr, endStr);
      months.push({ startStr, endStr, days, label });
    }
    return months;
  }

  function getDayStats(dateStr) {
    const dayLog = habitLog[dateStr]||{};
    const done = habits.filter(h=>dayLog[h.id]).length;
    const pct = habits.length>0 ? Math.round((done/habits.length)*100) : 0;
    const tasksCompleted = taskLog[dateStr]||[];
    const dayNotes = notes.filter(n=>n.date===dateStr);
    const habitDetails = habits.map(h=>({...h, done:!!dayLog[h.id], color:habitColor(h)}));
    return { pct, done, total:habits.length, tasksCompleted, dayNotes, habitDetails };
  }

  function getRangeStats(days) {
    if (!days.length||!habits.length) return { pct:0, best:null, worst:null, bestDay:null, worstDay:null, dailyPcts:[] };
    const startStr = days[0], endStr = days[days.length-1];
    const { best, worst } = getBestWorstHabitInRange(startStr, endStr);
    const { best:bestDay, worst:worstDay } = getBestWorstDayInRange(startStr, endStr);
    const dailyPcts = days.map(d=>getCompletionForDay(d));
    const avgPct = Math.round(dailyPcts.reduce((a,b)=>a+b,0)/dailyPcts.length);
    return { pct:avgPct, best, worst, bestDay, worstDay, dailyPcts };
  }

  const pctColor = (pct) => pct>=75 ? S.accent : pct>=40 ? S.amber : "#C0392B";

  // ── Daily tab ──────────────────────────────────────────────────────────────
  const DailyTab = () => {
    const days30 = getLast30Days();
    const selected = selectedItem;
    return (
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, padding:"14px 16px 8px" }}>Last 30 days — tap a day</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, padding:"0 16px" }}>
          {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:10, color:S.textHint, paddingBottom:4 }}>{d}</div>)}
          {/* offset — May 2026 starts Thursday (offset 3) */}
          {Array.from({length:3}).map((_,i)=><div key={"off"+i} />)}
          {days30.map(dateStr=>{
            const pct = getCompletionForDay(dateStr);
            const isFuture = dateStr > todayStr;
            const isSelected = selected===dateStr;
            const col = pctColor(pct);
            return (
              <div key={dateStr} onClick={()=>!isFuture&&setSelectedItem(isSelected?null:dateStr)} style={{ aspectRatio:"1", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2, cursor:isFuture?"default":"pointer", background:isSelected?S.accent:isFuture?"transparent":S.card, border:`0.5px solid ${isSelected?S.accent:S.border}`, opacity:isFuture?0.25:1 }}>
                <span style={{ fontSize:10, fontWeight:500, color:isSelected?S.accentBg:S.textPrimary }}>{new Date(dateStr+"T12:00").getDate()}</span>
                {!isFuture&&habits.length>0&&<div style={{ width:5, height:5, borderRadius:"50%", background:isSelected?S.accentBg:col }} />}
              </div>
            );
          })}
        </div>
        {selected&&(()=>{
          const { pct, done, total, tasksCompleted, dayNotes, habitDetails } = getDayStats(selected);
          const dateObj = new Date(selected+"T12:00");
          const label = dateObj.toLocaleDateString("default",{weekday:"long",month:"long",day:"numeric"});
          return (
            <div style={{ margin:"14px 16px 0", background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:500, color:S.textPrimary }}>{label}</div>
                  <div style={{ fontSize:12, color:S.textSecondary, marginTop:2 }}>{done} of {total} habits · {pct}% completion</div>
                </div>
                <PieChart pct={pct} color={pctColor(pct)} size={56} />
              </div>
              <div style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.08em", color:S.textHint, marginBottom:8 }}>Habits</div>
              {habitDetails.map(h=>(
                <div key={h.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:h.done?h.color:S.missDot, border:h.done?"none":`1px solid ${S.missBorder}`, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:h.done?S.textPrimary:S.textHint, textDecoration:h.done?"none":"line-through" }}>{h.name}</span>
                </div>
              ))}
              {tasksCompleted.length>0&&<>
                <div style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.08em", color:S.textHint, margin:"10px 0 8px" }}>Tasks completed</div>
                {tasksCompleted.map((t,i)=><div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><span style={{ fontSize:12, color:S.accent }}>✓</span><span style={{ fontSize:13, color:S.textPrimary }}>{t.name}</span></div>)}
              </>}
              {dayNotes.length>0&&<>
                <div style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.08em", color:S.textHint, margin:"10px 0 8px" }}>Notes</div>
                {dayNotes.map(n=><div key={n.id} style={{ fontSize:13, color:S.textSecondary, fontStyle:"italic", padding:"8px 10px", background:S.surface, borderRadius:6, marginBottom:5, lineHeight:1.5 }}>{n.text}</div>)}
              </>}
            </div>
          );
        })()}
      </div>
    );
  };

  // ── Weekly tab ─────────────────────────────────────────────────────────────
  const WeeklyTab = () => {
    const weeks = getLast8Weeks();
    const selected = selectedItem;
    return (
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, padding:"14px 16px 8px" }}>Last 8 weeks — tap a week</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"0 16px" }}>
          {weeks.map(w=>{
            const { pct } = getRangeStats(w.days);
            const isSelected = selected===w.startStr;
            const col = pctColor(pct);
            return (
              <div key={w.startStr} onClick={()=>setSelectedItem(isSelected?null:w.startStr)} style={{ background:isSelected?S.accent:S.card, border:`0.5px solid ${isSelected?S.accent:S.border}`, borderRadius:10, padding:"10px 0", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", gap:6 }}>
                <PieChart pct={pct} color={isSelected?S.accentBg:col} size={48} />
                <span style={{ fontSize:10, color:isSelected?S.accentBg:S.textSecondary }}>{w.label}</span>
              </div>
            );
          })}
        </div>
        {selected&&(()=>{
          const week = weeks.find(w=>w.startStr===selected);
          if (!week) return null;
          const { pct, best, worst, bestDay, worstDay, dailyPcts } = getRangeStats(week.days);
          const endObj = new Date(week.endStr+"T12:00");
          const startObj = new Date(week.startStr+"T12:00");
          const label = `${startObj.toLocaleDateString("default",{month:"short",day:"numeric"})} – ${endObj.toLocaleDateString("default",{month:"short",day:"numeric"})}`;
          return (
            <div style={{ margin:"14px 16px 0", background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, padding:16 }}>
              <div style={{ fontSize:15, fontWeight:500, color:S.textPrimary, marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:12, color:S.textSecondary, marginBottom:14 }}>{pct}% average completion</div>
              {/* Day pies for the week */}
              <div style={{ display:"flex", gap:8, marginBottom:14, justifyContent:"space-between" }}>
                {week.days.map((d,i)=>{
                  const dayPct = getCompletionForDay(d);
                  const dayLabel = new Date(d+"T12:00").toLocaleDateString("default",{weekday:"short"});
                  return (
                    <div key={d} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <PieChart pct={dayPct} color={pctColor(dayPct)} size={36} />
                      <span style={{ fontSize:9, color:S.textHint }}>{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {[{label:"🏆 Best habit", val:best?`${best.habit.name} (${best.pct}%)`:"-"},
                  {label:"📉 Worst habit",val:worst?`${worst.habit.name} (${worst.pct}%)`:"-"},
                  {label:"⭐ Best day",   val:bestDay?`${new Date(bestDay.date+"T12:00").toLocaleDateString("default",{weekday:"short"})} (${bestDay.pct}%)`:"-"},
                  {label:"😓 Worst day",  val:worstDay?`${new Date(worstDay.date+"T12:00").toLocaleDateString("default",{weekday:"short"})} (${worstDay.pct}%)`:"-"},
                ].map(s=>(
                  <div key={s.label} style={{ background:S.surface, borderRadius:8, padding:"10px 11px" }}>
                    <div style={{ fontSize:11, color:S.textHint, marginBottom:3 }}>{s.label}</div>
                    <div style={{ fontSize:12, fontWeight:500, color:S.textPrimary, lineHeight:1.3 }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ── Monthly tab ────────────────────────────────────────────────────────────
  const MonthlyTab = () => {
    const months = getLast6Months();
    const selected = selectedItem;
    return (
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, padding:"14px 16px 8px" }}>Last 6 months — tap a month</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"0 16px" }}>
          {months.map(m=>{
            const { pct } = getRangeStats(m.days);
            const isSelected = selected===m.startStr;
            const col = pctColor(pct);
            return (
              <div key={m.startStr} onClick={()=>setSelectedItem(isSelected?null:m.startStr)} style={{ background:isSelected?S.accent:S.card, border:`0.5px solid ${isSelected?S.accent:S.border}`, borderRadius:10, padding:"12px 0", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", gap:8 }}>
                <PieChart pct={pct} color={isSelected?S.accentBg:col} size={52} />
                <span style={{ fontSize:11, color:isSelected?S.accentBg:S.textSecondary }}>{m.label}</span>
              </div>
            );
          })}
        </div>
        {selected&&(()=>{
          const month = months.find(m=>m.startStr===selected);
          if(!month) return null;
          const { pct, best, worst, bestDay, worstDay, dailyPcts } = getRangeStats(month.days);
          // Weekly pies within the month
          const weeksInMonth = [];
          for (let i=0;i<month.days.length;i+=7) weeksInMonth.push(month.days.slice(i,i+7));
          return (
            <div style={{ margin:"14px 16px 0", background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, padding:16 }}>
              <div style={{ fontSize:15, fontWeight:500, color:S.textPrimary, marginBottom:4 }}>{month.label}</div>
              <div style={{ fontSize:12, color:S.textSecondary, marginBottom:14 }}>{pct}% average completion</div>
              {/* Weekly pies */}
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                {weeksInMonth.map((wDays,i)=>{
                  const wPcts = wDays.map(d=>getCompletionForDay(d));
                  const wAvg = Math.round(wPcts.reduce((a,b)=>a+b,0)/wPcts.length);
                  return (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <PieChart pct={wAvg} color={pctColor(wAvg)} size={52} />
                      <span style={{ fontSize:10, color:S.textHint }}>Wk {i+1}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[{label:"🏆 Best habit", val:best?`${best.habit.name} (${best.pct}%)`:"-"},
                  {label:"📉 Worst habit",val:worst?`${worst.habit.name} (${worst.pct}%)`:"-"},
                  {label:"⭐ Best day",   val:bestDay?`${new Date(bestDay.date+"T12:00").toLocaleDateString("default",{month:"short",day:"numeric"})} (${bestDay.pct}%)`:"-"},
                  {label:"😓 Worst day",  val:worstDay?`${new Date(worstDay.date+"T12:00").toLocaleDateString("default",{month:"short",day:"numeric"})} (${worstDay.pct}%)`:"-"},
                ].map(s=>(
                  <div key={s.label} style={{ background:S.surface, borderRadius:8, padding:"10px 11px" }}>
                    <div style={{ fontSize:11, color:S.textHint, marginBottom:3 }}>{s.label}</div>
                    <div style={{ fontSize:12, fontWeight:500, color:S.textPrimary, lineHeight:1.3 }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div style={{ background:S.bg, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:S.textPrimary, padding:0, lineHeight:1 }}>←</button>
          <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>History</h1>
        </div>
        <p style={{ fontSize:13, color:S.textSecondary, marginLeft:34 }}>Tap any period to see your stats</p>
      </div>
      <div style={{ display:"flex", background:S.card, borderBottom:`0.5px solid ${S.border}` }}>
        {[["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>{setTab(id);setSelectedItem(null);}} style={{ flex:1, padding:"10px 0", textAlign:"center", fontSize:13, fontWeight:500, color:tab===id?S.accent:S.textHint, borderBottom:`2px solid ${tab===id?S.accent:"transparent"}`, cursor:"pointer", userSelect:"none" }}>{lbl}</div>
        ))}
      </div>
      {tab==="daily"&&<DailyTab />}
      {tab==="weekly"&&<WeeklyTab />}
      {tab==="monthly"&&<MonthlyTab />}
      <div style={{ height:24 }} />
    </div>
  );
}

// ── Main Progress screen ──────────────────────────────────────────────────────
export default function ProgressScreen({ theme }) {
  const [tab, setTab] = useState("week");
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState(null);
  const S = theme;

  useEffect(() => {
    setHabits(getHabits());
    setHabitLog(getHabitLog());
  }, []);

  if (showHistory) return <HistoryScreen theme={theme} onBack={()=>setShowHistory(false)} />;

  function habitColor(h) { return S.isDark?(AREA_COLORS_DARK[h.area]||"#97C459"):(AREA_COLORS[h.area]||"#3B6D11"); }
  function areaFill(area) { return S.isDark?(AREA_COLORS_DARK[area]||"#97C459"):(AREA_COLORS[area]||"#3B6D11"); }

  function getRange() {
    const t = today();
    if (tab==="week") return { start:subtractDays(6), end:t, days:7 };
    return { start:subtractDays(29), end:t, days:30 };
  }

  const { start, end } = getRange();
  const rangeDays = getDaysInRange(start, end);

  function getStats() {
    let total=0, done=0;
    if (!habits.length) return { pct:0, done:0, total:0, bestStreak:0, bestName:"—" };
    rangeDays.forEach(d=>{ habits.forEach(h=>{ total++; if(habitLog[d]&&habitLog[d][h.id]) done++; }); });
    const pct = total>0?Math.round((done/total)*100):0;
    let bestStreak=0, bestName="—";
    habits.forEach(h=>{
      let s=0;
      const allDays = Object.keys(habitLog).sort();
      for(let i=allDays.length-1;i>=0;i--){ if(habitLog[allDays[i]]&&habitLog[allDays[i]][h.id]) s++; else break; }
      if(s>bestStreak){bestStreak=s;bestName=h.name;}
    });
    return { pct, done, total, bestStreak, bestName };
  }

  function getDailyPcts() {
    if (!habits.length) return rangeDays.map(()=>0);
    return rangeDays.map(d=>{ const done=habits.filter(h=>habitLog[d]&&habitLog[d][h.id]).length; return Math.round((done/habits.length)*100); });
  }

  function getAreaBreakdown() {
    const areas = {};
    habits.forEach(h=>{
      if(!areas[h.area]) areas[h.area]={done:0,total:0};
      rangeDays.forEach(d=>{ areas[h.area].total++; if(habitLog[d]&&habitLog[d][h.id]) areas[h.area].done++; });
    });
    return Object.entries(areas).map(([area,d])=>({ area, pct:d.total>0?Math.round((d.done/d.total)*100):0, label:AREA_LABELS[area]||area })).sort((a,b)=>b.pct-a.pct);
  }

  const stats = getStats();
  const dailyPcts = getDailyPcts();
  const breakdown = getAreaBreakdown();
  const accentColor = S.isDark?"#97C459":"#3B6D11";
  const periodLabel = tab==="week"?"this week":"this month";

  const hasData = habits.length > 0;

  return (
    <div>
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.12em", color:S.textHint, textTransform:"uppercase" }}>Northstar</span>
          <button onClick={S.toggleTheme} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1.5px solid ${S.themeBtnBorder}`, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:500, color:S.themeBtnText, cursor:"pointer" }}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>Progress</h1>
        <p style={{ fontSize:13, color:S.textSecondary, marginTop:1 }}>Your journey so far</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:S.card, borderBottom:`0.5px solid ${S.border}` }}>
        {[["week","This week"],["month","This month"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"10px 0", textAlign:"center", fontSize:13, fontWeight:500, color:tab===id?S.accent:S.textHint, borderBottom:`2px solid ${tab===id?S.accent:"transparent"}`, cursor:"pointer", userSelect:"none" }}>{lbl}</div>
        ))}
      </div>

      {!hasData && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:S.textHint }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
          <div style={{ fontSize:14, color:S.textSecondary }}>Start checking off habits to see your progress here.</div>
        </div>
      )}

      {hasData && (<>
        {/* Big stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"14px 16px 0" }}>
          <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, padding:14 }}>
            <div style={{ fontSize:26, fontWeight:500, color:S.textPrimary }}>{stats.pct}<span style={{ fontSize:13, color:S.textHint }}>%</span></div>
            <div style={{ fontSize:12, color:S.textSecondary, marginTop:4 }}>Habit rate {periodLabel}</div>
            <div style={{ fontSize:11, color:S.textHint, marginTop:2 }}>{stats.done} of {stats.total} completed</div>
          </div>
          <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, padding:14 }}>
            <div style={{ fontSize:26, fontWeight:500, color:S.textPrimary }}>{stats.bestStreak}<span style={{ fontSize:13, color:S.textHint }}>d</span></div>
            <div style={{ fontSize:12, color:S.textSecondary, marginTop:4 }}>Best streak</div>
            <div style={{ fontSize:11, color:S.textHint, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{stats.bestName}</div>
          </div>
        </div>

        {/* History button */}
        <div style={{ margin:"10px 16px 0" }}>
          <button onClick={()=>setShowHistory(true)} style={{ width:"100%", padding:"11px 14px", background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", fontFamily:"inherit" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <span style={{ fontSize:18 }}>📅</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary }}>View history</div>
                <div style={{ fontSize:11, color:S.textHint }}>Daily, weekly & monthly breakdown</div>
              </div>
            </div>
            <span style={{ fontSize:16, color:S.textHint }}>›</span>
          </button>
        </div>

        {/* Line graph */}
        <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"10px 16px 0", padding:14 }}>
          <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, marginBottom:12 }}>Daily completion — last {tab==="week"?"7":"30"} days</div>
          <LineGraph pcts={dailyPcts} accentColor={accentColor} />
        </div>

        {/* Habit summaries */}
        <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"10px 16px 0", padding:14 }}>
          <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, marginBottom:4 }}>Habits</div>
          {habits.map((h,i)=>{
            const last7 = Array.from({length:7},(_,j)=>{ const d=new Date();d.setDate(d.getDate()-6+j);const key=formatDate(d);return !!(habitLog[key]&&habitLog[key][h.id]); });
            let streak=0;
            const allDays=Object.keys(habitLog).sort();
            for(let j=allDays.length-1;j>=0;j--){if(habitLog[allDays[j]]&&habitLog[allDays[j]][h.id])streak++;else break;}
            const color=habitColor(h);
            const isExpanded=expandedHabit===h.id;

            // Stats for expanded view
            const slicePct = rangeDays.length>0?Math.round(rangeDays.filter(d=>habitLog[d]&&habitLog[d][h.id]).length/rangeDays.length*100):0;
            let best=0,cur=0;
            Object.keys(habitLog).sort().forEach(d=>{if(habitLog[d]&&habitLog[d][h.id]){cur++;best=Math.max(best,cur);}else cur=0;});

            return (
              <div key={h.id} style={{ borderBottom:i<habits.length-1?`0.5px solid ${S.border}`:"none" }}>
                <div onClick={()=>setExpandedHabit(isExpanded?null:h.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", cursor:"pointer" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                  <div style={{ flex:1, fontSize:13, color:S.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.name}</div>
                  <div style={{ display:"flex", gap:3 }}>
                    {last7.map((d,j)=><div key={j} style={{ width:10, height:10, borderRadius:2, background:d?color:S.missDot, border:d?"none":`1px solid ${S.missBorder}` }} />)}
                  </div>
                  <span style={{ fontSize:11, color:S.textHint, marginLeft:4, whiteSpace:"nowrap" }}>{streak}d</span>
                  <span style={{ fontSize:13, color:S.textHint, transition:"transform 0.2s", transform:isExpanded?"rotate(180deg)":"none" }}>⌄</span>
                </div>
                {isExpanded&&(
                  <div style={{ padding:"8px 0 12px 18px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                      {[{n:`${slicePct}%`,l:periodLabel},{n:`${streak}d`,l:"Current streak"},{n:`${best}d`,l:"Best streak"}].map(s=>(
                        <div key={s.l} style={{ background:S.surface, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                          <div style={{ fontSize:16, fontWeight:500, color:S.textPrimary }}>{s.n}</div>
                          <div style={{ fontSize:10, color:S.textSecondary, marginTop:2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:S.textSecondary, marginBottom:5 }}>Last 30 days</div>
                    <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                      {Array.from({length:30},(_,j)=>{ const d=new Date();d.setDate(d.getDate()-29+j);const key=formatDate(d);const done=!!(habitLog[key]&&habitLog[key][h.id]); return <div key={j} style={{ width:14, height:14, borderRadius:3, background:done?color:S.missDot, border:done?"none":`1px solid ${S.missBorder}` }} />; })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Area breakdown */}
        {breakdown.length>0&&(
          <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"10px 16px 0", padding:14 }}>
            <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary, marginBottom:10 }}>Completion by life area</div>
            {breakdown.map(a=>(
              <div key={a.area} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:S.textSecondary, marginBottom:4 }}>
                  <span>{a.label}</span><span>{a.pct}%</span>
                </div>
                <div style={{ height:6, background:S.surface, borderRadius:3 }}>
                  <div style={{ height:6, borderRadius:3, background:areaFill(a.area), width:`${a.pct}%`, transition:"width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Goal progress */}
        <div style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:12, margin:"10px 16px 0", padding:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:tooltipVisible?8:12 }}>
            <div style={{ fontSize:13, fontWeight:500, color:S.textPrimary }}>Goal progress</div>
            <button onClick={()=>setTooltipVisible(v=>!v)} style={{ width:16, height:16, borderRadius:"50%", border:`1px solid ${S.borderMed}`, background:"none", fontSize:10, color:S.textHint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit", fontWeight:500 }}>?</button>
          </div>
          {tooltipVisible&&(
            <div style={{ background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:12, color:S.textSecondary, lineHeight:1.5, marginBottom:12 }}>
              Progress is calculated from the daily completion rate of habits linked to each goal {periodLabel}. The more consistently you show up, the higher your goal progress.
            </div>
          )}
          {breakdown.length===0 ? (
            <div style={{ fontSize:13, color:S.textHint }}>Set your goals on the Goals screen to see progress here.</div>
          ):(
            breakdown.map(a=>{
              const fill = areaFill(a.area);
              return (
                <div key={a.area} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:30, height:30, borderRadius:7, background:S.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                    {{health:"🏃",career:"💼",hobbies:"🎯",relationships:"❤️",family:"👥",lifestyle:"🏡"}[a.area]||"⭐"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, color:S.textPrimary }}>{a.label}</div>
                    <div style={{ height:4, background:S.surface, borderRadius:2, marginTop:5 }}>
                      <div style={{ height:4, borderRadius:2, background:fill, width:`${a.pct}%`, transition:"width 0.4s" }} />
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:S.textHint, flexShrink:0, minWidth:28, textAlign:"right" }}>{a.pct}%</div>
                </div>
              );
            })
          )}
        </div>
      </>)}
      <div style={{ height:16 }} />
    </div>
  );
}
