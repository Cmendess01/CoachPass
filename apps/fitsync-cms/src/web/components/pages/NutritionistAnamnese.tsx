import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createAnamnese,
  fetchAnamnesesForStudent,
  fetchLinkedPeople,
  updateAnamnese,
  type AnamneseDoc,
  type LinkedPerson,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const input =
  'cp-field cp-field-plain text-sm'

export function NutritionistAnamnese() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<LinkedPerson[]>([])
  const [student, setStudent] = useState(patientId || '')
  const [history, setHistory] = useState('')
  const [habits, setHabits] = useState('')
  const [goals, setGoals] = useState('')
  const [items, setItems] = useState<AnamneseDoc[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.accessToken || !user.id) return
    fetchLinkedPeople(user.id, 'nutritionist', user.accessToken, 'active')
      .then((rows) => {
        setPatients(rows)
        if (!student && rows[0]) setStudent(rows[0].userId)
      })
      .catch(() => toast.error('Não foi possível carregar pacientes.'))
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    if (!user?.accessToken || !student) return
    fetchAnamnesesForStudent(student, user.accessToken)
      .then((docs) => {
        setItems(docs)
        const latest = docs[0]
        const answers = latest?.answers as { history?: string; habits?: string; goals?: string } | undefined
        if (answers && typeof answers === 'object') {
          setHistory(answers.history || '')
          setHabits(answers.habits || '')
          setGoals(answers.goals || '')
        } else {
          setHistory('')
          setHabits('')
          setGoals('')
        }
      })
      .catch(() => setItems([]))
  }, [student, user?.accessToken])

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um paciente.')
      return
    }
    if (status === 'completed') {
      const missing = [
        !history.trim() && 'histórico',
        !habits.trim() && 'hábitos',
        !goals.trim() && 'objetivos',
      ].filter(Boolean)
      if (missing.length) {
        toast.error(`Para concluir, preencha ${missing.join(', ')}.`)
        return
      }
    }
    setSaving(true)
    try {
      const payload = {
        student,
        status,
        answers: { history, habits, goals },
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      }
      const existing = items[0]
      if (existing) await updateAnamnese(existing.id, payload, user.accessToken)
      else await createAnamnese(payload, user.accessToken)
      toast.success(status === 'completed' ? 'Anamnese concluída.' : 'Rascunho salvo.')
      setItems(await fetchAnamnesesForStudent(student, user.accessToken))
    } catch (err) {
      toast.error(
        err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : 'Falha ao salvar.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative px-4 sm:px-8 pt-8 pb-28 max-w-[1080px] mx-auto space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="text-sm dark:text-zinc-400">
        Voltar
      </button>
      <h1 className="cp-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.02]">Anamnese</h1>
      <div className="cp-panel p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Paciente</option>
          {patients.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name} · {row.email} · {row.userId}
            </option>
          ))}
        </select>
        <textarea className={input} rows={3} placeholder="Histórico clínico e alimentar" value={history} onChange={(e) => setHistory(e.target.value)} />
        <textarea className={input} rows={3} placeholder="Hábitos e rotina" value={habits} onChange={(e) => setHabits(e.target.value)} />
        <textarea className={input} rows={3} placeholder="Objetivos" value={goals} onChange={(e) => setGoals(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave('draft')}
            className="px-4 py-2 rounded-xl text-sm border dark:border-zinc-700"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave('completed')}
            className="cp-btn-sm"
          >
            Concluir
          </button>
        </div>
      </div>
      <section className="cp-panel p-5 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma anamnese ainda.</p>
        ) : (
          items.map((item) => (
            <p key={item.id} className="text-sm dark:text-zinc-200">
              {item.status === 'completed' ? 'Concluída' : 'Rascunho'}
              {item.completedAt ? ` · ${new Date(item.completedAt).toLocaleDateString('pt-BR')}` : ''}
            </p>
          ))
        )}
      </section>
    </div>
  )
}
