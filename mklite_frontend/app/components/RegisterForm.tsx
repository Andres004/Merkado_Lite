'use client';
import { useState } from 'react';
import { registerService } from '../services/auth.service';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', ci: '', email: '', password: '', telefono: '', direccion: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    
    try {
      await registerService(form);
      alert('Registro exitoso. Ahora inicia sesión.');
      onSuccess(); 
    } catch (err: any) {
      const msg = err.response?.data?.message 
        ? (Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message)
        : 'Error al registrar. Verifica tus datos.';
      setError(msg);
    }
  };

  // Estilos comunes para los inputs para no repetir tanto código
  const inputClasses = "p-3 border border-gray-300 rounded-lg w-full text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="nombre" placeholder="Nombre" onChange={handleChange} className={inputClasses} required />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} className={inputClasses} required />
      </div>
      
      <input name="ci" placeholder="Cédula (CI)" onChange={handleChange} className={inputClasses} required />
      <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} className={inputClasses} required />
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className={inputClasses} required />
      
      <div className="grid grid-cols-2 gap-3">
         <input name="telefono" placeholder="Teléfono" onChange={handleChange} className={inputClasses} />
         <input name="direccion" placeholder="Dirección" onChange={handleChange} className={inputClasses} />
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

      <button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-md"
      >
        Crear Cuenta
      </button>

      <div className="text-center text-sm text-gray-600 mt-2">
        ¿Ya tienes una cuenta?{' '}
        <button 
            type="button" 
            onClick={onSwitchToLogin} 
            className="text-red-600 hover:underline font-medium"
        >
          Iniciar Sesión
        </button>
      </div>
    </form>
  );
}