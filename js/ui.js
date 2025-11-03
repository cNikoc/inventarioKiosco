// Gestión de la interfaz de usuario
class UIManager {
  constructor() {
    this.elements = {};
    this.loadingStates = new Set();
    this.editingProductoId = null;
  }

  initialize() {
    // Cachear elementos del DOM
    this.elements = {
      btnOpenModal: document.getElementById("btnOpenModalVenta"),
      btnDescarga: document.getElementById("btnDescarga"),
      modal: document.getElementById("modalVenta"),
      btnCerrarModal: document.getElementById("btnCerrarModal"),
      formulario: document.getElementById("formularioVentas"),
      ventasTable: document.getElementById("ventasTable"),
      turnosDividers: document.getElementById("turnosDividers"),
      totalDisplay: document.getElementById("Ntotal"),
      fechaTitulo: document.getElementById("fechaTitulo"),
      btnSubmit: document.getElementById("btnSubmit"),
      inputPrecio: document.getElementById("precio"),
      inputDescripcion: document.getElementById("desc"),
      btnMasVendidos: document.getElementById("btnMasVendidos"),
      modalMasVendidos: document.getElementById("modalMasVendidos"),
      btnCerrarMasVendidos: document.getElementById("btnCerrarMasVendidos"),
      btnCancelarMasVendidos: document.getElementById("btnCancelarMasVendidos"),
      listaMasVendidos: document.getElementById("listaMasVendidos"),
      btnAgregarProducto: document.getElementById("btnAgregarProducto"),
      modalAgregarProducto: document.getElementById("modalAgregarProducto"),
      btnCerrarAgregarProducto: document.getElementById("btnCerrarAgregarProducto"),
      btnGuardarProducto: document.getElementById("btnGuardarProducto"),
      prodDesc: document.getElementById("prodDesc"),
      prodPrecio: document.getElementById("prodPrecio"),
      prodImagenUrl: document.getElementById("prodImagenUrl"),
      btnTurnoManiana: document.getElementById("btnTurnoManiana"),
      btnTurnoTarde: document.getElementById("btnTurnoTarde"),
      btnTurnoNoche: document.getElementById("btnTurnoNoche"),
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Modal principal
    this.elements.btnOpenModal.addEventListener("click", () => this.openModal());
    this.elements.btnCerrarModal.addEventListener("click", () => this.closeModal());

    // Modal de más vendidos
    this.elements.btnMasVendidos.addEventListener("click", () => this.openMasVendidos());
    this.elements.btnCerrarMasVendidos.addEventListener("click", () => this.closeMasVendidos());
    this.elements.btnCancelarMasVendidos.addEventListener("click", () => this.closeMasVendidos());
    
    // Modal de agregar producto
    this.elements.btnAgregarProducto.addEventListener("click", () => this.openAgregarProducto());
    this.elements.btnCerrarAgregarProducto.addEventListener("click", () => this.closeAgregarProducto());

    // Validación en tiempo real
    this.elements.inputPrecio.addEventListener("input", () => this.validateForm());
    this.elements.inputDescripcion.addEventListener("input", () => this.validateForm());
  }

  openAgregarProducto() {
    this.editingProductoId = null;
    this.elements.modalAgregarProducto.classList.add("is-active");
    this.updateModalProductoTitulo(false);
    this.elements.prodDesc.value = "";
    this.elements.prodPrecio.value = "";
    this.elements.prodImagenUrl.value = "";
  }

  openEditProducto(producto) {
    this.editingProductoId = producto.Uid;
    this.elements.modalAgregarProducto.classList.add("is-active");
    this.updateModalProductoTitulo(true);
    this.elements.prodDesc.value = producto.descripcion;
    this.elements.prodPrecio.value = producto.precio;
    this.elements.prodImagenUrl.value = producto.imagenUrl || "";
  }

  closeAgregarProducto() {
    this.editingProductoId = null;
    this.elements.modalAgregarProducto.classList.remove("is-active");
    this.updateModalProductoTitulo(false);
    this.elements.prodDesc.value = "";
    this.elements.prodPrecio.value = "";
    this.elements.prodImagenUrl.value = "";
  }

  updateModalProductoTitulo(isEditing) {
    const titulo = document.querySelector('#modalAgregarProducto .modal-card-title');
    if (titulo) {
      titulo.textContent = isEditing ? '✏️ Editar Producto Favorito' : '➕ Agregar Producto Favorito';
    }
  }

  getProductoFormData() {
    return {
      descripcion: this.elements.prodDesc.value.trim(),
      precio: this.elements.prodPrecio.value,
      imagenUrl: this.elements.prodImagenUrl.value.trim(),
      uid: this.editingProductoId
    };
  }

  openModal() {
    this.elements.modal.classList.add("is-active");
    this.resetForm();
  }

  closeModal() {
    this.elements.modal.classList.remove("is-active");
    this.resetForm();
  }

  resetForm() {
    this.elements.inputPrecio.value = "";
    this.elements.inputDescripcion.value = "";
    this.elements.btnSubmit.disabled = true;
    this.elements.btnSubmit.textContent = "COMPLETAR CAMPOS";
  }

  validateForm() {
    const isValid = 
      this.elements.inputPrecio.value.trim() !== "" && 
      this.elements.inputDescripcion.value.trim() !== "";
    
    this.elements.btnSubmit.disabled = !isValid;
    this.elements.btnSubmit.textContent = isValid ? "GUARDAR VENTA" : "COMPLETAR CAMPOS";
  }

  getFormData() {
    return {
      precio: this.elements.inputPrecio.value,
      descripcion: this.elements.inputDescripcion.value,
    };
  }

  setLoading(elementId, isLoading) {
    const element = this.elements[elementId] || document.getElementById(elementId);
    if (!element) return;

    if (isLoading) {
      this.loadingStates.add(elementId);
      element.disabled = true;
      element.classList.add('is-loading');
    } else {
      this.loadingStates.delete(elementId);
      element.disabled = false;
      element.classList.remove('is-loading');
    }
  }

  updateTotal(total) {
    this.elements.totalDisplay.textContent = new Intl.NumberFormat("en-US").format(total);
  }

  renderVentas(ventas) {
    this.elements.ventasTable.innerHTML = "";
    this.elements.turnosDividers.innerHTML = "";
    let total = 0;

    if (!ventas || Object.keys(ventas).length === 0) {
      this.elements.ventasTable.innerHTML = `
        <tr>
          <td colspan="6" class="has-text-centered">No hay ventas registradas hoy</td>
        </tr>
      `;
      this.updateTotal(0);
      return;
    }

    // Agrupar ventas por turno
    const ventasPorTurno = {
      maniana: [],
      tarde: [],
      noche: []
    };

    Object.values(ventas).forEach((venta) => {
      const turno = venta.turno || 'maniana';
      if (ventasPorTurno[turno]) {
        ventasPorTurno[turno].push(venta);
      }
    });

    // Orden de turnos
    const ordenTurnos = ['maniana', 'tarde', 'noche'];
    let contadorGlobal = 1;

    // Primero agregar todas las ventas
    ordenTurnos.forEach((turno) => {
      if (ventasPorTurno[turno] && ventasPorTurno[turno].length > 0) {
        const ventasTurno = ventasPorTurno[turno];
        ventasTurno.forEach((venta) => {
          const row = this.createVentaRow(venta, contadorGlobal++);
          this.elements.ventasTable.appendChild(row);
          total += parseFloat(venta.precio);
        });
      }
    });

    // Luego agregar los divisores de turno al final
    ordenTurnos.forEach((turno) => {
      if (ventasPorTurno[turno] && ventasPorTurno[turno].length > 0) {
        const ventasTurno = ventasPorTurno[turno];
        const subtotalTurno = ventasTurno.reduce((sum, v) => sum + parseFloat(v.precio), 0);
        const horaInicio = ventasTurno[0].hora; // Primera venta del turno
        
        // Agregar divisor del turno
        const divisorRow = this.createTurnoDivider(turno, subtotalTurno, horaInicio);
        this.elements.turnosDividers.appendChild(divisorRow);
      }
    });

    this.updateTotal(total);
  }

  createTurnoDivider(turno, subtotal, horaInicio) {
    const div = document.createElement('div');
    const nombreTurno = {
      'maniana': '🌅 TURNO MAÑANA',
      'tarde': '🌆 TURNO TARDE',
      'noche': '🌙 TURNO NOCHE'
    };
    
    div.className = `turno-divider ${turno}`;
    div.innerHTML = `
      <span>${nombreTurno[turno]} (${horaInicio})</span>
      <span class="turno-subtotal">Subtotal: $${new Intl.NumberFormat("en-US").format(subtotal)}</span>
    `;
    return div;
  }

  createVentaRow(venta, index) {
    const tr = document.createElement('tr');
    const turnoEmoji = {
      'maniana': '🟡',
      'tarde': '🟠',
      'noche': '⚫'
    };
    const turno = venta.turno || 'maniana';
    
    tr.innerHTML = `
      <th>${index}</th>
      <td>${this.escapeHtml(venta.descripcion).toUpperCase()}</td>
      <td>$ ${venta.precio}</td>
      <td>${venta.hora}</td>
      <td>${turnoEmoji[turno]}</td>
      <td>
        <button class="button is-light is-small deletebtn" 
                data-id="${venta.Uid}" 
                data-desc="${this.escapeHtml(venta.descripcion).toUpperCase()} - $${venta.precio}">
          ❌
        </button>
      </td>
    `;
    return tr;
  }

  setupDeleteButtons(callback) {
    // Usar delegación de eventos para mejor rendimiento
    this.elements.ventasTable.addEventListener('click', (e) => {
      if (e.target.classList.contains('deletebtn') || e.target.closest('.deletebtn')) {
        const btn = e.target.closest('.deletebtn');
        const desc = btn.dataset.desc;
        const id = btn.dataset.id;
        
        if (confirm(`¿Desea eliminar de la lista: ${desc}?`)) {
          callback(id, btn);
        }
      }
    });
  }

  setFechaTitulo(fecha) {
    this.elements.fechaTitulo.textContent = fecha.toUpperCase();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  openMasVendidos() {
    this.elements.modalMasVendidos.classList.add("is-active");
  }

  closeMasVendidos() {
    this.elements.modalMasVendidos.classList.remove("is-active");
  }

  renderMasVendidos(productos) {
    const container = this.elements.listaMasVendidos;
    container.innerHTML = "";

    if (!productos || productos.length === 0) {
      container.innerHTML = `
        <div class="notification is-light has-text-centered" style="grid-column: 1 / -1;">
          No hay productos favoritos. Agrega productos usando el botón "➕ Agregar Producto"
        </div>
      `;
      return;
    }

    productos.forEach((producto, index) => {
      const card = document.createElement('div');
      card.className = 'producto-card';
      card.dataset.uid = producto.Uid;
      
      // Determinar qué mostrar: imagen o emoji
      let imagenContent = '';
      if (producto.imagenUrl) {
        imagenContent = `<img src="${this.escapeHtml(producto.imagenUrl)}" alt="${this.escapeHtml(producto.descripcion)}" onerror="this.outerHTML='<span style=\\'font-size: 2.5rem;\\'>${this.escapeHtml(producto.emoji || this.getProductoEmoji(producto.descripcion))}</span>';">`;
      } else {
        const emoji = producto.emoji || this.getProductoEmoji(producto.descripcion);
        imagenContent = emoji;
      }
      
      card.innerHTML = `
        <div class="producto-imagen">
          ${imagenContent}
        </div>
        <div class="producto-info">
          <div class="producto-nombre">${this.escapeHtml(producto.descripcion)}</div>
          <div class="producto-precio">
            <span style="font-weight: 600; color: #27c980;">$${producto.precio}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="button is-small is-info is-light" data-action="editar" title="Editar">
              ✏️
            </button>
            <button class="button is-small is-danger is-light" data-action="eliminar" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      `;
      
      // Evento de clic en la card (excepto en botones)
      card.addEventListener('click', (e) => {
        const target = e.target;
        // Ignorar clicks en botones y sus padres
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          return;
        }
        
        // Usar el precio original del producto
        this.selectMasVendido({
          descripcion: producto.descripcion,
          precio: producto.precio
        });
      });

      // Botones de acción
      const btnEditar = card.querySelector('[data-action="editar"]');
      const btnEliminar = card.querySelector('[data-action="eliminar"]');
      
      btnEditar.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditProducto(producto);
      });
      
      btnEliminar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar ${producto.descripcion}?`)) {
          // Llamar callback de app.js para eliminar
          if (this.onDeleteProducto) {
            this.onDeleteProducto(producto.Uid);
          }
        }
      });

      container.appendChild(card);
    });
  }

  setDeleteProductoCallback(callback) {
    this.onDeleteProducto = callback;
  }

  getProductoEmoji(descripcion) {
    const desc = descripcion.toLowerCase();
    
    // Mapeo de emojis según palabras clave
    if (desc.includes('coca') || desc.includes('cola')) return '🥤';
    if (desc.includes('agua')) return '💧';
    if (desc.includes('papas') || desc.includes('fritas')) return '🍟';
    if (desc.includes('chocolate')) return '🍫';
    if (desc.includes('caramelos') || desc.includes('golosinas')) return '🍬';
    if (desc.includes('chicles')) return '🟢';
    if (desc.includes('cigarrillo') || desc.includes('cigarro')) return '🚬';
    if (desc.includes('bebida')) return '🥤';
    if (desc.includes('snack')) return '🍿';
    if (desc.includes('galletas')) return '🍪';
    if (desc.includes('barra') || desc.includes('chocobar')) return '🍫';
    if (desc.includes('gaseosa') || desc.includes('soda')) return '🥤';
    if (desc.includes('jugo')) return '🧃';
    if (desc.includes('sprite') || desc.includes('pepsi') || desc.includes('7up')) return '🥤';
    if (desc.includes('energia') || desc.includes('red bull')) return '⚡';
    if (desc.includes('agua') && desc.includes('mineral')) return '💧';
    if (desc.includes('alfajor')) return '🍰';
    if (desc.includes('turron')) return '🍯';
    if (desc.includes('maní') || desc.includes('mani')) return '🥜';
    
    // Emoji por defecto
    return '🍪';
  }

  selectMasVendido(producto) {
    // Cerrar modales primero
    this.closeMasVendidos();
    this.closeModal(); // También cerrar el modal de agregar venta
    
    // Llamar callback de app.js para agregar venta directamente
    if (this.onSelectProducto) {
      this.onSelectProducto(producto);
    }
  }

  setSelectProductoCallback(callback) {
    this.onSelectProducto = callback;
  }
}

const ui = new UIManager();

