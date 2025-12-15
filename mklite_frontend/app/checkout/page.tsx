import Image from "next/image";
import Link from "next/link";

const cartItems = [
  {
    id: 1,
    name: "Nuggets Dino Sofia 1 kg",
    price: 64.8,
    image: "/images/nuggets.jpg",
  },
  {
    id: 2,
    name: "Papa Holandesa 1 kg",
    price: 65.0,
    image: "/images/papa.jpg",
  },
];

const SHIPPING = 5.0;
const subtotal = cartItems.reduce((a, b) => a + b.price, 0);
const total = subtotal + SHIPPING;

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">
          Inicio / Carrito /{" "}
          <span className="text-gray-900 font-semibold">
            Finalizar Compra
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-10">
          {/* Información contacto */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                className="border rounded-md px-4 py-2 text-sm"
                placeholder="Nombre cliente"
              />
              <input
                className="border rounded-md px-4 py-2 text-sm"
                placeholder="Correo electrónico"
              />
            </div>

            <p className="text-sm text-gray-600 mb-3">
              ¿Dónde lo enviamos?
            </p>

            {/* Direcciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-red-500 rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Casa</span>
                  <span className="text-xs text-green-600">Predeterminada</span>
                </div>
                <p className="text-gray-600">
                  Av. xxxxxxxxxxxxxxxxx
                </p>
                <p className="text-gray-600">Tel: 77777777</p>
              </div>

              <div className="border rounded-lg p-4 text-sm">
                <span className="font-semibold">Oficina</span>
                <p className="text-gray-600">
                  Av. xxxxxxxxxxxxxxxxx
                </p>
                <p className="text-gray-600">Tel: 66666676</p>
              </div>

              <button className="text-sm text-gray-600 border rounded-lg p-4 hover:bg-gray-50">
                + Añadir Nueva Dirección
              </button>
            </div>
          </section>

          {/* Método de entrega */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Método de Entrega
            </h2>

            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="delivery" defaultChecked />
                Envío a Domicilio
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="delivery" />
                Recoger en tienda
              </label>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-gray-600 mb-2">¿Cuándo lo quieres?</p>

              <label className="flex items-center gap-2 mb-2">
                <input type="radio" name="time" />
                Entregar lo antes posible
              </label>

              <label className="flex items-center gap-2 mb-4">
                <input type="radio" name="time" defaultChecked />
                Programar mi pedido
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border rounded-md px-4 py-2"
                  placeholder="DD / MM / AAAA"
                />
                <select className="border rounded-md px-4 py-2">
                  <option>Selecciona una franja horaria</option>
                  <option>09:00 - 11:00</option>
                  <option>11:00 - 13:00</option>
                  <option>15:00 - 17:00</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* DERECHA */}
        <aside className="border rounded-lg p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">
            Resumen del Pedido
          </h3>

          <div className="space-y-4 border-b pb-4 mb-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <span>{item.name}</span>
                </div>
                <span>Bs. {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Bs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de Envío</span>
              <span>Bs. {SHIPPING.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between font-semibold text-sm py-4">
            <span>Total</span>
            <span>Bs. {total.toFixed(2)}</span>
          </div>

          <h4 className="font-semibold text-sm mb-1">
            Método de Pago
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Pago en efectivo al recibir tu pedido.
          </p>

          <Link href="/confirmacion">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-semibold">
              Confirmar Pedido
            </button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
