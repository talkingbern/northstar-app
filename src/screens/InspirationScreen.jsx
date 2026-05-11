import { useState, useEffect } from "react";
import { getNotes, addNote, deleteNote } from "../store";

const FEATURED = [
  { text:"The purpose of life is finding the largest burden that you can bear and bearing it.", author:"Jordan Peterson", tag:"Vision", gradient:["#1a3a0a","#2d5c14"] },
  { text:"You must determine where you are going in your life, because you cannot get there unless you move in that direction.", author:"Jordan Peterson", tag:"Direction", gradient:["#0a1f40","#153266"] },
  { text:"A man who has a why to live for can bear almost any how.", author:"Friedrich Nietzsche", tag:"Meaning", gradient:["#3a1a05","#6b3510"] },
  { text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", author:"Fyodor Dostoevsky", tag:"Depth", gradient:["#2a0a0a","#5a1a1a"] },
  { text:"In the middle of winter, I at last discovered that there was in me an invincible summer.", author:"Albert Camus", tag:"Resilience", gradient:["#0a2030","#1a4060"] },
];

const ALL_QUOTES = [
  { text:"You could have the worst possible past and still choose to be a good person now. And that's a miracle.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Discipline" },
  { text:"It took you a long time to develop a character that works. Don't be surprised that you can't transform yourself in an instant.", author:"Jordan Peterson", source:"Beyond Order", tag:"Patience" },
  { text:"The successful among us delay gratification. The successful among us bargain with the future.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Discipline" },
  { text:"Pursue what is meaningful, not what is expedient.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Vision" },
  { text:"The secret to your existence is right in front of you and it manifests itself as all the things you know you should do but are avoiding.", author:"Jordan Peterson", source:"Maps of Meaning", tag:"Discipline" },
  { text:"Compare yourself to who you were yesterday, not to who someone else is today.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Growth" },
  { text:"You have to treat yourself like you matter. If you don't, you won't take care of yourself.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Vision" },
  { text:"To suffer terribly and to know yourself as the author of your own suffering is perhaps the worst of all possible discoveries.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Accountability" },
  { text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", author:"Fyodor Dostoevsky", source:"Crime and Punishment", tag:"Depth" },
  { text:"The darker the night, the brighter the stars. The deeper the grief, the closer is God.", author:"Fyodor Dostoevsky", source:"Crime and Punishment", tag:"Meaning" },
  { text:"To live without hope is to cease to live.", author:"Fyodor Dostoevsky", source:"", tag:"Vision" },
  { text:"What is hell? I maintain that it is the suffering of being unable to love.", author:"Fyodor Dostoevsky", source:"The Brothers Karamazov", tag:"Depth" },
  { text:"The two most important days in your life are the day you are born and the day you find out why.", author:"Leo Tolstoy", source:"", tag:"Vision" },
  { text:"Everyone thinks of changing the world, but no one thinks of changing himself.", author:"Leo Tolstoy", source:"", tag:"Discipline" },
  { text:"The line separating good and evil passes not through states nor between classes nor between political parties — but right through every human heart.", author:"Aleksandr Solzhenitsyn", source:"The Gulag Archipelago", tag:"Depth" },
  { text:"In the middle of winter, I at last discovered that there was in me an invincible summer.", author:"Albert Camus", source:"", tag:"Resilience" },
  { text:"You will never be happy if you continue to search for what happiness consists of.", author:"Albert Camus", source:"", tag:"Meaning" },
  { text:"He who has a why to live can bear almost any how.", author:"Friedrich Nietzsche", source:"", tag:"Vision" },
  { text:"That which does not kill us makes us stronger.", author:"Friedrich Nietzsche", source:"Twilight of the Idols", tag:"Resilience" },
  { text:"Without music, life would be a mistake.", author:"Friedrich Nietzsche", source:"Twilight of the Idols", tag:"Growth" },
  { text:"You have power over your mind, not outside events. Realise this, and you will find strength.", author:"Marcus Aurelius", source:"Meditations", tag:"Discipline" },
  { text:"Waste no more time arguing about what a good man should be. Be one.", author:"Marcus Aurelius", source:"Meditations", tag:"Discipline" },
  { text:"The impediment to action advances action. What stands in the way becomes the way.", author:"Marcus Aurelius", source:"Meditations", tag:"Resilience" },
  { text:"Confine yourself to the present.", author:"Marcus Aurelius", source:"Meditations", tag:"Focus" },
  { text:"Don't stop when you're tired. Stop when you're done.", author:"David Goggins", source:"", tag:"Discipline" },
  { text:"No one is going to come help you. No one's coming to save you.", author:"David Goggins", source:"Can't Hurt Me", tag:"Accountability" },
  { text:"Discipline equals freedom.", author:"Jocko Willink", source:"", tag:"Discipline" },
  { text:"Good. The best thing that can happen is when something goes wrong. Now you get to fix it.", author:"Jocko Willink", source:"", tag:"Resilience" },
  { text:"When we are no longer able to change a situation, we are challenged to change ourselves.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Meaning" },
  { text:"Everything can be taken from a man but one thing: to choose one's attitude in any given set of circumstances.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Meaning" },
  { text:"Those who have a why to live can bear almost any how.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Vision" },
  { text:"Desire is a contract you make with yourself to be unhappy until you get what you want.", author:"Naval Ravikant", source:"", tag:"Focus" },
  { text:"Reading is the best investment you can make. You access the greatest minds that have ever lived.", author:"Naval Ravikant", source:"", tag:"Growth" },
  { text:"We are what we repeatedly do. Excellence then is not an act but a habit.", author:"Aristotle", source:"", tag:"Habits" },
  { text:"Knowing yourself is the beginning of all wisdom.", author:"Aristotle", source:"", tag:"Vision" },
  { text:"Do not go where the path may lead; go instead where there is no path and leave a trail.", author:"Ralph Waldo Emerson", source:"", tag:"Vision" },
  { text:"The chains of habit are too light to be felt until they are too heavy to be broken.", author:"Warren Buffett", source:"", tag:"Habits" },
  { text:"Long-term thinking is a competitive advantage in almost every field.", author:"Anonymous", source:"", tag:"Focus" },
  { text:"Your future self is watching you right now through your memories. Make it proud.", author:"Anonymous", source:"", tag:"Accountability" },
];

const FILTERS = ["All","Vision","Discipline","Habits","Growth","Resilience","Meaning","Depth","Focus","Accountability","Patience"];
const INITIAL_QUOTE_COUNT = 10;

const WATCH_LINKS = [
  { title:"13 Minutes To Change Your Life", sub:"Dr Jordan Peterson Clips", emoji:"🎯", url:"https://www.youtube.com/watch?v=NX2ep5fCJZ0", thumb:"https://img.youtube.com/vi/NX2ep5fCJZ0/mqdefault.jpg" },
  { title:"David Goggins — Unbreakable Mindset", sub:"On discipline and accountability", emoji:"💪", url:"https://www.youtube.com/watch?v=Bc9hOXGXiuk", thumb:"https://img.youtube.com/vi/Bc9hOXGXiuk/mqdefault.jpg" },
  { title:"Jocko Willink — Extreme Ownership", sub:"Take responsibility for everything", emoji:"⚡", url:"https://www.youtube.com/watch?v=ljqra3BcqWM", thumb:"https://img.youtube.com/vi/ljqra3BcqWM/mqdefault.jpg" },
  { title:"Viktor Frankl — Why to Believe in Others", sub:"On meaning and suffering", emoji:"🕯", url:"https://www.youtube.com/watch?v=fD1512_XJEw", thumb:"https://img.youtube.com/vi/fD1512_XJEw/mqdefault.jpg" },
];

export default function InspirationScreen({ theme }) {
  const [featIdx, setFeatIdx]         = useState(0);
  const [filter, setFilter]           = useState("All");
  const [saved, setSaved]             = useState(new Set());
  const [notes, setNotes]             = useState([]);
  const [noteText, setNoteText]       = useState("");
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const S = theme;

  useEffect(() => { setNotes(getNotes()); }, []);

  const filtered      = filter==="All" ? ALL_QUOTES : ALL_QUOTES.filter(q=>q.tag===filter);
  const visibleQuotes = showAllQuotes ? filtered : filtered.slice(0, INITIAL_QUOTE_COUNT);
  const todayQ        = ALL_QUOTES[new Date().getDay() % ALL_QUOTES.length];
  const feat          = FEATURED[featIdx];

  function toggleSaved(idx) { setSaved(s=>{const n=new Set(s);n.has(idx)?n.delete(idx):n.add(idx);return n;}); }

  function handleAddNote() {
    if (!noteText.trim()) return;
    addNote(noteText.trim());
    setNotes(getNotes());
    setNoteText("");
  }

  function handleDeleteNote(id) { deleteNote(id); setNotes(getNotes()); }

  return (
    <div>
      {/* Header */}
      <div style={{background:S.card,borderBottom:`0.5px solid ${S.border}`,padding:"14px 20px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:11,fontWeight:500,letterSpacing:"0.12em",color:S.textHint,textTransform:"uppercase"}}>Northstar</span>
          <button onClick={S.toggleTheme} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1.5px solid ${S.themeBtnBorder}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:500,color:S.themeBtnText,cursor:"pointer"}}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{fontSize:22,fontWeight:500,color:S.textPrimary}}>Inspiration</h1>
        <p style={{fontSize:13,color:S.textSecondary,marginTop:1}}>Fuel for the long road</p>
      </div>

      {/* Featured carousel */}
      <div style={{margin:"14px 16px 0"}}>
        <div onClick={()=>setFeatIdx(i=>(i+1)%FEATURED.length)} style={{borderRadius:14,padding:"22px 20px 18px",background:`linear-gradient(135deg,${feat.gradient[0]},${feat.gradient[1]})`,minHeight:175,display:"flex",flexDirection:"column",justifyContent:"space-between",cursor:"pointer",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-10,top:-16,fontSize:110,fontWeight:700,opacity:0.07,color:"white",lineHeight:1,userSelect:"none"}}>"</div>
          <div>
            <span style={{display:"inline-block",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.1em",padding:"3px 9px",borderRadius:20,background:"rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.85)",marginBottom:12}}>{feat.tag}</span>
            <div style={{fontSize:15,color:"white",lineHeight:1.65,fontStyle:"italic"}}>{feat.text}</div>
          </div>
          <div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:14,fontWeight:500}}>— {feat.author}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:3}}>Tap to see next</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
          {FEATURED.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i===featIdx?S.accent:S.border,transition:"background 0.2s"}}/>)}
        </div>
      </div>

      {/* ── NOTES — prominent, always visible ── */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>
        My Notes {notes.length>0?`(${notes.length})`:""}
      </div>
      <div style={{margin:"0 16px",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:14}}>
        <textarea
          value={noteText}
          onChange={e=>setNoteText(e.target.value)}
          placeholder="Jot down an idea, a mantra, something you read, or a thought you want to remember..."
          style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"11px 12px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,minHeight:90,resize:"vertical",lineHeight:1.55}}
        />
        <button onClick={handleAddNote} disabled={!noteText.trim()} style={{marginTop:10,padding:"9px 18px",background:noteText.trim()?S.accent:S.surface,color:noteText.trim()?S.accentBg:S.textHint,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:noteText.trim()?"pointer":"default",fontFamily:"inherit",transition:"all 0.2s"}}>
          Save note
        </button>
      </div>

      {notes.length>0&&(
        <div style={{margin:"8px 16px 0"}}>
          {notes.map(n=>(
            <div key={n.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8,borderLeft:`2px solid ${S.accent}`}}>
              <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.55}}>{n.text}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <div style={{fontSize:11,color:S.textHint}}>{n.ts}</div>
                <button onClick={()=>handleDeleteNote(n.id)} style={{background:"none",border:"none",cursor:"pointer",color:S.textHint,fontSize:13,padding:0}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote of the day */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>Quote of the day</div>
      <div style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"0 16px",padding:16}}>
        <div style={{fontSize:28,color:S.accent,lineHeight:0.8,marginBottom:8,opacity:0.4}}>"</div>
        <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{todayQ.text}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{todayQ.author}</div>
            {todayQ.source&&<div style={{fontSize:11,color:S.textHint}}>{todayQ.source}</div>}
          </div>
          <button onClick={()=>toggleSaved(-1)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:saved.has(-1)?S.accent:S.textHint}}>
            {saved.has(-1)?"★":"☆"}
          </button>
        </div>
      </div>

      {/* Watch section with thumbnails */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>Watch</div>
      {WATCH_LINKS.map(w=>(
        <a key={w.title} href={w.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:12,background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"0 16px 8px",padding:"12px 14px",textDecoration:"none"}}>
          {/* YouTube thumbnail with play button overlay */}
          <div style={{width:76,height:50,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#000",position:"relative"}}>
            <img
              src={w.thumb}
              alt={w.title}
              style={{width:"100%",height:"100%",objectFit:"cover"}}
              onError={e=>{e.target.style.display="none";}}
            />
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"white",fontSize:10,marginLeft:2}}>▶</span>
              </div>
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:500,color:S.textPrimary,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</div>
            <div style={{fontSize:11,color:S.textHint,marginTop:2}}>{w.sub}</div>
          </div>
          <span style={{fontSize:14,color:S.textHint,flexShrink:0}}>↗</span>
        </a>
      ))}

      {/* Browse quotes */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"8px 20px 8px"}}>Browse quotes</div>
      <div style={{display:"flex",gap:7,padding:"0 16px 10px",overflowX:"auto",scrollbarWidth:"none"}}>
        {FILTERS.map(f=>(
          <div key={f} onClick={()=>{setFilter(f);setShowAllQuotes(false);}} style={{whiteSpace:"nowrap",padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:500,border:`1px solid ${f===filter?S.accent:S.borderMed}`,color:f===filter?S.accentBg:S.textSecondary,background:f===filter?S.accent:S.card,cursor:"pointer",userSelect:"none",transition:"all 0.15s"}}>{f}</div>
        ))}
      </div>

      {/* Quote list — first 10 then show more */}
      {visibleQuotes.map((q,i)=>{
        const isSaved=saved.has(i);
        return (
          <div key={i} style={{background:S.card,border:`0.5px solid ${isSaved?S.accent:S.border}`,borderRadius:12,margin:"0 16px 8px",padding:"14px 16px"}}>
            <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:20,background:S.surface,color:S.textHint,marginBottom:8}}>{q.tag}</span>
            <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{q.text}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:10}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{q.author}</div>
                {q.source&&<div style={{fontSize:11,color:S.textHint}}>{q.source}</div>}
              </div>
              <button onClick={()=>toggleSaved(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:isSaved?S.accent:S.textHint,padding:0}}>
                {isSaved?"★":"☆"}
              </button>
            </div>
          </div>
        );
      })}

      {/* Show more — with fade */}
      {!showAllQuotes&&filtered.length>INITIAL_QUOTE_COUNT&&(
        <div style={{margin:"0 16px 16px",position:"relative"}}>
          <div style={{position:"absolute",top:-50,left:0,right:0,height:50,background:`linear-gradient(transparent,${S.bg})`,pointerEvents:"none"}}/>
          <button onClick={()=>setShowAllQuotes(true)} style={{width:"100%",padding:12,background:S.card,border:`0.5px solid ${S.borderMed}`,borderRadius:12,fontSize:13,fontWeight:500,color:S.accent,cursor:"pointer",fontFamily:"inherit"}}>
            Show {filtered.length-INITIAL_QUOTE_COUNT} more quotes ↓
          </button>
        </div>
      )}

      {/* Saved */}
      {saved.size>0&&(<>
        <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"8px 20px 8px"}}>Saved ({saved.size})</div>
        {[...saved].filter(i=>i>=0).map(i=>{ const q=ALL_QUOTES[i]; if(!q) return null;
          return <div key={i} style={{background:S.card,border:`0.5px solid ${S.accent}`,borderRadius:12,margin:"0 16px 8px",padding:"14px 16px"}}>
            <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:20,background:S.surface,color:S.textHint,marginBottom:8}}>{q.tag}</span>
            <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{q.text}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{q.author}</div>
              <button onClick={()=>toggleSaved(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:S.accent,padding:0}}>★</button>
            </div>
          </div>; })}
      </>)}
      <div style={{height:16}}/>
    </div>
  );
}
