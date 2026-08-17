
function nuevaReferencia() {
  return `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}


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
