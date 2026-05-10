import { useState, useEffect } from "react";
import { getHabits, getTasks, addTask, deleteTask, completeTask, uncompleteTask, toggleHabitForDay, getHabitLog, today } from "../store";

const AREAS = [
  { id:"health",        label:"Health & Fitness",  color:"#3B6D11", darkColor:"#97C459" },
  { id:"career",        label:"Career & Finance",  color:"#185FA5", darkColor:"#7AAEDF" },
  { id:"hobbies",       label:"Hobbies & Growth",  color:"#854F0B", darkColor:"#EF9F27" },
  { id:"relationships", label:"Relationships",      color:"#8B1A1A", darkColor:"#E57373" },
  { id:"family",        label:"Family & Friends",  color:"#0D6B5E", darkColor:"#4DB6AC" },
  { id:"lifestyle",     label:"Lifestyle",         color:"#4B2E8A", darkColor:"#B39DDB" },
];

export default function HabitsScreen({ theme, navigate, onOpenSettings }) {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskArea, setTaskArea] = useState("health");
  const [taskDue, setTaskDue] = useState("today");
  const [taskDate, setTaskDate] = useState("");

  const todayStr = today();
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

  useEffect(() => { reload(); }, []);

  function reload() {
    setHabits(getHabits());
    setTasks(getTasks());
    setHabitLog(getHabitLog());
  }

  function areaColor(id) { const a=AREAS.find(x=>x.id===id); return a?(theme.isDark?a.darkColor:a.color):theme.accent; }
  function areaLabel(id) { return AREAS.find(x=>x.id===id)?.label||id; }
  function isHabitDone(id) { return !!(habitLog[todayStr]&&habitLog[todayStr][id]); }

  function handleToggleHabit(id) {
    toggleHabitForDay(id, todayStr, !isHabitDone(id));
    reload();
  }

  function handleCompleteTask(id) { completeTask(id); reload(); }
  function handleUncompleteTask(id) { uncompleteTask(id); reload(); }
  function handleDeleteTask(id) { deleteTask(id); reload(); }

  function handleAddTask() {
    if (!taskName.trim()) return;
    addTask({ name:taskName.trim(), area:taskArea, due:taskDue==="date"?(taskDate||"custom"):taskDue });
    setTaskName(""); setTaskArea("health"); setTaskDue("today"); setTaskDate("");
    setShowTaskForm(false);
    reload();
  }

  const activeTasks = tasks.filter(t=>!t.done);
  const completedToday = tasks.filter(t=>t.done&&t.completedAt===todayStr);
  const doneHabits = habits.filter(h=>isHabitDone(h.id)).length;
  const doneTasks = completedToday.length;
  const total = habits.length + activeTasks.length;
  const done = doneHabits + doneTasks;
  const pct = total>0?Math.round((done/total)*100):0;
  const bestStreak = Math.max(0,...habits.map(h=>h.streak||0));
  const S = theme;

  return (
    <div>
      <div style={{ background:S.card, borderBottom:`0.5px solid ${S.border}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.12em", color:S.textHint, textTransform:"uppercase" }}>Northstar</span>
          <button onClick={S.toggleTheme} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1.5px solid ${S.themeBtnBorder}`, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:500, color:S.themeBtnText, cursor:"pointer" }}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{ fontSize:22, fontWeight:500, color:S.textPrimary }}>Today</h1>
        <p style={{ fontSize:13, color:S.textSecondary, marginTop:1 }}>{dayName} · {done} of {total} complete</p>
      </div>

      {/* Progress bar */}
      <div style={{ padding:"12px 16px 4px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:S.textSecondary, marginBottom:5 }}>
          <span>Today's progress</span><span>{pct}%</span>
        </div>
        <div style={{ height:5, background:S.border, borderRadius:3 }}>
          <div style={{ height:5, borderRadius:3, background:S.accent, width:`${pct}%`, transition:"width 0.35s" }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, margin:"10px 16px 4px" }}>
        {[{n:`${doneHabits}/${habits.length}`,l:"Habits"},{n:`${doneTasks}/${activeTasks.length+doneTasks}`,l:"Tasks"},{n:`${bestStreak}d`,l:"Best streak"}].map(s=>(
          <div key={s.l} style={{ background:S.surface, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:18, fontWeight:500, color:S.textPrimary }}>{s.n}</div>
            <div style={{ fontSize:10, color:S.textSecondary, marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Habits */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"14px 20px 7px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>My Habits</span>
        <button onClick={onOpenSettings} style={{ fontSize:12, color:S.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>Edit in Settings →</button>
      </div>

      {habits.length===0 && (
        <div style={{ textAlign:"center", padding:"16px", color:S.textHint, fontSize:13 }}>
          No habits yet —{" "}
          <span onClick={onOpenSettings} style={{ color:S.accent, cursor:"pointer", textDecoration:"underline" }}>go to Settings to add habits</span>
        </div>
      )}

      {habits.map(h=>{
        const color = areaColor(h.area);
        const isDone = isHabitDone(h.id);
        return (
          <div key={h.id} style={{ background:S.card, border:`0.5px solid ${S.border}`, borderLeft:`3px solid ${color}`, borderRadius:10, margin:"0 16px 7px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:11, padding:"11px 13px" }}>
              <div onClick={()=>handleToggleHabit(h.id)} style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${isDone?color:S.borderMed}`, background:isDone?color:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}>
                {isDone&&<span style={{ color:"white", fontSize:12 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:isDone?S.textHint:S.textPrimary, textDecoration:isDone?"line-through":"none" }}>{h.name}</div>
                <div style={{ display:"flex", gap:6, marginTop:3, alignItems:"center" }}>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:S.surface, color:S.textSecondary }}>{areaLabel(h.area)}</span>
                  <span style={{ fontSize:11, color:S.textHint }}>🔥 {(h.streak||0)>0?`${h.streak}d streak`:"Start today"}</span>
                </div>
              </div>
              {/* No trash icon — deletion is in Settings only */}
            </div>
          </div>
        );
      })}

      {/* Tasks */}
      <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"14px 20px 7px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>Tasks</span>
        <button onClick={()=>setShowTaskForm(v=>!v)} style={{ fontSize:12, color:S.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
          {showTaskForm?"✕ Cancel":"+ Add task"}
        </button>
      </div>

      {showTaskForm && (
        <div style={{ background:S.card, border:`0.5px solid ${S.borderMed}`, borderRadius:10, margin:"0 16px 10px", padding:"13px 14px" }}>
          <input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="Task name..." onKeyDown={e=>e.key==="Enter"&&handleAddTask()} autoFocus style={{ width:"100%", background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"10px 11px", fontSize:13, fontFamily:"inherit", color:S.textPrimary, marginBottom:8 }} />
          <select value={taskArea} onChange={e=>setTaskArea(e.target.value)} style={{ width:"100%", background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 10px", fontSize:12, fontFamily:"inherit", color:S.textPrimary, marginBottom:8 }}>
            {AREAS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <div style={{ fontSize:11, color:S.textHint, marginBottom:6 }}>Due</div>
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[["today","Today"],["this week","This week"],["end of month","This month"],["date","Pick date"]].map(([val,lbl])=>(
              <div key={val} onClick={()=>setTaskDue(val)} style={{ padding:"5px 11px", borderRadius:20, fontSize:12, border:`1px solid ${taskDue===val?S.blue:S.borderMed}`, color:taskDue===val?S.blue:S.textSecondary, background:taskDue===val?S.blueBg:S.surface, cursor:"pointer", userSelect:"none", transition:"all 0.15s" }}>{lbl}</div>
            ))}
          </div>
          {taskDue==="date"&&<input type="date" value={taskDate} onChange={e=>setTaskDate(e.target.value)} style={{ width:"100%", background:S.surface, border:`0.5px solid ${S.borderMed}`, borderRadius:8, padding:"9px 11px", fontSize:13, fontFamily:"inherit", color:S.textPrimary, marginBottom:10 }} />}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{setShowTaskForm(false);setTaskName("");}} style={{ padding:"10px 14px", background:"none", border:`0.5px solid ${S.borderMed}`, borderRadius:8, fontSize:13, color:S.textSecondary, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleAddTask} style={{ flex:1, padding:10, background:S.blue, color:S.blueBg, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Add task</button>
          </div>
        </div>
      )}

      {activeTasks.length===0&&!showTaskForm&&<div style={{ textAlign:"center", padding:"14px", color:S.textHint, fontSize:13 }}>No tasks — tap + Add task above.</div>}

      {activeTasks.map(t=>{
        const color = areaColor(t.area);
        return (
          <div key={t.id} style={{ background:S.card, border:`0.5px solid ${S.border}`, borderLeft:`3px solid ${color}`, borderRadius:10, margin:"0 16px 7px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"11px 13px" }}>
              <div onClick={()=>handleCompleteTask(t.id)} style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${S.borderMed}`, background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, marginTop:2 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:S.textPrimary }}>{t.name}</div>
                <div style={{ fontSize:11, color:S.textHint, marginTop:3 }}>📅 {t.due} · <span style={{ fontSize:10, padding:"1px 6px", borderRadius:20, background:S.surface, color:S.textSecondary }}>{areaLabel(t.area)}</span></div>
              </div>
              <button onClick={()=>handleDeleteTask(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:S.textHint, fontSize:14 }}>🗑</button>
            </div>
          </div>
        );
      })}

      {completedToday.length>0&&(<>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", color:S.textHint, textTransform:"uppercase", padding:"10px 20px 7px" }}>Completed today</div>
        {completedToday.map(t=>(
          <div key={t.id} style={{ background:S.card, border:`0.5px solid ${S.border}`, borderRadius:10, margin:"0 16px 7px", opacity:0.6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 13px" }}>
              <div onClick={()=>handleUncompleteTask(t.id)} style={{ width:18, height:18, borderRadius:4, background:S.blue, border:`1.5px solid ${S.blue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <span style={{ color:"white", fontSize:10 }}>✓</span>
              </div>
              <div style={{ flex:1, fontSize:13, color:S.textHint, textDecoration:"line-through" }}>{t.name}</div>
            </div>
          </div>
        ))}
      </>)}
      <div style={{ height:16 }} />
    </div>
  );
}
