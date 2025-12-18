export const metadata = {
  title: 'Sobre nosotros | Merkado Lite',
};

const AboutPage = () => {
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-red-600 font-semibold">Merkado Lite</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Sobre nosotros</h1>
          <p className="text-gray-600 max-w-3xl">
            Somos Merkado Lite, tu aliado cercano para hacer las compras diarias fáciles, rápidas y confiables. Nos
            apasiona conectar a las personas con productos de calidad a precios justos, siempre con un servicio cercano
            y humano.
          </p>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Misión</h2>
          <p className="text-gray-700 leading-relaxed">
            Facilitar el acceso a productos de supermercado con una experiencia de compra digital sencilla, ágil y
            segura. Queremos que cada pedido llegue a tiempo y con la misma calidez que recibirlo de un vecino.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Visión</h2>
          <p className="text-gray-700 leading-relaxed">
            Ser la plataforma de compras preferida en Bolivia, reconocida por la confianza, la cercanía y la innovación
            constante en cada entrega.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Valores</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Confianza:</strong> productos de calidad y procesos transparentes.</li>
            <li><strong>Cercanía:</strong> atención humana y empatía en cada pedido.</li>
            <li><strong>Agilidad:</strong> entregas puntuales y un checkout sin complicaciones.</li>
            <li><strong>Innovación:</strong> mejoras constantes para que comprar en línea sea cada vez más fácil.</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;