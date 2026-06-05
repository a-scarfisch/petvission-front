import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import '@/styles/modules/landing.css'

const LandingPage = () => {
  const anio = new Date().getFullYear()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  return (
    <div className="lp-root">

      {/* Navbar */}
      <nav className="lp-nav">
        <span className="lp-nav__brand">🐾 PetVission</span>
        <div className="lp-nav__links">
          <a href="#servicios">Servicios</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>

          <div ref={menuRef} className="lp-nav__dropdown">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className={`lp-nav__dropdown-btn${menuAbierto ? ' lp-nav__dropdown-btn--open' : ''}`}
            >
              🐾 Mi cuenta
              <span className="lp-nav__dropdown-arrow">{menuAbierto ? '▲' : '▼'}</span>
            </button>

            {menuAbierto && (
              <div className="lp-nav__dropdown-menu">
                <Link to="/login" className="lp-nav__dropdown-item" onClick={() => setMenuAbierto(false)}>
                  <span className="lp-nav__dropdown-icon">🔑</span>
                  <div>
                    <p>Iniciar sesión</p>
                    <p>Ya tengo cuenta</p>
                  </div>
                </Link>

                <div className="lp-nav__dropdown-divider" />

                <Link to="/register" className="lp-nav__dropdown-item" onClick={() => setMenuAbierto(false)}>
                  <span className="lp-nav__dropdown-icon">🐶</span>
                  <div>
                    <p>Crear cuenta</p>
                    <p>Es gratis 🎉</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero__content">
          <span className="lp-hero__badge">🐾 Clínica Veterinaria Online</span>
          <h1 className="lp-hero__title">
            El cuidado que tu mascota{' '}
            <span>merece</span>,{' '}
            en un solo lugar
          </h1>
          <p className="lp-hero__desc">
            Agenda citas veterinarias y accede al historial clínico de tu mascota
            desde una plataforma moderna y centralizada.
          </p>
          <div className="lp-hero__ctas">
            <Link to="/register" className="lp-btn">📅 Agendar cita</Link>
            <a href="#servicios" className="lp-btn lp-btn--outline">🐾 Ver servicios</a>
          </div>
          <div className="lp-hero__stats">
            {[
              { value: '500+',   label: 'Mascotas atendidas' },
              { value: '4',      label: 'Veterinarios especializados' },
              { value: '1.200+', label: 'Citas realizadas' },
            ].map((s) => (
              <div key={s.label}>
                <p className="lp-hero__stat-value">{s.value}</p>
                <p className="lp-hero__stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero__img">
          <img src="/LPV_transparente.png" alt="PetVission" />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="lp-section lp-section--white">
        <div className="lp-section__header">
          <h2 className="lp-section__title">Nuestros <span>Servicios</span></h2>
          <p className="lp-section__subtitle">Todo lo que necesitas para el bienestar de tu mascota</p>
        </div>
        <div className="lp-servicios-grid">
          {[
            { icon: '📅', title: 'Agenda Online',     desc: 'Reserva citas veterinarias en segundos, sin llamadas ni esperas.' },
            { icon: '📋', title: 'Historial Clínico', desc: 'Accede al historial médico digital de tu mascota en cualquier momento.' },
            { icon: '💉', title: 'Control de Vacunas',desc: 'Registro y recordatorios automáticos del calendario de vacunación.' },
            { icon: '🔔', title: 'Recordatorios',     desc: 'Recibe avisos automáticos de tus citas para no olvidar ninguna.' },
          ].map((s) => (
            <div key={s.title} className="lp-servicio-card">
              <div className="lp-servicio-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="lp-section lp-section--gray">
        <div className="lp-section__header">
          <h2 className="lp-section__title">¿Cómo <span>funciona</span>?</h2>
          <p className="lp-section__subtitle">Tres pasos para empezar</p>
        </div>
        <div className="lp-pasos">
          {[
            { num: '1', title: 'Crea tu cuenta',  desc: 'Regístrate gratis y agrega el perfil de tus mascotas en minutos.' },
            { num: '2', title: 'Agenda tu cita',  desc: 'Reserva una cita con el veterinario disponible en el horario que prefieras.' },
            { num: '3', title: 'Gestiona todo',   desc: 'Accede al historial clínico y próximas citas desde tu panel personal.' },
          ].map((s) => (
            <div key={s.num} className="lp-paso">
              <div className="lp-paso__num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="lp-section lp-section--white lp-nosotros">
        <div className="lp-nosotros__img">
          <img src="/groupPV.png" alt="Equipo PetVission" />
        </div>
        <div>
          <h2>¿Por qué elegir <span>PetVission</span>?</h2>
          {[
            { icon: '✅', title: 'Todo centralizado', desc: 'Mascotas, citas e historial clínico en una sola plataforma.' },
            { icon: '🕐', title: 'Disponible 24/7',   desc: 'Agenda citas en cualquier momento del día.' },
            { icon: '🔒', title: 'Seguro y confiable',desc: 'Sistema protegido con autenticación JWT y control de roles.' },
          ].map((item) => (
            <div key={item.title} className="lp-nosotros__feature">
              <div className="lp-nosotros__feature-icon">{item.icon}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
          <Link to="/register" className="lp-btn">Comenzar gratis →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>¿Listo para cuidar mejor a tu mascota?</h2>
        <p>Únete a cientos de dueños que ya confían en PetVission</p>
        <Link to="/register" className="lp-btn--white">Crear cuenta gratis</Link>
      </section>

      {/* Contacto */}
      <section id="contacto" className="lp-section--contacto">
        <h2>Contacto</h2>
        <p>¿Tienes dudas? Escríbenos</p>
        <div className="lp-contacto">
          {[
            { icon: '📍', label: 'Dirección', value: 'Av. Veterinaria 123, Santiago, Chile' },
            { icon: '📞', label: 'Teléfono',  value: '+56 9 1234 5678' },
            { icon: '✉️', label: 'Email',     value: 'contacto@petvission.cl' },
          ].map((c) => (
            <div key={c.label} className="lp-contacto__item">
              <p>{c.icon}</p>
              <p>{c.label}</p>
              <p>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer__copy">PetVission © {anio} — Todos los derechos reservados</span>
        <span className="lp-footer__credit">Desarrollado por Escuadrón Alpha Mango — Java Generation Chile</span>
      </footer>
    </div>
  )
}

export default LandingPage
