import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useData } from '../../contexts/DataContext';
import { AsistenciaRecord } from '../../types';
import { X, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Flag, MessageSquare, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialAsistenciasModalProps {
    celulaId: string;
    isOpen: boolean;
    onClose: () => void;
    readOnly?: boolean; // Cuando es true, solo permite ver, no eliminar
}

export const HistorialAsistenciasModal: React.FC<HistorialAsistenciasModalProps> = ({ celulaId, isOpen, onClose, readOnly = false }) => {
    const { getHistorialAsistencias } = useData();
    const [historial, setHistorial] = useState<AsistenciaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const handleDelete = (id: string) => {
        setDeletingId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.deleteAsistencia(deletingId);
            setHistorial(historial.filter(h => h.id !== deletingId));
        } catch (error) {
            alert('Error eliminando asistencia');
        } finally {
            setConfirmOpen(false);
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (isOpen) {
            cargarHistorial();
        }
    }, [isOpen, celulaId]);

    const cargarHistorial = async () => {
        setLoading(true);
        try {
            const data = await getHistorialAsistencias(celulaId);
            setHistorial(data);
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Historial de Asistencia</h3>
                            <p className="text-blue-100 text-xs uppercase tracking-wider font-semibold">Registro semanal detallado</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-medium">Cargando registros históricos...</p>
                        </div>
                    ) : historial.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay registros aún</h4>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                Las asistencias que registres aparecerán aquí ordenadas por fecha.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historial.map((registro) => {
                                const isExpanded = expandedId === registro.id;

                                return (
                                    <div
                                        key={registro.id}
                                        className={`bg-white dark:bg-gray-800 rounded-xl border transition-all duration-300 ${isExpanded ? 'border-blue-300 dark:border-blue-600 shadow-md ring-1 ring-blue-100 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'
                                            }`}
                                    >
                                        {/* Fila colapsada */}
                                        <div
                                            onClick={() => setExpandedId(isExpanded ? null : registro.id)}
                                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer group"
                                        >
                                            <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                                                <div className="flex flex-col items-center justify-center min-w-[70px] py-1 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                                                    <span className="text-xs uppercase leading-none mb-1">{format(new Date(registro.date), 'MMM', { locale: es })}</span>
                                                    <span className="text-2xl leading-none">{format(new Date(registro.date), 'dd')}</span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                        {format(new Date(registro.date), 'EEEE, d MMMM', { locale: es })}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm">
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold rounded-md border border-green-100 dark:border-green-800">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {registro.totalPresentes} Presentes
                                                        </span>
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 font-bold rounded-md border border-red-100 dark:border-red-800">
                                                            <XCircle className="w-3 h-3" />
                                                            {registro.totalAusentes} Ausentes
                                                        </span>
                                                        {registro.ofrenda > 0 && (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold rounded-md border border-emerald-100 dark:border-emerald-800">
                                                                <DollarSign className="w-3 h-3" />
                                                                ${registro.ofrenda.toFixed(2)}
                                                            </span>
                                                        )}
                                                        {registro.pendientesCompletar > 0 && (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold rounded-md border border-amber-100 dark:border-amber-800 animate-pulse">
                                                                {registro.pendientesCompletar} Pendientes
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Registrado por</p>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{(registro as any).registradoPor?.name || 'Sistema'}</p>
                                                </div>
                                                <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón eliminar - Solo para líderes */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 p-5 animate-in fade-in duration-300">
                                                {!readOnly && (
                                                    <div className="flex justify-end mb-2">
                                                        <button
                                                            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                                                            onClick={() => handleDelete(registro.id)}
                                                        >
                                                            Eliminar asistencia
                                                        </button>
                                                    </div>
                                                )}
                                                                {/* Modal de confirmación */}
                                                                {confirmOpen && (
                                                                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-xs w-full flex flex-col items-center">
                                                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">¿Estás seguro que deseas eliminar esta asistencia?</p>
                                                                            <div className="flex gap-4 mt-2">
                                                                                <button
                                                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                                                    onClick={() => { setConfirmOpen(false); setDeletingId(null); }}
                                                                                >
                                                                                    Cancelar
                                                                                </button>
                                                                                <button
                                                                                    className="px-4 py-2 bg-red-600 rounded-lg font-bold text-white hover:bg-red-700"
                                                                                    onClick={confirmDelete}
                                                                                >
                                                                                    Sí, eliminar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Listado de Asistencia
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {registro.miembros.map((m) => (
                                                        <div
                                                            key={m.miembroId}
                                                            className={`flex flex-col p-4 rounded-xl border-2 transition-all ${m.presente
                                                                ? 'bg-white dark:bg-gray-800 border-green-50 dark:border-green-800 hover:border-green-100 dark:hover:border-green-700'
                                                                : 'bg-white dark:bg-gray-800 border-red-50 dark:border-red-800 hover:border-red-100 dark:hover:border-red-700'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    {m.presente ? (
                                                                        <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full text-green-600 dark:text-green-300">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-red-100 dark:bg-red-900 p-1.5 rounded-full text-red-600 dark:text-red-300">
                                                                            <XCircle className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-bold text-gray-800 dark:text-gray-100">{(m as any).miembro?.nombre || 'Miembro'}</span>
                                                                        {/* Usar rol histórico si está disponible, sino el rol actual */}
                                                                        {(((m as any).rolCelulaEnMomento?.toLowerCase() === 'visita') || 
                                                                          (!(m as any).rolCelulaEnMomento && (m as any).miembro?.rolCelula?.toLowerCase() === 'visita')) && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 border border-pink-300 dark:border-pink-700">
                                                                                    VISITA
                                                                                </span>
                                                                                {(m as any).miembro?.contadorAsistencias > 0 && (
                                                                                    <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400">
                                                                                        {(m as any).miembro.contadorAsistencias} {(m as any).miembro.contadorAsistencias === 1 ? 'asistencia' : 'asistencias'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${m.presente ? 'bg-green-600 dark:bg-green-700 text-white' : 'bg-red-600 dark:bg-red-700 text-white'
                                                                    }`}>
                                                                    {m.presente ? 'Presente' : 'Ausente'}
                                                                </span>
                                                            </div>

                                                            {(m.anotacionEspecial || m.motivoFalta) && (
                                                                <div className={`mt-2 p-3 rounded-lg border-l-4 ${m.presente ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-600'
                                                                    }`}>
                                                                    <div className="flex items-start gap-2">
                                                                        <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${m.presente ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                                                        <div>
                                                                            {m.motivoFalta && (
                                                                                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase mb-1">
                                                                                    Motivo: {
                                                                                        {
                                                                                            'trabajo': 'Trabajo',
                                                                                            'enfermedad': 'Enfermedad',
                                                                                            'vacaciones': 'Vacaciones',
                                                                                            'familia': 'Asunto Familiar',
                                                                                            'viaje': 'Viaje',
                                                                                            'sin-motivo': 'Sin motivo específico',
                                                                                            'otro': 'Otro',
                                                                                            'dejar-pendiente': 'Dejar pendiente'
                                                                                        }[m.motivoFalta] || m.motivoFalta
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                            {m.anotacionEspecial && (
                                                                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">
                                                                                    {`"${m.anotacionEspecial}"`}
                                                                                </p>
                                                                            )}
                                                                            {m.prioridadAnotacion && (
                                                                                <div className="flex items-center gap-1 mt-2">
                                                                                    <Flag className={`w-3 h-3 ${m.prioridadAnotacion === 'alta' ? 'text-red-600 dark:text-red-400' :
                                                                                        m.prioridadAnotacion === 'media' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                                                                                        }`} />
                                                                                    <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prioridad {m.prioridadAnotacion}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors tracking-wide"
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    );
};
