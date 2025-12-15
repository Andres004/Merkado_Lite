export const metadata = {
  title: 'Contáctanos | Merkado Lite',
};

const ContactPage = () => {
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-red-600 font-semibold">Merkado Lite</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Contáctanos</h1>
          <p className="text-gray-600 max-w-3xl">
            Estamos listos para ayudarte. Escríbenos o llámanos y un miembro de nuestro equipo te atenderá con gusto.
          </p>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Ubicación</h2>
          <p className="text-gray-700 leading-relaxed">
            Calle Minimarket, entre Av Super y Ladislado cerca de la Católica Boliviana UCB - Cochabamba
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Canales de contacto</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Teléfono de soporte:</strong> +591 4 123 4567</li>
            <li><strong>Celulares:</strong> +591 700 11111 / +591 700 22222</li>
            <li><strong>Correo administración:</strong> admin@merkadolite.com</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;