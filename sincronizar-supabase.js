#!/usr/bin/env node

/**
 * SINCRONIZAR BASELINE COM SUPABASE
 * Lê clientes-baseline.json e atualiza no Supabase
 */

require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sincronizar() {
  console.log('═════════════════════════════════════════');
  console.log('  SINCRONIZAR COM SUPABASE');
  console.log('═════════════════════════════════════════\n');

  // Ler arquivo
  const dados = JSON.parse(fs.readFileSync('clientes-baseline.json', 'utf8'));
  console.log(`📄 Carregados ${dados.length} clientes\n`);

  let inseridos = 0;
  let atualizados = 0;
  let erros = 0;

  for (const cliente of dados) {
    try {
      // Tentar inserir (upsert)
      const { error } = await supabase
        .from('clientes_propostas_baseline')
        .upsert(cliente, {
          onConflict: 'contact_id'
        });

      if (error) throw error;

      console.log(`✅ ${cliente.nome}`);
      atualizados++;

    } catch (err) {
      console.error(`❌ ${cliente.nome}: ${err.message}`);
      erros++;
    }
  }

  console.log('\n═════════════════════════════════════════');
  console.log(`✅ Sincronizados: ${atualizados}`);
  console.log(`❌ Erros: ${erros}`);
  console.log('═════════════════════════════════════════\n');
}

sincronizar().catch(console.error);
