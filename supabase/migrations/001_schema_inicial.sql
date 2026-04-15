-- ============================================
-- NA2S — Schema Inicial v1.0
-- ============================================

-- Habilitar extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================
-- TÉCNICOS PARCEIROS
-- ============================================
create table tecnicos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text,
  cnpj text,
  whatsapp_pessoal text,
  whatsapp_negocio text,
  email text,
  instagram text,
  pacote text not null check (pacote in ('starter', 'pro', 'full')),
  status text not null default 'piloto' check (status in ('piloto', 'ativo', 'inativo', 'inadimplente', 'cancelado')),
  origem text check (origem in ('indicacao', 'instagram', 'grupo_whatsapp', 'landing_page', 'abordagem_direta')),
  data_inicio date not null,
  dia_cobranca integer not null default 5 check (dia_cobranca between 1 and 28),
  token_acesso uuid not null default uuid_generate_v4() unique,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- CONTRATOS
-- ============================================
create table contratos (
  id uuid primary key default uuid_generate_v4(),
  tecnico_id uuid not null references tecnicos(id) on delete cascade,
  pacote text not null check (pacote in ('starter', 'pro', 'full')),
  mensalidade_valor numeric(10,2) not null,
  comissao_pct numeric(5,2) not null,
  status text not null default 'ativo' check (status in ('ativo', 'encerrado', 'suspenso', 'em_negociacao')),
  eh_piloto boolean not null default false,
  mes_piloto_atual integer default 1 check (mes_piloto_atual in (1, 2, 3)),
  prazo_minimo_meses integer not null default 3,
  data_inicio date not null,
  data_fim date,
  condicoes_especiais text,
  created_at timestamptz not null default now()
);

-- ============================================
-- CLIENTES (dos técnicos)
-- ============================================
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  tecnico_id uuid not null references tecnicos(id) on delete cascade,
  nome text not null,
  cpf text,
  data_nascimento date,
  whatsapp text,
  email text,
  endereco_rua text,
  endereco_numero text,
  endereco_bairro text,
  endereco_cidade text,
  endereco_cep text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- EQUIPAMENTOS
-- ============================================
create table equipamentos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  tecnico_id uuid not null references tecnicos(id),
  tipo text not null check (tipo in ('split', 'cassete', 'janela', 'multi_split', 'pe_teto', 'comercial', 'industrial')),
  marca text,
  btus integer,
  ambiente text,
  ultima_manutencao date,
  periodicidade_meses integer default 6,
  proxima_manutencao date generated always as (
    case
      when ultima_manutencao is not null and periodicidade_meses is not null
      then ultima_manutencao + (periodicidade_meses || ' months')::interval
      else null
    end
  ) stored,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ORDENS DE SERVIÇO
-- ============================================
create table ordens_servico (
  id uuid primary key default uuid_generate_v4(),
  numero_os serial,
  tecnico_id uuid not null references tecnicos(id) on delete cascade,
  cliente_id uuid not null references clientes(id),

  -- Abertura
  status text not null default 'agendada' check (status in ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  tipo_servico text check (tipo_servico in ('instalacao', 'manutencao', 'limpeza', 'reparo', 'orcamento', 'outros')),
  descricao_solicitacao text,
  data_agendamento timestamptz,

  -- Fechamento
  data_conclusao timestamptz,
  o_que_foi_feito text,
  valor_cobrado numeric(10,2),
  forma_pagamento text check (forma_pagamento in ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto', 'transferencia')),
  status_pagamento text default 'pendente' check (status_pagamento in ('pago', 'pendente', 'inadimplente')),
  data_pagamento date,

  -- Comissão (snapshot do contrato no momento da conclusão)
  comissao_pct numeric(5,2),
  comissao_valor numeric(10,2),

  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- OS ↔ EQUIPAMENTOS (junction table)
-- ============================================
create table os_equipamentos (
  os_id uuid not null references ordens_servico(id) on delete cascade,
  equipamento_id uuid not null references equipamentos(id) on delete cascade,
  primary key (os_id, equipamento_id)
);

-- ============================================
-- ORÇAMENTOS
-- ============================================
create table orcamentos (
  id uuid primary key default uuid_generate_v4(),
  os_id uuid not null references ordens_servico(id) on delete cascade,
  tecnico_id uuid not null references tecnicos(id),
  cliente_id uuid not null references clientes(id),
  descricao text,
  itens jsonb,
  valor_estimado numeric(10,2),
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'expirado')),
  validade_dias integer default 7,
  data_envio date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- FINANCEIRO MENSAL (consolidado por técnico)
-- ============================================
create table financeiro_mensal (
  id uuid primary key default uuid_generate_v4(),
  tecnico_id uuid not null references tecnicos(id) on delete cascade,
  mes_referencia char(7) not null, -- formato: YYYY-MM
  faturamento_bruto numeric(10,2) not null default 0,
  num_os_concluidas integer not null default 0,
  ticket_medio numeric(10,2) generated always as (
    case when num_os_concluidas > 0
    then faturamento_bruto / num_os_concluidas
    else 0
    end
  ) stored,
  total_comissao_na2s numeric(10,2) not null default 0,
  mensalidade_valor numeric(10,2) not null default 0,
  total_devido_na2s numeric(10,2) generated always as (
    total_comissao_na2s + mensalidade_valor
  ) stored,
  status_mensalidade text not null default 'pendente' check (status_mensalidade in ('pago', 'pendente', 'inadimplente')),
  data_vencimento_mensalidade date,
  data_pagamento_mensalidade date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tecnico_id, mes_referencia)
);

-- ============================================
-- REPASSES QUINZENAIS (comissão → NA2S)
-- ============================================
create table repasses (
  id uuid primary key default uuid_generate_v4(),
  tecnico_id uuid not null references tecnicos(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  valor_comissao numeric(10,2) not null default 0,
  valor_total numeric(10,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'inadimplente')),
  data_vencimento date not null,
  data_pagamento date,
  observacoes text,
  created_at timestamptz not null default now()
);

-- ============================================
-- LOG DE ALTERAÇÕES EM OS (auditoria)
-- ============================================
create table os_log (
  id uuid primary key default uuid_generate_v4(),
  os_id uuid not null references ordens_servico(id) on delete cascade,
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por text not null default 'stephanie',
  created_at timestamptz not null default now()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
create index idx_clientes_tecnico on clientes(tecnico_id);
create index idx_os_tecnico on ordens_servico(tecnico_id);
create index idx_os_cliente on ordens_servico(cliente_id);
create index idx_os_status on ordens_servico(status);
create index idx_os_status_pagamento on ordens_servico(status_pagamento);
create index idx_equipamentos_cliente on equipamentos(cliente_id);
create index idx_equipamentos_proxima_manutencao on equipamentos(proxima_manutencao);
create index idx_financeiro_tecnico_mes on financeiro_mensal(tecnico_id, mes_referencia);
create index idx_repasses_tecnico on repasses(tecnico_id);
create index idx_tecnicos_token on tecnicos(token_acesso);

-- ============================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar trigger nas tabelas que têm updated_at
create trigger trg_tecnicos_updated_at before update on tecnicos for each row execute function update_updated_at();
create trigger trg_clientes_updated_at before update on clientes for each row execute function update_updated_at();
create trigger trg_equipamentos_updated_at before update on equipamentos for each row execute function update_updated_at();
create trigger trg_os_updated_at before update on ordens_servico for each row execute function update_updated_at();
create trigger trg_orcamentos_updated_at before update on orcamentos for each row execute function update_updated_at();
create trigger trg_financeiro_updated_at before update on financeiro_mensal for each row execute function update_updated_at();

-- ============================================
-- RLS (Row Level Security) — desabilitar por ora
-- O sistema usa service_role no backend.
-- Habilitar RLS com políticas quando houver
-- autenticação por técnico implementada.
-- ============================================
