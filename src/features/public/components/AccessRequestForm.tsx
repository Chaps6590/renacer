import React, { useEffect, useState } from 'react';
import { Building2, ChevronDown, Mail, MapPin, Phone, Send, ShieldCheck, Users } from 'lucide-react';
import { api } from '../../../services/api';
import { AccessRequestPayload } from '../../../types';

const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Cordoba',
  'Corrientes',
  'Entre Rios',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquen',
  'Rio Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucuman',
  'Ciudad Autonoma de Buenos Aires'
];

const initialForm: AccessRequestPayload = {
  iglesiaNombre: '',
  responsableNombre: '',
  responsableEmail: '',
  responsableTelefono: '',
  pais: 'Argentina',
  ciudad: '',
  cantidadCelulas: undefined,
  cantidadUsuarios: undefined,
  mensaje: ''
};

export const AccessRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<AccessRequestPayload>(initialForm);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
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
      const payload: AccessRequestPayload = {
        ...formData,
        pais: 'Argentina',
        ciudad: selectedCity && selectedProvince ? `${selectedCity}, ${selectedProvince}` : undefined
      };

      const response: any = await api.createAccessRequest(payload);
      setSuccessMessage(response.message || 'Solicitud enviada correctamente.');
      setFormData(initialForm);
      setSelectedProvince('');
      setSelectedCity('');
      setCityOptions([]);
    } catch (submitError: any) {
      setError(submitError?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProvince) {
      setCityOptions([]);
      setSelectedCity('');
      return;
    }

    const controller = new AbortController();
    setCityLoading(true);

    const loadCities = async () => {
      try {
        const response = await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(selectedProvince)}&max=5000&campos=nombre&aplanar=true`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setCityOptions([]);
          return;
        }

        const data = await response.json();
        const localidades = Array.isArray(data?.localidades) ? data.localidades : [];

        const formatted = localidades
          .map((item: any) => item?.nombre?.trim())
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b, 'es'));

        setCityOptions(Array.from(new Set(formatted)) as string[]);
      } catch (fetchError: any) {
        if (fetchError?.name !== 'AbortError') {
          setCityOptions([]);
        }
      } finally {
        setCityLoading(false);
      }
    };

    loadCities();

    return () => {
      controller.abort();
    };
  }, [selectedProvince]);

  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/30';
  const selectCls = `${inputCls} appearance-none pr-11 text-slate-100 disabled:cursor-not-allowed disabled:opacity-70`;
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
              Provincia
            </span>
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedProvince(value);
                  setSelectedCity('');
                }}
                className={selectCls}
                required
              >
                <option className="bg-slate-900 text-white" value="">Seleccionar provincia</option>
                {ARGENTINA_PROVINCES.map((province) => (
                  <option className="bg-slate-900 text-white" key={province} value={province}>{province}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

          <label className="block">
            <span className={labelCls}>
              <MapPin className="h-4 w-4 text-emerald-400" />
              Ciudad
            </span>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCity(value);
                  handleChange('ciudad', value);
                }}
                className={selectCls}
                disabled={!selectedProvince || cityLoading}
                required
              >
                <option className="bg-slate-900 text-white" value="">
                  {!selectedProvince
                    ? 'Primero selecciona provincia'
                    : cityLoading
                      ? 'Cargando ciudades...'
                      : 'Seleccionar ciudad'}
                </option>
                {cityOptions.map((city) => (
                  <option className="bg-slate-900 text-white" key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
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