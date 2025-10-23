// Configuração para usar variáveis de ambiente do Vercel
// No Vercel, configure as env vars com prefixo NEXT_PUBLIC_ ou use este sistema
const CONFIG = {
  SUPABASE_URL: typeof process !== 'undefined' && process.env?.SUPABASE_URL
    ? process.env.SUPABASE_URL
    : (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
      ? 'https://YOUR_PROJECT.supabase.co' // Será substituído por env var
      : 'https://YOUR_PROJECT.supabase.co'),

  SUPABASE_ANON_KEY: typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY
    ? process.env.SUPABASE_ANON_KEY
    : (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
      ? 'YOUR_ANON_KEY' // Será substituído por env var
      : 'YOUR_ANON_KEY'),

  PLOOME_API_KEY: typeof process !== 'undefined' && process.env?.PLOOME_API_KEY
    ? process.env.PLOOME_API_KEY
    : '',

  OPENAI_API_KEY: typeof process !== 'undefined' && process.env?.OPENAI_API_KEY
    ? process.env.OPENAI_API_KEY
    : ''
};

// Exportar como global
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
