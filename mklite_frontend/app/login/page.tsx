// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginService } from '../services/auth.service';

export default function LoginPage() {
  const router = useRouter();
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
      
      // 1. Guardamos el token con el nombre que tu axios.tsx espera ('authToken')
      localStorage.setItem('authToken', data.access_token);
      
      // Opcional: Guardar datos del usuario para mostrar "Hola Juan"
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      alert('¡Bienvenido ' + data.user.nombre + '!');
      router.push('/'); // Redirigir al inicio (dashboard)
      
    } catch (err: any) {
      console.error(err);
      // Intentamos mostrar el mensaje de error del backend si existe
      const msg = err.response?.data?.message || 'Credenciales incorrectas';
      setError(msg);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Correo electrónico:</label>
          <input
            name="email"
            type="email"
            placeholder="ejemplo@correo.com"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            name="password"
            type="password"
            placeholder="******"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          Ingresar
        </button>

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: '#0070f3' }}>Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}