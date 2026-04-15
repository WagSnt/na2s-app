export type StatusTecnico = 'piloto' | 'ativo' | 'inativo' | 'inadimplente' | 'cancelado'
export type Pacote = 'starter' | 'pro' | 'full'
export type StatusContrato = 'ativo' | 'encerrado' | 'suspenso' | 'em_negociacao'

export interface Tecnico {
  id: string
  nome: string
  cpf?: string
  cnpj?: string
  whatsapp_pessoal: string
  whatsapp_negocio?: string
  email?: string
  instagram?: string
  pacote: Pacote
  status: StatusTecnico
  origem?: string
  data_inicio: string
  dia_cobranca: number
  token_acesso: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  tecnico_id: string
  nome: string
  cpf?: string
  data_nascimento?: string
  whatsapp?: string
  email?: string
  endereco_rua?: string
  endereco_numero?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_cep?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export type TipoEquipamento = 'split' | 'cassete' | 'janela' | 'multi_split' | 'pe_teto' | 'comercial' | 'industrial'
export type StatusOS = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
export type StatusPagamento = 'pago' | 'pendente' | 'inadimplente'
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia'
export type TipoServico = 'instalacao' | 'manutencao' | 'limpeza' | 'reparo' | 'orcamento' | 'outros'

export interface Equipamento {
  id: string
  cliente_id: string
  tecnico_id: string
  tipo: TipoEquipamento
  marca?: string
  btus?: number
  ambiente?: string
  ultima_manutencao?: string
  periodicidade_meses?: number
  proxima_manutencao?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface OrdemServico {
  id: string
  numero_os: number
  tecnico_id: string
  cliente_id: string
  status: StatusOS
  tipo_servico?: TipoServico
  descricao_solicitacao?: string
  data_agendamento?: string
  data_conclusao?: string
  o_que_foi_feito?: string
  valor_cobrado?: number
  forma_pagamento?: FormaPagamento
  status_pagamento?: StatusPagamento
  data_pagamento?: string
  comissao_pct?: number
  comissao_valor?: number
  observacoes?: string
  created_at: string
  updated_at: string
  cliente?: { nome: string; whatsapp?: string }
  tecnico?: { nome: string }
  equipamentos?: Equipamento[]
}

export interface Contrato {
  id: string
  tecnico_id: string
  pacote: Pacote
  mensalidade_valor: number
  comissao_pct: number
  status: StatusContrato
  eh_piloto: boolean
  mes_piloto_atual?: number
  prazo_minimo_meses: number
  data_inicio: string
  data_fim?: string
  condicoes_especiais?: string
}

export type StatusPagamentoMensal = 'pago' | 'pendente' | 'inadimplente'
export type StatusRepasse = 'pendente' | 'pago' | 'inadimplente'

export interface FinanceiroMensal {
  id: string
  tecnico_id: string
  mes_referencia: string // YYYY-MM
  faturamento_bruto: number
  num_os_concluidas: number
  ticket_medio: number // gerado pelo banco
  total_comissao_na2s: number
  mensalidade_valor: number
  total_devido_na2s: number // gerado pelo banco
  status_mensalidade: StatusPagamentoMensal
  data_vencimento_mensalidade?: string
  data_pagamento_mensalidade?: string
  observacoes?: string
  tecnico?: { nome: string; pacote: string }
}

export interface Repasse {
  id: string
  tecnico_id: string
  periodo_inicio: string
  periodo_fim: string
  valor_comissao: number
  valor_total: number
  status: StatusRepasse
  data_vencimento: string
  data_pagamento?: string
  observacoes?: string
  tecnico?: { nome: string }
}
