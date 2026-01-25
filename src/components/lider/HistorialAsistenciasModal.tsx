import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { AsistenciaRecord } from '../../types';
import { X, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Flag, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialAsistenciasModalProps {
    celulaId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const HistorialAsistenciasModal: React.FC<HistorialAsistenciasModalProps> = ({ celulaId, isOpen, onClose }) => {
    const { getHistorialAsistencias } = useData();
    const [historial, setHistorial] = useState<AsistenciaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
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
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-medium">Cargando registros históricos...</p>
                        </div>
                    ) : historial.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">No hay registros aún</h4>
                            <p className="text-gray-500 max-w-sm mx-auto">
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
                                        className={`bg-white rounded-xl border transition-all duration-300 ${isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:border-gray-300 shadow-sm'
                                            }`}
                                    >
                                        {/* Fila colapsada */}
                                        <div
                                            onClick={() => setExpandedId(isExpanded ? null : registro.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center min-w-[70px] py-1 bg-blue-50 rounded-lg text-blue-700 border border-blue-100 font-bold group-hover:bg-blue-100 transition-colors">
                                                    <span className="text-xs uppercase leading-none mb-1">{format(new Date(registro.date), 'MMM', { locale: es })}</span>
                                                    <span className="text-2xl leading-none">{format(new Date(registro.date), 'dd')}</span>
                                                </div>

                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        {format(new Date(registro.date), 'EEEE, d MMMM', { locale: es })}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm">
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded-md border border-green-100">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {registro.totalPresentes} Presentes
                                                        </span>
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded-md border border-red-100">
                                                            <XCircle className="w-3 h-3" />
                                                            {registro.totalAusentes} Ausentes
                                                        </span>
                                                        {registro.pendientesCompletar > 0 && (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md border border-amber-100 animate-pulse">
                                                                {registro.pendientesCompletar} Pendientes
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Registrado por</p>
                                                    <p className="text-sm font-semibold text-gray-600">{(registro as any).registradoPor?.name || 'Sistema'}</p>
                                                </div>
                                                <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detalle expandido */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 bg-gray-50/30 p-5 animate-in fade-in duration-300">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Listado de Asistencia
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {registro.miembros.map((m) => (
                                                        <div
                                                            key={m.miembroId}
                                                            className={`flex flex-col p-4 rounded-xl border-2 transition-all ${m.presente
                                                                ? 'bg-white border-green-50 hover:border-green-100'
                                                                : 'bg-white border-red-50 hover:border-red-100'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    {m.presente ? (
                                                                        <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-red-100 p-1.5 rounded-full text-red-600">
                                                                            <XCircle className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                    <span className="font-bold text-gray-800">{(m as any).miembro?.nombre || 'Miembro'}</span>
                                                                </div>
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${m.presente ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                                    }`}>
                                                                    {m.presente ? 'Presente' : 'Ausente'}
                                                                </span>
                                                            </div>

                                                            {(m.anotacionEspecial || m.motivoFalta) && (
                                                                <div className={`mt-2 p-3 rounded-lg border-l-4 ${m.presente ? 'bg-blue-50 border-blue-500' : 'bg-amber-50 border-amber-500'
                                                                    }`}>
                                                                    <div className="flex items-start gap-2">
                                                                        <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${m.presente ? 'text-blue-600' : 'text-amber-600'}`} />
                                                                        <div>
                                                                            {m.motivoFalta && (
                                                                                <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Motivo: {m.motivoFalta}</p>
                                                                            )}
                                                                            <p className="text-sm text-gray-700 font-medium italic">"{m.anotacionEspecial || 'Sin comentario detallado'}"</p>
                                                                            {m.prioridadAnotacion && (
                                                                                <div className="flex items-center gap-1 mt-2">
                                                                                    <Flag className={`w-3 h-3 ${m.prioridadAnotacion === 'alta' ? 'text-red-600' :
                                                                                        m.prioridadAnotacion === 'media' ? 'text-amber-600' : 'text-green-600'
                                                                                        }`} />
                                                                                    <span className="text-[10px] font-bold uppercase text-gray-400">Prioridad {m.prioridadAnotacion}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
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

                <div className="p-6 border-t shrink-0 bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors tracking-wide"
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    );
};
