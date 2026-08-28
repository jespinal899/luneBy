import { useState } from "react";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  time: string;
  description: string;
  badge?: string;
}

const BASE_SERVICES: ServiceOption[] = [
  {
    id: "acrilicas",
    name: "Uñas Acrílicas Esculpidas",
    price: 45,
    time: "1h 45m",
    description: "Estructura perfecta, máxima resistencia y acabado profesional.",
    badge: "Más Popular"
  },
  {
    id: "gel",
    name: "Manicura Rusa + Gel Semipermanente",
    price: 30,
    time: "1h 15m",
    description: "Limpieza profunda de cutículas y esmaltado impecable de 21 días.",
    badge: "Tendencia"
  },
  {
    id: "kapping",
    name: "Baño de Acrílico (Kapping)",
    price: 35,
    time: "1h 20m",
    description: "Refuerzo para uñas naturales quebradizas sin alargar.",
  },
  {
    id: "spa",
    name: "Manicura Spa & Restauración",
    price: 25,
    time: "50m",
    description: "Exfoliación con sales, mascarilla nutritiva e hidratación profunda.",
  }
];

const LENGTH_OPTIONS = [
  { id: "corta", label: "Cortas (#1 - #2)", price: 0, desc: "Elegante y cómodo para el día a día" },
  { id: "mediana", label: "Medianas (#3 - #4)", price: 8, desc: "El balance ideal entre estilo y practicidad" },
  { id: "larga", label: "Largas (#5 - #6)", price: 15, desc: "Look estilizado y llamativo" },
  { id: "xl", label: "XL Glam (#7+)", price: 22, desc: "Máximo impacto para ocasiones especiales" },
];

const NAIL_ART_OPTIONS = [
  { id: "liso", label: "Liso / 1 solo tono", price: 0, desc: "Acabado clásico limpio y uniforme" },
  { id: "french", label: "Francés / Glazed / Ombré", price: 10, desc: "Diseño sutil, elegante y atemporal" },
  { id: "chrome", label: "Efecto Cromo / Aurora / Foil", price: 15, desc: "Brillo metálico tornasol de alta tendencia" },
  { id: "3d", label: "Nail Art 3D, Cristales & Mano Alzada", price: 25, desc: "Pedrería de lujo, perlas y arte detallado" },
];

export const HomePage = () => {
  // Cotizador Interactivo State
  const [selectedService, setSelectedService] = useState<string>("acrilicas");
  const [selectedLength, setSelectedLength] = useState<string>("mediana");
  const [selectedArt, setSelectedArt] = useState<string>("french");
  const [spaAddon, setSpaAddon] = useState<boolean>(false);
  const [bookedModalOpen, setBookedModalOpen] = useState<boolean>(false);

  // Calcular precio en vivo
  const currentBase = BASE_SERVICES.find(s => s.id === selectedService) || BASE_SERVICES[0];
  const currentLength = LENGTH_OPTIONS.find(l => l.id === selectedLength) || LENGTH_OPTIONS[0];
  const currentArt = NAIL_ART_OPTIONS.find(a => a.id === selectedArt) || NAIL_ART_OPTIONS[0];
  const calculatedTotal = currentBase.price + currentLength.price + currentArt.price + (spaAddon ? 12 : 0);

  return (
    <div id="inicio">
      {/* 1. HERO SECTION */}
      <section style={{
        position: "relative",
        padding: "3.5rem 0 5rem 0",
        overflow: "hidden"
      }}>
        {/* Soft Background Glow Circles */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "5%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201, 122, 126, 0.18) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(40px)",
          zIndex: 0,
          pointerEvents: "none"
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "center"
          }}>
            {/* Left Content */}
            <div>
              <div style={{ marginBottom: "1.2rem" }}>
                <span className="badge-pill badge-rose">
                  <span>✨</span> Asistente Inteligente de Citas & Cotizaciones
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                fontWeight: "700",
                letterSpacing: "-0.5px",
                marginBottom: "1.2rem",
                color: "#1F1A1C"
              }}>
                Tus uñas, tu mejor <br />
                <span style={{
                  color: "var(--color-primary-dark)",
                  fontStyle: "italic",
                  background: "linear-gradient(135deg, #AD5C60 0%, #C97A7E 50%, #D9A05B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  accesorio de lujo.
                </span>
              </h1>

              <p style={{
                fontSize: "1.1rem",
                lineHeight: "1.7",
                color: "var(--color-text-muted)",
                marginBottom: "2.2rem"
              }}>
                Bienvenida a <strong>LuneBy Kelin</strong>. Especialistas en manicura rusa, uñas acrílicas esculpidas y nail art de autor. Cotiza tu diseño favorito en tiempo real y agenda tu cita en segundos.
              </p>

              {/* Action Buttons */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2.5rem"
              }}>
                <a href="#cotizador" className="btn btn-primary">
                  <span>💎 Cotizar Mi Diseño</span>
                </a>
                <a href="#servicios" className="btn btn-secondary">
                  <span>💅 Ver Servicios & Precios</span>
                </a>
              </div>

              {/* Social Proof & Trust Metrics */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1.8rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--color-border-subtle)"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#D9A05B" }}>
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} style={{ fontSize: "1.1rem" }}>{star}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-text-main)", marginTop: "0.2rem" }}>
                    4.9 / 5.0 (500+ Clientas)
                  </div>
                </div>

                <div style={{ width: "1px", height: "36px", background: "var(--color-border)" }} />

                <div>
                  <div style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-primary-dark)", fontFamily: "var(--font-serif)" }}>
                    100% Esterilizado
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Higiene de grado médico
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Image Showcase with Floating Glass Cards */}
            <div style={{ position: "relative" }}>
              <div style={{
                position: "relative",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                border: "4px solid #FFFFFF",
                aspectRatio: "16 / 10"
              }}>
                <img 
                  src="/images/hero-nails.jpg" 
                  alt="LuneBy Kelin Manicura de Lujo" 
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease"
                  }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(35, 28, 30, 0.4) 100%)"
                }} />
              </div>

              {/* Floating Glass Tag 1 (Top Right) */}
              <div className="glass-panel animate-float" style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                padding: "0.75rem 1.1rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem"
              }}>
                <span style={{ fontSize: "1.4rem" }}>💎</span>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-text-main)" }}>
                    Brillo & Duración 3-4 Semanas
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-primary-dark)" }}>
                    Garantía LuneBy
                  </div>
                </div>
              </div>

              {/* Floating Glass Tag 2 (Bottom Left) */}
              <div className="glass-panel" style={{
                position: "absolute",
                bottom: "-20px",
                left: "-15px",
                padding: "0.85rem 1.2rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "var(--color-secondary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem"
                }}>
                  ⏱️
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>
                    Citas Rápidas Online
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                    Sin esperas por WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE QUOTE ASSISTANT (COTIZADOR EN VIVO) */}
      <section id="cotizador" style={{
        padding: "4.5rem 0",
        background: "linear-gradient(180deg, #FBF4F1 0%, #FFFFFF 100%)",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3rem auto" }}>
            <span className="badge-pill badge-gold" style={{ marginBottom: "0.8rem" }}>
              💎 Cotizador Interactivo
            </span>
            <h2 style={{ fontSize: "2.3rem", marginBottom: "0.8rem", color: "var(--color-text-main)" }}>
              Cotiza tu diseño en tiempo real
            </h2>
            <p style={{ fontSize: "1rem" }}>
              Personaliza el tipo de servicio, el largo y los detalles de nail art para calcular el presupuesto estimado al instante.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "start"
          }}>
            {/* Step Selection Panel */}
            <div className="glass-panel" style={{
              padding: "2rem",
              borderRadius: "var(--radius-lg)",
              background: "#FFFFFF"
            }}>
              {/* Paso 1: Tipo de Servicio */}
              <div style={{ marginBottom: "1.8rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "var(--color-text-main)",
                  marginBottom: "0.8rem"
                }}>
                  1. Selecciona el Servicio Base:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
                  {BASE_SERVICES.map((s) => {
                    const isSelected = selectedService === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedService(s.id)}
                        style={{
                          padding: "0.9rem",
                          borderRadius: "var(--radius-md)",
                          border: isSelected ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                          background: isSelected ? "var(--color-primary-light)" : "var(--color-surface-soft)",
                          cursor: "pointer",
                          transition: "var(--transition-fast)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: isSelected ? "var(--color-primary-dark)" : "var(--color-text-main)" }}>
                            {s.name}
                          </span>
                          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>
                            ${s.price}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          ⏱️ {s.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paso 2: Largo de Uñas */}
              <div style={{ marginBottom: "1.8rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "var(--color-text-main)",
                  marginBottom: "0.8rem"
                }}>
                  2. Largo Deseado:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.6rem" }}>
                  {LENGTH_OPTIONS.map((l) => {
                    const isSelected = selectedLength === l.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLength(l.id)}
                        style={{
                          padding: "0.75rem",
                          borderRadius: "var(--radius-md)",
                          border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                          background: isSelected ? "var(--color-primary-light)" : "#FFFFFF",
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        <div style={{ fontSize: "0.84rem", fontWeight: "700", color: isSelected ? "var(--color-primary-dark)" : "var(--color-text-main)" }}>
                          {l.label}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: isSelected ? "var(--color-primary-dark)" : "var(--color-text-muted)", marginTop: "0.2rem" }}>
                          {l.price === 0 ? "Incluido" : `+$${l.price}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paso 3: Nivel de Nail Art */}
              <div style={{ marginBottom: "1.8rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "var(--color-text-main)",
                  marginBottom: "0.8rem"
                }}>
                  3. Nivel de Nail Art / Decoración:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem" }}>
                  {NAIL_ART_OPTIONS.map((a) => {
                    const isSelected = selectedArt === a.id;
                    return (
                      <div
                        key={a.id}
                        onClick={() => setSelectedArt(a.id)}
                        style={{
                          padding: "0.8rem 1rem",
                          borderRadius: "var(--radius-md)",
                          border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                          background: isSelected ? "var(--color-primary-light)" : "#FFFFFF",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: isSelected ? "var(--color-primary-dark)" : "var(--color-text-main)" }}>
                            {a.label}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {a.desc}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>
                          {a.price === 0 ? "+$0" : `+$${a.price}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra Addon Checkbox */}
              <div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem",
                  background: "var(--color-surface-soft)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer"
                }}>
                  <input
                    type="checkbox"
                    checked={spaAddon}
                    onChange={(e) => setSpaAddon(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--color-text-main)" }}>
                      Añadir Spa de Manos con Parafina & Masaje Hidratante
                    </span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Nutre la piel y cutículas a profundidad (+15 min)
                    </span>
                  </div>
                  <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>
                    +$12
                  </span>
                </label>
              </div>
            </div>

            {/* Live Summary Receipt Card */}
            <div className="glass-panel" style={{
              padding: "2.2rem",
              borderRadius: "var(--radius-lg)",
              border: "2px solid rgba(201, 122, 126, 0.3)",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8F6 100%)",
              position: "sticky",
              top: "90px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                <span className="badge-pill badge-rose">Resumen de Cotización</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Estimación en vivo</span>
              </div>

              <h3 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", color: "var(--color-text-main)" }}>
                Tu Experiencia Personalizada
              </h3>

              {/* Line items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", paddingBottom: "1.2rem", borderBottom: "1px dashed var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>{currentBase.name}</span>
                  <span style={{ fontWeight: "600" }}>${currentBase.price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Largo: {currentLength.label}</span>
                  <span style={{ fontWeight: "600" }}>{currentLength.price === 0 ? "Gratis" : `+$${currentLength.price}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Estilo: {currentArt.label}</span>
                  <span style={{ fontWeight: "600" }}>{currentArt.price === 0 ? "Gratis" : `+$${currentArt.price}`}</span>
                </div>
                {spaAddon && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "var(--color-primary-dark)" }}>
                    <span>Spa de Parafina Nutritiva</span>
                    <span style={{ fontWeight: "600" }}>+$12</span>
                  </div>
                )}
              </div>

              {/* Total & Duration */}
              <div style={{ padding: "1.2rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-main)" }}>Precio Estimado:</span>
                  <span style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "2.4rem",
                    fontWeight: "700",
                    color: "var(--color-primary-dark)"
                  }}>
                    ${calculatedTotal}
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span>⏱️ Tiempo aproximado de sesión:</span>
                  <strong>{currentBase.time}</strong>
                </div>
              </div>

              {/* CTA to Book this exact quotation */}
              <button
                onClick={() => setBookedModalOpen(true)}
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "0.5rem" }}
              >
                ✨ Agendar con esta Cotización (${calculatedTotal})
              </button>

              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-light)", marginTop: "1rem" }}>
                🔒 Precios transparentes sin costos ocultos. Se reserva con anticipo del 20%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES SHOWCASE (CARDS CON FOTOS GENERADAS) */}
      <section id="servicios" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 3.5rem auto" }}>
            <span className="badge-pill badge-rose" style={{ marginBottom: "0.8rem" }}>
              Nuestra Carta de Servicios
            </span>
            <h2 style={{ fontSize: "2.3rem", marginBottom: "0.8rem" }}>
              Técnicas exclusivas para tus manos
            </h2>
            <p style={{ fontSize: "1rem" }}>
              Utilizamos productos de alta gama y técnicas avanzadas de esterilización y diseño para garantizar un acabado perfecto y duradero.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.2rem"
          }}>
            {/* Service Card 1: Gel Semipermanente */}
            <div className="glass-panel" style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}>
              <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
                <img 
                  src="/images/service-gel.jpg" 
                  alt="Manicura Rusa y Gel Semipermanente" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span className="badge-pill badge-rose" style={{ position: "absolute", top: "15px", left: "15px" }}>
                  Esmaltado en Seco
                </span>
              </div>
              <div style={{ padding: "1.8rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem" }}>Manicura Rusa & Gel</h3>
                  <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-primary-dark)", fontFamily: "var(--font-serif)" }}>
                    Desde $30
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.2rem", flex: 1 }}>
                  Técnica de precisión milimétrica que limpia profundamente la cutícula para permitir un esmaltado debajo del pliegue ungueal con duración de más de 3 semanas.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>⏱️ Duración: 1h 15m</span>
                  <a href="#cotizador" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
                    Cotizar
                  </a>
                </div>
              </div>
            </div>

            {/* Service Card 2: Uñas Acrílicas Esculpidas */}
            <div className="glass-panel" style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              border: "2px solid rgba(201, 122, 126, 0.35)",
              boxShadow: "var(--shadow-lg)"
            }}>
              <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
                <img 
                  src="/images/service-acrylic.jpg" 
                  alt="Uñas Acrílicas Esculpidas" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span className="badge-pill badge-gold" style={{ position: "absolute", top: "15px", left: "15px" }}>
                  👑 Servicio Estrella
                </span>
              </div>
              <div style={{ padding: "1.8rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem" }}>Acrílicas Esculpidas</h3>
                  <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-primary-dark)", fontFamily: "var(--font-serif)" }}>
                    Desde $45
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.2rem", flex: 1 }}>
                  Alargamiento escultural con polímeros de grado premium. Elige tu forma favorita: Almendra, Coffin, Stiletto o Cuadrada con difuminados franceses y tonos nude.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>⏱️ Duración: 1h 45m</span>
                  <a href="#cotizador" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
                    Cotizar
                  </a>
                </div>
              </div>
            </div>

            {/* Service Card 3: Nail Art de Autor & 3D */}
            <div className="glass-panel" style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
                <img 
                  src="/images/service-nailart.jpg" 
                  alt="Nail Art de Autor y Cristalería" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span className="badge-pill badge-rose" style={{ position: "absolute", top: "15px", left: "15px" }}>
                  Arte 100% Exclusivo
                </span>
              </div>
              <div style={{ padding: "1.8rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem" }}>Nail Art & Diseños 3D</h3>
                  <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-primary-dark)", fontFamily: "var(--font-serif)" }}>
                    Desde $40
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.2rem", flex: 1 }}>
                  Perlas, incrustaciones de cristalería Swarovski, relieves 3D, líneas cromadas líquidas y diseños hechos a mano alzada para lucir una obra de arte única.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>⏱️ Duración: 2h 00m</span>
                  <a href="#cotizador" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
                    Cotizar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW: CÓMO AGENDAR EN 3 SIMPLES PASOS */}
      <section style={{
        padding: "4.5rem 0",
        background: "var(--color-surface-soft)"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3.5rem auto" }}>
            <span className="badge-pill badge-gold" style={{ marginBottom: "0.8rem" }}>
              Sin Fila Ni Complicaciones
            </span>
            <h2 style={{ fontSize: "2.3rem", marginBottom: "0.8rem" }}>
              ¿Cómo agendar tu cita en LuneBy?
            </h2>
            <p>Disfruta de una experiencia digital intuitiva diseñada para ahorrarte tiempo.</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2rem"
          }}>
            {[
              {
                num: "01",
                icon: "💎",
                title: "Personaliza & Cotiza",
                desc: "Usa nuestro cotizador interactivo para armar tu set soñado con largo y estilo exacto."
              },
              {
                num: "02",
                icon: "📅",
                title: "Elige Fecha y Horario",
                desc: "Selecciona el día y la hora disponible que mejor se ajuste a tu agenda sin esperar confirmaciones lentas."
              },
              {
                num: "03",
                icon: "✨",
                title: "Asiste y Déjate Consentir",
                desc: "Recibe recordatorios automáticos por WhatsApp y vive la experiencia más relajante en nuestro estudio."
              }
            ].map((step, idx) => (
              <div key={idx} className="glass-panel" style={{
                padding: "2.2rem 1.8rem",
                borderRadius: "var(--radius-lg)",
                background: "#FFFFFF",
                position: "relative"
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "3.5rem",
                  fontWeight: "700",
                  color: "rgba(201, 122, 126, 0.15)",
                  position: "absolute",
                  top: "12px",
                  right: "20px",
                  lineHeight: "1"
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>{step.icon}</div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.6rem", color: "var(--color-text-main)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.88rem", lineHeight: "1.6" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE LUNEBY EXPERIENCE (BENEFICIOS) */}
      <section id="experiencia" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}>
            <div>
              <span className="badge-pill badge-rose" style={{ marginBottom: "0.8rem" }}>
                El Estándar LuneBy
              </span>
              <h2 style={{ fontSize: "2.4rem", marginBottom: "1.2rem" }}>
                Por qué nuestras clientas nos eligen una y otra vez
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: "1.7", marginBottom: "2rem" }}>
                Nos enfocamos en cuidar la salud de tu uña natural tanto como en la estética. Cada sesión es un momento de autocuidado y relajación pensado para ti.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                {[
                  {
                    icon: "🛡️",
                    title: "Bioseguridad & Esterilización Médica",
                    desc: "Herramientas selladas y desinfectadas en autoclave para cada clienta."
                  },
                  {
                    icon: "💅",
                    title: "Marcas Premium Internacionales",
                    desc: "Esmaltes y acrílicos hipoalergénicos que no dañan ni debilitan tus uñas."
                  },
                  {
                    icon: "☕",
                    title: "Bebida de Cortesía & Zona Relax",
                    desc: "Café de especialidad, té herbal o mocktail mientras disfrutas tu sesión."
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "var(--color-primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{item.title}</h4>
                      <p style={{ fontSize: "0.88rem" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials highlight card */}
            <div id="testimonios" className="glass-panel" style={{
              padding: "2.5rem",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FCF6F4 100%)",
              border: "1px solid rgba(201, 122, 126, 0.25)"
            }}>
              <div style={{ fontSize: "1.8rem", color: "#D9A05B", marginBottom: "1rem" }}>★★★★★</div>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.25rem",
                fontStyle: "italic",
                lineHeight: "1.6",
                color: "#2E2428",
                marginBottom: "1.5rem"
              }}>
                “Nunca había tenido una manicura que me durara tanto tiempo intacta. El cotizador me dio el precio exacto desde la web y el trato de Kelin fue un 10/10. ¡Amé mis uñas!”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C97A7E 0%, #D9A05B 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.1rem"
                }}>
                  VC
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "var(--color-text-main)", fontSize: "0.95rem" }}>
                    Valeria C.
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-primary-dark)" }}>
                    Clienta Frecuente (Set Acrílico Glam)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER (AGENDAR AHORA) */}
      <section style={{ padding: "0 0 4rem 0" }}>
        <div className="container">
          <div style={{
            background: "linear-gradient(135deg, #2D2326 0%, #1F181A 100%)",
            color: "#FFFFFF",
            borderRadius: "var(--radius-lg)",
            padding: "3.5rem 2.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-lg)"
          }}>
            {/* Background luxury gradient accents */}
            <div style={{
              position: "absolute",
              top: "-50%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "300px",
              background: "radial-gradient(circle, rgba(201, 122, 126, 0.3) 0%, transparent 70%)",
              filter: "blur(50px)",
              pointerEvents: "none"
            }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: "650px", margin: "0 auto" }}>
              <span className="badge-pill badge-gold" style={{ marginBottom: "1rem" }}>
                ✨ Agenda Tu Momento de Belleza
              </span>
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#FFFFFF", marginBottom: "1rem" }}>
                ¿Lista para lucir unas uñas espectaculares?
              </h2>
              <p style={{ color: "#D4C7CC", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                Cotiza en línea o reserva directamente tu espacio. Los cupos para fines de semana se llenan rápido.
              </p>

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem" }}>
                <a href="#cotizador" className="btn btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
                  <span>💎 Cotizar Mi Set Ahora</span>
                </a>
                <button
                  onClick={() => setBookedModalOpen(true)}
                  className="btn btn-gold" 
                  style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}
                >
                  <span>📅 Agendar Cita Rápida</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE CONFIRMACIÓN / DEMO DE AGENDAMIENTO */}
      {bookedModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            background: "#FFFFFF",
            borderRadius: "var(--radius-lg)",
            maxWidth: "480px",
            width: "100%",
            padding: "2.2rem",
            boxShadow: "var(--shadow-lg)",
            position: "relative"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--color-primary-light)",
                color: "var(--color-primary-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                margin: "0 auto 1rem auto"
              }}>
                💅
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
                ¡Excelente Elección!
              </h3>
              <p style={{ fontSize: "0.9rem" }}>
                Tu cotización estimada para <strong>{currentBase.name}</strong> es de <strong style={{ color: "var(--color-primary-dark)" }}>${calculatedTotal} USD</strong>.
              </p>
            </div>

            <div style={{
              background: "var(--color-surface-soft)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}>
              <div><strong>Largo:</strong> {currentLength.label}</div>
              <div><strong>Nail Art:</strong> {currentArt.label}</div>
              <div><strong>Extras:</strong> {spaAddon ? "Spa de Parafina Nutritiva" : "Ninguno"}</div>
              <div><strong>Duración estimada:</strong> {currentBase.time}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hola LuneBy Kelin! Me gustaría agendar una cita con esta cotización: Servicio: ${currentBase.name}, Largo: ${currentLength.label}, Estilo: ${currentArt.label}, Total estimado: $${calculatedTotal}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                💬 Continuar por WhatsApp con esta Cotización
              </a>
              <button
                onClick={() => setBookedModalOpen(false)}
                className="btn btn-secondary"
                style={{ width: "100%" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};