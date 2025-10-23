-- Tabela para armazenar baseline e alertas de cada cliente

CREATE TABLE IF NOT EXISTS clientes_propostas_baseline (
  id SERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cnpj TEXT,

  -- Histórico total (todos os tempos)
  total_propostas INT DEFAULT 0,
  total_ganhas INT DEFAULT 0,
  total_perdidas INT DEFAULT 0,
  win_rate_historico DECIMAL(5,2),
  ticket_medio_historico DECIMAL(12,2),

  -- Últimos 3 meses
  propostas_recentes INT DEFAULT 0,
  ganhas_recentes INT DEFAULT 0,
  perdidas_recentes INT DEFAULT 0,
  win_rate_recente DECIMAL(5,2),
  ticket_medio_recente DECIMAL(12,2),

  -- Alertas automáticos
  tem_alerta BOOLEAN DEFAULT FALSE,
  severidade TEXT CHECK (severidade IN ('CRÍTICO', 'ALTO', 'MÉDIO', 'BAIXO')),
  desvio_win_rate DECIMAL(5,2),
  desvio_ticket_medio DECIMAL(5,2),
  motivo_alerta TEXT,

  -- Sugestões de ação (JSON)
  sugestoes_recuperacao JSONB,

  -- Controle
  ultima_atualizacao TIMESTAMP DEFAULT NOW(),
  proxima_sincronizacao TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contact_id ON clientes_propostas_baseline(contact_id);
CREATE INDEX idx_tem_alerta ON clientes_propostas_baseline(tem_alerta) WHERE tem_alerta = TRUE;
CREATE INDEX idx_severidade ON clientes_propostas_baseline(severidade);
CREATE INDEX idx_ultima_atualizacao ON clientes_propostas_baseline(ultima_atualizacao DESC);

-- Comentários
COMMENT ON TABLE clientes_propostas_baseline IS 'Baseline e alertas de propostas perdidas por cliente';
COMMENT ON COLUMN clientes_propostas_baseline.desvio_win_rate IS 'Diferença entre win rate recente e histórico (%)';
COMMENT ON COLUMN clientes_propostas_baseline.sugestoes_recuperacao IS 'Array JSON com 5 sugestões específicas para recuperar cliente';
