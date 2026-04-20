-- 1. Crie a tabela para a Galeria da Comunidade
CREATE TABLE community_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  character_id TEXT,
  style_id TEXT,
  is_video BOOLEAN DEFAULT false
);

-- 2. Habilite o acesso público (Leitura para todos)
ALTER TABLE community_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público de leitura" 
ON community_feed FOR SELECT 
USING (true);

-- 3. Habilite inserção pública (Para qualquer um que gere arte no seu site poder contribuir)
CREATE POLICY "Inserção pública anônima"
ON community_feed FOR INSERT
WITH CHECK (true);
