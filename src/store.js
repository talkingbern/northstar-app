// store.js — central persistent data layer

const KEYS = {
  user:           'ns_user',
  vision:         'ns_vision',
  goals:          'ns_goals',
  habits:         'ns_habits',
  tasks:          'ns_tasks',
  habitLog:       'ns_habit_log',
  taskLog:        'ns_task_log',
  notes:          'ns_notes',
  onboarded:      'ns_onboarded',
  onboardedAt:    'ns_onboarded_at',
  theme:          'ns_theme',
  nextId:         'ns_next_id',
  starredQuotes:  'ns_starred_quotes',
  futureMessages: 'ns_future_messages',
  weeklyCheckin:  'ns_weekly_checkin',
  milestones:     'ns_milestones',
  tutorialDone:   'ns_tutorial_done',
  videoSeen:      'ns_video_seen',
};

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn('Storage error:', e); }
}
function getNextId() { const c = load(KEYS.nextId, 1); save(KEYS.nextId, c + 1); return c; }

// ─── User ─────────────────────────────────────────────────────────────────────
export function getUser() { return load(KEYS.user, { name: '' }); }
export function setUser(u) { save(KEYS.user, u); }

// ─── Onboarding ───────────────────────────────────────────────────────────────
export function isOnboarded() { return load(KEYS.onboarded, false); }
export function setOnboarded(v) {
  save(KEYS.onboarded, v);
  if (v && !load(KEYS.onboardedAt, null)) save(KEYS.onboardedAt, today());
}
export function getOnboardedAt() { return load(KEYS.onboardedAt, null); }

// ─── Video ────────────────────────────────────────────────────────────────────
export function hasSeenVideo() { return load(KEYS.videoSeen, false); }
export function markVideoSeen() { save(KEYS.videoSeen, true); }

// ─── Tutorial ─────────────────────────────────────────────────────────────────
export function isTutorialDone() { return load(KEYS.tutorialDone, false); }
export function setTutorialDone() { save(KEYS.tutorialDone, true); }

// ─── Theme ────────────────────────────────────────────────────────────────────
export function getThemePref() { return load(KEYS.theme, true); } // default dark
export function setThemePref(v) { save(KEYS.theme, v); }

// ─── Vision ───────────────────────────────────────────────────────────────────
export function getVision() { return load(KEYS.vision, {}); }
export function saveVision(areaId, text) { const v = getVision(); v[areaId] = text; save(KEYS.vision, v); }

// ─── Goals ────────────────────────────────────────────────────────────────────
export function getGoals() { return load(KEYS.goals, {}); }
export function saveGoals(goals) { save(KEYS.goals, goals); }

// ─── Habits ───────────────────────────────────────────────────────────────────
export function getHabits() { return load(KEYS.habits, []); }
export function saveHabits(h) { save(KEYS.habits, h); }
export function addHabit(habit) {
  const habits = getHabits();
  const n = { ...habit, id: getNextId(), streak: 0, createdAt: today() };
  habits.push(n); save(KEYS.habits, habits); return n;
}
export function deleteHabit(id) { save(KEYS.habits, getHabits().filter(h => h.id !== id)); }

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function getTasks() { return load(KEYS.tasks, []); }
export function addTask(task) {
  const tasks = getTasks();
  const n = { ...task, id: getNextId(), done: false, createdAt: today() };
  tasks.push(n); save(KEYS.tasks, tasks); return n;
}
export function deleteTask(id) { save(KEYS.tasks, getTasks().filter(t => t.id !== id)); }
export function completeTask(id) {
  const tasks = getTasks();
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = true; t.completedAt = today();
  save(KEYS.tasks, tasks);
  const log = load(KEYS.taskLog, {});
  const d = today();
  if (!log[d]) log[d] = [];
  log[d].push({ name: t.name, area: t.area });
  save(KEYS.taskLog, log);
}
export function uncompleteTask(id) {
  const tasks = getTasks();
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = false; delete t.completedAt;
  save(KEYS.tasks, tasks);
}

// ─── Habit Log ────────────────────────────────────────────────────────────────
export function getHabitLog() { return load(KEYS.habitLog, {}); }
export function toggleHabitForDay(habitId, date, value) {
  const log = getHabitLog();
  if (!log[date]) log[date] = {};
  log[date][habitId] = value;
  save(KEYS.habitLog, log);
  recalcStreak(habitId);
}
function recalcStreak(habitId) {
  const log = getHabitLog(), habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  let streak = 0;
  const d = new Date();
  const todayKey = formatDate(d);
  const todayLog = log[todayKey] || {};
  if (!todayLog[habitId]) d.setDate(d.getDate() - 1); // grace period
  for (let i = 0; i < 365; i++) {
    const key = formatDate(d);
    if (log[key] && log[key][habitId]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  habit.streak = streak;
  save(KEYS.habits, habits);
}

// ─── Task Log ─────────────────────────────────────────────────────────────────
export function getTaskLog() { return load(KEYS.taskLog, {}); }

// ─── Notes ────────────────────────────────────────────────────────────────────
export function getNotes() { return load(KEYS.notes, []); }
export function addNote(text) {
  const notes = getNotes();
  const n = { id: getNextId(), text, ts: new Date().toLocaleString(), date: today() };
  notes.unshift(n); save(KEYS.notes, notes); return n;
}
export function deleteNote(id) { save(KEYS.notes, getNotes().filter(n => n.id !== id)); }

// ─── Starred Quotes ───────────────────────────────────────────────────────────
export function getStarredQuotes() { return load(KEYS.starredQuotes, []); }
export function starQuote(quote) {
  const starred = getStarredQuotes();
  if (starred.find(q => q.text === quote.text)) return;
  starred.unshift({ ...quote, starredAt: today(), id: getNextId() });
  save(KEYS.starredQuotes, starred);
}
export function unstarQuote(text) { save(KEYS.starredQuotes, getStarredQuotes().filter(q => q.text !== text)); }
export function isQuoteStarred(text) { return getStarredQuotes().some(q => q.text === text); }

// ─── Future Messages ──────────────────────────────────────────────────────────
export function getFutureMessages() { return load(KEYS.futureMessages, []); }
export function addFutureMessage(msg) {
  const msgs = getFutureMessages();
  msgs.push({ ...msg, id: getNextId(), createdAt: today() });
  save(KEYS.futureMessages, msgs);
}
export function getDueMessages() {
  const t = today();
  return getFutureMessages().filter(m => !m.read && m.deliverOn <= t);
}
export function markMessageRead(id) {
  const msgs = getFutureMessages();
  const m = msgs.find(x => x.id === id);
  if (m) { m.read = true; save(KEYS.futureMessages, msgs); }
}

// ─── Weekly Check-in ─────────────────────────────────────────────────────────
export function getWeeklyCheckins() { return load(KEYS.weeklyCheckin, []); }
export function addWeeklyCheckin(entry) {
  const c = getWeeklyCheckins();
  c.unshift({ ...entry, id: getNextId(), date: today() });
  save(KEYS.weeklyCheckin, c);
}
export function shouldShowWeeklyCheckin() {
  const checkins = getWeeklyCheckins();
  const onboardedAt = getOnboardedAt();
  if (!onboardedAt) return false;
  const diff = (new Date(today()) - new Date(onboardedAt)) / 86400000;
  if (!checkins.length) return new Date().getDay() === 0 && diff >= 6;
  const daysSince = (new Date(today()) - new Date(checkins[0].date)) / 86400000;
  return new Date().getDay() === 0 && daysSince >= 6;
}

// ─── Milestone Celebrations ───────────────────────────────────────────────────
export function getCelebrations() { return load(KEYS.milestones, []); }
export function checkAndAddCelebration(habitId, streak) {
  const milestones = [7, 14, 30, 60, 100, 200, 365];
  if (!milestones.includes(streak)) return null;
  const existing = getCelebrations();
  const key = `${habitId}-${streak}`;
  if (existing.includes(key)) return null;
  existing.push(key);
  save(KEYS.milestones, existing);
  return streak;
}

// ─── Onboarding completion score ──────────────────────────────────────────────
export function getOnboardingScore() {
  const vision = getVision(), goals = getGoals(), habits = getHabits();
  let score = 0, total = 13;
  score += Object.values(vision).filter(v => v && v.length > 10).length; // max 6
  score += Object.keys(goals).filter(k => Object.values(goals[k] || {}).some(a => a.length > 0)).length; // max 6
  if (habits.length >= 3) score += 1;
  return Math.round((score / total) * 100);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function today() { return formatDate(new Date()); }
export function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function getDaysInRange(startDate, endDate) {
  const days = [], d = new Date(startDate), end = new Date(endDate);
  while (d <= end) { days.push(formatDate(d)); d.setDate(d.getDate() + 1); }
  return days;
}
export function subtractDays(n) { const d = new Date(); d.setDate(d.getDate() - n); return formatDate(d); }
export function getCompletionForDay(date) {
  const habits = getHabits(), log = getHabitLog();
  if (!habits.length) return 0;
  const dl = log[date] || {};
  return Math.round((habits.filter(h => dl[h.id]).length / habits.length) * 100);
}
export function getBestWorstHabitInRange(startDate, endDate) {
  const habits = getHabits(), log = getHabitLog(), days = getDaysInRange(startDate, endDate);
  if (!habits.length || !days.length) return { best: null, worst: null };
  const scores = habits.map(h => ({ habit: h, pct: Math.round((days.filter(d => log[d] && log[d][h.id]).length / days.length) * 100) }));
  scores.sort((a, b) => b.pct - a.pct);
  return { best: scores[0], worst: scores[scores.length - 1] };
}
export function getBestWorstDayInRange(startDate, endDate) {
  const days = getDaysInRange(startDate, endDate);
  const scored = days.map(d => ({ date: d, pct: getCompletionForDay(d) })).sort((a, b) => b.pct - a.pct);
  return { best: scored[0], worst: scored[scored.length - 1] };
}

// ─── Goal progress calculation ────────────────────────────────────────────────
export function calcGoalProgress(areaId, rangeDays) {
  const habits = getHabits(), log = getHabitLog(), tasks = getTasks();
  const onboardedAt = getOnboardedAt() || today();
  const daysSinceOnboard = Math.max(1, (new Date(today()) - new Date(onboardedAt)) / 86400000);

  // Habits contribution
  const areaHabits = habits.filter(h => h.area === areaId);
  const habitsDone = areaHabits.reduce((s, h) => s + rangeDays.filter(d => log[d] && log[d][h.id]).length, 0);
  const habitsTotal = areaHabits.length * rangeDays.length;
  const habitRate = habitsTotal > 0 ? habitsDone / habitsTotal : 0;

  // Tasks contribution — completed tasks in this area / projected annual
  const completedAreaTasks = tasks.filter(t => t.done && t.area === areaId).length;
  const avgTasksPerDay = completedAreaTasks / daysSinceOnboard;
  const projectedAnnualTasks = avgTasksPerDay * 365;
  const annualTaskTarget = Math.max(projectedAnnualTasks * 1.2, 1); // target 20% more than current rate
  const taskRate = Math.min(completedAreaTasks / annualTaskTarget, 1);

  // Weight: habits 70%, tasks 30%
  const combined = (habitRate * 0.7) + (taskRate * 0.3);
  return Math.min(100, Math.round(combined * 100));
}
