# Renacer - Sistema de Gestión de Células

Aplicación web y móvil para la gestión de células de la Iglesia Renacer.

## 🚀 Características

### Roles y Permisos

- **Pastor**: 
  - Crear y gestionar líderes
  - Ver todas las células
  - Acceder a estadísticas completas (semanal, mensual, anual)
  - Descargar reportes en PDF

- **Líder**:
  - Registrarse con validación previa
  - Gestionar su célula
  - Agregar/eliminar miembros
  - Designar colíderes
  - Tomar asistencia semanal

- **Colíder**:
  - Agregar/eliminar miembros
  - Tomar asistencia de la célula

## 📦 Tecnologías

- **React 18** con TypeScript
- **Vite** - Build tool
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Context API** - Gestión de estado
- **jsPDF** - Exportación de PDF
- **date-fns** - Manejo de fechas
- **Lucide React** - Iconos

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

## 🌐 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/              # Login y Registro
│   ├── layout/            # Navbar y layouts
│   ├── pastor/            # Dashboard del Pastor
│   ├── lider/             # Dashboard del Líder
│   └── ProtectedRoute.tsx # Protección de rutas
├── contexts/
│   ├── AuthContext.tsx    # Autenticación
│   └── DataContext.tsx    # Datos de células
├── types/
│   └── index.ts           # TypeScript types
└── App.tsx                # Componente principal
```

## 🔒 Seguridad

- Rutas protegidas por rol
- Validación de permisos en cada componente
- LocalStorage para sesión (temporal - se integrará con JWT)
- Context API para gestión centralizada de autenticación

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔄 Próximos Pasos (Backend)

- [ ] Integración con API REST
- [ ] Autenticación JWT
- [ ] Base de datos (PostgreSQL/MySQL)
- [ ] Endpoints para CRUD de células, miembros, asistencia
- [ ] Sistema de notificaciones
- [ ] Backup automático de datos

## 📝 Notas de Desarrollo

### Flujo de Registro de Líder

1. Pastor crea líder precargado (solo nombre)
2. Líder busca su nombre en el registro
3. Sistema valida la identidad
4. Líder completa su información (email, contraseña, teléfono)
5. Líder puede acceder al sistema

### Sistema de Asistencia

- Registro por fecha
- Marca presentes/ausentes por click
- Estadísticas en tiempo real
- Historial completo por célula

### Exportación de Reportes

- PDF con jsPDF y autoTable
- Incluye todas las células y estadísticas
- Filtros por período (semanal, mensual, anual)
- Resumen general al final del reporte

## 👥 Autor

Sistema desarrollado para la Iglesia Renacer.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026
