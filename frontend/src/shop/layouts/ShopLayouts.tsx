import { Outlet, Link, useLocation } from "react-router";

export const ShopLayouts = () => {
    const location = useLocation();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Top Announcement Bar */}
            <div style={{
                background: "linear-gradient(90deg, #AD5C60 0%, #C97A7E 50%, #D9A05B 100%)",
                color: "#FFFFFF",
                textAlign: "center",
                padding: "0.45rem 1rem",
                fontSize: "0.82rem",
                fontWeight: "500",
                letterSpacing: "0.3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
            }}>
                <span>✨</span>
                <span>Agenda tu cita en línea en segundos o cotiza tu diseño personalizado con nuestro asistente inteligente</span>
            </div>

            {/* Main Header / Navbar */}
            <header className="glass-nav" style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                transition: "all 0.3s ease"
            }}>
                <div className="container" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "1rem",
                    paddingBottom: "1rem"
                }}>
                    {/* Brand Logo */}
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #F7E7E7 0%, #FAF0EC 100%)",
                            border: "1.5px solid #C97A7E",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 10px rgba(201, 122, 126, 0.15)"
                        }}>
                            <span style={{ fontSize: "1.2rem" }}>💅</span>
                        </div>
                        <div>
                            <div style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "1.35rem",
                                fontWeight: "700",
                                color: "var(--color-primary-dark)",
                                letterSpacing: "0.5px",
                                lineHeight: "1.1"
                            }}>
                                LuneBy <span style={{ color: "var(--color-secondary)", fontWeight: "400", fontStyle: "italic" }}>Kelin</span>
                            </div>
                            <div style={{
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                                letterSpacing: "1.8px",
                                color: "var(--color-text-muted)",
                                fontWeight: "600"
                            }}>
                                Nail Studio & Spa
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem"
                    }}>
                        <a
                            href="#inicio"
                            style={{
                                fontSize: "0.92rem",
                                fontWeight: location.pathname === "/" ? "600" : "500",
                                color: "var(--color-text-main)",
                                transition: "color 0.2s"
                            }}
                        >
                            Inicio
                        </a>
                        <a
                            href="#servicios"
                            style={{
                                fontSize: "0.92rem",
                                fontWeight: "500",
                                color: "var(--color-text-muted)",
                                transition: "color 0.2s"
                            }}
                        >
                            Servicios
                        </a>
                        <a
                            href="#cotizador"
                            style={{
                                fontSize: "0.92rem",
                                fontWeight: "600",
                                color: "var(--color-primary-dark)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem"
                            }}
                        >
                            <span>💎 Cotizador</span>
                        </a>
                        <a
                            href="#experiencia"
                            style={{
                                fontSize: "0.92rem",
                                fontWeight: "500",
                                color: "var(--color-text-muted)"
                            }}
                        >
                            Beneficios
                        </a>
                        <a
                            href="#testimonios"
                            style={{
                                fontSize: "0.92rem",
                                fontWeight: "500",
                                color: "var(--color-text-muted)"
                            }}
                        >
                            Reseñas
                        </a>
                    </nav>

                    {/* Right Action CTA & Admin Link */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <Link
                            to="/auth/login"
                            style={{
                                fontSize: "0.88rem",
                                fontWeight: "600",
                                color: "var(--color-text-muted)",
                                padding: "0.5rem 0.9rem",
                                borderRadius: "var(--radius-full)",
                                transition: "all 0.2s"
                            }}
                        >
                            Ingresar
                        </Link>
                        <a
                            href="#cotizador"
                            className="btn btn-primary"
                            style={{
                                fontSize: "0.88rem",
                                padding: "0.65rem 1.35rem"
                            }}
                        >
                            ✨ Agendar Cita
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Routed Page Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            {/* Luxury Footer */}
            <footer style={{
                backgroundColor: "#1F1A1C",
                color: "#E2D9DC",
                paddingTop: "4rem",
                paddingBottom: "2rem",
                marginTop: "4rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
                <div className="container">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "2.5rem",
                        marginBottom: "3rem"
                    }}>
                        {/* Col 1: Brand Info */}
                        <div>
                            <div style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "1.6rem",
                                fontWeight: "700",
                                color: "#FFFFFF",
                                marginBottom: "0.5rem"
                            }}>
                                LuneBy <span style={{ color: "#D9A05B", fontStyle: "italic" }}>Kelin</span>
                            </div>
                            <p style={{ color: "#A89BA1", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.2rem" }}>
                                Estudio profesional de manicura, aplicación de uñas esculpidas, nail art de tendencia y cuidado de manos. Diseñamos con pasión y precisión para resaltar tu estilo único.
                            </p>
                            <div style={{ display: "flex", gap: "0.6rem" }}>
                                {["📸 Instagram", "💬 WhatsApp", "🎵 TikTok"].map((social, idx) => (
                                    <span key={idx} style={{
                                        fontSize: "0.8rem",
                                        background: "rgba(255, 255, 255, 0.08)",
                                        padding: "0.35rem 0.75rem",
                                        borderRadius: "var(--radius-full)",
                                        color: "#FFFFFF"
                                    }}>
                                        {social}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Col 2: Servicios Rápidos */}
                        <div>
                            <h4 style={{ color: "#FFFFFF", fontSize: "1.1rem", marginBottom: "1.2rem" }}>Servicios Populares</h4>
                            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.9rem" }}>
                                <li><a href="#servicios" style={{ color: "#C2B5BB" }}>💅 Uñas Acrílicas Esculpidas</a></li>
                                <li><a href="#servicios" style={{ color: "#C2B5BB" }}>🌸 Manicura Rusa & Gel Semipermanente</a></li>
                                <li><a href="#servicios" style={{ color: "#C2B5BB" }}>✨ Diseños Nail Art 3D & Chrome</a></li>
                                <li><a href="#servicios" style={{ color: "#C2B5BB" }}>🌿 Baño de Acrílico & Retiro Seguro</a></li>
                                <li><a href="#servicios" style={{ color: "#C2B5BB" }}>👑 Spa de Manos Hidratante</a></li>
                            </ul>
                        </div>

                        {/* Col 3: Asistente & Horarios */}
                        <div>
                            <h4 style={{ color: "#FFFFFF", fontSize: "1.1rem", marginBottom: "1.2rem" }}>Horario de Atención</h4>
                            <div style={{ fontSize: "0.9rem", color: "#C2B5BB", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <p style={{ color: "#E2D9DC" }}><strong>Lunes a Sábado:</strong> 9:00 AM - 7:30 PM</p>
                                <p style={{ color: "#E2D9DC" }}><strong>Domingos:</strong> Previa Cita Especial</p>
                                <p style={{ color: "#A89BA1", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                                    💡 <em>Cotizador y asistente de citas disponible las 24 horas del día.</em>
                                </p>
                            </div>
                        </div>

                        {/* Col 4: Ubicación y Contacto */}
                        <div>
                            <h4 style={{ color: "#FFFFFF", fontSize: "1.1rem", marginBottom: "1.2rem" }}>Ubicación & Citas</h4>
                            <div style={{ fontSize: "0.9rem", color: "#C2B5BB", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <p style={{ color: "#C2B5BB" }}>📍 Studio LuneBy, Choloma, Cortés</p>
                                <p style={{ color: "#C2B5BB" }}>📞 Consultas directas: +504 2525-1445</p>
                                <a
                                    href="#cotizador"
                                    className="btn btn-gold"
                                    style={{
                                        marginTop: "0.8rem",
                                        padding: "0.6rem 1.2rem",
                                        fontSize: "0.85rem",
                                        alignSelf: "flex-start"
                                    }}
                                >
                                    💎 Cotizar Ahora
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom copyright */}
                    <div style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        paddingTop: "1.8rem",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        fontSize: "0.82rem",
                        color: "#8B7E84"
                    }}>
                        <div>
                            © {new Date().getFullYear()} <strong>LuneBy Kelin</strong>. Todos los derechos reservados.
                        </div>
                        <div style={{ display: "flex", gap: "1.5rem" }}>
                            <Link to="/admin" style={{ color: "#A89BA1" }}>Panel Administrativo</Link>
                            <span>Privacidad</span>
                            <span>Términos de Reserva</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};