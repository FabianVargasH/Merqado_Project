export const formatearColones = (valor) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0, //Sin decimales porque el colón suele mostrarse en enteros
  }).format(valor);
