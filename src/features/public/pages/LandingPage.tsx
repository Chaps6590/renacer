import React from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronRight, Layers3, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logoRenacer2.png';
import { AccessRequestForm } from '../components/AccessRequestForm';

const pillars = [
  {
    title: 'Gestión por iglesia',
    description: 'Cada iglesia tendrá su propia estructura, líderes, células, estadísticas, materiales y configuración.'
  },
  {
    title: 'Seguimiento ministerial',
    description: 'Asistencia, peticiones, formación, cumpleaños y acompañamiento pastoral en un mismo flujo.'
  },
  {
    title: 'Escalado ordenado',
    description: 'La adhesión se registra primero y después se habilita la creación formal de iglesia, administradores y usuarios.'
  }
];

const steps = [
  'Solicitud de adhesión de la iglesia',
  'Validación y revisión operativa',
  'Creación de la iglesia en la plataforma',
  'Asignación del administrador principal',
  'Alta de usuarios, supervisores, líderes y células'
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 p-1 shadow-lg">
              <img src={logo} alt="Kairos" className="h-full w-full rounded-xl object-contain bg-white/85 p-1" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Kairos</p>
              <h1 className="text-lg font-bold text-slate-950">Favor y Influencia</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="#solicitud" className="hidden rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white sm:inline-flex">
              Solicitar adhesión
            </a>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ingresar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Layers3 className="h-4 w-4" />
              Plataforma en transición a multi-iglesia
            </div>

            <h2 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl">
              Una plataforma para gestionar iglesias, células y seguimiento pastoral sin mezclar datos.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Esta nueva etapa arranca con una entrada pública ordenada: cada iglesia solicita adhesión, se valida el alta y luego se crea su estructura independiente con administradores, usuarios y permisos propios.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#solicitud" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700">
                Quiero adherir mi iglesia
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
                Ya tengo acceso
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-2 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_28px_100px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.24),_transparent_30%)]" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Fase siguiente</p>
              <h3 className="mt-3 text-3xl font-bold leading-tight">Estructura prevista para cada iglesia</h3>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-emerald-300">
                    <Building2 className="h-5 w-5" />
                    <span className="font-semibold">Iglesia</span>
                  </div>
                  <p className="text-sm text-slate-300">Entidad principal con configuración propia, plan y administración independiente.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sky-300">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Administrador de iglesia</span>
                  </div>
                  <p className="text-sm text-slate-300">Usuario responsable de configurar personal, permisos, supervisores y recursos internos.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-300">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Usuarios y células</span>
                  </div>
                  <p className="text-sm text-slate-300">Pastores, supervisores, líderes, colíderes, timoteos y miembros bajo una estructura aislada por tenant.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="border-y border-slate-200/70 bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Proceso de alta</p>
                <h3 className="mt-3 text-3xl font-bold text-slate-950">Cómo se incorpora una nueva iglesia</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  El objetivo no es abrir acceso anónimo a cualquier usuario, sino crear una entrada institucional ordenada para dar de alta la iglesia completa y luego definir su equipo administrador.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {steps.map((step, index) => (
                  <div key={step} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-emerald-700">Paso {index + 1}</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="solicitud" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <AccessRequestForm />
        </section>
      </main>
    </div>
  );
};

export default LandingPage;