'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_credentials')
      ) {
        setErro('E-mail ou senha incorretos.')
      } else {
        setErro('Erro ao conectar. Tente novamente.')
      }
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--na2s-noite)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--na2s-ardosia)',
          border: '1px solid var(--na2s-borda)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-space-grotesk), var(--font-display)',
              fontWeight: 700,
              fontSize: '32px',
              letterSpacing: '-2px',
              color: 'var(--na2s-papel)',
              lineHeight: 1,
            }}
          >
            NA<sup style={{ color: 'var(--na2s-lima)', fontSize: '18px', verticalAlign: 'super' }}>2</sup>S
          </div>
          <p
            style={{
              color: 'var(--na2s-texto-secundario)',
              fontSize: '14px',
              marginTop: '8px',
            }}
          >
            Gestão que sobe junto.
          </p>
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: 'var(--na2s-lima)',
              margin: '24px auto',
            }}
          />
        </div>

        {/* Título */}
        <h1
          style={{
            color: 'var(--na2s-papel)',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Acesse o painel
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              backgroundColor: 'var(--na2s-noite)',
              border: '1px solid var(--na2s-borda)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: 'var(--na2s-papel)',
              fontSize: '14px',
              width: '100%',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-lima)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-borda)')}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
            style={{
              backgroundColor: 'var(--na2s-noite)',
              border: '1px solid var(--na2s-borda)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: 'var(--na2s-papel)',
              fontSize: '14px',
              width: '100%',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-lima)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-borda)')}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)',
              color: 'var(--na2s-noite)',
              border: 'none',
              borderRadius: '999px',
              padding: '14px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {erro && (
            <p
              style={{
                color: 'var(--na2s-ambar)',
                fontSize: '13px',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {erro}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
