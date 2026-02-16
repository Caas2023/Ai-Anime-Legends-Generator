import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url.startsWith('http')) {
        supabase = createClient(url, key);
    } else {
        console.warn('[SUPABASE] Variáveis de ambiente não configuradas. Galeria online desativada.');
    }
} catch (e) {
    console.error('[SUPABASE] Falha na inicialização:', e);
    supabase = null;
}

export { supabase };
