// app/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerService } from '../services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
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
      alert('Usuario registrado correctamente. Ahora inicia sesión.');
      router.push('/login'); // Mandarlo al login
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error al registrar. Verifica tus datos.';
      setError(msg);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', paddingBottom: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required style={inputStyle} />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} required style={inputStyle} />
        <input name="ci" placeholder="Cédula (CI)" onChange={handleChange} required style={inputStyle} />
        <input name="email" type="email" placeholder="Correo electrónico" onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required style={inputStyle} />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
        <input name="direccion" placeholder="Dirección" onChange={handleChange} style={inputStyle} />

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
          Registrarse
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#0070f3' }}>Inicia sesión</a>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd'
};