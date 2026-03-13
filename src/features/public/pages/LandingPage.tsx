import React from 'react';
import { ArrowRight, Building2, ChevronRight, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import kairosDestello from '../../../assets/images/KairosDestello.png';
import kairosNombre from '../../../assets/images/KairosNombre.png';
import { AccessRequestForm } from '../components/AccessRequestForm';
import { ParticlesBackground } from '../components/ParticlesBackground';

const features = [
  {
    icon: Building2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    cardBorder: 'border-emerald-500/20',
    cardBg: 'bg-emerald-500/5',
    title: 'Aislamiento total por iglesia',
    description: 'Cada iglesia opera en su propio espacio aislado. Datos, usuarios, células y configuración 100% separados entre sí.',
  },
  {
    icon: Shield,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    cardBorder: 'border-cyan-500/20',
    cardBg: 'bg-cyan-500/5',
    title: 'Roles y permisos granulares',
    description: 'Administrador, pastor, supervisor, líder, colíder, timoteo, miembro y visitante. Cada rol ve solo lo que necesita.',
  },
  {
    icon: Users,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    cardBorder: 'border-amber-500/20',
    cardBg: 'bg-amber-500/5',
    title: 'Seguimiento ministerial completo',
    description: 'Asistencia semanal, peticiones de oración, formación, bautismo, cumpleaños y acompañamiento pastoral.',
  },
];

const roles = [
  { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', icon: Building2, label: 'Iglesia', desc: 'Entidad principal con configuración propia, plan y administración independiente.' },
  { color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', icon: Shield, label: 'Administrador de iglesia', desc: 'Usuario responsable de configurar personal, permisos, supervisores y recursos internos.' },
  { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', icon: Users, label: 'Usuarios y células', desc: 'Pastores, supervisores, líderes, colíderes, timoteos y miembros bajo una estructura aislada por tenant.' },
];

const steps = [
  { num: '01', title: 'Solicitud de adhesión', desc: 'Completás el formulario con los datos de tu iglesia y el responsable principal.' },
  { num: '02', title: 'Validación operativa', desc: 'El equipo de Kairos revisa la solicitud y valida la información.' },
  { num: '03', title: 'Creación de la iglesia', desc: 'Se habilita la iglesia con su propio link y espacio configurado.' },
  { num: '04', title: 'Alta del administrador', desc: 'Se asigna el administrador principal y se envían las credenciales.' },
  { num: '05', title: 'En producción', desc: 'El equipo carga células, supervisores, líderes y miembros.' },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07101f] text-white">
      <ParticlesBackground />

      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[700px] w-[700px] rounded-full bg-emerald-500/[0.07] blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[110px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-600/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07101f]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <img src={kairosDestello} alt="Kairos" className="h-11 w-auto object-contain [mix-blend-mode:screen] sm:h-14" />
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#solicitud"
                className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Solicitar adhesión
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                Ingresar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo hero */}
            <div className="flex flex-col items-center gap-4">

              <img
                src={kairosNombre}
                alt="Kairos"
                className="h-44 w-auto max-w-[94vw] object-contain [mix-blend-mode:screen] sm:h-52 md:h-60"
              />
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Plataforma Multi-Iglesia · En construcción activa
            </div>
            <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Gestión pastoral para{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                iglesias con células
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Una plataforma unificada para registrar asistencia, hacer seguimiento de miembros, gestionar formación y coordinar pastores, supervisores y líderes — con total aislamiento de datos entre iglesias.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#solicitud"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 text-sm font-bold text-slate-900 shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Solicitar adhesión
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Ya tengo acceso
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.cardBorder} ${f.cardBg} p-6 backdrop-blur-sm transition duration-200 hover:scale-[1.02]`}
              >
                <div className={`mb-4 inline-flex rounded-xl border ${f.iconBg} p-2.5`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Estructura por iglesia */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">Fase siguiente</p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Estructura prevista para cada iglesia
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Cada iglesia que se sume a Kairos tendrá su propio espacio aislado con administración independiente, jerarquía de roles y datos completamente separados del resto de las iglesias.
              </p>
            </div>
            <div className="space-y-4">
              {roles.map((r) => (
                <div key={r.label} className={`rounded-2xl border ${r.border} ${r.bg} p-5`}>
                  <div className={`mb-2 flex items-center gap-2 font-semibold ${r.color}`}>
                    <r.icon className="h-5 w-5" />
                    <span>{r.label}</span>
                  </div>
                  <p className="text-sm text-slate-400">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Steps */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">Proceso de alta</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Cómo se incorpora tu iglesia</h2>
            <p className="mt-4 text-base text-slate-400">
              La adhesión es el primer paso de un proceso ordenado. No se crea acceso anónimo — cada iglesia pasa por validación antes de activarse.
            </p>
          </div>
          <div className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-black text-emerald-500/25">{step.num}</p>
                <h3 className="mt-3 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="absolute -right-2 top-7 hidden h-px w-4 bg-emerald-500/30 lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Form */}
        <section id="solicitud" className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">Adhesión</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Sumá tu iglesia a Kairos</h2>
            <p className="mt-3 text-base text-slate-400">
              Completá el formulario y nos ponemos en contacto para iniciar el alta.
            </p>
          </div>
          <AccessRequestForm />
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-10 text-center">
          <img src={kairosNombre} alt="Kairos" className="mx-auto mb-4 h-5 object-contain [mix-blend-mode:screen] brightness-[2] opacity-50" />
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} Kairos · Plataforma de gestión ministerial</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;