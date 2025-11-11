// mklite_frontend/app/components/ServicesSection.tsx

import React from 'react';
// Importamos los iconos de lucide-react (asumiendo que ya la instalaste)
import { Truck, Phone, CreditCard, Calendar } from 'lucide-react'; 

const servicesData = [
  {
    icon: Truck, // Icono para Entrega Rápida
    title: "Entrega Rápida y Confiable",
    description: "Recibe tu pedido en la puerta de tu casa con nuestro servicio puntual y seguro.",
  },
  {
    icon: Phone, // Icono para Soporte Dedicado
    title: "Soporte Dedicado",
    description: "Estamos listos para ayudarte con tu pedido en nuestros horarios de atención.",
  },
  {
    icon: CreditCard, // Icono para Pago al Recibir
    title: "Paga al Recibir",
    description: "Tu pago es 100% seguro. Pagas en efectivo al momento de la entrega.",
  },
  {
    icon: Calendar, // Icono para Entrega Flexible
    title: "Entrega Flexible",
    description: "Recibe tu pedido hoy mismo o prográmalo para el día y la hora que te convenga.",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Usamos un grid de 4 columnas para los servicios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {servicesData.map((service, index) => (
            <div key={index} className="flex items-start space-x-4">
              
              {/* Contenedor del Icono */}
              <div className="flex-shrink-0 p-3 rounded-full border border-gray-300 text-gray-700">
                <service.icon size={24} />
              </div>

              {/* Contenido del Servicio */}
              <div>
                <h3 className="text-base font-semibold mb-1">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;