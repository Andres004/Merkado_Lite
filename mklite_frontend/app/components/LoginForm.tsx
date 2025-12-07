'use client';
import { useState } from 'react';
import { loginService } from '../services/auth.service';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginService(form);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      alert('¡Bienvenido ' + data.user.nombre + '!');
      onSuccess(); 
    } catch (err: any) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input
          name="email"
          type="email"
          placeholder="Ingresa tu correo electrónico"
          onChange={handleChange}
          // CORRECCIÓN: text-gray-900 (texto oscuro), bg-white (fondo blanco), placeholder:text-gray-400
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          onChange={handleChange}
          // CORRECCIÓN: Mismas clases de color aquí
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
        Iniciar Sesión
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes una cuenta?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-red-600 hover:underline font-medium">
          Registrarse aquí
        </button>
      </p>
    </form>
  );
}