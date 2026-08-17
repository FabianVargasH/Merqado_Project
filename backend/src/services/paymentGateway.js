// Pasarela de pago simulada.
//
// El pago es simulado: se autoriza localmente y se genera una referencia de
// transacción para el comprobante. No se consume un procesador de pagos real
// (los sandboxes reales requieren llaves o auto-hospedaje), y como los precios ya
// están en colones no hace falta conversión de moneda. El consumo de API externa
// de la app es la de ubicaciones de Costa Rica en el flujo de envío.

// Referencia de transacción legible tipo PAY-XXXXXXXX (comprobante del pago).
function nuevaReferencia() {
  return `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

// Procesa el pago simulado de una orden y devuelve el comprobante que se guarda
// en Order.payment. El monto queda en colones (moneda de la tienda).
async function processPayment({ montoCRC }) {
  return {
    metodo: 'tarjeta',
    referencia: nuevaReferencia(),
    montoCRC,
    autorizado: true,
    procesadoEn: new Date(),
  }
}

module.exports = { processPayment, nuevaReferencia }
