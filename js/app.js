const btnOpenModalVenta = document.getElementById("btnOpenModalVenta");
const btnDescarga = document.getElementById("btnDescarga");
const modalVenta = document.getElementById("modalVenta");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const formularioVentas = document.getElementById("formularioVentas");
const ventasTable = document.getElementById("ventasTable");
const Ntotal = document.getElementById("Ntotal");
const fechaTitulo = document.getElementById("fechaTitulo");
btnOpenModalVenta.addEventListener("click", () => {
  modalVenta.classList.toggle("is-active");
});
btnCerrarModal.addEventListener("click", () => {
  modalVenta.classList.toggle("is-active");
});

var firebaseConfig = {
  apiKey: "AIzaSyAbDa9RRhB5EZBK-z93flLE2PUI7ZgEm28",
  authDomain: "kioscoelmunie-19959.firebaseapp.com",
  projectId: "kioscoelmunie-19959",
  storageBucket: "kioscoelmunie-19959.appspot.com",
  messagingSenderId: "381410981038",
  appId: "1:381410981038:web:6115a08af2bff36feae93f",
};
firebase.initializeApp(firebaseConfig);

function calcularTotal(n) {
  const totalActual = parseFloat(Ntotal.textContent.replace(/,/g, "")) || 0;
  let totalFinal = totalActual + parseFloat(n);
  Ntotal.textContent = new Intl.NumberFormat("en-US").format(totalFinal);
  return;
}

function horaInstante() {
  const now = new Date();
  const hours = now.getHours(); // Obtiene la hora
  const minutes = now.getMinutes(); // Obtiene los minutos
  // Para mostrarlo en formato de dos dígitos (si es necesario)
  const horaFormateada = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return horaFormateada;
}

const fechaHoy = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
});
const ventasRef = firebase.database().ref(`Ventas del ${fechaHoy}`);
fechaTitulo.textContent = fechaHoy.toUpperCase();

formularioVentas.addEventListener("submit", (e) => {
  e.preventDefault();
  const precio = formularioVentas["precio"].value;
  const descripcion = formularioVentas["desc"].value;

  // Usamos push para agregar una nueva venta sin reemplazar las anteriores
  const registrarVenta = ventasRef.push();
  registrarVenta.set({
    Uid: registrarVenta.key, // Usamos la clave generada por push() como Uid
    precio: precio,
    descripcion: descripcion,
    hora: horaInstante(),
  });

  // Limpiar los campos del formulario
  formularioVentas["precio"].value = "";
  formularioVentas["desc"].value = "";
  // Cerrar el modal
  modalVenta.classList.toggle("is-active");
});

window.addEventListener("DOMContentLoaded", async () => {
  await ventasRef.on("value", (snapshot) => {
    ventasTable.innerHTML = ""; // Limpiar la tabla antes de actualizar
    Ntotal.textContent = 0;

    const venta = snapshot.val(); // Obtener los datos de ventas

    // Asegúrate de que ventasData sea un objeto válido y tiene datos
    if (venta) {
      // Iterar sobre cada venta
      Object.values(venta).forEach((venta, index) => {
        ventasTable.innerHTML += `
            <tr>
              <th>${index + 1}</th>
              <td>${venta.descripcion.toUpperCase()}</td>
              <td>$ ${venta.precio}</td>
              <td>${venta.hora}</td>
              <td>
                <button class="button is-light is-small deletebtn" data-id="${
                  venta.Uid
                }" data-desc="${venta.descripcion.toUpperCase()} - $${
          venta.precio
        }">
                ❌
                </button>
              </td>
            </tr>
          `;

        calcularTotal(venta.precio);

        // Asignar eventos a los botones de eliminación
        document.querySelectorAll(".deletebtn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const confirmacion = confirm(
              `Desea eliminar de la lista:  ${e.target.dataset.desc}`
            );
            if (confirmacion) {
              /* alert("Eliminado de la lista"); */

              // UID del ítem a eliminar
              const itemUID = e.target.dataset.id;

              try {
                await firebase
                  .database()
                  .ref(`Ventas del ${fechaHoy}/${itemUID}`)
                  .remove();
                alert("✅ Ítem eliminado correctamente.");
                e.target.closest("tr").remove();
              } catch (e) {
                alert("❌ Error eliminando el ítem.");
                console.error(e);
              }
            }
          });
        });
      });
    }
  });
});

btnDescarga.addEventListener("click", () => {
  let contenido = "";
  document.querySelectorAll("#ventasTable tr").forEach((row) => {
    let rowData = [];
    const cells = row.querySelectorAll("td, th");
    // Excluir la última columna
    for (let i = 0; i < cells.length - 1; i++) {
      rowData.push(cells[i].innerText);
    }
    contenido += rowData.join("\t") + "\n"; // Separado por tabulaciones
  });

  // Agregar "FIN" al final
  contenido += `\n-----\nTOTAL: $${Ntotal.textContent}.\n`;

  // Crear archivo TXT y descargarlo
  const blob = new Blob([contenido], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Ventas del ${fechaHoy}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
