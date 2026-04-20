-- ========================================================
-- SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA SUPABASE (IDEMPOTENTE)
-- Projeto: AI Anime Legends Generator
-- ========================================================

-- 1. TABELA DO MURAL (community_feed)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url TEXT NOT NULL,
  character_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_video BOOLEAN DEFAULT false
);

-- Habilitar RLS (Se já estiver habilitado, não há problema)
ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas para evitar erros de "Already Exists"
DROP POLICY IF EXISTS "Leitura pública para todos" ON public.community_feed;
DROP POLICY IF EXISTS "Inserção pública anônima" ON public.community_feed;

-- Criar políticas atualizadas
CREATE POLICY "Leitura pública para todos" 
ON public.community_feed FOR SELECT 
USING (true);

CREATE POLICY "Inserção pública anônima"
ON public.community_feed FOR INSERT
WITH CHECK (true);


-- 2. STORAGE (Bucket 'gallery')
-- ------------------------------------------

-- Criar o bucket se ele não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Limpar políticas de storage antigas
DROP POLICY IF EXISTS "Acesso público de leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete para admins" ON storage.objects;

-- Criar políticas de Storage atualizadas
CREATE POLICY "Acesso público de leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Permitir upload público"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Permitir delete para admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');


-- 3. REALTIME (Ativar atualizações ao vivo)
-- ------------------------------------------

-- Habilitar Realtime com segurança (verifica se já existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'community_feed'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_feed;
  END IF;
END $$;

-- FIM DO SCRIPT
-- Role o script novamente no SQL Editor e agora ele ignorará o que já existe! 🚀
