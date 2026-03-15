import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Filter, Clock3, Download, FileJson } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogEntry } from '../../types';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-AR');
};

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [limit, setLimit] = useState(200);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [pathFilter, setPathFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'' | 'SUCCESS' | 'FAILURE' | 'UNKNOWN'>('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getAuditLogs({
        limit,
        onlyFailures,
        outcome: outcomeFilter,
        action: actionFilter,
        user: userFilter,
        pathContains: pathFilter,
        from: fromDate ? `${fromDate}T00:00:00.000Z` : '',
        to: toDate ? `${toDate}T23:59:59.999Z` : '',
      }) as { logs?: AuditLogEntry[] };
      setLogs(response.logs || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No fue posible cargar los logs.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = async () => {
    try {
      const blob = await api.downloadAuditCsv({
        limit,
        onlyFailures,
        outcome: outcomeFilter,
        action: actionFilter,
        user: userFilter,
        pathContains: pathFilter,
        from: fromDate ? `${fromDate}T00:00:00.000Z` : '',
        to: toDate ? `${toDate}T23:59:59.999Z` : '',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'No se pudo descargar el CSV.');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
  }, [onlyFailures, limit, outcomeFilter]);

  const failureCount = useMemo(() => logs.filter((log) => log.outcome === 'FAILURE').length, [logs]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Auditoría de Actividad</h2>
            <p className="text-gray-600 dark:text-gray-400">Quién intentó hacer qué y por qué falló, cuando aplica.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              <span className="font-semibold">{logs.length} eventos</span>
            </div>
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">{failureCount} fallos</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad de registros</label>
            <select
              id="limit"
              className="input"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>

          <div>
            <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resultado</label>
            <select
              id="outcome"
              className="input"
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as '' | 'SUCCESS' | 'FAILURE' | 'UNKNOWN')}
            >
              <option value="">Todos</option>
              <option value="SUCCESS">Éxito</option>
              <option value="FAILURE">Fallo</option>
              <option value="UNKNOWN">Sin clasificar</option>
            </select>
          </div>

          <div>
            <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario (email)</label>
            <input
              id="userFilter"
              className="input"
              placeholder="ej: admin@..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acción exacta</label>
            <input
              id="actionFilter"
              className="input"
              placeholder="ej: POST_USERS"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pathFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Path contiene</label>
            <input
              id="pathFilter"
              className="input"
              placeholder="ej: /api/celulas"
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
            <input id="fromDate" type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
            <input id="toDate" type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={onlyFailures}
                onChange={(e) => setOnlyFailures(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Filter className="w-4 h-4" />
              Solo fallos
            </label>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Aplicar filtros
            </button>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={downloadCsv}>
              <Download className="w-4 h-4" />
              Descargar CSV
            </button>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={downloadJson}>
              <FileJson className="w-4 h-4" />
              Descargar JSON
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Acción</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Resultado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Motivo</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-600 dark:text-gray-400">Cargando logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-600 dark:text-gray-400">No hay logs para mostrar.</td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={`${log.timestamp || 'na'}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">{log.userEmail || 'Sin usuario'}</div>
                    <div className="text-xs text-gray-500">{log.userRole || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">{log.action}</div>
                    <div className="text-xs text-gray-500">{log.method || '-'} {log.path || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.outcome === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        OK {log.statusCode ? `(${log.statusCode})` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Falló {log.statusCode ? `(${log.statusCode})` : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.reason || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
