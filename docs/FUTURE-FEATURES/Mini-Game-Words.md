Got you — here’s the entire, copy-pasteable document inline.

---

# Twisted Tales Wordle – End-to-End Implementation (MVP v1)

> Copy/paste ready. This single document contains SQL migrations, RLS, RPCs, seed hooks, TypeScript client stubs, React routes/components, the unlock hook, stats modal, and a simple paginated leaderboard. It favors Supabase Postgres **RPC** for speed. All daily cut-offs use **UTC**.

---

## 0) Prereqs & conventions

* **Stack:** React + Vite, Tailwind, shadcn/ui, Supabase JS v2.
* **Auth:** Supabase Auth; optional public `profiles` table for display names.
* **Timezone:** UTC authoritative daily rollover.
* **Schema:** `public`.
* **Secrets:** Replace `TT_SALT` with a secret you manage (pgsodium/env). For MVP we inline a constant and rotate later.

---

## 1) SQL: Tables, Indexes, RLS

> Create a migration file (e.g., `2025XXXX_twisted_tales_game.sql`) with the following.

```sql
-- 1.1 Words pool (answers + guessable)
create table if not exists game_words (
  id serial primary key,
  word text not null unique check (char_length(word) = 6),
  category text check (category in ('halloween','fairy_tale','twisted')),
  difficulty int check (difficulty between 1 and 5),
  is_active boolean not null default true,
  is_answer_pool boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists game_words_active_idx
  on game_words (is_active, is_answer_pool);

-- 1.2 Per-user game progression
create table if not exists game_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_unlocked boolean not null default false,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  total_wins int not null default 0,
  total_games int not null default 0,
  average_guesses numeric,
  last_played_date date,
  last_answer_id int references game_words(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists game_progress_user_idx on game_progress(user_id);

-- 1.3 Daily results
create table if not exists game_daily_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_date date not null, -- UTC date
  answer_id int not null references game_words(id),
  word_of_day text not null,
  guesses jsonb not null default '[]'::jsonb,      -- ["PRINCE","GOBLIN",...]
  tiles jsonb not null default '[]'::jsonb,        -- [["G","-","Y",...], ...]
  solved boolean not null default false,
  num_guesses int,
  completed_at timestamptz,
  ms_spent int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, game_date)
);

create index if not exists game_daily_results_date_idx on game_daily_results(game_date);
create index if not exists game_daily_results_user_idx on game_daily_results(user_id);

-- 1.4 RLS
alter table game_progress enable row level security;
alter table game_daily_results enable row level security;

create policy "own_progress_all"
  on game_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_results_all"
  on game_daily_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 1.5 Triggers to maintain updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger t_game_progress_touch
  before update on game_progress
  for each row execute procedure touch_updated_at();

create trigger t_game_daily_results_touch
  before update on game_daily_results
  for each row execute procedure touch_updated_at();
```

> Optional: if you maintain `public.profiles(id uuid pk, display_name text, avatar_url text)`, the leaderboard will use display names.

---

## 2) SQL: Utility helpers & constants

```sql
-- 2.1 UTC today helper
create or replace function tt_utc_today()
returns date language sql stable as $$
  select (now() at time zone 'UTC')::date
$$;

-- 2.2 Salted hash → index mapping
-- Replace the salt with a proper secret in production.
create or replace function tt_daily_index(_date date)
returns bigint language plpgsql stable as $$
declare
  salt text := 'TT_SALT_REPLACE_ME';
  h bigint;
begin
  -- cheap fold of text -> 64-bit
  select abs(hashtextextended(salt || _date::text, 913)) into h; -- 913 arbitrary seed
  return h;
end
$$;
```

---

## 3) SQL: Core RPCs (server-authoritative)

### 3.1 `get_daily_word(date)`

```sql
create or replace function get_daily_word(_date date default tt_utc_today())
returns table(answer_id int, word text) language sql stable as $$
  with pool as (
    select id, word from game_words
    where is_active and is_answer_pool
    order by id
  ),
  c as (select count(*)::int as n from pool)
  select p.id, p.word
  from pool p, c
  where (p.id % c.n) = (tt_daily_index(_date) % c.n)
  limit 1;
$$;
```

### 3.2 `unlock_game()`

```sql
create or replace function unlock_game()
returns void language plpgsql security definer as $$
begin
  insert into game_progress(user_id, game_unlocked)
  values (auth.uid(), true)
  on conflict (user_id) do update set game_unlocked = true;
end
$$;
```

### 3.3 Letter coloring (duplicate-aware)

```sql
-- Returns array of chars 'G' (green), 'Y' (present), '-' (absent)
create or replace function tt_color_row(_guess text, _answer text)
returns text[] language plpgsql immutable as $$
declare
  g text := upper(_guess);
  a text := upper(_answer);
  len int := 6;
  res text[] := array_fill('-'::text, ARRAY[len]);
  counts jsonb := '{}';
  i int;
begin
  if length(g) <> len or length(a) <> len then
    raise exception 'words must be 6 letters';
  end if;
  -- count letters in answer
  for i in 1..len loop
    counts := jsonb_set(
      counts,
      ARRAY[substr(a,i,1)],
      to_jsonb( coalesce( (counts->>substr(a,i,1))::int, 0) + 1 ), true);
  end loop;
  -- first pass: greens
  for i in 1..len loop
    if substr(g,i,1) = substr(a,i,1) then
      res[i] := 'G';
      counts := jsonb_set(
        counts,
        ARRAY[substr(g,i,1)],
        to_jsonb( (counts->>substr(g,i,1))::int - 1 ), true);
    end if;
  end loop;
  -- second pass: yellows where count remains
  for i in 1..len loop
    if res[i] = '-' then
      if (counts ? substr(g,i,1)) and (counts->>substr(g,i,1))::int > 0 then
        res[i] := 'Y';
        counts := jsonb_set(
          counts,
          ARRAY[substr(g,i,1)],
          to_jsonb( (counts->>substr(g,i,1))::int - 1 ), true);
      end if;
    end if;
  end loop;
  return res;
end
$$;
```

### 3.4 `submit_guess(guess text)`

```sql
create or replace function submit_guess(_guess text)
returns jsonb language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  d date := tt_utc_today();
  ans record;              -- answer_id, word
  r record;                -- existing result row (locked)
  row_colors text[];
  new_tiles jsonb;
  new_guesses jsonb;
  finished boolean := false;
  solved boolean := false;
  attempts int;
  max_attempts constant int := 6;
begin
  -- Fetch today’s answer
  select * into ans from get_daily_word(d);
  if ans is null then raise exception 'answer pool empty'; end if;

  -- Basic guard: word must exist in game_words (guessable)
  if not exists (
    select 1 from game_words where upper(word) = upper(_guess) and is_active
  ) then
    return jsonb_build_object('error','INVALID_WORD');
  end if;

  -- Upsert today’s result row for this user
  insert into game_daily_results(user_id, game_date, answer_id, word_of_day)
  values (uid, d, ans.answer_id, ans.word)
  on conflict (user_id, game_date) do nothing;

  select * into r from game_daily_results where user_id = uid and game_date = d for update;

  if r.solved is true or (r.num_guesses is not null and r.num_guesses >= max_attempts) then
    return jsonb_build_object('status','final','guesses', r.guesses, 'tiles', r.tiles, 'numGuesses', r.num_guesses, 'solved', r.solved);
  end if;

  -- Compute colors
  row_colors := tt_color_row(_guess, ans.word);
  new_tiles := coalesce(r.tiles, '[]'::jsonb) || to_jsonb(row_colors);
  new_guesses := coalesce(r.guesses, '[]'::jsonb) || to_jsonb(upper(_guess));
  attempts := jsonb_array_length(new_guesses);

  solved := (select bool_and(x = 'G') from unnest(row_colors) as x);
  finished := solved or attempts >= max_attempts;

  update game_daily_results set
    guesses = new_guesses,
    tiles = new_tiles,
    num_guesses = case when finished then attempts else null end,
    solved = case when finished then solved else false end,
    completed_at = case when finished then now() else null end
  where id = r.id;

  -- Update progression if finished
  if finished then
    insert into game_progress(user_id, last_played_date, last_answer_id)
    values (uid, d, ans.answer_id)
    on conflict (user_id) do update set
      last_played_date = excluded.last_played_date,
      last_answer_id   = excluded.last_answer_id,
      total_games = game_progress.total_games + 1,
      total_wins  = game_progress.total_wins + (case when solved then 1 else 0 end),
      current_streak = case
        when solved and (game_progress.last_played_date = d - 1 or game_progress.last_played_date is null)
          then coalesce(game_progress.current_streak,0) + 1
        when solved then 1
        else 0
      end,
      longest_streak = greatest(game_progress.longest_streak,
        case when solved then
          case
            when (game_progress.last_played_date = d - 1 or game_progress.last_played_date is null)
              then coalesce(game_progress.current_streak,0) + 1
            else 1
          end
        else game_progress.longest_streak end),
      average_guesses = case
        when solved then round(((coalesce(game_progress.average_guesses,0) * greatest(game_progress.total_wins,0)) + attempts)::numeric / nullif(greatest(game_progress.total_wins,0) + 1,0), 2)
        else game_progress.average_guesses end;
  end if;

  return jsonb_build_object(
    'status', case when finished then 'final' else 'playing' end,
    'attemptsLeft', max_attempts - attempts,
    'guesses', new_guesses,
    'tiles', new_tiles,
    'solved', solved,
    'numGuesses', case when finished then attempts else null end
  );
end
$$;
```

### 3.5 `get_user_game_stats()`

```sql
create or replace function get_user_game_stats()
returns jsonb language sql stable as $$
  with p as (
    select * from game_progress where user_id = auth.uid()
  ), d as (
    select jsonb_build_object(
      'currentStreak', coalesce(p.current_streak,0),
      'longestStreak', coalesce(p.longest_streak,0),
      'totalWins', coalesce(p.total_wins,0),
      'totalGames', coalesce(p.total_games,0),
      'winPct', case when coalesce(p.total_games,0) > 0 then round(100.0 * p.total_wins / p.total_games, 1) else 0 end,
      'avgGuesses', coalesce(p.average_guesses, null)
    ) as j
    from p
  ) select coalesce((select j from d), '{}'::jsonb);
$$;
```

### 3.6 `get_leaderboard(scope text, limit int, offset int)`

```sql
create or replace function get_leaderboard(scope text default 'streak', limit_count int default 20, offset_count int default 0)
returns table (rank_no int, display_name text, stat numeric) language sql stable as $$
  with base as (
    select gp.user_id,
      case when scope = 'wins' then gp.total_wins::numeric
           when scope = 'avg'  then nullif(gp.average_guesses, 9999)
           else gp.current_streak::numeric end as stat
    from game_progress gp
  ), ranked as (
    select b.user_id, b.stat,
           row_number() over (
             order by
               case when scope = 'avg' then b.stat asc else b.stat desc end,
               b.user_id asc
           ) as rk
    from base b
  )
  select r.rk,
         coalesce(p.display_name, substr(cast(r.user_id as text),1,8) || '…') as display_name,
         r.stat
  from ranked r
  left join profiles p on p.id = r.user_id
  where r.stat is not null
  order by r.rk
  limit limit_count offset offset_count;
$$;
```

---

## 4) Seed script (minimal words)

> Create `2025XXXX_seed_twisted_words.sql` and expand later.

```sql
insert into game_words (word, category, difficulty, is_active, is_answer_pool) values
('MIRROR','twisted',2,true,true),
('POISON','halloween',2,true,true),
('CURSED','twisted',3,true,true),
('GOBLIN','halloween',2,true,true),
('WITCHY','halloween',3,true,false), -- guessable only (not in answer pool)
('PRINCE','fairy_tale',2,true,true),
('DRAGON','fairy_tale',3,true,true),
('CASTLE','fairy_tale',2,true,true);
```

> Ensure all words are exactly 6 letters; expand to 365+ ASAP.

---

## 5) TypeScript: Supabase client helpers (`src/lib/ttGameApi.ts`)

```ts
// src/lib/ttGameApi.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export type SubmitGuessResp = {
  status: 'playing' | 'final'
  attemptsLeft: number
  guesses: string[]
  tiles: string[][]
  solved: boolean
  numGuesses: number | null
} | { error: 'INVALID_WORD' }

export async function unlockGame() {
  const { error } = await supabase.rpc('unlock_game')
  if (error) throw error
}

export async function submitGuess(guess: string) {
  const { data, error } = await supabase.rpc('submit_guess', { _guess: guess })
  if (error) throw error
  return data as SubmitGuessResp
}

export async function getUserStats() {
  const { data, error } = await supabase.rpc('get_user_game_stats')
  if (error) throw error
  return data as {
    currentStreak: number
    longestStreak: number
    totalWins: number
    totalGames: number
    winPct: number
    avgGuesses: number | null
  }
}

export async function getLeaderboard(scope: 'streak'|'wins'|'avg', limit = 20, offset = 0) {
  const { data, error } = await supabase.rpc('get_leaderboard', { scope, limit_count: limit, offset_count: offset })
  if (error) throw error
  return (data || []) as { rank_no: number, display_name: string, stat: number }[]
}
```

---

## 6) React: Route + Auth Gate (`src/pages/TwistedTalesGame.tsx`)

```tsx
// src/pages/TwistedTalesGame.tsx
import { useEffect, useState } from 'react'
import { submitGuess, getUserStats } from '@/lib/ttGameApi'
import { Button } from '@/components/ui/button'

const MAX_ATTEMPTS = 6
const WORD_LEN = 6

function useReducedMotion() {
  const [pref, setPref] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPref(mq.matches)
    const h = (e: MediaQueryListEvent) => setPref(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return pref
}

export default function TwistedTalesGame() {
  const [rows, setRows] = useState<string[]>([])
  const [tiles, setTiles] = useState<string[][]>([])
  const [current, setCurrent] = useState('')
  const [final, setFinal] = useState<null | { solved: boolean; numGuesses: number }>(null)
  const [stats, setStats] = useState<any>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => { getUserStats().then(setStats).catch(console.error) }, [])

  async function onEnter() {
    if (current.length !== WORD_LEN || final) return
    try {
      const resp = await submitGuess(current)
      if ('error' in resp) {
        // TODO: show toast "Not in word list"
        return
      }
      setRows(resp.guesses)
      setTiles(resp.tiles)
      if (resp.status === 'final') {
        setFinal({ solved: resp.solved, numGuesses: resp.numGuesses ?? MAX_ATTEMPTS })
        getUserStats().then(setStats).catch(console.error)
      }
      setCurrent('')
    } catch (e) { console.error(e) }
  }

  function onKey(k: string) {
    if (final) return
    if (k === 'ENTER') return onEnter()
    if (k === 'DEL') return setCurrent(c => c.slice(0, -1))
    if (/^[A-Z]$/.test(k) && current.length < WORD_LEN) setCurrent(c => (c + k).toUpperCase())
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center gap-4 p-4 bg-gradient-to-b from-[#0f0d17] to-[#1a1326] text-white">
      <header className="mt-2 text-center">
        <h1 className="text-2xl font-bold tracking-wide">Twisted Tales</h1>
        <p className="text-sm opacity-80">Guess the 6-letter word in 6 tries.</p>
      </header>

      {/* Board */}
      <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${MAX_ATTEMPTS}, 1fr)` }}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, r) => (
          <div key={r} className="grid grid-cols-6 gap-2">
            {Array.from({ length: WORD_LEN }).map((_, c) => {
              const ch = rows[r]?.[c] ?? (r === rows.length ? current[c] : '') ?? ''
              const state = tiles[r]?.[c]
              const cls = state === 'G' ? 'bg-green-600' : state === 'Y' ? 'bg-yellow-500' : (state ? 'bg-gray-700' : 'bg-[#241b33]')
              return (
                <div key={c} className={`w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center font-semibold text-lg ${cls} ${reduceMotion ? '' : 'transition-transform'}`}>
                  {ch}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <TTKeyboard onKey={onKey} disabled={!!final} />

      {/* Footer stats */}
      <div className="mt-2 text-sm opacity-90">
        {stats && (
          <p>
            Streak <strong>{stats.currentStreak}</strong> · Best <strong>{stats.longestStreak}</strong> · Win% <strong>{stats.winPct}%</strong> · Avg <strong>{stats.avgGuesses ?? '–'}</strong>
          </p>
        )}
      </div>

      {final && (
        <div className="fixed bottom-4 inset-x-0 mx-auto w-fit px-4 py-2 rounded-xl bg-white/10 backdrop-blur">
          {final.solved ? 'You solved it!' : 'Better luck tomorrow.'} Tries: {final.numGuesses}
        </div>
      )}
    </div>
  )
}

function TTKeyboard({ onKey, disabled }:{ onKey:(k:string)=>void, disabled?:boolean }) {
  const rows = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    ['ENTER', ...'ZXCVBNM'.split(''), 'DEL'],
  ]
  return (
    <div className="select-none">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2 justify-center mb-2">
          {r.map(k => (
            <button key={k}
              onClick={() => onKey(k)}
              disabled={disabled}
              className="px-3 py-2 rounded-md bg-[#2b2240] hover:bg-[#332653] disabled:opacity-40">
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
```

### 6.1 Route registration (`src/App.tsx`)

```tsx
import { lazy } from 'react'
import { Route } from 'react-router-dom'
const TwistedTalesGame = lazy(() => import('@/pages/TwistedTalesGame'))

// inside your router
<Route path="/twisted-tales-game" element={<RequireAuth fallback={<GameTeaser/>}><TwistedTalesGame/></RequireAuth>} />

function GameTeaser(){
  return (
    <div className="p-8 text-center text-white">
      <h2 className="text-xl font-semibold">Sign in to play Twisted Tales</h2>
      <p className="opacity-80">Compete on the leaderboard and keep your daily streak.</p>
    </div>
  )
}

function RequireAuth({ children, fallback }:{ children: React.ReactNode; fallback: React.ReactNode }){
  // wire to your auth state (supabase.auth.onAuthStateChange or context)
  const authed = /* your logic */ false
  return authed ? <>{children}</> : <>{fallback}</>
}
```

---

## 7) Footer Easter Egg Unlock (`src/hooks/useEasterEggUnlock.ts`)

```ts
// src/hooks/useEasterEggUnlock.ts
import { useCallback, useEffect, useState } from 'react'
import { unlockGame } from '@/lib/ttGameApi'

const KEY = 'tt_unlock_v1'

export function useEasterEggUnlock() {
  const [count, setCount] = useState<number>(() => Number(localStorage.getItem(KEY) || 0))
  const [unlocked, setUnlocked] = useState<boolean>(false)

  useEffect(() => {
    // Optionally: fetch server unlocked state and sync here
  }, [])

  const click = useCallback(async () => {
    const next = Math.min(13, count + 1)
    setCount(next)
    localStorage.setItem(KEY, String(next))
    if (next === 13 && !unlocked) {
      await unlockGame()
      setUnlocked(true)
    }
  }, [count, unlocked])

  return { count, unlocked, click }
}
```

### 7.1 Hook usage in Footer (snippet)

```tsx
// src/components/Footer.tsx (snippet)
import { useEasterEggUnlock } from '@/hooks/useEasterEggUnlock'

export function FooterIcons() {
  const { count, unlocked, click } = useEasterEggUnlock()
  return (
    <div className="flex gap-4 text-2xl">
      <button onClick={click}>👻</button>
      <button onClick={click}>🦇</button>
      <button onClick={click}>🎃</button>
      <span className="text-xs opacity-60">{count >= 3 && count < 13 ? `${count}/13` : unlocked ? 'Unlocked!' : null}</span>
    </div>
  )
}
```

---

## 8) Stats Modal (lightweight) (`src/components/game/GameStatsModal.tsx`)

```tsx
import { useEffect, useState } from 'react'
import { getUserStats } from '@/lib/ttGameApi'

export function GameStatsModal({ open, onClose }:{ open:boolean; onClose:()=>void }){
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { if(open) getUserStats().then(setStats) }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40">
      <div className="w-[22rem] rounded-xl p-4 bg-[#201733] text-white">
        <h3 className="text-lg font-semibold mb-2">Your Stats</h3>
        {stats && (
          <ul className="space-y-1 text-sm">
            <li>Current Streak: <b>{stats.currentStreak}</b></li>
            <li>Longest Streak: <b>{stats.longestStreak}</b></li>
            <li>Total Wins: <b>{stats.totalWins}</b></li>
            <li>Win %: <b>{stats.winPct}</b></li>
            <li>Avg Guesses: <b>{stats.avgGuesses ?? '–'}</b></li>
          </ul>
        )}
        <div className="text-right mt-3">
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-white/10">Close</button>
        </div>
      </div>
    </div>
  )
}
```

---

## 9) Simple, paginated Leaderboard (`src/pages/GameLeaderboard.tsx`)

```tsx
import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/lib/ttGameApi'

export default function GameLeaderboard(){
  const [scope, setScope] = useState<'streak'|'wins'|'avg'>('streak')
  const [rows, setRows] = useState<any[]>([])
  const [page, setPage] = useState(0)

  useEffect(() => { load() }, [scope, page])
  async function load(){
    const data = await getLeaderboard(scope, 20, page*20)
    setRows(data)
  }

  return (
    <div className="p-4 text-white">
      <div className="flex gap-2 mb-3">
        {(['streak','wins','avg'] as const).map(s => (
          <button key={s} onClick={() => { setPage(0); setScope(s) }}
            className={`px-3 py-1 rounded ${scope===s?'bg-white/15':'bg-white/5'}`}>{s}</button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead className="text-white/70">
          <tr>
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Player</th>
            <th className="text-right p-2">Stat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rank_no} className="border-top border-white/10">
              <td className="p-2">{r.rank_no}</td>
              <td className="p-2">{r.display_name}</td>
              <td className="p-2 text-right">{r.stat}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-3">
        <button className="px-3 py-1 bg-white/10 rounded" disabled={page===0} onClick={() => setPage(p=>Math.max(0,p-1))}>Prev</button>
        <button className="px-3 py-1 bg-white/10 rounded" onClick={() => setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  )
}
```

---

## 10) Feature flag (optional)

Create an env flag `VITE_FEATURE_TWISTED_TALES=true` and conditionally render the footer teaser / route link.

---

## 11) QA checklist (MVP)

* [ ] UTC midnight rollover confirmed (mock clock in E2E)
* [ ] RLS denies cross-user reads/writes
* [ ] Invalid words return `INVALID_WORD`
* [ ] Duplicate letter cases score correctly
* [ ] Unlock flow persists across refresh and accounts
* [ ] Leaderboard paginates and never leaks emails/user_ids
* [ ] Respect `prefers-reduced-motion`

---

## 12) Deployment notes

1. Apply migrations in Supabase SQL editor or CLI.
2. Replace `TT_SALT_REPLACE_ME` with a real secret (or pgsodium-stored secret).
3. Ship the lazy route; protect behind auth.
4. Soft-launch behind feature flag → broaden access after smoke test.

---

## 13) What’s intentionally left for v1.1

* Animated backgrounds (Framer Motion SVG scenes)
* Realtime leaderboard via Supabase Realtime (polling is fine now)
* Wordlist expansion tooling & lint (ensure all 6 letters; theme tags)
* Profile opt-out/aliases & moderation tools

---

If you want this broken into repo files with a commit plan (filenames + exact add/modify steps), say the word and I’ll lay out the branch script next.
