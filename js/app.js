const btnOpenModalVenta = document.getElementById("btnOpenModalVenta");
const btnDescarga = document.getElementById("btnDescarga");
const modalVenta = document.getElementById("modalVenta");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const formularioVentas = document.getElementById("formularioVentas");
const ventasTable = document.getElementById("ventasTable");
const Ntotal = document.getElementById("Ntotal");
const fechaTitulo = document.getElementById("fechaTitulo");
const btnSubmit = document.getElementById("btnSubmit");
const inputPrecio = formularioVentas["precio"];
const inputDescripcion = formularioVentas["desc"];

// Configuración Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAbDa9RRhB5EZBK-z93flLE2PUI7ZgEm28",
  authDomain: "kioscoelmunie-19959.firebaseapp.com",
  projectId: "kioscoelmunie-19959",
  storageBucket: "kioscoelmunie-19959.appspot.com",
  messagingSenderId: "381410981038",
  appId: "1:381410981038:web:6115a08af2bff36feae93f",
};
firebase.initializeApp(firebaseConfig);

// Función para calcular total
function calcularTotal(n) {
  const totalActual = parseFloat(Ntotal.textContent.replace(/,/g, "")) || 0;
  let totalFinal = totalActual + parseFloat(n);
  Ntotal.textContent = new Intl.NumberFormat("en-US").format(totalFinal);
}

// Función para obtener la hora actual
function horaInstante() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// Obtener la fecha actual
const fechaHoy = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
});
const ventasRef = firebase.database().ref(`Ventas del ${fechaHoy}`);
fechaTitulo.textContent = fechaHoy.toUpperCase();

// Función para validar los campos del formulario
function validarCampos() {
  btnSubmit.disabled = !(inputPrecio.value.trim() !== "" && inputDescripcion.value.trim() !== "");
  if (btnSubmit.disabled === true) btnSubmit.textContent = 'COMPLETAR CAMPOS'
  else btnSubmit.textContent = 'GUARDAR VENTA'
}

// Agregar evento input para habilitar/deshabilitar el botón
inputPrecio.addEventListener("input", validarCampos);
inputDescripcion.addEventListener("input", validarCampos);

// Deshabilitar el botón al abrir el modal
btnOpenModalVenta.addEventListener("click", () => {
  modalVenta.classList.toggle("is-active");
  btnSubmit.disabled = true;
});

// También deshabilitar el botón al cerrar el modal
btnCerrarModal.addEventListener("click", () => {
  modalVenta.classList.toggle("is-active");
  btnSubmit.disabled = true;
  inputPrecio.value = "";
  inputDescripcion.value = "";
});

// Evento de envío del formulario
formularioVentas.addEventListener("submit", (e) => {
  e.preventDefault();
  const precio = inputPrecio.value;
  const descripcion = inputDescripcion.value;

  // Registrar la venta en Firebase
  const registrarVenta = ventasRef.push();
  registrarVenta.set({
    Uid: registrarVenta.key,
    precio: precio,
    descripcion: descripcion,
    hora: horaInstante(),
  });

  // Limpiar el formulario y deshabilitar el botón nuevamente
  inputPrecio.value = "";
  inputDescripcion.value = "";
  btnSubmit.disabled = true;

  // Cerrar el modal
  modalVenta.classList.toggle("is-active");
});

// Cargar ventas al iniciar
window.addEventListener("DOMContentLoaded", async () => {
  await ventasRef.on("value", (snapshot) => {
    ventasTable.innerHTML = "";
    Ntotal.textContent = 0;

    const venta = snapshot.val();
    if (venta) {
      Object.values(venta).forEach((venta, index) => {
        ventasTable.innerHTML += `
          <tr>
            <th>${index + 1}</th>
            <td>${venta.descripcion.toUpperCase()}</td>
            <td>$ ${venta.precio}</td>
            <td>${venta.hora}</td>
            <td>
              <button class="button is-light is-small deletebtn" data-id="${venta.Uid}" data-desc="${venta.descripcion.toUpperCase()} - $${venta.precio}">
                ❌
              </button>
            </td>
          </tr>
        `;

        calcularTotal(venta.precio);

        // Asignar eventos a los botones de eliminación
        document.querySelectorAll(".deletebtn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const confirmacion = confirm(`Desea eliminar de la lista:  ${e.target.dataset.desc}`);
            if (confirmacion) {
              const itemUID = e.target.dataset.id;

              try {
                await firebase.database().ref(`Ventas del ${fechaHoy}/${itemUID}`).remove();
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

// Descargar archivo con ventas
btnDescarga.addEventListener("click", () => {
  let contenido = "";
  document.querySelectorAll("#ventasTable tr").forEach((row) => {
    let rowData = [];
    const cells = row.querySelectorAll("td, th");
    for (let i = 0; i < cells.length - 1; i++) {
      rowData.push(cells[i].innerText);
    }
    contenido += rowData.join("\t") + "\n";
  });

  contenido += `\n-----\nTOTAL: $${Ntotal.textContent}.\n`;

  const blob = new Blob([contenido], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Ventas del ${fechaHoy}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});