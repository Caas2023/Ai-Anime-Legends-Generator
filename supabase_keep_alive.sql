-- ==========================================================
-- SUPABASE KEEP-ALIVE BUNDLE (Antigravity v5.9)
-- ==========================================================
-- Este script faz duas coisas:
-- 1. Garante que a tabela 'community_feed' exista.
-- 2. Agenda a tarefa de Keep-Alive para evitar pausa do banco.
-- ==========================================================

-- A. GARANTIR TABELA (Idempotente)
CREATE TABLE IF NOT EXISTS public.community_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url TEXT NOT NULL,
  character_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_video BOOLEAN DEFAULT false
);

-- B. CONFIGURAR CRON
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover tarefa antiga se existir para evitar erro de duplicidade
SELECT cron.unschedule('supabase-keep-alive-task');

-- Agendar nova tarefa com schema explícito
SELECT cron.schedule(
  'supabase-keep-alive-task',
  '0 0 */3 * *',               -- A cada 3 dias
  'SELECT count(*) FROM public.community_feed;' 
);

-- C. TESTE DE VALIDAÇÃO
-- O comando abaixo deve retornar pelo menos uma linha com o nome da tarefa
-- SELECT * FROM cron.job WHERE jobname = 'supabase-keep-alive-task';
