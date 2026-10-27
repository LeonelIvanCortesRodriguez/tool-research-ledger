<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/hero-dark.png">
  <img src="docs/brand/hero-light.png" width="1280" alt="Tool Research Ledger. Encuentra una herramienta para el trabajo y ve cuánta prueba la respalda. Para líderes técnicos que eligen herramientas de código abierto: 99 herramientas en 13 familias de trabajo. Una ficha de OCRmyPDF, la opción principal para inteligencia documental, muestra cuatro canales separados: decisión PILOT con un círculo a medio llenar, hacer un piloto controlado; evidencia E0 en una escalera de seis pasos con uno lleno, fuente revisada; riesgo MEDIUM con dos de cuatro barras llenas; y ajuste, la mejor opción para generar PDF con texto buscable. La siguiente prueba es una tarea acotada con su resultado, verificaciones, limitaciones y plan de reversión.">
</picture>

**[Abrir el ledger en vivo](https://leonelivancortesrodriguez.github.io/tool-research-ledger/)** · [Ejecutarlo localmente](#ejecutar-y-verificar) · [Modelo de evidencia](docs/EVIDENCE_MODEL.md) (en inglés) · [English](README.md)

Para líderes técnicos que eligen herramientas de código abierto: describes un trabajo y ves qué herramientas sirven para él, qué se ha verificado de cada una y qué puedes hacer con ella a continuación. Las 99 entradas solo tienen revisión de fuente (E0), y la interfaz lo dice desde la primera pantalla.

La interfaz y la documentación técnica están en inglés.

## El problema

Las listas de repositorios ordenan las herramientas por popularidad. No dicen si una herramienta sirve para un trabajo concreto, qué ha verificado alguien en realidad ni qué podría frenar su adopción. Los equipos instalan con base en un README y descubren el riesgo después.

## Una decisión de principio a fin

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="docs/brand/demo-poster.png">
  <img src="docs/brand/demo.gif" width="960" alt="Grabación con subtítulos del ledger en vivo: se escribe el trabajo 'convertir PDF escaneados en datos confiables' en el buscador; aparece una lista corta con OCRmyPDF como opción principal, la acción permitida y la prueba que todavía necesita; dos candidatas se comparan lado a lado en decisión, evidencia y riesgo; y el detalle de evidencia muestra E0 como techo actual, con todos los niveles superiores aún sin alcanzar.">
</picture>

Un trabajo descrito en lenguaje común se convierte en tres candidatas explicadas. Dos se comparan en los mismos canales, y la evidencia de la principal muestra exactamente qué tendría que conservar una prueba. [Versión MP4](docs/brand/demo.mp4).

## Cómo se toma una decisión

`necesidad del proyecto → candidatas filtradas → evidencia → decisión`

1. **Necesidad del proyecto.** Escribe el trabajo con tus palabras o elige uno de ocho trabajos comunes.
2. **Candidatas filtradas.** El ledger reduce 99 herramientas de 13 familias a una opción principal y dos alternativas. Cada alternativa dice por qué no es la principal y qué la haría avanzar. Cualquier par se puede comparar.
3. **Evidencia.** Cada entrada muestra su nivel en una escalera de seis pasos, qué lo produjo y qué prueba necesita el siguiente nivel.
4. **Decisión.** La siguiente acción permitida, su fundamento, sus controles y la siguiente prueba.

Ajuste, evidencia, decisión y riesgo responden cuatro preguntas distintas y nunca se combinan en una sola calificación:

| Canal | Pregunta | Cómo se muestra |
| --- | --- | --- |
| Ajuste | ¿Qué tanto corresponde la herramienta al trabajo? | Una letra editorial (A a D) con el trabajo al que se adapta; es un juicio, nunca se presenta como medición ni se suma a una calificación |
| Evidencia | ¿Qué se ha verificado? | Seis pasos ascendentes, llenos hasta el nivel alcanzado, con el código E y una etiqueta simple |
| Decisión | ¿Qué podemos hacer ahora? | Una forma más un verbo: ● IMPLEMENT, ◐ PILOT, ⊖ CONDITIONAL, ○ REFERENCE, ○ punteado WATCH, ■ HOLD, ✕ REJECT |
| Riesgo | ¿Qué todavía puede frenar la adopción? | De una a cuatro barras más la palabra; HIGH y CRITICAL en rojo de alto |

Solo dos colores tienen significado: el color baya marca tu acción y tu selección, y el rojo de alto marca todo lo que puede bloquear la adopción.

## Resultado y evidencia

| Estado | Qué cubre | Dónde verificarlo |
| --- | --- | --- |
| Implementado y probado | Búsqueda, trabajos guiados, mapa de capacidades, filtros y orden, comparación, detalle de evidencia, estado compartible en la URL, cambio de tema, foco con teclado, movimiento reducido | `npm run test:browser` (escritorio y móvil de 390 px) |
| Implementado y probado | Integridad del catálogo: IDs y URLs de repositorio únicos, la conciliación de 99 repositorios, relaciones válidas, copias JSON y JavaScript idénticas | `npm test`; `npm run test:mutation` demuestra que se rechazan una escala de evidencia rota y una fuente faltante |
| Fuente revisada | Las 99 entradas de terceros: 29 PILOT, 23 CONDITIONAL, 22 REFERENCE, 10 HOLD, 8 REJECT, 7 WATCH, 0 IMPLEMENT | [`data/catalog.json`](data/catalog.json), [registro del Lote I](docs/BATCH_2026-10-26-I.md) |
| Planeado | Pruebas de proyecto que conserven la tarea, la versión, la entrada, el resultado, las verificaciones y los límites. Solo una prueba conservada puede subir una entrada a E1 o más | [Modelo de evidencia](docs/EVIDENCE_MODEL.md) |
| No se afirma | Puntajes de benchmark, certificación de seguridad o beneficio operativo de cualquier herramienta listada | No hay evidencia en este repositorio |

## Vistas del producto

<img src="docs/brand/view-shortlist.png" width="1440" alt="Captura anotada de una lista corta para el trabajo de PDF escaneados: OCRmyPDF como opción principal con acción permitida PILOT, sello de evidencia E0, por qué va primero, el fundamento de la decisión, qué impide todavía tener confianza y qué prueba se necesita; PaddleOCR y Scribe OCR como alternativas, con la razón por la que no son la principal.">

<img src="docs/brand/view-compare.png" width="1440" alt="Captura anotada del diálogo de comparación con OCRmyPDF y PaddleOCR lado a lado: cada una muestra la misma escalera de evidencia E0, un glifo de decisión PILOT, su principal fortaleza y debilidad, sus barras y nivel de riesgo, y su siguiente acción.">

<img src="docs/brand/view-evidence.png" width="1440" alt="Captura anotada del detalle de evidencia de OCRmyPDF: las marcas E0, PILOT y riesgo MEDIUM, lo que permite la decisión y una pista de evidencia donde E0 es el techo actual y E1 a E5 aún no se alcanzan.">

<img src="docs/brand/view-map.png" width="1440" alt="Captura anotada del mapa de capacidades: cada familia de trabajo con su número de opciones, la opción principal, el glifo de decisión, la evidencia E0, el número de riesgos elevados en rojo y el siguiente paso de investigación.">

## El papel de Leonel y sus decisiones

**Problema elegido.** Que cada adopción de herramienta sea una decisión respaldada por evidencia que cualquiera pueda revisar.

**Papel.** Leonel definió el objetivo del producto, fijó los criterios de investigación y aceptación, curó los resúmenes de los repositorios y tomó la decisión final de cada registro. Agentes de programación ayudaron a implementar la interfaz, las pruebas, las reglas de evidencia y el paquete de publicación.

**Decisiones que le dan forma**

- *Sin calificación compuesta.* Un solo número oculta por qué una opción es fuerte y hace que una evidencia débil parezca precisa.
- *La evidencia es un techo.* Solo una prueba conservada sube un nivel. Influir en un diseño, instalar la herramienta o hacer un análisis estático lo deja donde está.
- *La decisión es un permiso.* Cada etiqueta dice qué se puede hacer ahora. Una herramienta puede ajustarse bien y aun así quedar en REFERENCE o HOLD.
- *Forma antes que color.* Cada estado se entiende sin color.
- *Contar desde el catálogo.* Cada número de la página y de estas imágenes se calcula desde `data/catalog.json` al mostrarse.

**Restricciones.** Sitio estático sin backend ni dependencias en tiempo de ejecución; solo investigación de repositorios públicos; las pruebas privadas y los reportes internos no pueden subir la evidencia pública.

**Resultados observados.** Pasan las verificaciones de integridad, mutación, contraste, redacción, navegador, privacidad y build. El catálogo concilia los 99 repositorios compartidos sin URLs duplicadas.

**Tecnologías.** HTML semántico, CSS con tokens OKLCH, JavaScript de navegador, Web Animations API, scripts de Node.js y Playwright Core para pruebas de desarrollo.

## Arquitectura y controles

`catalog.js` permite abrir el archivo directamente y `catalog.json` da a otras herramientas una copia legible por máquina; el verificador exige que ambos coincidan. El movimiento respeta la preferencia de movimiento reducido del usuario. Consulta [Modelo de evidencia](docs/EVIDENCE_MODEL.md), [Metodología](docs/METHODOLOGY.md) y [Decisión de ejemplo](docs/SAMPLE_DECISION.md). Lee [SECURITY.md](SECURITY.md), los [avisos de terceros](THIRD_PARTY_NOTICES.md) y la [revisión de licencias](docs/LICENSE_REVIEW.md).

## Limitaciones

Las entradas del catálogo apoyan decisiones; no son una certificación de seguridad. Todas las entradas públicas están en E0. El ajuste y la relevancia para un proyecto son evaluaciones editoriales, no puntajes de benchmark. Los enlaces y los datos de los repositorios pueden envejecer, y cada adopción sigue necesitando una revisión legal, de seguridad y operativa propia del proyecto.

## Ejecutar y verificar

Requisitos: Node.js 20+ y Chrome, Edge o un Chromium compatible con Playwright.

```powershell
npm ci
npm run start      # http://127.0.0.1:4173; index.html also works directly
npm run verify     # static, mutation, contrast, prose, browser, privacy, build
```

El build crea un ZIP y un inventario SHA-256 en `release/`, sin historial de Git, dependencias, resultados de pruebas ni archivos temporales de render. `npm run render` regenera las imágenes y el demo del README a partir del catálogo y la interfaz en vivo; necesita FFmpeg.

## Licencia

El código y la documentación originales se publican bajo la [Licencia MIT](LICENSE). Schibsted Grotesk se incluye bajo la SIL Open Font License. Los proyectos de terceros conservan sus propias licencias y marcas.
