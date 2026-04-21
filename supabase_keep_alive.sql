-- ==========================================================
-- SUPABASE KEEP-ALIVE SCRIPT (Antigravity v5.8)
-- ==========================================================
-- Este script garante que o banco de dados não seja pausado 
-- por inatividade, realizando uma leitura a cada 3 dias.
--
-- INSTRUÇÕES:
-- 1. Copie este código.
-- 2. Cole no "SQL Editor" do seu painel Supabase.
-- 3. Clique em "Run".
-- ==========================================================

-- Habilita a extensão de agendamento do Postgres
create extension if not exists pg_cron;

-- Agenda uma tarefa de leitura (SELECT) a cada 3 dias às 00:00
-- Isso mantém o motor do banco de dados ativo.
select cron.schedule(
  'supabase-keep-alive-task', -- Nome da tarefa
  '0 0 */3 * *',               -- Cron syntax (A cada 3 dias)
  'SELECT count(*) FROM community_feed;' -- Comando inofensivo de leitura
);

-- Para verificar se a tarefa foi criada, rode:
-- select * from cron.job;
