/*"use client"

import { createUser, deleteUser, getUsers } from "../services/user.service";
import { useEffect, useState } from "react";
import styles from "./page.module.css"
import UserModel from "../models/user.model";

export default function Usuario() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [user, setUser] = useState<Partial<UserModel>>({
    lastname: "",
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    }

    fetchUsers();
  }) 

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createUser(user);
    console.log(response);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.placeholder]: e.target.value,
    });
  };

  const deleteSelectedUser = async (ci: string) => {  
    const response = await deleteUser(ci);
    console.log(response);
  }

  return (
    <div className={styles.user_page}>
      <form onSubmit={onSubmit} className={styles.user_form}>
        <input type="text" placeholder="name" value={user.name} onChange={handleChange} />
        <input type="text" placeholder="lastname" value={user.lastname} onChange={handleChange} />
        <input type="email" placeholder="email" value={user.email} onChange={handleChange} />
        <input type="password" placeholder="password" value={user.password} onChange={handleChange} />
        <button className={styles.user_card_delete_button} type="submit">Crear Usuario</button>
      </form>
      <div className={styles.user_container}>
        { users.map((user: any) => (
          <div className={styles.user_card} key={user.ci}>
            <h1 className={styles.user_data}>Usuario: {user.name}</h1>
            <p>Email: {user.email}</p>
            <button className={styles.user_card_delete_button} onClick={() => deleteSelectedUser(user.ci)}>Eliminar</button>
          </div>
        )) }
      </div>
    </div>
  );
}*/

// mklite_frontend/app/user/page.tsx
// mklite_frontend/app/user/page.tsx

"use client"; // Necesario para usar useState

import React, { useState } from 'react';
import Image from 'next/image';

// Mocks de Imágenes
const promoImageUrl = '/images/auth-promo.jpg'; 

// --- Componentes de Formulario (UI Pura) ---

const LoginForm = () => (
  <form className="space-y-4 pt-6" onSubmit={(e) => e.preventDefault()}> {/* PreventDefault para evitar recarga */}
    <input
      type="email"
      placeholder="Correo Electrónico"
      className="w-full border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <input
      type="password"
      placeholder="Contraseña"
      className="w-full border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <a href="#" className="text-sm text-gray-500 hover:text-red-600 block pt-2">
      ¿Olvidaste tu contraseña?
    </a>
    <button
      type="submit"
      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md shadow-md transition duration-150"
    >
      INICIAR SESIÓN
    </button>
  </form>
);

const RegisterForm = () => (
  <form className="grid grid-cols-2 gap-4 pt-6" onSubmit={(e) => e.preventDefault()}> {/* PreventDefault para evitar recarga */}
    <input
      type="text"
      placeholder="Nombre Completo"
      className="col-span-2 border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <input
      type="email"
      placeholder="Correo Electrónico"
      className="border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <input
      type="tel"
      placeholder="Celular"
      className="border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <input
      type="password"
      placeholder="Contraseña"
      className="border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    <input
      type="password"
      placeholder="Confirmar Contraseña"
      className="border border-gray-300 p-3 rounded-md focus:ring-red-500 focus:border-red-500"
    />
    
    <button
      type="submit"
      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md shadow-md transition duration-150 col-span-2"
    >
      CREAR CUENTA
    </button>
  </form>
);


// --- Componente Principal: Page ---
export default function UserPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register'); // Mantenemos Registro como pestaña activa por defecto

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-12">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden flex">
        
        {/* Columna Izquierda: Imagen Promocional */}
        <div className="w-1/2 relative bg-gray-800 hidden md:block">
          <Image
            src={promoImageUrl}
            alt="Mercado Fácil"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-70"
            priority
          />
          {/* Texto Promocional Superpuesto */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
            <h2 className="text-4xl font-bold leading-tight mb-2">¡Tu mercado fácil, tu vida simple!</h2>
            <p className="text-xl font-semibold text-red-500">MERKADO LITE</p>
          </div>
        </div>

        {/* Columna Derecha: Formularios de Autenticación */}
        <div className="w-full md:w-1/2 p-8">
          
          {/* Pestañas de Navegación */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 text-center py-3 font-semibold transition duration-150 ${
                activeTab === 'login'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 text-center py-3 font-semibold transition duration-150 ${
                activeTab === 'register'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              REGISTRARME
            </button>
          </div>

          {/* Renderizado del Formulario Activo */}
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          
        </div>
      </div>
    </div>
  );
}