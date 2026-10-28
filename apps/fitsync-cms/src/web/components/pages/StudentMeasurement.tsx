import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

export function StudentMeasurement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(id ? `/personal/avaliacao/${id}` : '/personal/avaliacao', { replace: true })
  }, [id, navigate])

  return <p className="px-8 pt-10 text-sm text-[var(--muted)]">Abrindo avaliação física…</p>
}
