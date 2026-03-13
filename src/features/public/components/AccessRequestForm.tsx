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

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Solicitud de adhesión</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Sumá tu iglesia a la plataforma</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Completá este formulario y registramos tu pedido para iniciar el alta, la configuración inicial y la asignación del administrador principal.
          </p>
        </div>
        <div className="hidden rounded-2xl bg-emerald-50 p-3 text-emerald-700 md:block">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-emerald-700" />
              Nombre de la iglesia
            </span>
            <input
              value={formData.iglesiaNombre}
              onChange={(e) => handleChange('iglesiaNombre', e.target.value)}
              className="input"
              placeholder="Ej: Renacer Zona Norte"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-emerald-700" />
              Responsable principal
            </span>
            <input
              value={formData.responsableNombre}
              onChange={(e) => handleChange('responsableNombre', e.target.value)}
              className="input"
              placeholder="Nombre y apellido"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail className="h-4 w-4 text-emerald-700" />
              Email de contacto
            </span>
            <input
              type="email"
              value={formData.responsableEmail}
              onChange={(e) => handleChange('responsableEmail', e.target.value)}
              className="input"
              placeholder="admin@iglesia.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Phone className="h-4 w-4 text-emerald-700" />
              Teléfono
            </span>
            <input
              type="tel"
              value={formData.responsableTelefono || ''}
              onChange={(e) => handleChange('responsableTelefono', e.target.value)}
              className="input"
              placeholder="+54 9 11 1234 5678"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-700" />
              País
            </span>
            <input
              value={formData.pais || ''}
              onChange={(e) => handleChange('pais', e.target.value)}
              className="input"
              placeholder="Argentina"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-700" />
              Ciudad
            </span>
            <input
              value={formData.ciudad || ''}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              className="input"
              placeholder="Buenos Aires"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 text-sm font-semibold text-slate-700">Cantidad estimada de células</span>
            <input
              type="number"
              min={0}
              value={formData.cantidadCelulas ?? ''}
              onChange={(e) => handleChange('cantidadCelulas', e.target.value)}
              className="input"
              placeholder="5"
            />
          </label>

          <label className="block">
            <span className="mb-2 text-sm font-semibold text-slate-700">Cantidad estimada de usuarios</span>
            <input
              type="number"
              min={0}
              value={formData.cantidadUsuarios ?? ''}
              onChange={(e) => handleChange('cantidadUsuarios', e.target.value)}
              className="input"
              placeholder="30"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Mensaje o contexto</span>
          <textarea
            value={formData.mensaje || ''}
            onChange={(e) => handleChange('mensaje', e.target.value)}
            className="input min-h-[120px] resize-y"
            placeholder="Contanos cómo quieren usar la plataforma, cuántas sedes tienen y qué esperan resolver."
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            La solicitud no crea la iglesia automáticamente. Primero pasa a revisión y validación operativa.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};