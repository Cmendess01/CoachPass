import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createAssessment,
  fetchAssessmentsForStudent,
  fetchLinkedPeople,
  type AssessmentDoc,
  type LinkedPerson,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { formatLocalDate, localDateToIso, todayLocalDate } from '../../lib/localDate'

const input =
  'cp-field cp-field-plain text-sm'

export function NutritionConsultation() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<LinkedPerson[]>([])
  const [student, setStudent] = useState(patientId || '')
  const [date, setDate] = useState(todayLocalDate())
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<AssessmentDoc[]>([])
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
    fetchAssessmentsForStudent(student, user.accessToken, 'consultation')
      .then(setItems)
      .catch(() => setItems([]))
  }, [student, user?.accessToken])

  const handleSave = async () => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um paciente.')
      return
    }
    setSaving(true)
    try {
      await createAssessment(
        {
          kind: 'consultation',
          student,
          date: localDateToIso(date),
          weightKg: weightKg ? Number(weightKg) : undefined,
          notes: notes.trim() || undefined,
        },
        user.accessToken,
      )
      toast.success('Consulta registrada.')
      setItems(await fetchAssessmentsForStudent(student, user.accessToken, 'consultation'))
      setNotes('')
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
      <h1 className="cp-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.02]">Consulta nutricional</h1>
      <div className="cp-panel p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Paciente</option>
          {patients.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name} · {row.email} · {row.userId}
            </option>
          ))}
        </select>
        <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className={input} type="number" placeholder="Peso (kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <textarea className={input} rows={4} placeholder="Anotações da consulta" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="cp-btn-sm"
        >
          {saving ? 'Salvando…' : 'Salvar consulta'}
        </button>
      </div>
      <section className="cp-panel p-5 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma consulta ainda.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="text-sm dark:text-zinc-200">
              {formatLocalDate(item.date)}
              {item.weightKg != null ? ` · ${item.weightKg} kg` : ''}
              {item.notes ? ` · ${item.notes}` : ''}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
