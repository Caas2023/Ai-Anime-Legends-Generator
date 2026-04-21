-- ==========================================================
-- SUPABASE KEEP-ALIVE BUNDLE (Antigravity v6.0)
-- ==========================================================
-- Este script faz duas coisas:
-- 1. Garante que a tabela 'community_feed' exista.
-- 2. Agenda a tarefa de Keep-Alive de forma segura.
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

-- B. CONFIGURAR EXTENSÃO
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- C. CONFIGURAR CRON DE FORMA SEGURA
-- Remove a tarefa antiga apenas se ela existir (evita erro XX000)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'supabase-keep-alive-task') THEN
        PERFORM cron.unschedule('supabase-keep-alive-task');
    END IF;
END $$;

-- Agenda a nova tarefa com caminho explícito (public.community_feed)
SELECT cron.schedule(
  'supabase-keep-alive-task',
  '0 0 */3 * *',               -- A cada 3 dias
  'SELECT count(*) FROM public.community_feed;' 
);

-- D. TESTE DE VALIDAÇÃO
-- Execute o SELECT abaixo para confirmar que a tarefa foi criada:
-- SELECT * FROM cron.job WHERE jobname = 'supabase-keep-alive-task';
