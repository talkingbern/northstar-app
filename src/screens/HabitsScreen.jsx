import { useState, useEffect } from "react";
import {
  getHabits, getTasks, addTask, deleteTask, completeTask, uncompleteTask,
  toggleHabitForDay, getHabitLog, today, checkAndAddCelebration
} from "../store";

const AREAS = [
  { id:"health",        label:"Health & Fitness",  color:"#3B6D11", darkColor:"#97C459" },
  { id:"career",        label:"Career & Finance",  color:"#185FA5", darkColor:"#7AAEDF" },
  { id:"hobbies",       label:"Hobbies & Growth",  color:"#854F0B", darkColor:"#EF9F27" },
  { id:"relationships", label:"Relationships",      color:"#8B1A1A", darkColor:"#E57373" },
  { id:"family",        label:"Family & Friends",  color:"#0D6B5E", darkColor:"#4DB6AC" },
  { id:"lifestyle",     label:"Lifestyle",         color:"#4B2E8A", darkColor:"#B39DDB" },
];

export default function HabitsScreen({ theme, navigate, onOpenSettings }) {
  const [habits, setHabits]         = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [habitLog, setHabitLog]     = useState({});
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskName, setTaskName]     = useState("");
  const [taskArea, setTaskArea]     = useState("health");
  const [taskDue, setTaskDue]       = useState("today");
  const [taskDate, setTaskDate]     = useState("");
  const [celebration, setCelebration] = useState(null);
  const [shareVisible, setShareVisible] = useState(false);

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
    const wasDone = isHabitDone(id);
    toggleHabitForDay(id, todayStr, !wasDone);
    reload();
    // Check for milestone celebration after toggle
    if (!wasDone) {
      const updated = getHabits().find(h=>h.id===id);
      if (updated) {
        const milestone = checkAndAddCelebration(id, updated.streak);
        if (milestone) {
          setCelebration({ habit: updated.name, streak: milestone });
        }
      }
    }
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

  const activeTasks    = tasks.filter(t=>!t.done);
  const completedToday = tasks.filter(t=>t.done&&t.completedAt===todayStr);
  const doneHabits     = habits.filter(h=>isHabitDone(h.id)).length;
  const doneTasks      = completedToday.length;
  const total          = habits.length + activeTasks.length;
  const done           = doneHabits + doneTasks;
  const pct            = total>0?Math.round((done/total)*100):0;
  const bestStreak     = Math.max(0,...habits.map(h=>h.streak||0));
  const S = theme;

  // Empty state messages per section
  const habitEmptyMsg = habits.length===0
    ? "No habits set yet. Go to Settings to add your daily habits."
    : null;

  return (
    <div>
      {/* Milestone celebration overlay */}
      {celebration && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:S.card,borderRadius:16,padding:28,textAlign:"center",maxWidth:320,width:"100%"}}>
            <div style={{fontSize:52,marginBottom:12}}>🏆</div>
            <h2 style={{fontSize:22,fontWeight:600,color:S.textPrimary,marginBottom:8}}>{celebration.streak} day streak!</h2>
            <p style={{fontSize:14,color:S.textSecondary,lineHeight:1.6,marginBottom:20}}>You've kept up <strong>{celebration.habit}</strong> for {celebration.streak} days in a row. That's not a habit anymore — that's who you are.</p>
            <button onClick={()=>setCelebration(null)} style={{width:"100%",padding:12,background:S.accent,color:S.accentBg,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Keep going →</button>
          </div>
        </div>
      )}

      {/* Share progress overlay */}
      {shareVisible && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:S.card,borderRadius:16,padding:24,maxWidth:320,width:"100%"}}>
            <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.1em",color:S.accent,marginBottom:16}}>Your progress today</div>
            <div style={{background:S.surface,borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:28,fontWeight:600,color:S.textPrimary,marginBottom:4}}>{pct}% complete</div>
              <div style={{fontSize:13,color:S.textSecondary,marginBottom:12}}>Today · {dayName}</div>
              {habits.filter(h=>isHabitDone(h.id)).map(h=>(
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{color:S.accent,fontSize:12}}>✓</span>
                  <span style={{fontSize:13,color:S.textPrimary}}>{h.name}</span>
                  <span style={{fontSize:11,color:S.textHint,marginLeft:"auto"}}>🔥 {h.streak}d</span>
                </div>
              ))}
              <div style={{marginTop:12,fontSize:11,color:S.textHint,textAlign:"center",fontStyle:"italic"}}>Northstar App</div>
            </div>
            <p style={{fontSize:12,color:S.textHint,marginBottom:16,textAlign:"center"}}>Screenshot this to share with friends!</p>
            <button onClick={()=>setShareVisible(false)} style={{width:"100%",padding:10,background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,fontSize:13,color:S.textPrimary,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:S.card,borderBottom:`0.5px solid ${S.border}`,padding:"14px 20px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:11,fontWeight:500,letterSpacing:"0.12em",color:S.textHint,textTransform:"uppercase"}}>Northstar</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setShareVisible(true)} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",padding:0}} title="Share progress">📤</button>
            <button onClick={S.toggleTheme} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1.5px solid ${S.themeBtnBorder}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:500,color:S.themeBtnText,cursor:"pointer"}}>
              {S.isDark?"☀️ Light":"🌙 Dark"}
            </button>
          </div>
        </div>
        <h1 style={{fontSize:22,fontWeight:500,color:S.textPrimary}}>Today</h1>
        <p style={{fontSize:13,color:S.textSecondary,marginTop:1}}>{dayName} · {done} of {total} complete</p>
      </div>

      {/* Progress bar */}
      <div style={{padding:"12px 16px 4px"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:S.textSecondary,marginBottom:5}}>
          <span>Today's progress</span><span>{pct}%</span>
        </div>
        <div style={{height:5,background:S.border,borderRadius:3}}>
          <div style={{height:5,borderRadius:3,background:S.accent,width:`${pct}%`,transition:"width 0.35s"}}/>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,margin:"10px 16px 4px"}}>
        {[{n:`${doneHabits}/${habits.length}`,l:"Habits"},{n:`${doneTasks}/${activeTasks.length+doneTasks}`,l:"Tasks"},{n:`${bestStreak}d`,l:"Best streak"}].map(s=>(
          <div key={s.l} style={{background:S.surface,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:18,fontWeight:500,color:S.textPrimary}}>{s.n}</div>
            <div style={{fontSize:10,color:S.textSecondary,marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Habits */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"14px 20px 7px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>My Habits</span>
        <button onClick={onOpenSettings} style={{fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Edit in Settings →</button>
      </div>

      {habitEmptyMsg && (
        <div style={{margin:"0 16px 8px",background:S.surface,borderRadius:10,padding:"14px 16px",borderLeft:`3px solid ${S.amber}`}}>
          <div style={{fontSize:13,color:S.textSecondary}}>{habitEmptyMsg}</div>
          <button onClick={onOpenSettings} style={{marginTop:8,fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500,padding:0}}>Go to Settings →</button>
        </div>
      )}

      {habits.map(h=>{
        const color=areaColor(h.area), isDone=isHabitDone(h.id);
        return (
          <div key={h.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderLeft:`3px solid ${color}`,borderRadius:10,margin:"0 16px 7px"}}>
            <div style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px"}}>
              <div onClick={()=>handleToggleHabit(h.id)} style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${isDone?color:S.borderMed}`,background:isDone?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
                {isDone&&<span style={{color:"white",fontSize:12}}>✓</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:isDone?S.textHint:S.textPrimary,textDecoration:isDone?"line-through":"none"}}>{h.name}</div>
                <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:S.surface,color:S.textSecondary}}>{areaLabel(h.area)}</span>
                  <span style={{fontSize:11,color:S.textHint}}>🔥 {(h.streak||0)>0?`${h.streak}d streak`:"Start today"}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tasks */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"14px 20px 7px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>Tasks</span>
        <button onClick={()=>setShowTaskForm(v=>!v)} style={{fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
          {showTaskForm?"✕ Cancel":"+ Add task"}
        </button>
      </div>

      {showTaskForm && (
        <div style={{background:S.card,border:`0.5px solid ${S.borderMed}`,borderRadius:10,margin:"0 16px 10px",padding:"13px 14px"}}>
          <input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="Task name..." onKeyDown={e=>e.key==="Enter"&&handleAddTask()} autoFocus style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"10px 11px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,marginBottom:8}}/>
          <select value={taskArea} onChange={e=>setTaskArea(e.target.value)} style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"9px 10px",fontSize:12,fontFamily:"inherit",color:S.textPrimary,marginBottom:8}}>
            {AREAS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <div style={{fontSize:11,color:S.textHint,marginBottom:6}}>Due</div>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {[["today","Today"],["this week","This week"],["end of month","This month"],["date","Pick date"]].map(([val,lbl])=>(
              <div key={val} onClick={()=>setTaskDue(val)} style={{padding:"5px 11px",borderRadius:20,fontSize:12,border:`1px solid ${taskDue===val?S.blue:S.borderMed}`,color:taskDue===val?S.blue:S.textSecondary,background:taskDue===val?S.blueBg:S.surface,cursor:"pointer",userSelect:"none",transition:"all 0.15s"}}>{lbl}</div>
            ))}
          </div>
          {taskDue==="date"&&<input type="date" value={taskDate} onChange={e=>setTaskDate(e.target.value)} style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,marginBottom:10}}/>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setShowTaskForm(false);setTaskName("");}} style={{padding:"10px 14px",background:"none",border:`0.5px solid ${S.borderMed}`,borderRadius:8,fontSize:13,color:S.textSecondary,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={handleAddTask} style={{flex:1,padding:10,background:S.blue,color:S.blueBg,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Add task</button>
          </div>
        </div>
      )}

      {activeTasks.length===0&&!showTaskForm&&(
        <div style={{margin:"0 16px 8px",background:S.surface,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${S.blue}`}}>
          <div style={{fontSize:13,color:S.textSecondary}}>No tasks for today. What's one thing you could do today to move closer to your goals?</div>
          <button onClick={()=>setShowTaskForm(true)} style={{marginTop:8,fontSize:12,color:S.blue,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500,padding:0}}>+ Add a task →</button>
        </div>
      )}

      {activeTasks.map(t=>{
        const color=areaColor(t.area);
        return (
          <div key={t.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderLeft:`3px solid ${color}`,borderRadius:10,margin:"0 16px 7px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:11,padding:"11px 13px"}}>
              <div onClick={()=>handleCompleteTask(t.id)} style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${S.borderMed}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,color:S.textPrimary}}>{t.name}</div>
                <div style={{fontSize:11,color:S.textHint,marginTop:3}}>📅 {t.due} · <span style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:S.surface,color:S.textSecondary}}>{areaLabel(t.area)}</span></div>
              </div>
              <button onClick={()=>handleDeleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:S.textHint,fontSize:14}}>🗑</button>
            </div>
          </div>
        );
      })}

      {completedToday.length>0&&(<>
        <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"10px 20px 7px"}}>Completed today</div>
        {completedToday.map(t=>(
          <div key={t.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:10,margin:"0 16px 7px",opacity:0.6}}>
            <div style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px"}}>
              <div onClick={()=>handleUncompleteTask(t.id)} style={{width:18,height:18,borderRadius:4,background:S.blue,border:`1.5px solid ${S.blue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                <span style={{color:"white",fontSize:10}}>✓</span>
              </div>
              <div style={{flex:1,fontSize:13,color:S.textHint,textDecoration:"line-through"}}>{t.name}</div>
            </div>
          </div>
        ))}
      </>)}
      <div style={{height:16}}/>
    </div>
  );
}
