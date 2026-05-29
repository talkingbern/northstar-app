import { useState, useEffect } from "react";
import { getNotes, addNote, deleteNote, getStarredQuotes, starQuote, unstarQuote, isQuoteStarred, addFutureMessage, getFutureMessages } from "../store";
import NorthstarLogo from "../NorthstarLogo";

const ALL_QUOTES = [
  { text:"You could have the worst possible past and still choose to be a good person now.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Discipline" },
  { text:"It took you a long time to develop a character that works. Don't be surprised that you can't transform yourself in an instant.", author:"Jordan Peterson", source:"Beyond Order", tag:"Patience" },
  { text:"The successful among us delay gratification. The successful among us bargain with the future.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Discipline" },
  { text:"Pursue what is meaningful, not what is expedient.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Vision" },
  { text:"Compare yourself to who you were yesterday, not to who someone else is today.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Growth" },
  { text:"You have to treat yourself like you matter. If you don't, you won't take care of yourself.", author:"Jordan Peterson", source:"12 Rules for Life", tag:"Vision" },
  { text:"The secret to your existence is right in front of you — it manifests as all the things you know you should do but are avoiding.", author:"Jordan Peterson", source:"Maps of Meaning", tag:"Discipline" },
  { text:"You have power over your mind, not outside events. Realise this, and you will find strength.", author:"Marcus Aurelius", source:"Meditations", tag:"Discipline" },
  { text:"Waste no more time arguing about what a good man should be. Be one.", author:"Marcus Aurelius", source:"Meditations", tag:"Discipline" },
  { text:"The impediment to action advances action. What stands in the way becomes the way.", author:"Marcus Aurelius", source:"Meditations", tag:"Resilience" },
  { text:"Confine yourself to the present.", author:"Marcus Aurelius", source:"Meditations", tag:"Focus" },
  { text:"It is not death that a man should fear, but he should fear never beginning to live.", author:"Marcus Aurelius", source:"Meditations", tag:"Vision" },
  { text:"The happiness of your life depends upon the quality of your thoughts.", author:"Marcus Aurelius", source:"Meditations", tag:"Discipline" },
  { text:"Make the best use of what is in your power, and take the rest as it happens.", author:"Epictetus", source:"Enchiridion", tag:"Focus" },
  { text:"First say to yourself what you would be; and then do what you have to do.", author:"Epictetus", source:"Discourses", tag:"Vision" },
  { text:"Luck is what happens when preparation meets opportunity.", author:"Seneca", source:"Letters", tag:"Discipline" },
  { text:"All things are alien to us; time alone is ours.", author:"Seneca", source:"Letters", tag:"Focus" },
  { text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", author:"Fyodor Dostoevsky", source:"Crime and Punishment", tag:"Depth" },
  { text:"The darker the night, the brighter the stars. The deeper the grief, the closer is God.", author:"Fyodor Dostoevsky", source:"Crime and Punishment", tag:"Meaning" },
  { text:"To live without hope is to cease to live.", author:"Fyodor Dostoevsky", source:"", tag:"Vision" },
  { text:"What is hell? I maintain that it is the suffering of being unable to love.", author:"Fyodor Dostoevsky", source:"The Brothers Karamazov", tag:"Depth" },
  { text:"Above all, don't lie to yourself. The man who lies to himself comes to a point where he cannot distinguish the truth within him.", author:"Fyodor Dostoevsky", source:"The Brothers Karamazov", tag:"Discipline" },
  { text:"Everyone thinks of changing the world, but no one thinks of changing himself.", author:"Leo Tolstoy", source:"", tag:"Discipline" },
  { text:"The line separating good and evil passes not through states nor between classes — but right through every human heart.", author:"Aleksandr Solzhenitsyn", source:"The Gulag Archipelago", tag:"Depth" },
  { text:"Own only what you can always carry with you: know languages, know countries, know people.", author:"Aleksandr Solzhenitsyn", source:"", tag:"Growth" },
  { text:"In the middle of winter, I at last discovered that there was in me an invincible summer.", author:"Albert Camus", source:"", tag:"Resilience" },
  { text:"You will never be happy if you continue to search for what happiness consists of.", author:"Albert Camus", source:"", tag:"Meaning" },
  { text:"He who has a why to live can bear almost any how.", author:"Friedrich Nietzsche", source:"", tag:"Vision" },
  { text:"That which does not kill us makes us stronger.", author:"Friedrich Nietzsche", source:"Twilight of the Idols", tag:"Resilience" },
  { text:"Become who you are.", author:"Friedrich Nietzsche", source:"Thus Spoke Zarathustra", tag:"Vision" },
  { text:"The higher we soar, the smaller we appear to those who cannot fly.", author:"Friedrich Nietzsche", source:"Thus Spoke Zarathustra", tag:"Vision" },
  { text:"The most common form of despair is not being who you are.", author:"Søren Kierkegaard", source:"The Sickness Unto Death", tag:"Vision" },
  { text:"Life can only be understood backwards; but it must be lived forwards.", author:"Søren Kierkegaard", source:"", tag:"Vision" },
  { text:"Anxiety is the dizziness of freedom.", author:"Søren Kierkegaard", source:"The Concept of Anxiety", tag:"Depth" },
  { text:"When we are no longer able to change a situation, we are challenged to change ourselves.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Meaning" },
  { text:"Everything can be taken from a man but one thing: to choose one's attitude in any given set of circumstances.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Meaning" },
  { text:"Between stimulus and response there is a space. In that space is our power to choose our response.", author:"Viktor Frankl", source:"Man's Search for Meaning", tag:"Discipline" },
  { text:"You can't go back and change the beginning, but you can start where you are and change the ending.", author:"C.S. Lewis", source:"", tag:"Resilience" },
  { text:"Hardships often prepare ordinary people for an extraordinary destiny.", author:"C.S. Lewis", source:"", tag:"Resilience" },
  { text:"Integrity is doing the right thing even when no one is watching.", author:"C.S. Lewis", source:"", tag:"Discipline" },
  { text:"The most incredible thing about miracles is that they happen.", author:"G.K. Chesterton", source:"The Blue Cross", tag:"Meaning" },
  { text:"To love means loving the unlovable. To forgive means pardoning the unpardonable.", author:"G.K. Chesterton", source:"", tag:"Depth" },
  { text:"Our heart is restless until it rests in thee.", author:"St Augustine", source:"Confessions", tag:"Meaning" },
  { text:"Take care of your body as if you were going to live forever; and take care of your soul as if you were going to die tomorrow.", author:"St Augustine", source:"", tag:"Discipline" },
  { text:"All of humanity's problems stem from man's inability to sit quietly in a room alone.", author:"Blaise Pascal", source:"Pensées", tag:"Focus" },
  { text:"The heart has its reasons which reason knows not.", author:"Blaise Pascal", source:"Pensées", tag:"Depth" },
  { text:"Many words satisfy not the soul, but a good life refresheth the mind.", author:"Thomas à Kempis", source:"The Imitation of Christ", tag:"Discipline" },
  { text:"The ultimate test of a moral society is the kind of world it leaves to its children.", author:"Dietrich Bonhoeffer", source:"", tag:"Vision" },
  { text:"Silence in the face of evil is itself evil. Not to speak is to speak.", author:"Dietrich Bonhoeffer", source:"", tag:"Discipline" },
  { text:"The biggest human temptation is to settle for too little.", author:"Thomas Merton", source:"", tag:"Vision" },
  { text:"We are what we love.", author:"Thomas Merton", source:"", tag:"Vision" },
  { text:"The most terrifying thing is to accept oneself completely.", author:"Carl Jung", source:"", tag:"Growth" },
  { text:"Until you make the unconscious conscious, it will direct your life and you will call it fate.", author:"Carl Jung", source:"", tag:"Vision" },
  { text:"You are what you do, not what you say you'll do.", author:"Carl Jung", source:"", tag:"Discipline" },
  { text:"We are what we repeatedly do. Excellence then is not an act but a habit.", author:"Aristotle", source:"", tag:"Habits" },
  { text:"Knowing yourself is the beginning of all wisdom.", author:"Aristotle", source:"", tag:"Vision" },
  { text:"The energy of the mind is the essence of life.", author:"Aristotle", source:"De Anima", tag:"Focus" },
  { text:"The first and greatest victory is to conquer yourself.", author:"Plato", source:"", tag:"Discipline" },
  { text:"Don't stop when you're tired. Stop when you're done.", author:"David Goggins", source:"", tag:"Discipline" },
  { text:"No one is going to come help you. No one's coming to save you.", author:"David Goggins", source:"Can't Hurt Me", tag:"Accountability" },
  { text:"Discipline equals freedom.", author:"Jocko Willink", source:"", tag:"Discipline" },
  { text:"Good. The best thing that can happen is when something goes wrong. Now you get to fix it.", author:"Jocko Willink", source:"", tag:"Resilience" },
  { text:"Clarity about the future is the most underrated advantage a person can have.", author:"Naval Ravikant", source:"", tag:"Vision" },
  { text:"Reading is the best investment you can make. You access the greatest minds that have ever lived.", author:"Naval Ravikant", source:"", tag:"Growth" },
  { text:"Do not go where the path may lead; go instead where there is no path and leave a trail.", author:"Ralph Waldo Emerson", source:"", tag:"Vision" },
  { text:"What lies behind us and what lies before us are tiny matters compared to what lies within us.", author:"Ralph Waldo Emerson", source:"", tag:"Vision" },
  { text:"Go confidently in the direction of your dreams. Live the life you have imagined.", author:"Henry David Thoreau", source:"", tag:"Vision" },
  { text:"The only journey is the one within.", author:"Rainer Maria Rilke", source:"", tag:"Vision" },
  { text:"I want to beg you to be patient toward all that is unsolved in your heart.", author:"Rainer Maria Rilke", source:"Letters to a Young Poet", tag:"Patience" },
  { text:"The chains of habit are too light to be felt until they are too heavy to be broken.", author:"Warren Buffett", source:"", tag:"Habits" },
  { text:"Your future self is watching you right now through your memories. Make it proud.", author:"Anonymous", source:"", tag:"Accountability" },
  { text:"Long-term thinking is a competitive advantage in almost every field.", author:"Anonymous", source:"", tag:"Focus" },
];

const FEATURED = [
  { text:"The purpose of life is finding the largest burden that you can bear and bearing it.", author:"Jordan Peterson", tag:"Vision", gradient:["#1a3a0a","#2d5c14"] },
  { text:"Pain and suffering are always inevitable for a large intelligence and a deep heart.", author:"Fyodor Dostoevsky", tag:"Depth", gradient:["#2a0a0a","#5a1a1a"] },
  { text:"The most terrifying thing is to accept oneself completely.", author:"Carl Jung", tag:"Growth", gradient:["#0a1f40","#153266"] },
  { text:"In the middle of winter, I at last discovered that there was in me an invincible summer.", author:"Albert Camus", tag:"Resilience", gradient:["#0a2030","#1a4060"] },
  { text:"Our heart is restless until it rests in thee.", author:"St Augustine", tag:"Meaning", gradient:["#2a1a0a","#5a3a10"] },
  { text:"The most common form of despair is not being who you are.", author:"Søren Kierkegaard", tag:"Vision", gradient:["#1a0a2a","#3a1a5a"] },
  { text:"Become who you are.", author:"Friedrich Nietzsche", tag:"Vision", gradient:["#1a1a0a","#3a3a10"] },
];

const WATCH_LINKS = [
  { title:"13 Minutes To Change Your Life", sub:"Dr Jordan Peterson Clips", url:"https://www.youtube.com/watch?v=NX2ep5fCJZ0", thumb:"https://img.youtube.com/vi/NX2ep5fCJZ0/mqdefault.jpg" },
  { title:"David Goggins — Unbreakable Mindset", sub:"On discipline and accountability", url:"https://www.youtube.com/watch?v=Bc9hOXGXiuk", thumb:"https://img.youtube.com/vi/Bc9hOXGXiuk/mqdefault.jpg" },
  { title:"Jocko Willink — Extreme Ownership", sub:"Take responsibility for everything", url:"https://www.youtube.com/watch?v=ljqra3BcqWM", thumb:"https://img.youtube.com/vi/ljqra3BcqWM/mqdefault.jpg" },
  { title:"Viktor Frankl — Why to Believe in Others", sub:"On meaning and suffering", url:"https://www.youtube.com/watch?v=fD1512_XJEw", thumb:"https://img.youtube.com/vi/fD1512_XJEw/mqdefault.jpg" },
  { title:"Marcus Aurelius — How to Think Clearly", sub:"Stoic philosophy for modern life", url:"https://www.youtube.com/watch?v=Auuk1y4DRgk", thumb:"https://img.youtube.com/vi/Auuk1y4DRgk/mqdefault.jpg" },
  { title:"C.S. Lewis — The Weight of Glory", sub:"On meaning, longing, and purpose", url:"https://www.youtube.com/watch?v=HGnMlksmfPo", thumb:"https://img.youtube.com/vi/HGnMlksmfPo/mqdefault.jpg" },
];

const FILTERS = ["All","Vision","Discipline","Habits","Growth","Resilience","Meaning","Depth","Focus","Accountability","Patience"];
const INITIAL_COUNT = 10;

function dateSeeded(arr) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
  return arr[seed % arr.length];
}
function weekSeeded(arr) {
  const d = new Date();
  const week = Math.floor((d.getFullYear()*365 + d.getMonth()*30 + d.getDate()) / 7);
  return arr[week % arr.length];
}

export default function InspirationScreen({ theme }) {
  const [filter, setFilter]             = useState("All");
  const [starred, setStarred]           = useState([]);
  const [notes, setNotes]               = useState([]);
  const [noteText, setNoteText]         = useState("");
  const [showPrevNotes, setShowPrevNotes] = useState(false);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [showStarred, setShowStarred]   = useState(false);
  const [showFutureForm, setShowFutureForm] = useState(false);
  const [futureMsg, setFutureMsg]       = useState("");
  const [futureDate, setFutureDate]     = useState("");
  const [futureMessages, setFutureMessages] = useState([]);
  const [showFutureMsgs, setShowFutureMsgs] = useState(false);
  const [featIdx, setFeatIdx]           = useState(() => {
    const d = new Date();
    return (d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate()) % FEATURED.length;
  });
  const S = theme;

  useEffect(() => {
    setNotes(getNotes());
    setStarred(getStarredQuotes());
    setFutureMessages(getFutureMessages());
  }, []);

  const dailyQuote  = dateSeeded(ALL_QUOTES);
  const weeklyVideo = weekSeeded(WATCH_LINKS);
  const filtered    = filter==="All" ? ALL_QUOTES : ALL_QUOTES.filter(q=>q.tag===filter);
  const visibleQuotes = showAllQuotes ? filtered : filtered.slice(0, INITIAL_COUNT);
  const feat        = FEATURED[featIdx];

  function handleStar(quote) {
    if(isQuoteStarred(quote.text)) unstarQuote(quote.text);
    else starQuote(quote);
    setStarred(getStarredQuotes());
  }

  function handleAddNote() {
    if(!noteText.trim()) return;
    addNote(noteText.trim());
    setNotes(getNotes());
    setNoteText("");
  }

  function handleDeleteNote(id) { deleteNote(id); setNotes(getNotes()); }

  function handleAddFutureMessage() {
    if(!futureMsg.trim()||!futureDate) return;
    addFutureMessage({ message:futureMsg.trim(), deliverOn:futureDate });
    setFutureMessages(getFutureMessages());
    setFutureMsg(""); setFutureDate("");
    setShowFutureForm(false);
  }

  const mostRecentNote = notes[0];
  const prevNotes = notes.slice(1);

  return (
    <div>
      <div style={{background:S.card,borderBottom:`0.5px solid ${S.border}`,padding:"14px 20px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <NorthstarLogo size={18} isDark={S.isDark}/>
            <span style={{fontSize:11,fontWeight:500,letterSpacing:"0.12em",color:S.textHint,textTransform:"uppercase"}}>Northstar</span>
          </div>
          <button onClick={S.toggleTheme} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1.5px solid ${S.themeBtnBorder}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:500,color:S.themeBtnText,cursor:"pointer"}}>
            {S.isDark?"☀️ Light":"🌙 Dark"}
          </button>
        </div>
        <h1 style={{fontSize:22,fontWeight:500,color:S.textPrimary}}>Inspiration</h1>
        <p style={{fontSize:13,color:S.textSecondary,marginTop:1}}>Fuel for the long road</p>
      </div>

      {/* Featured carousel */}
      <div style={{margin:"14px 16px 0"}}>
        <div onClick={()=>setFeatIdx(i=>(i+1)%FEATURED.length)} style={{borderRadius:14,padding:"22px 20px 18px",background:`linear-gradient(135deg,${feat.gradient[0]},${feat.gradient[1]})`,minHeight:170,display:"flex",flexDirection:"column",justifyContent:"space-between",cursor:"pointer",position:"relative",overflow:"hidden"}}>
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

      {/* Notes */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>My Notes</div>
      <div style={{margin:"0 16px",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:14}}>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Jot down an idea, a mantra, something you read, or a thought you want to remember..." style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"11px 12px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,minHeight:90,resize:"vertical",lineHeight:1.55}}/>
        <button onClick={handleAddNote} disabled={!noteText.trim()} style={{marginTop:10,padding:"9px 18px",background:noteText.trim()?S.accent:S.surface,color:noteText.trim()?S.accentBg:S.textHint,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:noteText.trim()?"pointer":"default",fontFamily:"inherit",transition:"all 0.2s"}}>
          Save note
        </button>
      </div>

      {mostRecentNote && (
        <div style={{margin:"8px 16px 0",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:10,padding:"12px 14px",borderLeft:`2px solid ${S.accent}`}}>
          <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.55}}>{mostRecentNote.text}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
            <div style={{fontSize:11,color:S.textHint}}>{mostRecentNote.ts}</div>
            <button onClick={()=>handleDeleteNote(mostRecentNote.id)} style={{background:"none",border:"none",cursor:"pointer",color:S.textHint,fontSize:13,padding:0}}>✕</button>
          </div>
        </div>
      )}

      {prevNotes.length>0&&(
        <div style={{margin:"6px 16px 0"}}>
          <button onClick={()=>setShowPrevNotes(v=>!v)} style={{width:"100%",padding:"9px 14px",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,fontSize:12,color:S.textSecondary,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            {showPrevNotes?`Hide previous notes`:`Show previous notes (${prevNotes.length})`}
          </button>
          {showPrevNotes&&prevNotes.map(n=>(
            <div key={n.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:10,padding:"12px 14px",marginTop:6,borderLeft:`2px solid ${S.accent}`}}>
              <div style={{fontSize:13,color:S.textPrimary,lineHeight:1.55}}>{n.text}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <div style={{fontSize:11,color:S.textHint}}>{n.ts}</div>
                <button onClick={()=>handleDeleteNote(n.id)} style={{background:"none",border:"none",cursor:"pointer",color:S.textHint,fontSize:13,padding:0}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Future messages */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>Messages to my future self</span>
        <button onClick={()=>setShowFutureForm(v=>!v)} style={{fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
          {showFutureForm?"✕ Cancel":"+ Write one"}
        </button>
      </div>

      {showFutureForm&&(
        <div style={{margin:"0 16px 8px",background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,padding:14}}>
          <div style={{fontSize:12,color:S.textSecondary,marginBottom:8,lineHeight:1.5}}>Write a message to yourself. It will appear when you open the app on the delivery date.</div>
          <textarea value={futureMsg} onChange={e=>setFutureMsg(e.target.value)} placeholder="Dear future me, by now you should have..." style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"10px 12px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,minHeight:80,resize:"vertical",lineHeight:1.55,marginBottom:8}}/>
          <div style={{fontSize:12,color:S.textSecondary,marginBottom:6}}>Deliver on</div>
          <input type="date" value={futureDate} onChange={e=>setFutureDate(e.target.value)} style={{width:"100%",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:13,fontFamily:"inherit",color:S.textPrimary,marginBottom:10}}/>
          <button onClick={handleAddFutureMessage} disabled={!futureMsg.trim()||!futureDate} style={{width:"100%",padding:10,background:S.accent,color:S.accentBg,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Send to future self</button>
        </div>
      )}

      {futureMessages.filter(m=>!m.read).length>0&&(
        <div style={{margin:"0 16px 0"}}>
          <button onClick={()=>setShowFutureMsgs(v=>!v)} style={{width:"100%",padding:"9px 14px",background:S.surface,border:`0.5px solid ${S.borderMed}`,borderRadius:8,fontSize:12,color:S.textSecondary,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            {showFutureMsgs?"Hide":` ${futureMessages.filter(m=>!m.read).length} message${futureMessages.filter(m=>!m.read).length!==1?"s":""} scheduled`} 📅
          </button>
          {showFutureMsgs&&futureMessages.filter(m=>!m.read).map(m=>(
            <div key={m.id} style={{background:S.card,border:`0.5px solid ${S.border}`,borderRadius:10,padding:"11px 14px",marginTop:6}}>
              <div style={{fontSize:11,color:S.accent,fontWeight:500,marginBottom:4}}>Delivers {m.deliverOn}</div>
              <div style={{fontSize:13,color:S.textSecondary,fontStyle:"italic"}}>{m.message.slice(0,60)}{m.message.length>60?"…":""}</div>
            </div>
          ))}
        </div>
      )}

      {/* Daily quote */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>Quote of the day</div>
      <div style={{background:S.card,border:`0.5px solid ${isQuoteStarred(dailyQuote.text)?S.accent:S.border}`,borderRadius:12,margin:"0 16px",padding:16}}>
        <div style={{fontSize:28,color:S.accent,lineHeight:0.8,marginBottom:8,opacity:0.4}}>"</div>
        <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{dailyQuote.text}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{dailyQuote.author}</div>
            {dailyQuote.source&&<div style={{fontSize:11,color:S.textHint}}>{dailyQuote.source}</div>}
          </div>
          <button onClick={()=>handleStar(dailyQuote)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:isQuoteStarred(dailyQuote.text)?S.accent:S.textHint}}>
            {isQuoteStarred(dailyQuote.text)?"★":"☆"}
          </button>
        </div>
      </div>

      {/* Watch */}
      <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"16px 20px 8px"}}>Watch this week</div>
      <a href={weeklyVideo.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:12,background:S.card,border:`0.5px solid ${S.accent}`,borderRadius:12,margin:"0 16px 8px",padding:"12px 14px",textDecoration:"none"}}>
        <div style={{width:80,height:52,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#000",position:"relative"}}>
          <img src={weeklyVideo.thumb} alt={weeklyVideo.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"white",fontSize:11,marginLeft:2}}>▶</span>
            </div>
          </div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,color:S.accent,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>This week's pick</div>
          <div style={{fontSize:13,fontWeight:500,color:S.textPrimary,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{weeklyVideo.title}</div>
          <div style={{fontSize:11,color:S.textHint,marginTop:2}}>{weeklyVideo.sub}</div>
        </div>
        <span style={{fontSize:14,color:S.textHint,flexShrink:0}}>↗</span>
      </a>
      {WATCH_LINKS.filter(w=>w.url!==weeklyVideo.url).slice(0,3).map(w=>(
        <a key={w.title} href={w.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:12,background:S.card,border:`0.5px solid ${S.border}`,borderRadius:12,margin:"0 16px 8px",padding:"12px 14px",textDecoration:"none"}}>
          <div style={{width:72,height:48,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#000",position:"relative"}}>
            <img src={w.thumb} alt={w.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(255,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center"}}>
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

      {visibleQuotes.map((q,i)=>{
        const isStar=isQuoteStarred(q.text);
        return (
          <div key={i} style={{background:S.card,border:`0.5px solid ${isStar?S.accent:S.border}`,borderRadius:12,margin:"0 16px 8px",padding:"14px 16px"}}>
            <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:20,background:S.surface,color:S.textHint,marginBottom:8}}>{q.tag}</span>
            <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{q.text}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:10}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{q.author}</div>
                {q.source&&<div style={{fontSize:11,color:S.textHint}}>{q.source}</div>}
              </div>
              <button onClick={()=>handleStar(q)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:isStar?S.accent:S.textHint,padding:0}}>
                {isStar?"★":"☆"}
              </button>
            </div>
          </div>
        );
      })}

      {!showAllQuotes&&filtered.length>INITIAL_COUNT&&(
        <div style={{margin:"0 16px 16px",position:"relative"}}>
          <div style={{position:"absolute",top:-50,left:0,right:0,height:50,background:`linear-gradient(transparent,${S.bg})`,pointerEvents:"none"}}/>
          <button onClick={()=>setShowAllQuotes(true)} style={{width:"100%",padding:12,background:S.card,border:`0.5px solid ${S.borderMed}`,borderRadius:12,fontSize:13,fontWeight:500,color:S.accent,cursor:"pointer",fontFamily:"inherit"}}>
            Show {filtered.length-INITIAL_COUNT} more quotes ↓
          </button>
        </div>
      )}

      {starred.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.1em",color:S.textHint,textTransform:"uppercase",padding:"8px 20px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>Starred ({starred.length})</span>
            <button onClick={()=>setShowStarred(v=>!v)} style={{fontSize:12,color:S.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>{showStarred?"Hide":"Show"}</button>
          </div>
          {showStarred&&starred.map(q=>(
            <div key={q.id} style={{background:S.card,border:`0.5px solid ${S.accent}`,borderRadius:12,margin:"0 16px 8px",padding:"14px 16px"}}>
              <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:20,background:S.surface,color:S.textHint,marginBottom:8}}>{q.tag}</span>
              <div style={{fontSize:14,color:S.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>{q.text}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                <div style={{fontSize:12,fontWeight:500,color:S.textSecondary}}>{q.author}</div>
                <button onClick={()=>handleStar(q)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:S.accent,padding:0}}>★</button>
              </div>
            </div>
          ))}
        </>
      )}
      <div style={{height:16}}/>
    </div>
  );
}
