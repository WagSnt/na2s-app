import type { StatusOS } from '@/types'

const config: Record<StatusOS, { label: string; color: string; bg: string; border: string }> = {
  agendada: {
    label: 'Agendada',
    color: '#F0EDE6',
    bg: 'rgba(240,237,230,0.1)',
    border: 'rgba(240,237,230,0.2)',
  },
  em_andamento: {
    label: 'Em andamento',
    color: '#FFB830',
    bg: 'rgba(255,184,48,0.1)',
    border: 'rgba(255,184,48,0.25)',
  },
  concluida: {
    label: 'Concluída',
    color: '#C8FF57',
    bg: 'rgba(200,255,87,0.1)',
    border: 'rgba(200,255,87,0.25)',
  },
  cancelada: {
    label: 'Cancelada',
    color: '#5A6070',
    bg: 'rgba(90,96,112,0.1)',
    border: 'rgba(90,96,112,0.25)',
  },
}

export function OSStatusBadge({ status }: { status: StatusOS }) {
  const { label, color, bg, border } = config[status] ?? config.agendada

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
