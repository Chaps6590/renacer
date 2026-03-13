import React, { useState } from 'react';
import { Building2, Mail, MapPin, Phone, Send, ShieldCheck, Users } from 'lucide-react';
import { api } from '../../../services/api';
import { AccessRequestPayload } from '../../../types';

const initialForm: AccessRequestPayload = {
  iglesiaNombre: '',
  responsableNombre: '',
  responsableEmail: '',
  responsableTelefono: '',
  pais: '',
  ciudad: '',
  cantidadCelulas: undefined,
  cantidadUsuarios: undefined,
  mensaje: ''
};

export const AccessRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<AccessRequestPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof AccessRequestPayload, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'cantidadCelulas' || field === 'cantidadUsuarios'
        ? (value === '' ? undefined : Number(value))
        : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response: any = await api.createAccessRequest(formData);
      setSuccessMessage(response.message || 'Solicitud enviada correctamente.');
      setFormData(initialForm);
    } catch (submitError: any) {
      setError(submitError?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/30';
  const labelCls = 'mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">Solicitud de adhesión</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Completá tus datos</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Registramos tu pedido para iniciar el alta, la configuración inicial y la asignación del administrador principal.
          </p>
        </div>
        <div className="hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400 md:block">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelCls}>
              <Building2 className="h-4 w-4 text-emerald-400" />
              Nombre de la iglesia
            </span>
            <input
              value={formData.iglesiaNombre}
              onChange={(e) => handleChange('iglesiaNombre', e.target.value)}
              className={inputCls}
              placeholder="Ej: Renacer Zona Norte"
              required
            />
          </label>

          <label className="block">
            <span className={labelCls}>
              <Users className="h-4 w-4 text-emerald-400" />
              Responsable principal
            </span>
            <input
              value={formData.responsableNombre}
              onChange={(e) => handleChange('responsableNombre', e.target.value)}
              className={inputCls}
              placeholder="Nombre y apellido"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelCls}>
              <Mail className="h-4 w-4 text-emerald-400" />
              Email de contacto
            </span>
            <input
              type="email"
              value={formData.responsableEmail}
              onChange={(e) => handleChange('responsableEmail', e.target.value)}
              className={inputCls}
              placeholder="admin@iglesia.com"
              required
            />
          </label>

          <label className="block">
            <span className={labelCls}>
              <Phone className="h-4 w-4 text-emerald-400" />
              Teléfono
            </span>
            <input
              type="tel"
              value={formData.responsableTelefono || ''}
              onChange={(e) => handleChange('responsableTelefono', e.target.value)}
              className={inputCls}
              placeholder="+54 9 11 1234 5678"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelCls}>
              <MapPin className="h-4 w-4 text-emerald-400" />
              País
            </span>
            <input
              value={formData.pais || ''}
              onChange={(e) => handleChange('pais', e.target.value)}
              className={inputCls}
              placeholder="Argentina"
            />
          </label>

          <label className="block">
            <span className={labelCls}>
              <MapPin className="h-4 w-4 text-emerald-400" />
              Ciudad
            </span>
            <input
              value={formData.ciudad || ''}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              className={inputCls}
              placeholder="Buenos Aires"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Cantidad estimada de células</span>
            <input
              type="number"
              min={0}
              value={formData.cantidadCelulas ?? ''}
              onChange={(e) => handleChange('cantidadCelulas', e.target.value)}
              className={inputCls}
              placeholder="5"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Cantidad estimada de usuarios</span>
            <input
              type="number"
              min={0}
              value={formData.cantidadUsuarios ?? ''}
              onChange={(e) => handleChange('cantidadUsuarios', e.target.value)}
              className={inputCls}
              placeholder="30"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-300">Mensaje o contexto</span>
          <textarea
            value={formData.mensaje || ''}
            onChange={(e) => handleChange('mensaje', e.target.value)}
            className={`${inputCls} min-h-[120px] resize-y`}
            placeholder="Contanos cómo quieren usar la plataforma, cuántas sedes tienen y qué esperan resolver."
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            La solicitud no crea la iglesia automáticamente. Primero pasa a revisión y validación operativa.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};