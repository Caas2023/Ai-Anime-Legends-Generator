import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Verificação robusta de URL para evitar erros de DNS/WebSocket no PageSpeed
    if (url && key && url.startsWith('http') && url.includes('.')) {
        supabase = createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
            // Otimização de Best Practices: Configurações de Realtime resilientes
            realtime: {
                params: {
                    eventsPerSecond: 2
                }
            }
        });
    } else {
        console.warn('[SUPABASE] Variáveis de ambiente ausentes ou inválidas. Galeria online operando em modo degradado.');
    }
} catch (e) {
    console.error('[SUPABASE] Falha crítica na inicialização:', e);
    supabase = null;
}

export { supabase };
