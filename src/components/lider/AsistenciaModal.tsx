import React, { useState } from 'react';
import { Celula, AsistenciaRecord, MiembroAsistencia, PrioridadAnotacion, MotivoFalta } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, Save, MessageCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface AsistenciaModalProps {
  celula: Celula;
  onClose: () => void;
}

export const AsistenciaModal: React.FC<AsistenciaModalProps> = ({ celula, onClose }) => {
  const { user } = useAuth();
  const { registrarAsistencia } = useData();
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ofrenda, setOfrenda] = useState<number>(0);
  const [miembrosAsistencia, setMiembrosAsistencia] = useState<{ [key: string]: MiembroAsistencia }>(
    celula.miembros.reduce((acc, m) => ({
      ...acc,
      [m.id]: {
        miembroId: m.id,
        presente: true,
        motivoCompletado: true,
        anotacionEspecial: '',
        prioridadAnotacion: 'baja' as PrioridadAnotacion
      }
    }), {})
  );
  const [mostrandoDetalles, setMostrandoDetalles] = useState<string | null>(null);

  const handleToggleAsistencia = (miembroId: string) => {
    setMiembrosAsistencia(prev => {
      const isPresent = !prev[miembroId].presente;
      const motivo = prev[miembroId].motivoFalta;
      // "dejar-pendiente" se trata como si no tuviera motivo
      const tieneMotivo = motivo && motivo !== 'dejar-pendiente';
      return {
        ...prev,
        [miembroId]: {
          ...prev[miembroId],
          presente: isPresent,
          motivoCompletado: isPresent ? true : !!(prev[miembroId].anotacionEspecial || tieneMotivo),
        }
      };
    });
  };

  const handleAnotacionEspecial = (miembroId: string, anotacion: string, prioridad: PrioridadAnotacion, motivoFalta?: MotivoFalta) => {
    setMiembrosAsistencia(prev => {
      const motivo = motivoFalta !== undefined ? motivoFalta : prev[miembroId].motivoFalta;
      
      // Motivos predefinidos que no necesitan detalles
      const motivosCompletos = ['vacaciones', 'trabajo', 'enfermedad', 'familia', 'viaje'];
      // Si seleccionó un motivo completo, ya está completo
      // Si seleccionó 'otro', necesita escribir el detalle
      // Si seleccionó 'dejar-pendiente' o no tiene motivo, queda pendiente
      const esCompleto = prev[miembroId].presente ? true : 
        (motivo && motivo !== 'dejar-pendiente' && motivosCompletos.includes(motivo)) || 
        (motivo === 'otro' && !!anotacion);
      
      return {
        ...prev,
        [miembroId]: {
          ...prev[miembroId],
          anotacionEspecial: anotacion,
          prioridadAnotacion: prioridad,
          motivoFalta: motivoFalta !== undefined ? motivoFalta : prev[miembroId].motivoFalta,
          motivoCompletado: esCompleto
        }
      };
    });
  };

  const handleGuardar = () => {
    // Convertir 'dejar-pendiente' a undefined antes de enviar
    const miembrosParaEnviar = Object.values(miembrosAsistencia).map(m => ({
      ...m,
      motivoFalta: m.motivoFalta === 'dejar-pendiente' ? undefined : m.motivoFalta
    }));
    
    const presentes = miembrosParaEnviar.filter(m => m.presente).length;
    const ausentes = miembrosParaEnviar.filter(m => !m.presente).length;
    const pendientesCompletar = miembrosParaEnviar.filter(m => !m.presente && !m.motivoCompletado).length;

    const record: AsistenciaRecord = {
      id: Date.now().toString(),
      celulaId: celula.id,
      date: new Date(fecha),
      miembros: miembrosParaEnviar,
      totalPresentes: presentes,
      totalAusentes: ausentes,
      ofrenda: ofrenda || 0,
      pendientesCompletar,
      registradoPor: user?.id || '',
      fechaRegistro: new Date(),
      completado: pendientesCompletar === 0
    };

    registrarAsistencia(record);
    onClose();
    alert(pendientesCompletar > 0
      ? `¡Asistencia registrada! Quedan ${pendientesCompletar} motivos de falta pendientes por completar.`
      : '¡Asistencia registrada exitosamente!');
  };

  const totalPresentes = Object.values(miembrosAsistencia).filter(m => m.presente).length;
  const totalAusentes = celula.miembros.length - totalPresentes;
  const pendientesMotivo = Object.values(miembrosAsistencia).filter(m => !m.presente && !m.motivoCompletado).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full my-8 shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Registrar Asistencia</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Fecha de la Reunión
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 font-bold text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Ofrenda ($)
            </label>
            <input
              type="number"
              value={ofrenda}
              onChange={(e) => setOfrenda(Number(e.target.value))}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 font-bold text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-0 transition-all"
            />
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Miembros</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {celula.miembros.filter(m => m.rolCelula?.toLowerCase() !== 'visita').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-green-400 dark:text-green-500 uppercase">Presentes</p>
              <p className="text-xl font-black text-green-600 dark:text-green-400">{totalPresentes}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-red-400 dark:text-red-500 uppercase">Ausentes</p>
              <p className="text-xl font-black text-red-600 dark:text-red-400">{totalAusentes}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {celula.miembros.map((miembro) => {
            const asistencia = miembrosAsistencia[miembro.id];
            // El panel se mantiene abierto si:
            // - El usuario lo abrió manualmente (mostrandoDetalles)
            // - O si es ausente SIN motivo o con motivo 'otro' (para que complete detalles)
            const panelVisible = mostrandoDetalles === miembro.id || 
              (!asistencia.presente && (!asistencia.motivoFalta || asistencia.motivoFalta === 'otro'));

            return (
              <div key={miembro.id} className={`rounded-2xl border-2 transition-all duration-300 ${asistencia.presente
                ? 'border-green-100 bg-white'
                : 'border-red-100 bg-white shadow-sm'
                }`}>
                {/* Fila principal */}
                <div
                  onClick={() => handleToggleAsistencia(miembro.id)}
                  className="flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${asistencia.presente ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {miembro.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold transition-colors ${asistencia.presente ? 'text-gray-900' : 'text-red-900'}`}>{miembro.name}</p>
                      {asistencia.anotacionEspecial && (
                        <div className="flex items-center gap-2 mt-1">
                          <Flag className={`w-3 h-3 ${asistencia.prioridadAnotacion === 'alta' ? 'text-red-500' :
                            asistencia.prioridadAnotacion === 'media' ? 'text-yellow-500' : 'text-green-500'
                            }`} />
                          <p className="text-xs text-blue-600 font-bold truncate max-w-[200px]">{asistencia.anotacionEspecial}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMostrandoDetalles(mostrandoDetalles === miembro.id ? null : miembro.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${(asistencia.anotacionEspecial || asistencia.motivoFalta)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${asistencia.presente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {asistencia.presente ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {asistencia.presente ? 'Presente' : 'Ausente'}
                    </div>
                  </div>
                </div>

                {/* Panel de detalles expandible */}
                {panelVisible && (
                  <div className={`p-4 border-t-2 animate-in slide-in-from-top-2 duration-300 ${asistencia.presente ? 'bg-blue-50/50 border-blue-50' : 'bg-red-50/30 border-red-50'}`}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {asistencia.presente ? 'Notas Especiales / Oración' : 'Motivo de la Ausencia'}
                        {!asistencia.presente && !asistencia.motivoCompletado && <span className="text-red-500 ml-2 animate-pulse">• Pendiente</span>}
                      </h4>
                      {!asistencia.presente && (
                        <select
                          value={asistencia.motivoFalta || ''}
                          onChange={(e) => handleAnotacionEspecial(miembro.id, asistencia.anotacionEspecial || '', asistencia.prioridadAnotacion!, e.target.value as MotivoFalta)}
                          className="text-sm font-bold p-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500 min-w-[150px]"
                        >
                          <option value="" className="text-gray-900 dark:text-white">Seleccione motivo...</option>
                          <option value="vacaciones" className="text-gray-900 dark:text-white">Vacaciones</option>
                          <option value="trabajo" className="text-gray-900 dark:text-white">Trabajo</option>
                          <option value="enfermedad" className="text-gray-900 dark:text-white">Enfermedad</option>
                          <option value="familia" className="text-gray-900 dark:text-white">Asunto Familiar</option>
                          <option value="viaje" className="text-gray-900 dark:text-white">Viaje</option>
                          <option value="otro" className="text-gray-900 dark:text-white">Otro Motivo (especificar)</option>
                          <option value="dejar-pendiente" className="text-gray-900 dark:text-white">⏳ Dejar pendiente</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Mostrar textarea solo si está presente (notas de oración) o si seleccionó 'otro' motivo */}
                      {(asistencia.presente || asistencia.motivoFalta === 'otro') && (
                        <textarea
                          value={asistencia.anotacionEspecial || ''}
                          onChange={(e) => handleAnotacionEspecial(miembro.id, e.target.value, asistencia.prioridadAnotacion!, asistencia.motivoFalta)}
                          placeholder={asistencia.presente
                            ? "Ej: Pidió oración por salud, agradecimiento, etc."
                            : "Especifica cuál es el otro motivo de ausencia..."}
                          className={`w-full p-3 bg-white dark:bg-gray-700 border-2 rounded-2xl resize-none outline-none transition-all text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${!asistencia.presente && asistencia.motivoFalta === 'otro' && !asistencia.anotacionEspecial ? 'border-red-200 dark:border-red-700 focus:border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
                            }`}
                          rows={2}
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridad de Cuidado:</span>
                        <div className="flex gap-2">
                          {(['alta', 'media', 'baja'] as PrioridadAnotacion[]).map(prioridad => (
                            <label key={prioridad} className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 cursor-pointer transition-all ${asistencia.prioridadAnotacion === prioridad
                              ? (prioridad === 'alta' ? 'bg-red-500 border-red-500 text-white' :
                                prioridad === 'media' ? 'bg-yellow-500 border-yellow-500 text-white' :
                                  'bg-green-500 border-green-500 text-white')
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                              }`}>
                              <input
                                type="radio"
                                name={`prioridad-${miembro.id}`}
                                checked={asistencia.prioridadAnotacion === prioridad}
                                onChange={() => handleAnotacionEspecial(miembro.id, asistencia.anotacionEspecial || '', prioridad, asistencia.motivoFalta)}
                                className="sr-only"
                              />
                              <span className="text-[10px] font-black uppercase">{prioridad}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {celula.miembros.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            No hay miembros para tomar asistencia. Agrega miembros primero.
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGuardar}
            disabled={celula.miembros.length === 0}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Asistencia
            {pendientesMotivo > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                {pendientesMotivo} pendientes
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
