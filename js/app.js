// App ya tiene acceso a firebaseService, ui, notifications, etc. globalmente

// Clase principal de la aplicación
class App {
  constructor() {
    this.ventasRef = null;
    this.fechaHoy = null;
    this.turnoActual = 'maniana'; // Turno por defecto
  }

  async init() {
    try {
      // Inicializar UI
      ui.initialize();
      
      // Inicializar reloj digital
      initRelojDigital();
      
      // Inicializar Firebase con configuración
      await firebaseService.initialize(firebaseConfig);
      
      // Configurar fecha
      this.fechaHoy = formatDate(new Date());
      ui.setFechaTitulo(this.fechaHoy);
      
      // Configurar referencia de ventas
      this.ventasRef = firebaseService.setVentasReference(this.fechaHoy);
      
      // Configurar referencia de productos favoritos
      firebaseService.setProductosFavoritosReference();
      
      // Configurar listeners
      this.setupEventListeners();
      
      // Cargar ventas iniciales
      this.loadVentas();
      
      // Cargar productos favoritos
      this.loadProductosFavoritos();
      
      // Configurar callback de eliminación
      ui.setDeleteProductoCallback((uid) => {
        this.handleDeleteProductoFavorito(uid);
      });

      // Configurar callback de selección de producto
      ui.setSelectProductoCallback((producto) => {
        this.handleAddVentaFromProducto(producto);
      });

      // Inicializar botón de turno
      this.actualizarBotonTurno();
      
      notifications.success('Aplicación cargada correctamente');
    } catch (error) {
      console.error('Error inicializando app:', error);
      notifications.error('Error al cargar la aplicación');
      this.showErrorState();
    }
  }

  setupEventListeners() {
    // Formulario de ventas
    ui.elements.formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddVenta();
    });

    // Botón de descarga
    ui.elements.btnDescarga.addEventListener('click', () => {
      this.handleDownloadData();
    });

    // Botones de eliminación
    ui.setupDeleteButtons((id, btn) => {
      this.handleDeleteVenta(id, btn);
    });

    // Botón guardar producto favorito
    ui.elements.btnGuardarProducto.addEventListener('click', () => {
      this.handleAddProductoFavorito();
    });

    // Botones de cambio de turno
    ui.elements.btnTurnoManiana.addEventListener('click', () => {
      this.cambiarTurno('maniana');
    });
    ui.elements.btnTurnoTarde.addEventListener('click', () => {
      this.cambiarTurno('tarde');
    });
    ui.elements.btnTurnoNoche.addEventListener('click', () => {
      this.cambiarTurno('noche');
    });
  }

  cambiarTurno(nuevoTurno) {
    this.turnoActual = nuevoTurno;
    // Actualizar apariencia de botones
    this.actualizarBotonTurno();
    // Recargar ventas para mostrar el nuevo turno activo
    this.loadVentas();
    notifications.info(`Cambiaste al turno: ${nuevoTurno.toUpperCase()}`);
  }

  actualizarBotonTurno() {
    // Quitar clase 'is-active' de todos los botones
    ui.elements.btnTurnoManiana.classList.remove('is-active');
    ui.elements.btnTurnoTarde.classList.remove('is-active');
    ui.elements.btnTurnoNoche.classList.remove('is-active');
    
    // Agregar clase 'is-active' al botón actual
    if (this.turnoActual === 'maniana') {
      ui.elements.btnTurnoManiana.classList.add('is-active');
    } else if (this.turnoActual === 'tarde') {
      ui.elements.btnTurnoTarde.classList.add('is-active');
    } else if (this.turnoActual === 'noche') {
      ui.elements.btnTurnoNoche.classList.add('is-active');
    }
  }

  async handleAddVenta() {
    try {
      ui.setLoading('btnSubmit', true);
      
      const formData = ui.getFormData();
      
      // Validar datos
      if (!this.validateVentaData(formData)) {
        notifications.warning('Por favor, complete todos los campos correctamente');
        ui.setLoading('btnSubmit', false);
        return;
      }

      // Agregar venta
      await firebaseService.addVenta({
        precio: formData.precio,
        descripcion: formData.descripcion,
        hora: getCurrentTime(),
        turno: this.turnoActual
      });

      notifications.success('Venta agregada correctamente');
      ui.closeModal();
      
    } catch (error) {
      console.error('Error agregando venta:', error);
      notifications.error('Error al agregar la venta');
    } finally {
      ui.setLoading('btnSubmit', false);
    }
  }

  async handleAddVentaFromProducto(producto) {
    try {
      // Agregar venta directamente con el precio editable que tenga el producto
      await firebaseService.addVenta({
        precio: producto.precio,
        descripcion: producto.descripcion,
        hora: getCurrentTime(),
        turno: this.turnoActual
      });

      notifications.success(`Venta agregada: ${producto.descripcion}`);
      
    } catch (error) {
      console.error('Error agregando venta desde producto:', error);
      notifications.error('Error al agregar la venta');
    }
  }

  async handleDeleteVenta(id, btn) {
    try {
      ui.setLoading('btnSubmit', true);
      
      await firebaseService.deleteVenta(id);
      
      notifications.success('Venta eliminada correctamente');
      
    } catch (error) {
      console.error('Error eliminando venta:', error);
      notifications.error('Error al eliminar la venta');
    } finally {
      ui.setLoading('btnSubmit', false);
    }
  }

  loadVentas() {
    try {
      firebaseService.onVentasChange((snapshot) => {
        const ventas = snapshot.val();
        ui.renderVentas(ventas);
      });
    } catch (error) {
      console.error('Error cargando ventas:', error);
      notifications.error('Error al cargar las ventas');
    }
  }

  loadProductosFavoritos() {
    try {
      firebaseService.onProductosFavoritosChange((snapshot) => {
        const productos = snapshot.val();
        if (productos) {
          // Convertir objeto a array preservando el UID
          const productosArray = Object.entries(productos).map(([key, value]) => ({
            ...value,
            Uid: key
          }));
          ui.renderMasVendidos(productosArray);
        } else {
          ui.renderMasVendidos([]);
        }
      });
    } catch (error) {
      console.error('Error cargando productos favoritos:', error);
    }
  }

  async handleAddProductoFavorito() {
    try {
      const formData = ui.getProductoFormData();
      
      if (!formData.descripcion || !formData.precio) {
        notifications.warning('Por favor, complete todos los campos');
        return;
      }

      const precio = parseFloat(formData.precio);
      if (isNaN(precio) || precio <= 0) {
        notifications.warning('Por favor, ingrese un precio válido');
        return;
      }

      const productoData = {
        descripcion: formData.descripcion,
        precio: precio,
        imagenUrl: formData.imagenUrl || null
      };

      // Si tiene UID, es edición, sino es nuevo
      if (formData.uid) {
        await firebaseService.updateProductoFavorito(formData.uid, productoData);
        notifications.success('Producto actualizado correctamente');
      } else {
        await firebaseService.addProductoFavorito(productoData);
        notifications.success('Producto agregado correctamente');
      }

      ui.closeAgregarProducto();
      
    } catch (error) {
      console.error('Error agregando/actualizando producto:', error);
      notifications.error('Error al guardar el producto');
    }
  }

  async handleDeleteProductoFavorito(uid) {
    try {
      await firebaseService.deleteProductoFavorito(uid);
      notifications.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      notifications.error('Error al eliminar el producto');
    }
  }

  handleDownloadData() {
    try {
      const ventas = this.getCurrentVentas();
      
      if (ventas.length === 0) {
        notifications.warning('No hay ventas para descargar');
        return;
      }

      const contenido = this.generateCSV(ventas);
      this.downloadFile(contenido, `Ventas del ${this.fechaHoy}.csv`);
      
      notifications.success('Datos descargados correctamente');
      
    } catch (error) {
      console.error('Error descargando datos:', error);
      notifications.error('Error al descargar los datos');
    }
  }

  getCurrentVentas() {
    const rows = document.querySelectorAll("#ventasTable tr");
    const ventas = [];
    
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      if (cells.length >= 4 && cells[0].textContent !== '#') {
        const [index, descripcion, precio, hora] = Array.from(cells).map(c => c.textContent.trim());
        // Filtrar filas vacías
        if (descripcion && descripcion !== 'No hay ventas registradas hoy') {
          ventas.push({ index, descripcion, precio, hora });
        }
      }
    });
    
    return ventas;
  }

  generateCSV(ventas) {
    let contenido = "#\tDescripción\tPrecio\tHora\n";
    
    ventas.forEach(venta => {
      contenido += `${venta.index}\t${venta.descripcion}\t${venta.precio}\t${venta.hora}\n`;
    });
    
    const total = ui.elements.totalDisplay.textContent;
    contenido += `\n-----\nTOTAL: $${total}\n`;
    
    return contenido;
  }

  downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
    
    if (a.download !== undefined) {
      const url = URL.createObjectURL(blob);
      a.setAttribute("href", url);
      a.setAttribute("download", filename);
      a.style.visibility = "hidden";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
    }
  }

  validateVentaData(data) {
    const precio = parseFloat(data.precio);
    const descripcion = data.descripcion.trim();
    
    if (isNaN(precio) || precio <= 0) {
      return false;
    }
    
    if (descripcion.length === 0 || descripcion.length > 55) {
      return false;
    }
    
    return true;
  }

  showErrorState() {
    ui.elements.ventasTable.innerHTML = `
      <tr>
        <td colspan="6" class="has-text-centered has-text-danger">
          ⚠️ Error al conectar con la base de datos. Por favor, recarga la página.
        </td>
      </tr>
    `;
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
