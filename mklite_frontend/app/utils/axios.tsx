import axios from "axios";

export const instance = axios.create({
  // url del backend
  baseURL: 'http://localhost:3005', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================================
// Interceptor para Inyectar el Token JWT
// ===================================
instance.interceptors.request.use(
  (config) => {
    //  token almacenado después del login exitoso
    const token = localStorage.getItem('authToken'); 

    // Si el token existe, adjuntarlo al header 'Authorization'
    if (token) {
      // formato debe ser 'Bearer ' + token
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Manejo de errores de solicitud
    return Promise.reject(error);
  }
);


export default instance; 