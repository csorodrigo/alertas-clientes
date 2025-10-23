// Template de configuração para Vercel
// Este arquivo será usado para gerar config.js com as env vars do Vercel

const CONFIG = {
  SUPABASE_URL: '__SUPABASE_URL__',
  SUPABASE_ANON_KEY: '__SUPABASE_ANON_KEY__',
  PLOOME_API_KEY: '__PLOOME_API_KEY__',
  OPENAI_API_KEY: '__OPENAI_API_KEY__'
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
