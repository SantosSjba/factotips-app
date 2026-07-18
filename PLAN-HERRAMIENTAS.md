# FactoTips — Plan de herramientas (roadmap)

> **Producto:** hub de utilidades FactoTips (Factosys Perú)  
> **Ya en producción:** Comparador de precios DIGEMID  
> **Regla de producto:** cada herramienta nueva = **landing SEO + app** (igual que precios)

Marca avance con `- [x]`. Implementar **una herramienta completa** antes de pasar a la siguiente.

---

## Convenciones (obligatorias por herramienta)

### Rutas

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Landing SEO | `/herramientas/{slug}` | `/herramientas/igv` |
| App / usar | `/herramientas/{slug}/usar` *(o `/consultar` si es búsqueda)* | `/herramientas/igv/usar` |

**Excepción ya hecha:** precios usa `/consultar` (no renombrar).

### Checklist SEO / calidad (copiar por herramienta)

- [ ] `metadata` (title, description, keywords, OG) en `lib/seo/tools.ts`
- [ ] Entrada en `TOOL_ROUTES` + `TOOLS` (hub)
- [ ] Landing con: marca/headline, 1 frase, CTA a la app, cómo funciona, FAQ, disclaimer
- [ ] JSON-LD: `WebApplication` + `FAQPage` (como precios)
- [ ] Sitemap: incluir landing (+ app si aplica)
- [ ] Mobile-first, sin login
- [ ] Cálculo **en cliente** cuando no haga falta API (preferido)
- [ ] Disclaimer legal / fuente de fórmulas visible
- [ ] i18n ES mínimo (EN opcional después)

### Stack técnico preferido

| Tipo | Enfoque |
|------|---------|
| Calculadoras (IGV, UIT, sueldo…) | 100% client-side; constantes UIT/RMV en `lib/pe/` |
| QR | Client-side (`qrcode` / similar) |
| PDF | Client-side (`pdf-lib` + Web Workers si hace falta) |
| Consultas externas | Solo APIs oficiales/públicas + rate limit + caché Postgres si aplica |

---

## Indicadores vigentes (actualizar cada año)

| Indicador | 2026 | Norma / nota |
|-----------|------|----------------|
| UIT | S/ 5,500 | D.S. 301-2025-EF |
| RMV | S/ 1,130 | Verificar MEF/MTPE al implementar |
| IGV general | 18% | |
| IGV MYPE (si aplica UI) | 10% | Documentar cuándo aplica |

Archivo sugerido: `lib/pe/indicadores.ts` (fuente única).

---

## Orden de trabajo (sprints)

```
Sprint A (quick wins)     → IGV → UIT → QR
Sprint B (bolsillo)       → Sueldo neto → Honorarios 4ta
Sprint C (estacional)     → CTS → Gratificación
Sprint D (archivos)       → PDF unir/comprimir
Opcional                  → Consulta RUC (API pública + rate limit)
```

---

# Sprint A — Quick wins

## A1. Calculadora IGV

**Slug:** `igv`  
**Demanda:** muy alta (boletas, precios, negocios)  
**Esfuerzo:** ~0.5–1 día  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/igv`
- App: `/herramientas/igv/usar`

### Funcionalidad

- [x] Precio sin IGV → con IGV
- [x] Precio con IGV → base + IGV
- [x] Toggle 18% / 10% (MYPE) con nota aclaratoria
- [x] Copiar resultado / resumen

### SEO (keywords seed)

`calcular IGV`, `IGV 18% Perú`, `precio con IGV`, `sacar IGV`, `IGV MYPE`

### Checklist entrega

- [x] Landing + app + hub card
- [x] FAQ (qué es IGV, diferencia 18/10, no reemplaza SUNAT)
- [x] `lib/pe/igv.ts` + tests manuales smoke

---

## A2. Conversor UIT ↔ soles

**Slug:** `uit`  
**Demanda:** alta (multas, rentas, trámites)  
**Esfuerzo:** ~0.5 día  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/uit`
- App: `/herramientas/uit/usar`

### Funcionalidad

- [x] UIT → soles y soles → UIT
- [x] Mostrar UIT vigente + año
- [x] Tabla rápida (0.5, 1, 2, 7, 10 UIT…)

### SEO

`UIT 2026`, `cuánto es 1 UIT`, `convertir UIT a soles`, `UIT Perú`

### Checklist entrega

- [x] Landing + app + hub
- [x] FAQ + disclaimer (valor oficial MEF; FactoTips no es entidad estatal)

---

## A3. Generador de código QR

**Slug:** `qr`  
**Demanda:** alta / global + negocios PE  
**Esfuerzo:** ~0.5–1 día  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/qr`
- App: `/herramientas/qr/usar`

### Funcionalidad

- [x] Texto / URL → QR PNG
- [x] Descargar imagen
- [x] (Opcional v1.1) tamaño / margen
- [x] Logo, colores, estilos, WhatsApp / WiFi, PNG + SVG

### SEO

`generar código QR`, `QR gratis`, `crear QR WhatsApp`, `QR para negocio`

### Checklist entrega

- [x] Landing + app + hub
- [x] Privacidad: “se genera en tu dispositivo”

---

# Sprint B — Bolsillo / independientes

## B1. Calculadora de sueldo neto (5ta categoría)

**Slug:** `sueldo-neto`  
**Demanda:** muy alta  
**Esfuerzo:** ~1–2 días  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/sueldo-neto`
- App: `/herramientas/sueldo-neto/usar`

### Funcionalidad

- [x] Bruto → neto (AFP o ONP)
- [x] Mostrar descuentos desglosados
- [x] RMV / topes documentados en UI
- [x] Disclaimer: estimativo, no liquidación oficial

### SEO

`sueldo neto Perú`, `calcular quinta categoría`, `descuento AFP sueldo`, `bruto a neto`

---

## B2. Recibo por honorarios / renta 4ta

**Slug:** `honorarios`  
**Demanda:** alta (freelance / independientes)  
**Esfuerzo:** ~1–2 días  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/honorarios`
- App: `/herramientas/honorarios/usar`

### Funcionalidad

- [x] Monto honorario → retención 8% → neto
- [x] Nota sobre suspensión de retención (< 7 UIT anuales — orientar, no tramitar)
- [x] Disclaimer SUNAT

### SEO

`recibo por honorarios`, `retención 8%`, `renta cuarta categoría`, `calcular honorarios netos`

---

# Sprint C — Estacional (SEO fuerte)

## C1. CTS

**Slug:** `cts`  
**Esfuerzo:** ~1–2 días  

- Landing: `/herramientas/cts` · App: `/herramientas/cts/usar`
- [ ] Cálculo CTS (may / nov) con inputs claros
- [ ] FAQ + base legal resumida + disclaimer

## C2. Gratificación

**Slug:** `gratificacion`  
**Esfuerzo:** ~1–2 días  

- Landing: `/herramientas/gratificacion` · App: `/herramientas/gratificacion/usar`
- [ ] Fiestas Patrias / Navidad
- [ ] Bonificación Essalud / EPS si aplica en UI simple

---

# Sprint D — Archivos (privacidad)

## D1. Kit PDF (v1)

**Slug:** `pdf`  
**Esfuerzo:** ~2–3 días  
**Tipo:** client-side (`pdf-lib`)

### Rutas

- Landing: `/herramientas/pdf`
- App: `/herramientas/pdf/usar`

### Funcionalidad v1

- [ ] Unir PDF
- [ ] Comprimir PDF (básico)
- [ ] (Opcional) dividir

### SEO / confianza

- [ ] Mensaje fuerte: archivos **no se suben** a servidor
- [ ] FAQ privacidad

---

# Opcional (post-MVP herramientas)

## Consulta RUC (datos públicos)

**Slug:** `ruc`  
- Solo si hay fuente oficial/pública estable  
- Rate limit + caché Postgres  
- Landing SEO + app  
- **No** scrapear HTML de SUNAT

---

## Plantilla de archivos por herramienta

```
app/herramientas/{slug}/page.tsx              # Landing SEO
app/herramientas/{slug}/usar/page.tsx         # App
components/marketing/{slug}-landing.tsx
components/{slug}/{slug}-tool.tsx
lib/pe/{slug}.ts                              # lógica (si aplica)
lib/seo/tools.ts                              # TOOL_ROUTES + TOOL_SEO + JSON-LD
lib/tools.ts                                  # card en hub
lib/i18n/dictionaries/{es,en}.ts              # copy
app/sitemap.ts                                # rutas nuevas
```

---

## Registro de avances

| Fecha | Nota |
|-------|------|
| 2026-07-17 | Plan creado. Orden: IGV → UIT → QR → sueldo neto → honorarios → CTS → gratificación → PDF. |
| 2026-07-17 | A1 Calculadora IGV entregada (`/herramientas/igv` + `/usar`). |
| 2026-07-17 | A2 Conversor UIT entregado (`/herramientas/uit` + `/usar`). |
| 2026-07-17 | A3 Generador QR pro entregado (logo, colores, PNG/SVG). |
| 2026-07-17 | B1 Calculadora sueldo neto entregada (`/herramientas/sueldo-neto` + `/usar`). |
| 2026-07-17 | B2 Recibo por honorarios entregado (`/herramientas/honorarios` + `/usar`). |

---

## Próximo paso inmediato

**Sprint C1 — CTS** (landing `/herramientas/cts` + app `/usar`).
