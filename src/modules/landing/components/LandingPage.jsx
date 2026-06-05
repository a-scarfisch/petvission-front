import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

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
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>

      {/* Navbar */}
      <nav className="lp-nav" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 64px', background: '#fff',
        borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{ fontWeight: 700, fontSize: '18px', color: '#2a9d8f' }}>🐾 PetVission</span>
        <div className="lp-nav__links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#servicios" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Servicios</a>
          <a href="#nosotros" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Nosotros</a>
          <a href="#contacto" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Contacto</a>

          {/* Dropdown acceso */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 20px', borderRadius: '99px',
                background: menuAbierto ? '#218f82' : '#2a9d8f',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(42,157,143,0.3)',
                transition: 'background 0.2s',
              }}
            >
              🐾 Mi cuenta
              <span style={{ fontSize: '10px', opacity: 0.8 }}>{menuAbierto ? '▲' : '▼'}</span>
            </button>

            {menuAbierto && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                background: '#fff', borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: '8px', minWidth: '200px', zIndex: 200,
                border: '1px solid #f3f4f6',
              }}>
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '8px',
                    color: '#1f2937', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#e8f5f0', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                  }}>🔑</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Iniciar sesión</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Ya tengo cuenta</p>
                  </div>
                </Link>

                <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                <Link
                  to="/register"
                  onClick={() => setMenuAbierto(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '8px',
                    color: '#1f2937', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#e8f5f0', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                  }}>🐶</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Crear cuenta</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Es gratis 🎉</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero" style={{
        background: 'linear-gradient(135deg, #e8f5f0 0%, #f0faf9 100%)',
        padding: '80px 64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '48px',
      }}>
        <div style={{ maxWidth: '560px' }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
            background: '#d1fae5', color: '#065f46', fontSize: '13px',
            fontWeight: 600, marginBottom: '16px',
          }}>
            🐾 Clínica Veterinaria Online
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' }}>
            El cuidado que tu mascota{' '}
            <span style={{ color: '#2a9d8f' }}>merece</span>,{' '}
            en un solo lugar
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px' }}>
            Agenda citas veterinarias y accede al historial clínico de tu mascota
            desde una plataforma moderna y centralizada.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/register" style={{
              padding: '12px 24px', borderRadius: '8px',
              background: '#2a9d8f', color: '#fff',
              textDecoration: 'none', fontWeight: 600, fontSize: '15px',
            }}>
              📅 Agendar cita
            </Link>
            <a href="#servicios" style={{
              padding: '12px 24px', borderRadius: '8px',
              border: '1px solid #2a9d8f', color: '#2a9d8f',
              textDecoration: 'none', fontWeight: 600, fontSize: '15px',
            }}>
              🐾 Ver servicios
            </a>
          </div>
          {/* Stats */}
          <div className="lp-hero__stats" style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
            {[
              { value: '500+', label: 'Mascotas atendidas' },
              { value: '4', label: 'Veterinarios especializados' },
              { value: '1.200+', label: 'Citas realizadas' },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#2a9d8f' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero__img" style={{
          width: '420px', height: '320px', borderRadius: '16px',
          background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <img
            src="/LPV_transparente.png"
            alt="PetVission"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
          />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" style={{ padding: '80px 64px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>
            Nuestros <span style={{ color: '#2a9d8f' }}>Servicios</span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Todo lo que necesitas para el bienestar de tu mascota
          </p>
        </div>
        <div className="lp-servicios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { icon: '📅', title: 'Agenda Online', desc: 'Reserva citas veterinarias en segundos, sin llamadas ni esperas.' },
            { icon: '📋', title: 'Historial Clínico', desc: 'Accede al historial médico digital de tu mascota en cualquier momento.' },
            { icon: '💉', title: 'Control de Vacunas', desc: 'Registro y recordatorios automáticos del calendario de vacunación.' },
            { icon: '🔔', title: 'Recordatorios', desc: 'Recibe avisos automáticos de tus citas para no olvidar ninguna.' },
          ].map((s) => (
            <div key={s.title} style={{
              padding: '32px 24px', borderRadius: '12px',
              border: '1px solid #f3f4f6', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#e8f5f0', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', margin: '0 auto 16px',
              }}>
                {s.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding: '80px 64px', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>
            ¿Cómo <span style={{ color: '#2a9d8f' }}>funciona</span>?
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Tres pasos para empezar</p>
        </div>
        <div className="lp-pasos" style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
          {[
            { num: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis y agrega el perfil de tus mascotas en minutos.' },
            { num: '2', title: 'Agenda tu cita', desc: 'Reserva una cita con el veterinario disponible en el horario que prefieras.' },
            { num: '3', title: 'Gestiona todo', desc: 'Accede al historial clínico y próximas citas desde tu panel personal.' },
          ].map((s) => (
            <div key={s.num} style={{ textAlign: 'center', maxWidth: '240px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#2a9d8f', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 800, margin: '0 auto 16px',
              }}>
                {s.num}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="lp-nosotros" style={{ padding: '80px 64px', background: '#fff', display: 'flex', gap: '64px', alignItems: 'center' }}>
        <div style={{
          width: '420px', height: '300px', borderRadius: '16px',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img
            src="/groupPV.png"
            alt="Equipo PetVission"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px' }}>
            ¿Por qué elegir <span style={{ color: '#2a9d8f' }}>PetVission</span>?
          </h2>
          {[
            { icon: '✅', title: 'Todo centralizado', desc: 'Mascotas, citas e historial clínico en una sola plataforma.' },
            { icon: '🕐', title: 'Disponible 24/7', desc: 'Agenda citas en cualquier momento del día.' },
            { icon: '🔒', title: 'Seguro y confiable', desc: 'Sistema protegido con autenticación JWT y control de roles.' },
          ].map((item) => (
            <div key={item.title} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#e8f5f0', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
              </div>
            </div>
          ))}
          <Link to="/register" style={{
            display: 'inline-block', marginTop: '8px',
            padding: '12px 24px', borderRadius: '8px',
            background: '#2a9d8f', color: '#fff',
            textDecoration: 'none', fontWeight: 600, fontSize: '15px',
          }}>
            Comenzar gratis →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '64px', background: '#2a9d8f', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
          ¿Listo para cuidar mejor a tu mascota?
        </h2>
        <p style={{ color: '#e8f5f0', fontSize: '16px', margin: '0 0 32px' }}>
          Únete a cientos de dueños que ya confían en PetVission
        </p>
        <Link to="/register" style={{
          padding: '14px 32px', borderRadius: '8px',
          background: '#fff', color: '#2a9d8f',
          textDecoration: 'none', fontWeight: 700, fontSize: '16px',
        }}>
          Crear cuenta gratis
        </Link>
      </section>

      {/* Contacto */}
      <section id="contacto" style={{ padding: '80px 64px', background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>Contacto</h2>
        <p style={{ color: '#6b7280', margin: '0 0 48px' }}>¿Tienes dudas? Escríbenos</p>
        <div className="lp-contacto" style={{ display: 'flex', justifyContent: 'center', gap: '64px' }}>
          {[
            { icon: '📍', label: 'Dirección', value: 'Av. Veterinaria 123, Santiago, Chile' },
            { icon: '📞', label: 'Teléfono', value: '+56 9 1234 5678' },
            { icon: '✉️', label: 'Email', value: 'contacto@petvission.cl' },
          ].map((c) => (
            <div key={c.label}>
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>{c.icon}</p>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px' }}>{c.label}</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer" style={{
        padding: '24px 64px', background: '#1f2937',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#9ca3af', fontSize: '14px' }}>
          PetVission © {anio} — Todos los derechos reservados
        </span>
        <span style={{ color: '#6b7280', fontSize: '13px' }}>
          Desarrollado por Escuadrón Alpha Mango — Java Generation Chile
        </span>
      </footer>
    </div>
  )
}

export default LandingPage