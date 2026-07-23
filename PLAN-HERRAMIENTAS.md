# FactoTips — Plan de herramientas (roadmap)

> **Producto:** hub de utilidades FactoTips (Factosys Perú)  
> **Ya en producción:** Precios DIGEMID, IGV, UIT, QR, sueldo neto, honorarios, CTS, gratificación  
> **Regla de producto:** cada herramienta nueva = **landing SEO + app** (igual que precios)  
> **Fuera de alcance:** consulta RUC — SUNAT ya la ofrece al público; no duplicar

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
- [ ] Entrada en `TOOL_ROUTES` + `HUB_TOOLS` (hub / header / footer)
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
| PDF | **Unir / split / compress:** servicio `factotips-py` vía proxy Next (`FACTOTIPS_PY_URL`); otras tools pueden ser client-side / WASM / API |
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
Sprint A (quick wins)     → IGV → UIT → QR                         ✅
Sprint B (bolsillo)       → Sueldo neto → Honorarios 4ta           ✅
Sprint C (estacional)     → CTS → Gratificación                    ✅
Sprint D (archivos)       → Kit PDF completo (7 categorías, orden abajo)  ← siguiente
Sprint E (cluster laboral)→ Liquidación/vacaciones → Horas extras → AFP vs ONP
Sprint F (SEO recurrente) → Calendario SUNAT → Utilidades laborales
Sprint G (nice-to-have)   → Tipo de cambio · Multas UIT · TEA/TCEA
```

**No planificar:** consulta RUC (disponible públicamente en SUNAT / gob.pe).

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
- [x] Cálculo CTS (may / nov) con inputs claros
- [x] FAQ + base legal resumida + disclaimer

## C2. Gratificación

**Slug:** `gratificacion`  
**Esfuerzo:** ~1–2 días  

- Landing: `/herramientas/gratificacion` · App: `/herramientas/gratificacion/usar`
- [x] Fiestas Patrias / Navidad
- [x] Bonificación Essalud / EPS si aplica en UI simple

---

# Sprint D — Kit PDF (privacidad)

> Hub tipo iLovePDF: **landing catálogo** + **una app por herramienta**.  
> Orden de categorías y herramientas = orden de producto (no reordenar).  
> Regla: **no persistir archivos**. Unir/dividir/comprimir van a **factotips-py** (proxy Next). Otras tools pueden ser client-side; documentar en cada landing.

**Slug hub:** `pdf`  
**Demanda:** muy alta (global + negocios PE)  
**Backend PDF:** `factotips-py` → `POST /v1/pdf/*` (merge, split, extract, compress)

### Rutas

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Hub SEO | `/herramientas/pdf` | Catálogo por categorías |
| Landing herramienta | `/herramientas/pdf/{tool}` | `/herramientas/pdf/unir` |
| App | `/herramientas/pdf/{tool}/usar` | `/herramientas/pdf/unir/usar` |

### Convenciones técnicas

- [x] Catálogo en `lib/pdf/tools.ts` (id, categoría, slug, stack, esfuerzo)
- [x] Entrada hub en `HUB_TOOLS` + `TOOL_ROUTES` (hub + tools)
- [x] Mensaje fuerte en hub y cada app: archivos **no se suben** cuando el flujo es 100% cliente
- [x] FAQ privacidad en hub
- [x] Sitemap: hub + cada landing (+ `/usar` si aplica) — hub en sitemap; landings hijas al activar cada tool
- [x] i18n ES mínimo

### SEO (keywords seed hub)

`unir PDF`, `comprimir PDF online`, `juntar PDF gratis`, `PDF sin subir archivos`, `herramientas PDF gratis`, `editar PDF online`

---

## D0. Hub PDF

- [x] Landing `/herramientas/pdf` con las **7 categorías** en este orden
- [x] Cards/links a cada herramienta (estado: disponible / próximamente)
- [x] CTA primario hacia la primera herramienta lista (Unir PDF)
- [x] Disclaimer privacidad + FAQ

---

## D1. Ordenar PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | Unir PDF | `unir` | UI Archivos/Páginas (reordenar, rotar, eliminar); proxy `POST /api/pdf/merge` + `plan` JSON → factotips-py `/v1/pdf/merge` |
| 2 | Dividir PDF | `dividir` | UI Separar/Extraer multi-archivo; proxy `POST /api/pdf/divide` → factotips-py `/v1/pdf/divide` |
| 3 | Eliminar páginas | `eliminar-paginas` | Selección de páginas |
| 4 | Extraer páginas | `extraer-paginas` | Cubierto en modo Extraer de Dividir; tool dedicada pendiente |
| 5 | Ordenar PDF | `ordenar` | Reordenar / drag & drop páginas |
| 6 | Escanea a PDF | `escanear` | Cámara / imágenes → PDF |

Checklist:

- [x] Unir PDF — landing `/herramientas/pdf/unir` + app `/usar` + proxy Next → py `/v1/pdf/merge` (con plan de páginas)
- [x] Dividir PDF — landing `/herramientas/pdf/dividir` + app `/usar` + proxy Next → py `/v1/pdf/divide`
- [ ] Eliminar páginas
- [ ] Extraer páginas
- [ ] Ordenar PDF
- [ ] Escanea a PDF

---

## D2. Optimizar PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | Comprimir PDF | `comprimir` | Básico client-side; niveles si aplica |
| 2 | Reparar PDF | `reparar` | Reconstrucción / limpieza básica |
| 3 | OCR PDF | `ocr` | Texto seleccionable; Tesseract WASM o worker |

Checklist:

- [ ] Comprimir PDF
- [ ] Reparar PDF
- [ ] OCR PDF

---

## D3. Convertir a PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | JPG a PDF | `jpg-a-pdf` | Incluye PNG/WebP si es trivial |
| 2 | WORD a PDF | `word-a-pdf` | Puede requerir conversión server/WASM |
| 3 | POWERPOINT a PDF | `powerpoint-a-pdf` | Idem |
| 4 | EXCEL a PDF | `excel-a-pdf` | Idem |
| 5 | HTML a PDF | `html-a-pdf` | Print / render client o worker |

Checklist:

- [ ] JPG a PDF
- [ ] WORD a PDF
- [ ] POWERPOINT a PDF
- [ ] EXCEL a PDF
- [ ] HTML a PDF

---

## D4. Convertir desde PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | PDF a JPG | `pdf-a-jpg` | Render páginas (pdf.js / canvas) |
| 2 | PDF a WORD | `pdf-a-word` | Complejidad alta; evaluar stack |
| 3 | PDF a POWERPOINT | `pdf-a-powerpoint` | Idem |
| 4 | PDF a EXCEL | `pdf-a-excel` | Tablas; calidad variable |
| 5 | PDF a PDF/A | `pdf-a-pdfa` | Cumplimiento archivo |

Checklist:

- [ ] PDF a JPG
- [ ] PDF a WORD
- [ ] PDF a POWERPOINT
- [ ] PDF a EXCEL
- [ ] PDF a PDF/A

---

## D5. Editar PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | Rotar PDF | `rotar` | 90° / 180° / 270° |
| 2 | Insertar números de página | `numeros-pagina` | Posición / formato |
| 3 | Insertar marca de agua | `marca-agua` | Texto o imagen |
| 4 | Recortar PDF | `recortar` | Crop por página / lote |
| 5 | Editar PDF | `editar` | Texto/anotaciones básicas (scope acotado) |
| 6 | Formularios PDF | `formularios` | Rellenar / aplanar campos |

Checklist:

- [ ] Rotar PDF
- [ ] Insertar números de página
- [ ] Insertar marca de agua
- [ ] Recortar PDF
- [ ] Editar PDF
- [ ] Formularios PDF

---

## D6. Seguridad de PDF

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | Desbloquear PDF | `desbloquear` | Quitar contraseña (con clave conocida) |
| 2 | Proteger PDF | `proteger` | Contraseña / permisos |
| 3 | Firmar PDF | `firmar` | Firma imagen / dibujo (no certificado cualificado v1) |
| 4 | Censurar PDF | `censurar` | Redactar zonas (irreversible) |
| 5 | Comparar PDF | `comparar` | Diff visual o textual orientativo |

Checklist:

- [ ] Desbloquear PDF
- [ ] Proteger PDF
- [ ] Firmar PDF
- [ ] Censurar PDF
- [ ] Comparar PDF

---

## D7. PDF Intelligence

| # | Herramienta | Slug | Notas |
|---|-------------|------|-------|
| 1 | Resumir con IA | `resumir-ia` | Requiere API; no persistir archivo si es posible |
| 2 | Traducir PDF | `traducir` | Idem + límites de tamaño |
| 3 | PDF a Markdown | `pdf-a-markdown` | Extracción texto/estructura |

Checklist:

- [ ] Resumir con IA
- [ ] Traducir PDF
- [ ] PDF a Markdown

### Notas IA / privacidad

- [ ] Aviso si el archivo sale del navegador (API)
- [ ] Rate limit / tamaño máximo
- [ ] No guardar PDFs en BD

---

## Orden de entrega sugerido (dentro de Sprint D)

Implementar **en este orden de categorías** (D1 → D7). Dentro de cada categoría, seguir la tabla de arriba.

Prioridad técnica realista para primeros releases (sin romper el orden del catálogo en UI):

1. **D0 hub** + **D1 Unir** (primera usable) ✅
2. Resto de **D1** (dividir → escanear)
3. **D2** Comprimir → OCR
4. **D3** JPG a PDF primero; Office después
5. **D4** PDF a JPG primero; Office/PDF/A después
6. **D5** Rotar / números / marca de agua antes que editor completo
7. **D6** Proteger / desbloquear / firmar básica
8. **D7** Intelligence al final (depende de API)

**Esfuerzo orientativo del kit completo:** varias semanas (no un solo sprint de 2–3 días). Entregar por oleadas, marcando checkboxes.

---

# Sprint E — Cluster laboral (alta demanda PE)

> Cierra el circuito con sueldo neto / CTS / gratificación. Todo **client-side** + disclaimer MTPE.

## E1. Liquidación / vacaciones truncas

**Slug:** `liquidacion`  
**Demanda:** muy alta (renuncia, cese, fin de contrato)  
**Esfuerzo:** ~2–3 días  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/liquidacion`
- App: `/herramientas/liquidacion/usar`

### Funcionalidad

- [ ] Vacaciones truncas / pendientes
- [ ] CTS trunca (si aplica al cese)
- [ ] Gratificación trunca (si aplica)
- [ ] Resumen “total estimado a recibir”
- [ ] Cross-links a CTS / gratificación / sueldo neto
- [ ] Disclaimer: estimativo, no liquidación oficial del empleador

### SEO

`liquidación laboral Perú`, `calcular vacaciones truncas`, `liquidación por renuncia`, `beneficios sociales cese`

### Checklist entrega

- [ ] Landing + app + `HUB_TOOLS`
- [ ] FAQ (qué incluye / qué no; regímenes especiales fuera de alcance)
- [ ] `lib/pe/liquidacion.ts` + indicadores vigentes

---

## E2. Horas extras

**Slug:** `horas-extras`  
**Demanda:** alta  
**Esfuerzo:** ~1 día  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/horas-extras`
- App: `/herramientas/horas-extras/usar`

### Funcionalidad

- [ ] Extra diurna / nocturna / feriado (recargos MTPE vigentes documentados)
- [ ] Input: remuneración horaria o sueldo mensual → valor hora
- [ ] Total a pagar por N horas
- [ ] Disclaimer laboral orientativo

### SEO

`calcular horas extras Perú`, `hora extra 25% 35%`, `horas extras feriado`, `recargo nocturno`

---

## E3. Comparador AFP vs ONP

**Slug:** `afp-onp`  
**Demanda:** alta (decisión de sistema pensionario)  
**Esfuerzo:** ~1–2 días  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/afp-onp`
- App: `/herramientas/afp-onp/usar`

### Funcionalidad

- [ ] Comparar descuento mensual AFP (flujo/saldo) vs ONP 13%
- [ ] Reusar comisiones AFP de `lib/pe/sueldo-neto` / indicadores SBS
- [ ] Proyección simple a N años (orientativa)
- [ ] Disclaimer: no asesoría SBS / no recomienda AFP concreta

### SEO

`AFP o ONP`, `comparar AFP ONP`, `cuál me conviene AFP`, `descuento ONP 13%`

---

# Sprint F — SEO recurrente / estacional

## F1. Calendario tributario SUNAT

**Slug:** `calendario-sunat`  
**Demanda:** alta (mensual; mypes y contadores)  
**Esfuerzo:** ~1–1.5 días  
**Tipo:** client-side (tabla del año + filtro por dígito RUC)

### Rutas

- Landing: `/herramientas/calendario-sunat`
- App: `/herramientas/calendario-sunat/usar`

### Funcionalidad

- [ ] Vencimientos IGV-Renta / PDT según último dígito RUC
- [ ] Año vigente editable (actualizar cada ejercicio)
- [ ] “Próximo vencimiento” destacado
- [ ] Fuente: calendario oficial SUNAT del año (documentar URL)
- [ ] Disclaimer: verificar siempre en SUNAT; feriados pueden mover fechas

### SEO

`calendario SUNAT 2026`, `vencimiento IGV dígito RUC`, `cuándo declaro SUNAT`, `cronograma tributario`

---

## F2. Utilidades laborales

**Slug:** `utilidades`  
**Demanda:** alta estacional (mar–abr)  
**Esfuerzo:** ~1–2 días  
**Tipo:** client-side

### Rutas

- Landing: `/herramientas/utilidades`
- App: `/herramientas/utilidades/usar`

### Funcionalidad

- [ ] Estimación según días laborados / remuneración
- [ ] Nota por sector (mínimo: comercio / industrial genérico o input % empresa)
- [ ] Disclaimer fuerte: el % y tope los define la empresa / ley; FactoTips no reemplaza liquidación

### SEO

`calcular utilidades Perú`, `utilidades laborales 2026`, `cuánto me toca de utilidades`

---

# Sprint G — Nice-to-have (después de E/F)

## G1. Tipo de cambio soles ↔ USD

**Slug:** `tipo-cambio`  
**Demanda:** media–alta  
**Esfuerzo:** ~0.5–1 día (+ API si no es manual)  
**Tipo:** client-side con tasa referencial documentada **o** API pública BCRP/SBS si estable

- [ ] Compra / venta / promedio (etiquetar claramente)
- [ ] Disclaimer: referencial, no tasa bancaria garantizada

## G2. Multas en UIT

**Slug:** `multas-uit`  
**Demanda:** media (trámites, SUNAFIL/SUNAT)  
**Esfuerzo:** ~0.5 día  
**Tipo:** client-side (reusa conversor UIT)

- [ ] N UIT → soles (tabla rápida de multas frecuentes opcional)
- [ ] Cross-link a `/herramientas/uit`

## G3. TEA / TCEA (préstamos)

**Slug:** `tea-tcea`  
**Demanda:** media  
**Esfuerzo:** ~1 día  
**Tipo:** client-side

- [ ] Estimar cuota / costo total orientativo
- [ ] Disclaimer SBS: no reemplaza la TCEA contractual del banco

---

# Explicitamente fuera de alcance

| Idea | Motivo |
|------|--------|
| **Consulta RUC** | SUNAT ya la ofrece al público (SOL / Emprender SUNAT / gob.pe). No competir ni scrapear. |
| Emisión de comprobantes / Clave SOL | Trámite oficial; fuera de producto |
| Liquidación “boleta-grade” perfecta | Regímenes especiales y casos judiciales → solo estimativo |

---

## Plantilla de archivos por herramienta

```
app/herramientas/{slug}/page.tsx              # Landing SEO
app/herramientas/{slug}/usar/page.tsx         # App
components/marketing/{slug}-landing.tsx
components/{slug}/{slug}-tool.tsx
lib/pe/{slug}.ts                              # lógica (si aplica)
lib/seo/tools.ts                              # TOOL_ROUTES + TOOL_SEO + JSON-LD
lib/hub-tools.ts                              # catálogo hub / header / footer / related
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
| 2026-07-17 | C1 Calculadora CTS entregada (`/herramientas/cts` + `/usar`). |
| 2026-07-17 | C2 Calculadora gratificación entregada (`/herramientas/gratificacion` + `/usar`). |
| 2026-07-23 | Roadmap ampliado: sprints E–G (liquidación, horas extras, AFP/ONP, calendario SUNAT, utilidades, etc.). **Consulta RUC descartada** (ya pública en SUNAT). |
| 2026-07-23 | **Sprint D ampliado:** Kit PDF con 7 categorías en orden de producto (Ordenar → Optimizar → Convertir a PDF → Convertir desde PDF → Editar → Seguridad → Intelligence). Hub `/herramientas/pdf` + app por herramienta. |
| 2026-07-23 | **D0 Hub PDF entregado:** `/herramientas/pdf` con catálogo completo, badges disponible/próximamente/siguiente (Unir), FAQ privacidad, SEO + hub FactoTips. |
| 2026-07-23 | **D1 Unir PDF:** proxy `POST /api/pdf/merge` (+ `plan` páginas/rotación) → factotips-py `/v1/pdf/merge`; landing + app. Env `FACTOTIPS_PY_URL` / `FACTOTIPS_PY_API_KEY`. |
| 2026-07-23 | **D1 Dividir PDF:** landing + app Separar/Extraer multi-archivo; proxy `POST /api/pdf/divide` → factotips-py `/v1/pdf/divide` (plan JSON + pypdf). |

---

## Próximo paso inmediato

**Sprint D1 — Eliminar páginas** (`/herramientas/pdf/eliminar-paginas`).  
Seguir: extraer (si dedicada) → ordenar → escanear → D2 Optimizar…  
Después del kit (o en paralelo por oleadas): **E1 Liquidación / vacaciones** → E2 Horas extras → E3 AFP vs ONP.
