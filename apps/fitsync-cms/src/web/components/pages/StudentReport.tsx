import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

export function StudentReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(id ? `/personal/aluno/${id}` : '/personal', { replace: true })
  }, [id, navigate])

  return <p className="px-8 pt-10 text-sm text-[var(--muted)]">Abrindo ficha do aluno…</p>
}
