import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, type TransactionDoc } from '../../lib/professionalApi'

const card = 'cp-panel p-5'

const statusLabel: Record<TransactionDoc['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
}

export function StudentFinance() {
  const { user } = useAuth()
  const [rows, setRows] = useState<TransactionDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.accessToken) return
    fetchTransactions(user.accessToken)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [user?.accessToken])

  return (
    <div className="relative px-4 sm:px-8 pt-8 pb-28 max-w-[1080px] mx-auto space-y-6">
      <div>
        <h1 className="cp-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.02]">Pagamentos</h1>
        <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Lançamentos do seu personal ou nutri. O app continua liberado; cobrança automática vem depois.
        </p>
      </div>
      {loading && <p className="text-sm text-[#6a6a7a]">Carregando…</p>}
      <section className={card}>
        {!loading && rows.length === 0 ? (
          <p className="text-sm text-[#6a6a7a]">Nenhum lançamento.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="text-sm text-[#000326] dark:text-white">
                <p className="font-medium">{row.description}</p>
                <p className="text-xs text-[#6a6a7a]">
                  R$ {Number(row.amount).toFixed(2)} · {statusLabel[row.status]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
