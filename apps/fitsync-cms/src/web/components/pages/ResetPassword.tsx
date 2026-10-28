import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth, type UserRole } from '../../context/AuthContext'
import { getPasswordErrors } from '@/lib/passwordPolicy'
import { PasswordInput, PasswordRequirements } from '../PasswordField'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { AuthShell, FieldLabel } from '../brand/AuthShell'
import { CTAButton } from '../brand/Brand'

function pathForRole(role: UserRole) {
  if (role === 'student') return '/app'
  if (role === 'personal') return '/personal'
  if (role === 'nutritionist') return '/nutritionist'
  return '/selecionar-painel'
}

export function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    setError(null)

    if (!token) {
      setError('Link inválido. Solicite uma nova recuperação de senha.')
      return
    }

    const policyErrors = getPasswordErrors(password)
    if (policyErrors.length > 0) {
      setError(policyErrors[0])
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const role = await resetPassword(token, password)
      toast.success('Senha redefinida. Você já está autenticado.')
      navigate(pathForRole(role), { replace: true })
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível redefinir a senha.'
      setError(msg || 'Link expirado ou inválido. Solicite uma nova recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Escolha uma"
      accent="senha nova."
      lead="O link do e-mail vale para esta troca. A regra de senha é a mesma do cadastro."
    >
      <form onSubmit={handleSubmit} className="w-full max-w-[420px] space-y-5">
        <div>
          <p className="cp-kicker">Acesso</p>
          <h2 className="cp-display mt-3 text-[40px] font-bold leading-none">Nova senha</h2>
        </div>
        {error && (
          <p role="alert" className="text-[14px] text-[#ff8a95]">
            {error}
          </p>
        )}
        <div>
          <FieldLabel htmlFor="reset-password">Nova senha</FieldLabel>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha"
            autoComplete="new-password"
            iconClassName="text-[var(--dim)]"
            className="cp-field"
            required
          />
          <PasswordRequirements password={password} showErrors={attempted} />
        </div>
        <div>
          <FieldLabel htmlFor="reset-confirm">Confirmar senha</FieldLabel>
          <PasswordInput
            id="reset-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            iconClassName="text-[var(--dim)]"
            className="cp-field"
            required
          />
        </div>
        <CTAButton type="submit" block disabled={loading || !password || !confirm}>
          {loading ? 'Salvando…' : 'Redefinir senha'}
        </CTAButton>
      </form>
    </AuthShell>
  )
}
