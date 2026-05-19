# 🐾 PetVission — Frontend (React + Vite)

> Proyecto Integrador · Cohorte 24 · Javalimos  
> Escuadrón Alpha Mango (ETM)

Interfaz de usuario de **PetVission**, plataforma de gestión veterinaria para clientes, veterinarios y administradores. Este repositorio es la migración oficial del frontend original (HTML/CSS/JS vanilla) a **React 18 + Vite**, siguiendo **Screaming Architecture** por módulos de dominio.

---

## 🚀 Tech Stack

| Herramienta | Uso |
|---|---|
| [React 18](https://react.dev/) | UI declarativa por componentes |
| [Vite](https://vitejs.dev/) | Bundler y dev server |
| [React Router DOM v7](https://reactrouter.com/) | Navegación SPA |
| [Axios](https://axios-http.com/) | Comunicación con el backend |
| React Context API | Estado global de sesión (auth, usuario) |
| CSS Modules | Estilos encapsulados por módulo |

---

## 📁 Estructura del proyecto

```
src/
├── main.jsx
├── App.jsx                        ← Router principal + rutas protegidas
├── assets/
│   └── img/
└── modules/
    ├── core/                      ← Compartido por todos los módulos
    │   ├── components/
    │   │   └── design-system/     ← Button, Input, Modal, Navbar...
    │   ├── hooks/
    │   ├── lib/
    │   │   └── axios.js           ← Instancia Axios con baseURL + interceptors
    │   ├── services/
    │   └── utils/
    │
    ├── auth/                      ← Login, Registro, gestión de sesión
    │   ├── components/
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── services/
    │   │   └── authService.js
    │   └── utils/
    │       └── strongPassword.js
    │
    ├── mascotas/                  ← CRUD de mascotas del cliente
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    │
    ├── client/                    ← Dashboard, citas y agendamiento
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    │
    ├── vet/                       ← Dashboard vet, historial, inventario, pacientes
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    │
    ├── admin/                     ← Panel de administración
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    │
    └── landing/                   ← Página pública + Quiénes somos
        └── components/
```

> **¿Por qué Screaming Architecture?**  
> Abrir `modules/mascotas/` te dice inmediatamente qué hace ese código. La estructura grita el dominio del negocio, no el tipo de archivo.

---

## ⚙️ Instalación y ejecución local

### Requisitos previos
- Node.js >= 18
- pnpm >= 9
- Backend corriendo en `http://localhost:8080`

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/DiegoPenaG/petvission-front.git
cd petvission-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🌐 Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://petvission-backend.onrender.com/api
```

> ⚠️ El archivo `.env` **nunca** se sube al repositorio. Está incluido en `.gitignore`.

---

## 👥 Roles del sistema

| Rol | Acceso |
|---|---|
| **Cliente** | Dashboard, mis mascotas, mis citas, agendamiento |
| **Veterinario** | Dashboard vet, historial clínico, inventario, pacientes |
| **Administrador** | Panel de administración general |

Las rutas de cada rol están protegidas por un componente `<PrivateRoute>` que valida el token JWT antes de renderizar.

---

## 🔗 Backend

API REST disponible en `http://localhost:8080/api`

Repositorio backend: [Proyecto-Integrador-Pet-Vission-BackEnd](#) *(enlace pendiente)*

---

## 📌 Convenciones del equipo

### Ramas
```
main          ← producción estable
dev           ← integración
feature/nombre-de-la-feature
fix/descripcion-del-fix
```

### Commits (Conventional Commits)
```
feat: agrega formulario de registro
fix: corrige validación de contraseña fuerte
refactor: mueve lógica de auth a useAuth hook
style: ajusta estilos del dashboard cliente
```

### Estructura de un módulo
Cada módulo nuevo sigue esta convención interna:
```
modules/mi-modulo/
├── components/   ← JSX visual
├── hooks/        ← lógica y estado local
├── services/     ← llamadas al backend (Axios)
├── states/       ← estado global si aplica (Zustand)
└── utils/        ← helpers y validaciones
```

---

## 📦 Scripts disponibles

```bash
pnpm dev       # Servidor de desarrollo
pnpm build     # Build de producción
pnpm preview   # Preview del build
pnpm lint      # Linter ESLint
```

---

## 🗺️ Roadmap de migración

- [ ] **Fase 0** — Setup Vite + estructura de carpetas
- [ ] **Fase 1** — Módulo `auth` (login + registro + rutas protegidas)
- [ ] **Fase 2** — Módulo `mascotas`
- [ ] **Fase 3** — Módulos `client` (dashboard + citas + agendamiento)
- [ ] **Fase 4** — Módulos `vet` y `admin`
- [ ] **Fase 5** — Módulo `landing` (página pública + quiénes somos)

---

## 👨‍💻 Equipo — Escuadrón Alpha Mango (ETM)

| Nombre | GitHub |
|---|---|
| Arantxa Fischer | [@a-scarfisch](https://github.com/a-scarfisch) |
| Cristian Diaz | [@Cristian-DH](https://github.com/Cristian-DH) |
| Cristopher Contreras | [@cristophercontrerasinformatica-dev](https://github.com/cristophercontrerasinformatica-dev) |
| Diego Peña | [@DiegoPenaG](https://github.com/DiegoPenaG) |
| Manuel Labrador | [@MannuDLab](https://github.com/MannuDLab) |
| Natalia Medel | [@NataliaMedelM](https://github.com/NataliaMedelM) |
| Sabrina Jeria | [@sabrinacecilajeria-cmyk](https://github.com/sabrinaceciliajeria-cmyk) |

---

*Proyecto Integrador · Java Generation Chile · Cohorte 24*
