-- ============================================================
--  판다 사부의 여름 수련 — Supabase 스키마
--
--  쓰는 법:
--   1) supabase.com 에서 프로젝트를 만든다
--   2) 왼쪽 메뉴 SQL Editor 를 연다
--   3) 이 파일 내용을 통째로 붙여넣고 Run 을 누른다
--
--  이 스키마는 예전 구글 시트의 문제를 고친다:
--   - 비밀번호는 해시로만 저장 (평문 금지)
--   - 열 순서가 아니라 이름표(컬럼)로 데이터를 찾음
--   - 나중에 컬럼을 더해도 기존 데이터가 안 깨짐
-- ============================================================

-- 수련생
create table if not exists players (
  nickname     text primary key,
  pin_hash     text not null,
  character    text not null default '',
  join_date    date not null default current_date,
  honesty_given boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 하루치 수련 기록
create table if not exists day_logs (
  nickname    text not null references players(nickname) on delete cascade,
  date        date not null,
  missions    text[] not null default '{}',
  done        text[] not null default '{}',
  completed   boolean not null default false,
  stars       int not null default 0,
  outcome     text not null default '',
  obstacle    text not null default '',
  plan        text not null default '',
  win         text not null default '',
  self_praise text not null default '',
  note        text not null default '',
  pledged     boolean not null default false,
  confessed   boolean not null default false,
  saved_at    timestamptz not null default now(),
  primary key (nickname, date)
);

-- 얻은 카드
create table if not exists cards (
  nickname  text not null references players(nickname) on delete cascade,
  key       text not null,
  kind      text not null,
  got_date  date not null default current_date,
  pos       int not null default -1,
  primary key (nickname, key)
);

-- 넘어선 보스
create table if not exists boss_clears (
  nickname     text not null references players(nickname) on delete cascade,
  slot_date    date not null,
  cleared_date date not null default current_date,
  boss_id      text not null,
  primary key (nickname, slot_date)
);

-- ------------------------------------------------------------
--  RLS(행 수준 보안)
--  이 앱은 아이들이 닉네임+PIN으로만 쓰는 소규모(5~10명) 앱이라
--  Supabase Auth를 쓰지 않는다. 대신 anon 키로 읽고 쓰되,
--  아래 정책으로 '아무나 전체 삭제' 같은 사고만 막는다.
--  (친구 목록을 보여줘야 하므로 읽기는 모두 허용)
-- ------------------------------------------------------------
alter table players     enable row level security;
alter table day_logs    enable row level security;
alter table cards       enable row level security;
alter table boss_clears enable row level security;

-- 읽기: 누구나 (친구 현황 표시용)
create policy "read all players"  on players     for select using (true);
create policy "read all logs"     on day_logs    for select using (true);
create policy "read all cards"    on cards       for select using (true);
create policy "read all bosses"   on boss_clears for select using (true);

-- 쓰기: 누구나 삽입/수정 가능하되 삭제는 막는다
--  (아이가 실수로도, 남이 장난으로도 남의 기록을 지울 수 없게)
create policy "insert players" on players  for insert with check (true);
create policy "update players" on players  for update using (true);
create policy "insert logs"    on day_logs for insert with check (true);
create policy "update logs"    on day_logs for update using (true);
create policy "insert cards"   on cards    for insert with check (true);
create policy "update cards"   on cards    for update using (true);
create policy "insert bosses"  on boss_clears for insert with check (true);
create policy "update bosses"  on boss_clears for update using (true);
-- (삭제 정책을 안 만들었으므로 삭제는 기본적으로 거부된다)
