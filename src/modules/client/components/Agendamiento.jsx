import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { getVeterinarios, getDisponibilidadVeterinario, agendarCita } from '../services/citasService'
import ClientLayout from './ClientLayout'
import { useNavigate } from 'react-router-dom'

const PASOS = ['Veterinario', 'Horario', 'Confirmar']

const Agendamiento = () => {
    const { user } = useAuthContext()
    const { addCita } = useClientContext()
    const navigate = useNavigate()

    const [paso, setPaso] = useState(0)
    const [veterinarios, setVeterinarios] = useState([])
    const [horarios, setHorarios] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [seleccion, setSeleccion] = useState({
        veterinario: null,
        horario: null,
        motivo: '',
    })

    // cargar veterinarios al montar
    useEffect(() => {
        const fetchVets = async () => {
            try {
                const data = await getVeterinarios()
                setVeterinarios(data)
            } catch {
                setError('Error al cargar veterinarios')
            }
        }
        fetchVets()
    }, [])

    // cargar horarios al elegir veterinario
    useEffect(() => {
        if (!seleccion.veterinario) return
        const fetchHorarios = async () => {
            setLoading(true)
            try {
                const data = await getDisponibilidadVeterinario()
                setHorarios(data)
            } catch {
                setError('Error al cargar horarios')
            } finally {
                setLoading(false)
            }
        }
        fetchHorarios()
    }, [seleccion.veterinario])

    const handleConfirmar = async () => {
        setLoading(true)
        setError(null)
        try {
            const nueva = await agendarCita({
                idUsuario: user.idUsuario,
                idVeterinario: seleccion.veterinario.idUsuario,
                fecha: seleccion.horario.fecha,
                hora: seleccion.horario.hora,
                motivo: seleccion.motivo || 'Consulta general',
            })
            addCita(nueva)
            navigate('/client/citas')
        } catch {
            setError('Error al agendar la cita')
        } finally {
            setLoading(false)
        }
    }

    const formatHora = (hora) => hora?.slice(0, 5) ?? ''

    return (
        <ClientLayout>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '22px' }}>📅 Nueva Cita</h2>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Paso {paso + 1}: {PASOS[paso]}
                </p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '0' }}>
                {PASOS.map((p, i) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', flex: i < PASOS.length - 1 ? 1 : 'none' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '14px',
                            background: i <= paso ? '#2a9d8f' : '#e5e7eb',
                            color: i <= paso ? '#fff' : '#9ca3af',
                            flexShrink: 0,
                        }}>
                            {i < paso ? '✓' : i + 1}
                        </div>
                        <p style={{
                            margin: '0 0 0 8px', fontSize: '13px', flexShrink: 0,
                            color: i <= paso ? '#2a9d8f' : '#9ca3af',
                            fontWeight: i === paso ? 600 : 400,
                        }}>
                            {p}
                        </p>
                        {i < PASOS.length - 1 && (
                            <div style={{
                                flex: 1, height: '2px', margin: '0 12px',
                                background: i < paso ? '#2a9d8f' : '#e5e7eb',
                            }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Contenido por paso */}
            <div style={{
                background: '#fff', borderRadius: '12px', padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>

                {/* Paso 0 — Elegir veterinario */}
                {paso === 0 && (
                    <div>
                        <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>¿Con qué veterinario deseas la cita?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {veterinarios.map((v) => (
                                <div
                                    key={v.idUsuario}
                                    onClick={() => setSeleccion({ ...seleccion, veterinario: v, horario: null })}
                                    style={{
                                        padding: '16px', borderRadius: '10px', cursor: 'pointer',
                                        border: seleccion.veterinario?.idUsuario === v.idUsuario
                                            ? '2px solid #2a9d8f'
                                            : '2px solid #e5e7eb',
                                        background: seleccion.veterinario?.idUsuario === v.idUsuario
                                            ? '#f0faf9' : '#fff',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%',
                                            background: '#2a9d8f', color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '16px',
                                        }}>
                                            {v.nombres?.[0]}{v.apellidos?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
                                                {v.nombres} {v.apellidos}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                                {v.correo}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Paso 1 — Elegir horario */}
                {paso === 1 && (
                    <div>
                        <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>
                            Horarios disponibles — {seleccion.veterinario?.nombres} {seleccion.veterinario?.apellidos}
                        </h3>
                        {loading ? (
                            <p style={{ color: '#6b7280' }}>Cargando horarios...</p>
                        ) : horarios.length === 0 ? (
                            <p style={{ color: '#9ca3af' }}>No hay horarios disponibles.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {horarios.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSeleccion({ ...seleccion, horario: h })}
                                        style={{
                                            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '14px',
                                            border: seleccion.horario === h ? 'none' : '1px solid #2a9d8f',
                                            background: seleccion.horario === h ? '#2a9d8f' : '#fff',
                                            color: seleccion.horario === h ? '#fff' : '#2a9d8f',
                                        }}
                                    >
                                        {h.fecha} · {formatHora(h.hora)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Paso 2 — Confirmar */}
                {paso === 2 && (
                    <div>
                        <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>Revisa y confirma tu cita</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'VETERINARIO', value: `${seleccion.veterinario?.nombres} ${seleccion.veterinario?.apellidos}` },
                                { label: 'FECHA', value: seleccion.horario?.fecha },
                                { label: 'HORA', value: formatHora(seleccion.horario?.hora) },
                            ].map((item) => (
                                <div key={item.label} style={{
                                    padding: '16px', borderRadius: '8px', background: '#f9fafb',
                                }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                                        {item.label}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
                                Motivo de la consulta
                            </label>
                            <input
                                type="text"
                                value={seleccion.motivo}
                                onChange={(e) => setSeleccion({ ...seleccion, motivo: e.target.value })}
                                placeholder="Consulta general, vacuna, control..."
                                style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                    border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
                    </div>
                )}
            </div>

            {/* Navegación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                    onClick={() => paso === 0 ? navigate('/client/dashboard') : setPaso(paso - 1)}
                    style={{
                        padding: '10px 24px', borderRadius: '8px',
                        border: '1px solid #d1d5db', background: '#fff',
                        cursor: 'pointer', fontSize: '14px',
                    }}
                >
                    ← {paso === 0 ? 'Cancelar' : 'Volver'}
                </button>

                {paso < 2 ? (
                    <button
                        onClick={() => setPaso(paso + 1)}
                        disabled={
                            (paso === 0 && !seleccion.veterinario) ||
                            (paso === 1 && !seleccion.horario)
                        }
                        style={{
                            padding: '10px 24px', borderRadius: '8px', border: 'none',
                            background: '#2a9d8f', color: '#fff',
                            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            opacity: (paso === 0 && !seleccion.veterinario) || (paso === 1 && !seleccion.horario) ? 0.5 : 1,
                        }}
                    >
                        Continuar →
                    </button>
                ) : (
                    <button
                        onClick={handleConfirmar}
                        disabled={loading}
                        style={{
                            padding: '10px 24px', borderRadius: '8px', border: 'none',
                            background: '#2a9d8f', color: '#fff',
                            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Agendando...' : '✓ Confirmar Cita'}
                    </button>
                )}
            </div>
        </ClientLayout>
    )
}

export default Agendamiento