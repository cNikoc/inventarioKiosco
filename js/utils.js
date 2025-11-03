// Utilidades generales
const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

const formatDate = (date) => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const parsePrice = (priceString) => {
  return parseFloat(priceString.replace(/,/g, "")) || 0;
};

// Reloj digital
const initRelojDigital = () => {
  const updateReloj = () => {
    const now = new Date();
    
    // Hora con segundos
    const horas = now.getHours().toString().padStart(2, "0");
    const minutos = now.getMinutes().toString().padStart(2, "0");
    const segundos = now.getSeconds().toString().padStart(2, "0");
    
    // Fecha abreviada
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const diaSemana = dias[now.getDay()];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const año = now.getFullYear();
    
    // Actualizar DOM
    const relojHora = document.querySelector('.reloj-hora');
    const relojFecha = document.querySelector('.reloj-fecha');
    
    if (relojHora) {
      relojHora.textContent = `${horas}:${minutos}:${segundos}`;
    }
    
    if (relojFecha) {
      relojFecha.textContent = `${diaSemana} ${dia}/${mes}/${año}`;
    }
  };
  
  // Actualizar cada segundo
  updateReloj();
  setInterval(updateReloj, 1000);
};

