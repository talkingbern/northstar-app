// store.js — central persistent data layer
// All app state lives here and syncs to localStorage automatically

const KEYS = {
  user: 'ns_user',
  vision: 'ns_vision',
  goals: 'ns_goals',
  habits: 'ns_habits',
  tasks: 'ns_tasks',
  habitLog: 'ns_habit_log',
  taskLog: 'ns_task_log',
  notes: 'ns_notes',
  onboarded: 'ns_onboarded',
  theme: 'ns_theme',
  nextId: 'ns_next_id',
};

function getNextId() {
  const current = load(KEYS.nextId, 1);
  save(KEYS.nextId, current + 1);
  return current;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

// ─── User ───────────────────────────────────────────────────────────────────
export function getUser() { return load(KEYS.user, { name: '' }); }
export function setUser(user) { save(KEYS.user, user); }

// ─── Onboarding ──────────────────────────────────────────────────────────────
export function isOnboarded() { return load(KEYS.onboarded, false); }
export function setOnboarded(v) { save(KEYS.onboarded, v); }

// ─── Theme ───────────────────────────────────────────────────────────────────
export function getThemePref() { return load(KEYS.theme, false); }
export function setThemePref(v) { save(KEYS.theme, v); }

// ─── Vision ──────────────────────────────────────────────────────────────────
export function getVision() { return load(KEYS.vision, {}); }
export function saveVision(areaId, text) {
  const v = getVision();
  v[areaId] = text;
  save(KEYS.vision, v);
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export function getGoals() { return load(KEYS.goals, {}); }
export function saveGoals(goals) { save(KEYS.goals, goals); }

// ─── Habits ──────────────────────────────────────────────────────────────────
const DEFAULT_HABITS = [];
export function getHabits() { return load(KEYS.habits, DEFAULT_HABITS); }
export function saveHabits(habits) { save(KEYS.habits, habits); }
export function addHabit(habit) {
  const habits = getHabits();
  const newHabit = { ...habit, id: getNextId(), streak: 0, createdAt: today() };
  habits.push(newHabit);
  save(KEYS.habits, habits);
  return newHabit;
}
export function deleteHabit(id) {
  const habits = getHabits().filter(h => h.id !== id);
  save(KEYS.habits, habits);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export function getTasks() { return load(KEYS.tasks, []); }
export function saveTasks(tasks) { save(KEYS.tasks, tasks); }
export function addTask(task) {
  const tasks = getTasks();
  const newTask = { ...task, id: getNextId(), done: false, createdAt: today() };
  tasks.push(newTask);
  save(KEYS.tasks, tasks);
  return newTask;
}
export function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  save(KEYS.tasks, tasks);
}
export function completeTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = true;
  task.completedAt = today();
  save(KEYS.tasks, tasks);
  // Log to task history
  const log = load(KEYS.taskLog, {});
  const d = today();
  if (!log[d]) log[d] = [];
  log[d].push({ name: task.name, area: task.area });
  save(KEYS.taskLog, log);
}
export function uncompleteTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = false;
  delete task.completedAt;
  save(KEYS.tasks, tasks);
}

// ─── Habit Log ───────────────────────────────────────────────────────────────
// habitLog: { "2026-05-09": { 123: true, 456: false } }
export function getHabitLog() { return load(KEYS.habitLog, {}); }

export function toggleHabitForDay(habitId, date, value) {
  const log = getHabitLog();
  if (!log[date]) log[date] = {};
  log[date][habitId] = value;
  save(KEYS.habitLog, log);
  // Update streak on the habit object
  recalcStreak(habitId);
}

export function getHabitDoneToday(habitId) {
  const log = getHabitLog();
  const d = today();
  return !!(log[d] && log[d][habitId]);
}

function recalcStreak(habitId) {
  const log = getHabitLog();
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  // Walk backwards from today
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = formatDate(d);
    if (log[key] && log[key][habitId]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  habit.streak = streak;
  save(KEYS.habits, habits);
}

// ─── Task Log ────────────────────────────────────────────────────────────────
export function getTaskLog() { return load(KEYS.taskLog, {}); }

// ─── Notes ───────────────────────────────────────────────────────────────────
export function getNotes() { return load(KEYS.notes, []); }
export function addNote(text) {
  const notes = getNotes();
  const note = { id: getNextId(), text, ts: new Date().toLocaleString(), date: today() };
  notes.unshift(note);
  save(KEYS.notes, notes);
  return note;
}
export function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  save(KEYS.notes, notes);
}

// ─── Date helpers ────────────────────────────────────────────────────────────
export function today() { return formatDate(new Date()); }
export function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function getDaysInRange(startDate, endDate) {
  const days = [];
  const d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) { days.push(formatDate(d)); d.setDate(d.getDate() + 1); }
  return days;
}
export function subtractDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}
export function getWeekStart(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}
export function getMonthStart(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// ─── Stats helpers ────────────────────────────────────────────────────────────
export function getCompletionForDay(date) {
  const habits = getHabits();
  const log = getHabitLog();
  if (!habits.length) return 0;
  const dayLog = log[date] || {};
  const done = habits.filter(h => dayLog[h.id]).length;
  return Math.round((done / habits.length) * 100);
}

export function getBestWorstHabitInRange(startDate, endDate) {
  const habits = getHabits();
  const log = getHabitLog();
  const days = getDaysInRange(startDate, endDate);
  if (!habits.length || !days.length) return { best: null, worst: null };
  const scores = habits.map(h => {
    const done = days.filter(d => log[d] && log[d][h.id]).length;
    return { habit: h, pct: Math.round((done / days.length) * 100) };
  });
  scores.sort((a, b) => b.pct - a.pct);
  return { best: scores[0], worst: scores[scores.length - 1] };
}

export function getBestWorstDayInRange(startDate, endDate) {
  const days = getDaysInRange(startDate, endDate);
  const scored = days.map(d => ({ date: d, pct: getCompletionForDay(d) }));
  scored.sort((a, b) => b.pct - a.pct);
  return { best: scored[0], worst: scored[scored.length - 1] };
}

// ─── Seed demo data (so app isn't empty on first load) ────────────────────────
export function seedDemoData() {
  if (getHabits().length > 0) return; // already seeded
  const demoHabits = [
    { name: 'Wake up by 8:00 am', area: 'health' },
    { name: 'Read for 30 mins', area: 'hobbies' },
    { name: 'Exercise', area: 'health' },
    { name: 'Journal', area: 'hobbies' },
    { name: 'Limit screen time to 1 hr', area: 'lifestyle' },
    { name: 'Eat well', area: 'health' },
  ];
  demoHabits.forEach(h => addHabit(h));

  // Seed 30 days of demo log data
  const habits = getHabits();
  const log = getHabitLog();
  const completionRates = [0.8, 0.6, 0.9, 0.5, 0.7, 0.85];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    log[key] = {};
    habits.forEach((h, hi) => {
      log[key][h.id] = Math.random() < completionRates[hi % completionRates.length];
    });
  }
  save(KEYS.habitLog, log);
  // recalc streaks
  habits.forEach(h => recalcStreak(h.id));
}
