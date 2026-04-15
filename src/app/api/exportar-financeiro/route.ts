import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@/lib/supabase/server'

// ---- Helpers ----------------------------------------------------------------

function formatCurrency(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMes(mesRef: string): string {
  const [ano, mes] = mesRef.split('-').map(Number)
  const d = new Date(ano, mes - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatDate(str?: string | null): string {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ---- Cores ------------------------------------------------------------------
const COR_FUNDO = '#FFFFFF'
const COR_TEXTO = '#0A0C0F'
const COR_HEADER_TABLE = '#0A0C0F'
const COR_LINHA_PAR = '#F5F5F5'
const COR_PAGO = '#1A5C00'
const COR_PENDENTE = '#CC8800'
const COR_SECUNDARIO = '#555555'

// ---- Gerador de tabela com pdfkit -------------------------------------------

function drawTable(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
): number {
  const ROW_H = 20
  const HEADER_H = 22
  const FONT_SIZE = 8

  // Header
  doc.rect(x, y, width, HEADER_H).fill(COR_HEADER_TABLE)
  let cx = x + 4
  headers.forEach((h, i) => {
    doc.fillColor('#FFFFFF').fontSize(FONT_SIZE).font('Helvetica-Bold')
    doc.text(h, cx, y + 5, { width: colWidths[i] - 6, lineBreak: false })
    cx += colWidths[i]
  })
  y += HEADER_H

  // Rows
  rows.forEach((row, rowIdx) => {
    const bg = rowIdx % 2 === 1 ? COR_LINHA_PAR : COR_FUNDO
    doc.rect(x, y, width, ROW_H).fill(bg)

    cx = x + 4
    row.forEach((cell, colIdx) => {
      // Colorir coluna Status
      const header = headers[colIdx]?.toLowerCase() ?? ''
      let cellColor = COR_TEXTO
      if (header === 'status') {
        if (cell === 'Pago') cellColor = COR_PAGO
        else if (cell === 'Pendente' || cell === 'Inadimplente') cellColor = COR_PENDENTE
      }

      doc.fillColor(cellColor).fontSize(FONT_SIZE).font('Helvetica')
      doc.text(cell, cx, y + 5, { width: colWidths[colIdx] - 6, lineBreak: false, ellipsis: true })
      cx += colWidths[colIdx]
    })

    // Border bottom
    doc.moveTo(x, y + ROW_H).lineTo(x + width, y + ROW_H)
      .strokeColor('#DDDDDD').lineWidth(0.5).stroke()

    y += ROW_H
  })

  return y
}

// ---- GET handler ------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tecnico_id = searchParams.get('tecnico_id') ?? undefined
  const mes_inicio = searchParams.get('mes_inicio') ?? undefined
  const mes_fim = searchParams.get('mes_fim') ?? undefined

  const supabase = await createClient()

  // ---- Buscar mensalidades --------------------------------------------------
  let qMensal = supabase
    .from('financeiro_mensal')
    .select('*, tecnico:tecnicos(nome, pacote)')
    .order('mes_referencia', { ascending: false })

  if (tecnico_id) qMensal = qMensal.eq('tecnico_id', tecnico_id)
  if (mes_inicio) qMensal = qMensal.gte('mes_referencia', mes_inicio)
  if (mes_fim) qMensal = qMensal.lte('mes_referencia', mes_fim)

  const { data: mensalidades } = await qMensal

  // ---- Buscar repasses ------------------------------------------------------
  let qRepasses = supabase
    .from('repasses')
    .select('*, tecnico:tecnicos(nome)')
    .order('data_vencimento', { ascending: false })

  if (tecnico_id) qRepasses = qRepasses.eq('tecnico_id', tecnico_id)
  if (mes_inicio) qRepasses = qRepasses.gte('periodo_inicio', mes_inicio + '-01')
  if (mes_fim) {
    const [ano, mes] = mes_fim.split('-').map(Number)
    const ultimoDia = new Date(ano, mes, 0).getDate()
    qRepasses = qRepasses.lte('periodo_fim', `${mes_fim}-${String(ultimoDia).padStart(2, '0')}`)
  }

  const { data: repasses } = await qRepasses

  // ---- Nomear técnico (se filtrado) -----------------------------------------
  let nomeTecnico = 'Todos os técnicos'
  if (tecnico_id && mensalidades && mensalidades.length > 0) {
    const tec = (mensalidades[0] as { tecnico?: { nome?: string } }).tecnico
    nomeTecnico = tec?.nome ?? nomeTecnico
  }

  // ---- Construir PDF --------------------------------------------------------
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: 'Extrato Financeiro NA2S' } })
  const buffers: Buffer[] = []

  doc.on('data', (chunk: Buffer) => buffers.push(chunk))

  await new Promise<void>((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)

    const PAGE_W = 595 - 80 // largura útil (margens 40 cada lado)
    const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    const periodoLabel = mes_inicio && mes_fim
      ? mes_inicio === mes_fim
        ? formatMes(mes_inicio)
        : `${formatMes(mes_inicio)} a ${formatMes(mes_fim)}`
      : 'Todos os períodos'

    // ---- Cabeçalho ----------------------------------------------------------
    doc.fontSize(20).font('Helvetica-Bold').fillColor(COR_TEXTO)
    doc.text('NA²S', 40, 40, { continued: true })
    doc.fontSize(10).font('Helvetica').fillColor(COR_SECUNDARIO)
    doc.text('  Gestão que sobe junto.', { lineBreak: false })

    doc.moveDown(0.5)
    doc.fontSize(14).font('Helvetica-Bold').fillColor(COR_TEXTO)
    doc.text(`Extrato Financeiro — ${nomeTecnico}`)

    doc.fontSize(10).font('Helvetica').fillColor(COR_SECUNDARIO)
    doc.text(`Período: ${periodoLabel}`)
    doc.text(`Gerado em: ${dataGeracao}`)

    // Linha divisória
    const yAfterHeader = doc.y + 10
    doc.moveTo(40, yAfterHeader).lineTo(555, yAfterHeader)
      .strokeColor('#CCCCCC').lineWidth(1).stroke()

    doc.y = yAfterHeader + 12

    // ---- Tabela de mensalidades ---------------------------------------------
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COR_TEXTO)
    doc.text('Mensalidades')
    doc.moveDown(0.3)

    const mensalidadesRows = (mensalidades ?? []).map((r) => {
      const tec = (r as { tecnico?: { nome?: string } }).tecnico
      const nome = tec?.nome ?? '—'
      const status = r.status_mensalidade === 'pago' ? 'Pago'
        : r.status_mensalidade === 'inadimplente' ? 'Inadimplente' : 'Pendente'
      return [
        (r.mes_referencia as string).slice(0, 7),
        nome,
        formatCurrency(r.faturamento_bruto ?? 0),
        formatCurrency(r.mensalidade_valor ?? 0),
        formatCurrency(r.total_comissao_na2s ?? 0),
        formatCurrency(r.total_devido_na2s ?? 0),
        status,
      ]
    })

    const mensalidadesHeaders = ['Mês', 'Técnico', 'Faturamento', 'Mensalidade', 'Comissão', 'Total', 'Status']
    const mensalidadesWidths = [52, 100, 72, 72, 62, 72, 58]

    let currentY = drawTable(doc, 40, doc.y, PAGE_W, mensalidadesHeaders, mensalidadesRows, mensalidadesWidths)
    doc.y = currentY + 14

    // ---- Tabela de repasses -------------------------------------------------
    // Nova página se pouco espaço
    if (doc.y > 620) doc.addPage()

    doc.fontSize(11).font('Helvetica-Bold').fillColor(COR_TEXTO)
    doc.text('Repasses')
    doc.moveDown(0.3)

    const repassesRows = (repasses ?? []).map((r) => {
      const tec = (r as { tecnico?: { nome?: string } }).tecnico
      const nome = tec?.nome ?? '—'
      const d1 = new Date((r.periodo_inicio as string) + 'T00:00:00')
      const d2 = new Date((r.periodo_fim as string) + 'T00:00:00')
      const periodo = `${d1.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}–${d2.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
      const status = r.status === 'pago' ? 'Pago' : r.status === 'inadimplente' ? 'Inadimplente' : 'Pendente'
      return [
        nome,
        periodo,
        formatCurrency(r.valor_comissao ?? 0),
        formatDate(r.data_vencimento as string),
        status,
        formatDate(r.data_pagamento as string | null),
      ]
    })

    const repassesHeaders = ['Técnico', 'Período', 'Comissão', 'Vencimento', 'Status', 'Data pgto']
    const repassesWidths = [110, 80, 80, 80, 70, 70]

    currentY = drawTable(doc, 40, doc.y, PAGE_W, repassesHeaders, repassesRows, repassesWidths)
    doc.y = currentY + 14

    // ---- Totais -------------------------------------------------------------
    if (doc.y > 680) doc.addPage()

    const totalFaturamento = (mensalidades ?? []).reduce((acc, r) => acc + (r.faturamento_bruto ?? 0), 0)
    const totalDevido = (mensalidades ?? []).reduce((acc, r) => acc + (r.total_devido_na2s ?? 0), 0)
    const totalRecebido = (mensalidades ?? [])
      .filter((r) => r.status_mensalidade === 'pago')
      .reduce((acc, r) => acc + (r.total_devido_na2s ?? 0), 0)
    const totalPendente = totalDevido - totalRecebido

    doc.fontSize(11).font('Helvetica-Bold').fillColor(COR_TEXTO)
    doc.text('Totais')
    doc.moveDown(0.3)

    const totaisData = [
      ['Total faturado pelos técnicos', formatCurrency(totalFaturamento)],
      ['Total devido à NA2S', formatCurrency(totalDevido)],
      ['Total recebido', formatCurrency(totalRecebido)],
      ['Total pendente', formatCurrency(totalPendente)],
    ]

    totaisData.forEach(([label, value]) => {
      doc.fontSize(9).font('Helvetica').fillColor(COR_SECUNDARIO)
      doc.text(label, 40, doc.y, { continued: true, width: 250 })
      doc.font('Helvetica-Bold').fillColor(COR_TEXTO)
      doc.text(value, { lineBreak: true })
    })

    // ---- Rodapé -------------------------------------------------------------
    const pageHeight = 842
    doc.fontSize(7).font('Helvetica').fillColor(COR_SECUNDARIO)
    doc.text(
      `Documento gerado em ${dataGeracao} — NA2S Gestão Operacional e Financeira`,
      40,
      pageHeight - 50,
      { align: 'center', width: PAGE_W },
    )

    doc.end()
  })

  const pdfBuffer = Buffer.concat(buffers)

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="extrato-financeiro-${mes_inicio ?? 'geral'}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
