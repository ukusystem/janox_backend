
export function getFormattedDateTime() {
  const ahora = new Date();

  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Nota: Los meses en JavaScript comienzan desde 0
  const anio = ahora.getFullYear();

  const hora = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");

  return `${dia}-${mes}-${anio}_${hora}-${minutos}-${segundos}`;
}

export function getFormattedDate(){
  const ahora = new Date();

  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Nota: Los meses en JavaScript comienzan desde 0
  const anio = ahora.getFullYear();

  return `${dia}-${mes}-${anio}`;
}

