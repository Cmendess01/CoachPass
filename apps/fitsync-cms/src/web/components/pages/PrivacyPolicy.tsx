import React, { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { AuthShell } from '../brand/AuthShell'
import { CTAButton } from '../brand/Brand'

const POLICY_URL = '/politica-de-privacidade.html'

export function PrivacyPolicy() {
  useEffect(() => {
    window.location.replace(POLICY_URL)
  }, [])

  return (
    <AuthShell
      title="Seus dados,"
      accent="com clareza."
      lead="A política completa abre em seguida. O documento é o mesmo que o cadastro pede para você aceitar."
    >
      <div className="w-full max-w-md text-center">
        <p className="cp-kicker">Privacidade</p>
        <h2 className="cp-display mt-3 text-[36px] font-bold leading-none">Abrindo a política…</h2>
        <p className="mt-3 text-[15px] text-[var(--muted)]">Se a página não mudar, use o botão abaixo.</p>
        <div className="mt-8">
          <CTAButton href={POLICY_URL} block>
            Abrir política completa
            <ExternalLink className="w-4 h-4" />
          </CTAButton>
        </div>
      </div>
    </AuthShell>
  )
}
