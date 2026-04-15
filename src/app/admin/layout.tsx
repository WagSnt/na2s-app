import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarDesktop, BottomNavMobile } from '@/components/SidebarNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--na2s-noite)' }}>
      {/* Sidebar — desktop */}
      <div className="hidden md:block">
        <SidebarDesktop />
      </div>

      {/* Conteúdo principal */}
      <main
        style={{
          overflowY: 'auto',
        }}
        className="
          md:ml-[240px]
          pb-[64px] md:pb-0
          p-4 md:p-8
        "
      >
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <div className="block md:hidden">
        <BottomNavMobile />
      </div>
    </div>
  )
}
