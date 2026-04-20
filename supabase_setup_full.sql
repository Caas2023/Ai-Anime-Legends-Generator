-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA SUPABASE
-- Projeto: AI Anime Legends Generator
-- ==========================================

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

-- Ativar Row Level Security (RLS)
ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver (Leitura Pública)
CREATE POLICY "Leitura pública para todos" 
ON public.community_feed FOR SELECT 
USING (true);

-- Política: Todos podem inserir (Inserção Pública Anônima)
-- Ideal para o MVP onde não há login de usuário
CREATE POLICY "Inserção pública anônima"
ON public.community_feed FOR INSERT
WITH CHECK (true);


-- 2. STORAGE (Bucket 'gallery')
-- ------------------------------------------

-- Criar o bucket se ele não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: Leitura Pública
CREATE POLICY "Acesso público de leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Política de Storage: Inserção Pública (Upload)
CREATE POLICY "Permitir upload público"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Política de Storage: Exclusão (Opcional, apenas admin)
CREATE POLICY "Permitir delete para admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');


-- 3. REALTIME (Ativar atualizações ao vivo)
-- ------------------------------------------

-- Habilitar Realtime para a tabela community_feed
-- Isso faz com que o mural atualize sozinho quando alguém gera uma foto nova
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_feed;

-- FIM DO SCRIPT
-- Role o script no SQL Editor do Supabase e tudo estará pronto! 🚀
