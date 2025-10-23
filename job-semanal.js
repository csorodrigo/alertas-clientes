#!/usr/bin/env node

/**
 * JOB SEMANAL - RECÁLCULO DE BASELINE
 * Executa toda segunda-feira às 6h
 * 
 * Configuração cron: 0 6 * * 1
 */

require('dotenv').config({ path: '../.env.local' });
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function executarJob() {
  console.log('═════════════════════════════════════════');
  console.log('  JOB SEMANAL - RECÁLCULO BASELINE');
  console.log('═════════════════════════════════════════');
  console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

  const inicio = Date.now();

  try {
    // 1. Executar varredura completa
    console.log('📊 Executando varredura completa...');
    const { stdout: stdout1 } = await execPromise('node varredura-completa-clientes.js');
    console.log(stdout1);

    // 2. Sincronizar com Supabase
    console.log('\n💾 Sincronizando com Supabase...');
    const { stdout: stdout2 } = await execPromise('node sincronizar-supabase.js');
    console.log(stdout2);

    const tempoTotal = Math.round((Date.now() - inicio) / 1000);

    console.log('\n═════════════════════════════════════════');
    console.log('✅ JOB CONCLUÍDO COM SUCESSO');
    console.log(`Tempo total: ${tempoTotal}s`);
    console.log(`Fim: ${new Date().toLocaleString('pt-BR')}`);
    console.log('═════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ ERRO NO JOB:', err.message);
    process.exit(1);
  }
}

executarJob().catch(console.error);
