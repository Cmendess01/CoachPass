import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Activity, Percent, Ruler, Scale, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchAssessmentsForStudent, type AssessmentDoc } from '../../lib/professionalApi'
import { StudentProfile, WorkoutLogDoc, fetchMyStudentProfile, fetchWorkoutLogs, goalLabel } from '../../lib/studentApi'
import { CTAButton } from '../brand/Brand'
import { Card, EmptyState, LoadingPage, Page, PageHeader, SectionTitle, Stat } from '../student/ui'

const BMI_BANDS = [
  { max: 18.5, label: 'Abaixo', color: '#38d6f5' },
  { max: 25, label: 'Adequado', color: '#2ee6c8' },
  { max: 30, label: 'Sobrepeso', color: '#ffb547' },
  { max: 40, label: 'Obesidade', color: '#ff8a5c' },
]

export function Evolution() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [items, setItems] = useState<AssessmentDoc[]>([])
  const [logs, setLogs] = useState<WorkoutLogDoc[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken) {
        setLoading(false)
        return
      }
      try {
        const [doc, assessments, workoutLogs] = await Promise.all([
          fetchMyStudentProfile(user.id, user.accessToken),
          fetchAssessmentsForStudent(user.id, user.accessToken),
          fetchWorkoutLogs(user.id, user.accessToken),
        ])
        if (!cancelled) {
          setProfile(doc)
          setItems(assessments)
          setLogs(workoutLogs)
        }
      } catch {
        /* sem perfil: mostra só o estado vazio */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  if (loading) return <LoadingPage />

  const bmi =
    profile?.heightCm && profile?.weightKg ? profile.weightKg / Math.pow(profile.heightCm / 100, 2) : null
  const band = bmi ? BMI_BANDS.find((b) => bmi < b.max) || BMI_BANDS[BMI_BANDS.length - 1] : null
  // posição na régua de 15 a 40
  const bmiPos = bmi ? Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100)) : 0
  const fmt = (n?: number | null) => (n != null ? String(n).replace('.', ',') : '—')

  return (
    <Page>
      <PageHeader
        kicker="Evolução"
        title="Cada registro conta"
        accent="a sua história."
        lead="Peso, medidas e histórico aparecem aqui conforme forem registrados."
      />

      {profile && (
        <section>
          <SectionTitle icon={Activity}>Ponto de partida</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Peso" value={fmt(profile.weightKg)} unit="kg" icon={Scale} delay={0.05} />
            <Stat label="Altura" value={fmt(profile.heightCm)} unit="cm" icon={Ruler} color="var(--violet)" delay={0.1} />
            <Stat
              label="Gordura"
              value={fmt(profile.bodyFatPercent)}
              unit={profile.bodyFatPercent != null ? '%' : undefined}
              hint={profile.bodyFatPercent == null ? 'Medido na avaliação física' : undefined}
              icon={Percent}
              color="var(--amber)"
              delay={0.15}
            />
            <Stat
              label="Objetivo"
              value={<span className="text-[22px]">{profile.goal ? goalLabel(profile.goal) : '—'}</span>}
              icon={TrendingUp}
              color="var(--teal)"
              delay={0.2}
            />
          </div>

          {bmi && band && (
            <Card className="mt-4 p-6 sm:p-7" delay={0.25}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">Índice de massa corporal</p>
                  <p className="cp-display mt-2 text-[44px] font-bold leading-none">
                    {bmi.toFixed(1).replace('.', ',')}
                    <span className="ml-3 align-middle text-[14px] font-semibold" style={{ color: band.color }}>
                      {band.label}
                    </span>
                  </p>
                </div>
                <p className="text-[13px] text-[var(--dim)] max-w-xs">
                  Referência geral. Composição corporal e conduta são avaliadas pelo seu profissional.
                </p>
              </div>
              <div className="relative mt-7">
                <div className="flex h-2.5 rounded-full overflow-hidden">
                  <span className="flex-[3.5] bg-[#38d6f5]/70" />
                  <span className="flex-[6.5] bg-[#2ee6c8]/70" />
                  <span className="flex-[5] bg-[#ffb547]/70" />
                  <span className="flex-[10] bg-[#ff8a5c]/70" />
                </div>
                <motion.span
                  className="absolute -top-1.5 w-5 h-5 -ml-2.5 rounded-full bg-white border-4 border-[var(--ink)] shadow-[0_0_0_2px_rgba(255,255,255,0.4)]"
                  initial={{ left: '0%' }}
                  animate={{ left: `${bmiPos}%` }}
                  transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.4 }}
                />
                <div className="mt-3 flex justify-between cp-mono text-[11px] text-[var(--dim)]">
                  <span>15</span>
                  <span>18,5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>
            </Card>
          )}
        </section>
      )}

      <section className="mt-10">
        <SectionTitle icon={TrendingUp}>Histórico</SectionTitle>
        {logs.length === 0 && items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Sem dados de evolução"
            action={<CTAButton to="/app/treinos">Ir para treinos</CTAButton>}
          >
            Marque um treino como feito ou aguarde uma avaliação do profissional.
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {logs.length > 0 && (
              <Card className="p-6">
                <h3 className="cp-display text-[20px] font-bold mb-3">Treinos feitos</h3>
                <ul className="space-y-3">
                  {logs.map((log) => (
                    <li key={log.id}>
                      <p className="font-medium">
                        {typeof log.workout === 'object' && log.workout?.title ? log.workout.title : 'Treino'} ·{' '}
                        {new Date(log.performedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[13px] text-[var(--dim)]">
                        {log.status === 'completed' ? 'Concluído' : log.status}
                        {log.rpe != null ? ` · esforço ${log.rpe}/10` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {items.length > 0 && (
              <Card className="p-6">
                <h3 className="cp-display text-[20px] font-bold mb-3">Avaliações</h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <p className="font-medium">
                        {item.kind === 'consultation' ? 'Consulta' : 'Avaliação física'} ·{' '}
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[13px] text-[var(--dim)]">
                        {item.weightKg != null ? `${item.weightKg} kg` : 'Peso não informado'}
                        {item.bodyFatPercent != null ? ` · ${item.bodyFatPercent}% gordura` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </section>
    </Page>
  )
}
