import React from 'react';
import { useNavigate } from 'react-router';
import { Dumbbell, Award, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthedImage } from '../AuthedImage';
import { Backdrop, Grain, Logo } from '../brand/Brand';

export function PanelSelector() {
  const navigate = useNavigate();
  // Obtém informações da sessão atual
  const { user, logout } = useAuth();

  // Definição dos painéis disponíveis
  const panels = [
    {
      id: 'personal',
      label: 'Personal Trainer',
      description: 'Estruturação de treinamentos, avaliações físicas contínuas e gestão de agenda.',
      icon: Dumbbell,
      path: '/personal',
      features: ['Planejamento de rotinas com IA', 'Administração de carteira de alunos', 'Avaliação biométrica detalhada'],
    },
    {
      id: 'nutritionist',
      label: 'Nutricionista',
      description: 'Prescrição dietética, registros de anamnese e monitoramento de pacientes.',
      icon: Award,
      path: '/nutritionist',
      features: ['Esquemas alimentares com IA', 'Anamnese clínica profunda', 'Monitoramento evolutivo'],
    },
  ];

  return (
    <div className="cp-brand relative min-h-screen">
      <Grain />
      <Backdrop variant="soft" />
      <div className="relative max-w-[980px] mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <AuthedImage
                src={user.avatar}
                token={user.accessToken}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-[var(--muted)]">{user?.name}</span>
            <button
              type="button"
              onClick={() => { logout(); navigate('/login'); }}
              className="cp-btn-ghost h-10 px-3"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="cp-kicker">Master</p>
          <h1 className="cp-display mt-3 text-[clamp(36px,5vw,60px)] font-bold leading-none">Escolha o painel</h1>
          <p className="mt-4 text-[15px] text-[var(--muted)]">O mesmo acesso abre o módulo de personal ou de nutricionista.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => navigate(panel.path)}
                className="cp-card p-7 text-left flex flex-col h-full"
              >
                <span className="w-11 h-11 rounded-2xl grid place-items-center border border-[var(--line)] bg-white/[0.04]">
                  <Icon className="w-5 h-5 text-[var(--brand-300)]" />
                </span>
                <h2 className="cp-display mt-5 text-[24px] font-bold">{panel.label}</h2>
                <p className="mt-2 text-[14px] text-[var(--muted)] flex-1">{panel.description}</p>
                <ul className="mt-6 space-y-2">
                  {panel.features.map((feat) => (
                    <li key={feat} className="text-[13px] text-[var(--muted)]">{feat}</li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-white">
                  Acessar
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
