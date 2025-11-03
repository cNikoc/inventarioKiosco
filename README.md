# 🏪 Kiosco "EL MUÑE" - Sistema de Gestión de Ventas

Sistema web para gestión y registro de ventas diarias de un kiosco. Desarrollado con HTML5, CSS3, JavaScript vanilla y Firebase Realtime Database.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Uso](#instalación-y-uso)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Mejoras Implementadas](#mejoras-implementadas)
- [Próximas Mejoras](#próximas-mejoras)

## ✨ Características

### Funcionalidades Principales

- ✅ **Registro de Ventas**: Agregar ventas con descripción, precio y hora automática
- ✅ **Gestión de Ventas**: Visualización y eliminación de ventas registradas
- ✅ **Total Automático**: Cálculo en tiempo real del total de ventas del día
- ✅ **Persistencia en Firebase**: Base de datos en tiempo real con Firebase
- ✅ **Exportación de Datos**: Descarga de ventas en formato CSV
- ✅ **Validación de Formularios**: Validación en tiempo real antes de guardar
- ✅ **Sistema de Notificaciones**: Notificaciones toast elegantes y no intrusivas
- ✅ **Responsive Design**: Adaptado para móviles y tablets
- ✅ **Interfaz Moderna**: Diseño limpio con Bulma CSS

### Seguridad y Robustez

- ✅ **Manejo de Errores**: Try-catch en operaciones críticas
- ✅ **Validación de Datos**: Sanitización y validación de inputs
- ✅ **Estados de Carga**: Indicadores visuales durante operaciones
- ✅ **Escape HTML**: Prevención de XSS
- ✅ **Estructura Modular**: Código organizado y mantenible

## 🛠 Tecnologías

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos personalizados con variables CSS
- **JavaScript ES6+**: Programación moderna y modular
- **Bulma CSS 0.9.4**: Framework de diseño responsivo

### Backend
- **Firebase Realtime Database**: Base de datos en tiempo real
- **Firebase SDK 8.2.9**: SDK oficial de Firebase

### Herramientas
- **Google Fonts**: Fuente Comfortaa
- **CDN**: Recursos externos optimizados

## 📁 Estructura del Proyecto

```
appKiosco/
├── index.html              # HTML principal
├── README.md               # Documentación del proyecto
├── styles/
│   └── main.css           # Estilos personalizados
├── js/
│   ├── app.js             # Aplicación principal
│   ├── config.js          # Configuración de Firebase
│   ├── utils.js           # Utilidades generales
│   ├── notifications.js   # Sistema de notificaciones
│   ├── firebaseService.js # Servicio de Firebase
│   └── ui.js              # Gestión de interfaz
└── assets/
    ├── app.jpg            # Imágenes
    └── kiosco.jpg
```

### Descripción de Archivos JS

| Archivo | Responsabilidad |
|---------|----------------|
| `app.js` | Clase principal, inicialización y orquestación |
| `config.js` | Configuración de Firebase |
| `utils.js` | Funciones utilitarias (formato, fechas, etc.) |
| `notifications.js` | Sistema de notificaciones toast |
| `firebaseService.js` | Abstracción de operaciones Firebase |
| `ui.js` | Gestión de elementos y estados de la UI |

## 🚀 Instalación y Uso

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a Internet (para Firebase y CDNs)
- Python 3.x (opcional, para servidor local)

### Método 1: Ejecución Directa

```bash
# Abre index.html directamente en tu navegador
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux
```

### Método 2: Servidor HTTP Local

#### Con Python
```bash
# Navega al directorio del proyecto
cd appKiosco

# Inicia servidor HTTP
python -m http.server 8000

# Abre en navegador
http://localhost:8000
```

#### Con Node.js (http-server)
```bash
# Instala http-server globalmente
npm install -g http-server

# Inicia servidor
http-server -p 8000

# Abre en navegador
http://localhost:8000
```

#### Con VS Code
1. Instala la extensión "Live Server"
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

### Método 3: Servidor de Producción

```bash
# Con Apache o Nginx
# Copia los archivos al directorio web y accede vía dominio
```

## 🏗 Arquitectura

### Patrón de Diseño

La aplicación utiliza un patrón **MVC (Modelo-Vista-Controlador)** simplificado:

- **Modelo**: `firebaseService.js` - Manejo de datos
- **Vista**: `index.html`, `main.css` - Interfaz de usuario
- **Controlador**: `app.js`, `ui.js` - Lógica de negocio

### Flujo de Datos

```
User Interaction → UIManager → App → FirebaseService → Firebase DB
                     ↓                                    ↓
                UI Updates                       Real-time Updates
```

### Clases Principales

#### App
Clase principal que orquesta toda la aplicación:
- Inicialización de servicios
- Gestión de eventos
- Coordinación entre módulos

#### UIManager
Gestión de la interfaz de usuario:
- Cache de elementos DOM
- Renderizado de ventas
- Validación de formularios
- Estados de carga

#### FirebaseService
Abstracción de Firebase:
- Operaciones CRUD
- Listeners en tiempo real
- Manejo de errores

#### NotificationManager
Sistema de notificaciones:
- Toast notifications
- Múltiples tipos (success, error, info, warning)
- Auto-dismiss

## ⚙️ Configuración

### Firebase

Las credenciales están en `js/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

**⚠️ IMPORTANTE**: En producción, considera mover estas credenciales a variables de entorno o un backend seguro.

### Personalización

#### Colores
Edita `styles/main.css`:

```css
:root {
    --dark: #555;
    --primary-color: #FF4500;
    --success-color: #27c980;
}
```

#### Texto del Modal
Edita `index.html`:

```html
<p class="modal-card-title">✚ Agregar Nueva Venta</p>
```

## 📈 Mejoras Implementadas

### v2.0 - Refactorización Mayor

#### Seguridad
- ✅ Separación de configuración en archivo dedicado
- ✅ Validación exhaustiva de datos
- ✅ Escape HTML para prevenir XSS
- ✅ Try-catch en operaciones críticas

#### Arquitectura
- ✅ Código modular y organizado
- ✅ Separación de responsabilidades
- ✅ Clases bien definidas
- ✅ Patrón MVC simplificado

#### UX/UI
- ✅ Sistema de notificaciones toast
- ✅ Estados de carga visuales
- ✅ Mensajes de error descriptivos
- ✅ Diseño responsive mejorado
- ✅ Animaciones suaves

#### Funcionalidad
- ✅ Exportación a CSV optimizada
- ✅ Delegación de eventos mejorada
- ✅ Manejo de errores robusto
- ✅ Validación en tiempo real

### v1.0 - Versión Inicial
- Funcionalidad básica
- Integración Firebase
- Diseño simple

## 🔮 Próximas Mejoras

### Alta Prioridad
- [ ] Autenticación de usuarios
- [ ] Reglas de seguridad Firebase
- [ ] Tests unitarios
- [ ] Documentación de API

### Media Prioridad
- [ ] Reportes por fecha
- [ ] Gráficos y estadísticas
- [ ] Búsqueda y filtros
- [ ] Categorías de productos
- [ ] Modo offline (PWA)

### Baja Prioridad
- [ ] Temas personalizables
- [ ] Multi-idioma
- [ ] Impresión de tickets
- [ ] Integración con impresora térmica
- [ ] Dashboard de métricas

## 🐛 Solución de Problemas

### "Cannot use import statement"
- **Causa**: Módulos ES6 cargados sin servidor HTTP
- **Solución**: Usa un servidor HTTP local (ver Métodos de Instalación)

### "firebase is not defined"
- **Causa**: Firebase no cargado correctamente
- **Solución**: Verifica conexión a Internet y CDN de Firebase

### No se cargan las ventas
- **Causa**: Problemas con Firebase
- **Solución**: Verifica credenciales en `config.js`

### Notificaciones no aparecen
- **Causa**: Error en inicialización
- **Solución**: Abre consola de desarrollador (F12) para ver errores

## 📝 Licencia

Este proyecto es de uso personal/educativo.

## 👤 Autor

Desarrollado para el Kiosco "EL MUÑE"

## 🙏 Agradecimientos

- Bulma CSS por el framework de diseño
- Firebase por el servicio de base de datos
- Google Fonts por las tipografías

---

**Versión**: 2.0.0  
**Última actualización**: 2024  
**Estado**: ✅ Activo

