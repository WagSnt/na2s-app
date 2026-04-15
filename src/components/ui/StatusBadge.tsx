import type { StatusTecnico } from '@/types'

const config: Record<
  StatusTecnico,
  { label: string; color: string; bg: string; border: string }
> = {
  piloto: {
    label: 'Piloto',
    color: '#C8FF57',
    bg: 'rgba(200,255,87,0.1)',
    border: 'rgba(200,255,87,0.25)',
  },
  ativo: {
    label: 'Ativo',
    color: '#C8FF57',
    bg: 'rgba(200,255,87,0.1)',
    border: 'rgba(200,255,87,0.25)',
  },
  inativo: {
    label: 'Inativo',
    color: '#5A6070',
    bg: 'rgba(90,96,112,0.1)',
    border: 'rgba(90,96,112,0.25)',
  },
  inadimplente: {
    label: 'Inadimplente',
    color: '#FFB830',
    bg: 'rgba(255,184,48,0.1)',
    border: 'rgba(255,184,48,0.25)',
  },
  cancelado: {
    label: 'Cancelado',
    color: '#5A6070',
    bg: 'rgba(90,96,112,0.1)',
    border: 'rgba(90,96,112,0.25)',
  },
}

export function StatusBadge({ status }: { status: StatusTecnico }) {
  const { label, color, bg, border } = config[status] ?? config.inativo

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 10px',
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
