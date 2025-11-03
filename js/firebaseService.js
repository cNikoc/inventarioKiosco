// Servicio de Firebase
class FirebaseService {
  constructor() {
    this.db = null;
    this.ventasRef = null;
    this.productosFavoritosRef = null;
    this.initialized = false;
  }

  async initialize(config) {
    try {
      // Evitar re-inicializar si ya está inicializado
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      } else {
        firebase.app(); // Obtener instancia existente
      }
      this.db = firebase.database();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
      throw error;
    }
  }

  setVentasReference(fecha) {
    if (!this.initialized) {
      throw new Error('Firebase no ha sido inicializado');
    }
    this.ventasRef = this.db.ref(`Ventas del ${fecha}`);
    return this.ventasRef;
  }

  async addVenta(venta) {
    try {
      const nuevaVenta = this.ventasRef.push();
      await nuevaVenta.set({
        Uid: nuevaVenta.key,
        precio: venta.precio,
        descripcion: venta.descripcion,
        hora: venta.hora,
        turno: venta.turno || 'maniana'
      });
      return nuevaVenta.key;
    } catch (error) {
      console.error('Error agregando venta:', error);
      throw error;
    }
  }

  async deleteVenta(uid) {
    try {
      await this.ventasRef.child(uid).remove();
      return true;
    } catch (error) {
      console.error('Error eliminando venta:', error);
      throw error;
    }
  }

  onVentasChange(callback) {
    if (!this.ventasRef) {
      throw new Error('Referencia de ventas no configurada');
    }
    return this.ventasRef.on('value', callback);
  }

  // === MÉTODOS PARA PRODUCTOS FAVORITOS ===
  
  setProductosFavoritosReference() {
    if (!this.initialized) {
      throw new Error('Firebase no ha sido inicializado');
    }
    this.productosFavoritosRef = this.db.ref('ProductosFavoritos');
    return this.productosFavoritosRef;
  }

  async addProductoFavorito(producto) {
    try {
      const nuevoProducto = this.productosFavoritosRef.push();
      await nuevoProducto.set({
        Uid: nuevoProducto.key,
        descripcion: producto.descripcion,
        precio: producto.precio,
        emoji: producto.emoji || '🍪',
        imagenUrl: producto.imagenUrl || null
      });
      return nuevoProducto.key;
    } catch (error) {
      console.error('Error agregando producto favorito:', error);
      throw error;
    }
  }

  async updateProductoFavorito(uid, producto) {
    try {
      const updateData = {
        descripcion: producto.descripcion,
        precio: producto.precio
      };
      
      // Solo actualizar emoji si se proporciona
      if (producto.emoji) {
        updateData.emoji = producto.emoji;
      }
      
      // Actualizar imagenUrl si se proporciona (incluyendo null)
      if (producto.imagenUrl !== undefined) {
        updateData.imagenUrl = producto.imagenUrl;
      }
      
      await this.productosFavoritosRef.child(uid).update(updateData);
      return true;
    } catch (error) {
      console.error('Error actualizando producto favorito:', error);
      throw error;
    }
  }

  async deleteProductoFavorito(uid) {
    try {
      await this.productosFavoritosRef.child(uid).remove();
      return true;
    } catch (error) {
      console.error('Error eliminando producto favorito:', error);
      throw error;
    }
  }

  onProductosFavoritosChange(callback) {
    if (!this.productosFavoritosRef) {
      throw new Error('Referencia de productos favoritos no configurada');
    }
    return this.productosFavoritosRef.on('value', callback);
  }
}

const firebaseService = new FirebaseService();

