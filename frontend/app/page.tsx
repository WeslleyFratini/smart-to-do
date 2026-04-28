'use client';

import { useEffect, useState } from 'react';
import { api, Task } from '@/lib/api';

/* ─── palette ─── */
const C = {
  bg: '#111111',
  card: '#1a1d21',
  cardHover: '#212529',
  border: '#2a2d31',
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  orange: '#f25f30',
  orangeLight: '#e88737',
  teal: '#117483',
};

/* ─── tiny design system ─── */
const input =
  'w-full bg-[#1a1d21] border border-[#2a2d31] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#f25f30] transition-colors';

const btnOrange =
  'px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#f25f30] text-white hover:bg-[#e05020] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

const btnTeal =
  'px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#117483] text-white hover:bg-[#0d5b65] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

/* ─── page ─── */
export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = () =>
    api.getTasks().then(setTasks).catch((e) => setError(e.message));

  useEffect(() => { refresh(); }, []);

  return (
    <main style={{ background: C.bg }} className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(242,95,48,0.12)', color: C.orange }}
            >
              AI-Powered
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: C.textPrimary }}>
            Smart To-Do
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
            Organize suas tarefas com inteligência artificial
          </p>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg text-sm border"
            style={{ background: 'rgba(242,95,48,0.08)', borderColor: C.orange, color: C.orange }}
          >
            {error}
          </div>
        )}

        {/* Add task */}
        <section
          className="rounded-xl border p-5 mb-6"
          style={{ background: C.card, borderColor: C.border }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.textSecondary }}>
            Nova tarefa
          </h2>
          <TaskForm onCreated={refresh} />
        </section>

        {/* Task list */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.textSecondary }}>
            Tarefas ({tasks.length})
          </h2>
          <TaskList tasks={tasks} onChanged={refresh} />
        </section>

        {/* AI generate */}
        <section
          className="rounded-xl border p-5 mt-8"
          style={{ background: C.card, borderColor: C.border }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.teal }}
            />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textSecondary }}>
              Gerar com IA
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: C.textSecondary }}>
            Descreva um objetivo e a IA vai quebrar em tarefas acionáveis.
          </p>
          <GenerateForm onGenerated={refresh} />
        </section>

      </div>
    </main>
  );
}

/* ─── TaskForm ─── */
function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      await api.createTask(title.trim());
      setTitle('');
      onCreated();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className={input}
          placeholder="Ex: Revisar o relatório mensal…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !title.trim()} className={btnOrange}>
          {loading ? 'Salvando…' : 'Adicionar'}
        </button>
      </div>
      {err && <p className="text-xs" style={{ color: C.orange }}>{err}</p>}
    </form>
  );
}

/* ─── TaskList ─── */
function TaskList({ tasks, onChanged }: { tasks: Task[]; onChanged: () => void }) {
  if (tasks.length === 0)
    return (
      <div
        className="rounded-xl border px-5 py-8 text-center text-sm"
        style={{ borderColor: C.border, color: C.textSecondary, borderStyle: 'dashed' }}
      >
        Nenhuma tarefa ainda. Crie uma acima ou gere com IA.
      </div>
    );

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onChanged={onChanged} />
      ))}
    </ul>
  );
}

/* ─── TaskItem ─── */
function TaskItem({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try { await api.updateTask(task.id, { isCompleted: !task.isCompleted }); onChanged(); }
    finally { setLoading(false); }
  };

  const remove = async () => {
    setLoading(true);
    try { await api.deleteTask(task.id); onChanged(); }
    finally { setLoading(false); }
  };

  return (
    <li
      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors group"
      style={{ background: C.card, borderColor: C.border }}
    >
      {/* checkbox */}
      <button
        onClick={toggle}
        disabled={loading}
        className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: task.isCompleted ? C.orange : C.border,
          background: task.isCompleted ? C.orange : 'transparent',
        }}
      >
        {task.isCompleted && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* title */}
      <span
        className="flex-1 text-sm transition-colors"
        style={{ color: task.isCompleted ? C.textSecondary : C.textPrimary, textDecoration: task.isCompleted ? 'line-through' : 'none' }}
      >
        {task.title}
      </span>

      {/* AI badge */}
      {task.source === 'ai' && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(17,116,131,0.15)', color: '#4db8c8' }}
        >
          IA
        </span>
      )}

      {/* delete */}
      <button
        onClick={remove}
        disabled={loading}
        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
        style={{ color: C.textSecondary }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.orange)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.textSecondary)}
      >
        remover
      </button>
    </li>
  );
}

/* ─── GenerateForm ─── */
function GenerateForm({ onGenerated }: { onGenerated: () => void }) {
  const [goal, setGoal] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      await api.generateTasks(goal.trim(), apiKey.trim() || undefined);
      setGoal('');
      onGenerated();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {/* API Key field */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: C.textSecondary }}>
          API Key do provedor{' '}
          <span style={{ color: '#4b5563' }}>(opcional — usa a configurada no servidor se omitida)</span>
        </label>
        <input
          className={input}
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Goal + button */}
      <div className="flex gap-2">
        <input
          className={input}
          placeholder="Ex: Aprender Docker do zero em 2 semanas…"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !goal.trim()} className={btnTeal}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              Gerando…
            </span>
          ) : 'Gerar'}
        </button>
      </div>
      {err && <p className="text-xs" style={{ color: C.orange }}>{err}</p>}
    </form>
  );
}
