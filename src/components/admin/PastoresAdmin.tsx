import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Pastor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const PastoresAdmin: React.FC = () => {
  const [pastores, setPastores] = useState<Pastor[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPastores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPastores(res.data.filter((u: any) => u.role === 'PASTOR'));
    } catch (err: any) {
      setError('Error al cargar pastores');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPastores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        '/api/users',
        { ...form, role: 'PASTOR' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Pastor creado exitosamente');
      setForm({ name: '', email: '', password: '' });
      fetchPastores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear pastor');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administrar Pastores</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block font-semibold">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Agregar Pastor'}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </form>
      <h3 className="text-xl font-semibold mb-2">Pastores existentes</h3>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <ul className="divide-y">
          {pastores.map((p) => (
            <li key={p.id} className="py-2">
              <span className="font-medium">{p.name}</span> - {p.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PastoresAdmin;
