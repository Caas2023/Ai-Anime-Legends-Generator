const { createClient } = require('@supabase/supabase-js');

// Configuração manual para o script de limpeza
const supabaseUrl = 'https://sevnboibounhxwbbgwea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldm5ib2lib3VuaHh3YmJnd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTQyMjIsImV4cCI6MjA5MjIzMDIyMn0.2HAwGGU5WCK7mC74yIfO5naAJ0AcJ7ezD3P7Elx7lNg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log("--- INICIANDO LIMPEZA DE REGISTROS CORROMPIDOS ---");
  
  // As lendas "quebradas" foram criadas hoje (20 de Abril) usando o endpoint /p/
  // Vamos buscar as mais recentes e deletar as que possuem o padrão de erro conhecido
  const { data, error } = await supabase
    .from('community_feed')
    .select('id, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Erro ao buscar registros:", error.message);
    return;
  }

  const toDelete = data.filter(item => {
      // Deletar qualquer uma que use o endpoint antigo /p/ ou que tenha sido criada no intervalo de erro
      return item.image_url.includes('/p/') || (new Date(item.created_at) > new Date('2026-04-20T00:00:00Z'));
  });

  console.log(`Encontrados ${toDelete.length} registros suspeitos.`);

  for (const item of toDelete) {
    console.log(`Deletando lenda corrompida: ${item.id} (${item.image_url.substring(0, 50)}...)`);
    const { error: delError } = await supabase
      .from('community_feed')
      .delete()
      .eq('id', item.id);
    
    if (delError) console.error(`Falha ao deletar ${item.id}:`, delError.message);
  }

  console.log("--- LIMPEZA CONCLUÍDA ---");
}

cleanup();
