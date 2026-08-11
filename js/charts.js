// ===============================
//  charts.js — Graphiques SVG minimalistes
// ===============================
// Pourquoi du SVG écrit à la main plutôt qu'une bibliothèque : la page
// d'analyse doit rester utilisable hors ligne et le projet n'embarque aucune
// dépendance runtime (voir CLAUDE.md §1). Un import CDN casserait les deux.
//
// Deux conséquences sur le style de ce module :
// - les couleurs ne sont jamais écrites en dur, elles pointent sur les tokens
//   de thème (var(--chart-1)…) : le thème sombre est donc gratuit ;
// - tout est dessiné dans un viewBox à dimensions fixes, la mise à l'échelle
//   est laissée au CSS (width:100%). Aucun recalcul au redimensionnement.

const SVG_NS = "http://www.w3.org/2000/svg";

// Repère de dessin commun à tous les graphiques (unités du viewBox).
const VIEW = { width: 720, height: 380 };

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)"
];

function el(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) continue;
    node.setAttribute(key, String(value));
  }
  return node;
}

function text(content, attributes = {}) {
  const node = el("text", attributes);
  node.textContent = content;
  return node;
}

// Infobulle native du navigateur : gratuite, lisible au survol, et reprise par
// les lecteurs d'écran comme nom accessible de la forme.
function withTitle(node, label) {
  const title = el("title");
  title.textContent = label;
  node.appendChild(title);
  return node;
}

function createSvg(ariaLabel) {
  const svg = el("svg", {
    viewBox: `0 0 ${VIEW.width} ${VIEW.height}`,
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
    "aria-label": ariaLabel,
    class: "chart-svg"
  });
  return svg;
}

function mount(container, svg, emptyMessage) {
  container.textContent = "";
  if (!svg) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = emptyMessage || "Aucune donnée à afficher pour cette sélection.";
    container.appendChild(empty);
    return null;
  }
  container.appendChild(svg);
  return svg;
}

// Bornes « rondes » : un axe qui s'arrête à 147 500 se lit moins bien qu'un axe
// qui s'arrête à 150 000.
function niceCeiling(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function truncate(value, maxLength) {
  const string = String(value ?? "");
  return string.length > maxLength ? `${string.slice(0, maxLength - 1)}…` : string;
}

/**
 * Histogramme vertical (créations par période, effectifs par tranche…).
 * @param {HTMLElement} container
 * @param {{data: Array<{label:string,value:number,title?:string}>, ariaLabel:string, formatValue?:(v:number)=>string, axisLabel?:string, colorIndex?:number, emptyMessage?:string}} options
 */
export function renderBarChart(container, options) {
  const { data = [], ariaLabel = "Histogramme", formatValue, axisLabel, colorIndex = 0 } = options;
  if (!data.length) return mount(container, null, options.emptyMessage);

  const format = formatValue || ((value) => String(value));
  const margin = { top: 18, right: 16, bottom: 46, left: 58 };
  const plotWidth = VIEW.width - margin.left - margin.right;
  const plotHeight = VIEW.height - margin.top - margin.bottom;
  const maxValue = niceCeiling(Math.max(...data.map((item) => item.value)));
  const bandWidth = plotWidth / data.length;
  const barWidth = Math.max(2, bandWidth * 0.72);

  const svg = createSvg(ariaLabel);
  const plot = el("g", { transform: `translate(${margin.left},${margin.top})` });

  // Grille horizontale + graduations.
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue / 4) * i;
    const y = plotHeight - (value / maxValue) * plotHeight;
    plot.appendChild(el("line", { x1: 0, y1: y, x2: plotWidth, y2: y, class: "chart-grid" }));
    plot.appendChild(
      text(format(value), { x: -10, y: y + 4, "text-anchor": "end", class: "chart-tick" })
    );
  }

  // Une étiquette d'abscisse sur n, sinon elles se chevauchent.
  const labelStep = Math.max(1, Math.ceil(data.length / 12));

  data.forEach((item, index) => {
    const height = maxValue ? (item.value / maxValue) * plotHeight : 0;
    const x = index * bandWidth + (bandWidth - barWidth) / 2;
    const bar = el("rect", {
      x,
      y: plotHeight - height,
      width: barWidth,
      height: Math.max(item.value > 0 ? 1 : 0, height),
      rx: 2,
      fill: SERIES_COLORS[colorIndex % SERIES_COLORS.length],
      class: "chart-bar"
    });
    plot.appendChild(withTitle(bar, item.title || `${item.label} : ${format(item.value)}`));

    if (index % labelStep === 0) {
      plot.appendChild(
        text(item.label, {
          x: index * bandWidth + bandWidth / 2,
          y: plotHeight + 20,
          "text-anchor": "middle",
          class: "chart-tick"
        })
      );
    }
  });

  plot.appendChild(
    el("line", { x1: 0, y1: plotHeight, x2: plotWidth, y2: plotHeight, class: "chart-axis" })
  );

  if (axisLabel) {
    plot.appendChild(
      text(axisLabel, {
        x: plotWidth / 2,
        y: plotHeight + 40,
        "text-anchor": "middle",
        class: "chart-axis-label"
      })
    );
  }

  svg.appendChild(plot);
  return mount(container, svg);
}

/**
 * Barres horizontales — le format qui convient aux classements dont les
 * libellés sont longs (top des recettes).
 * @param {HTMLElement} container
 * @param {{data: Array<{label:string,value:number,title?:string}>, ariaLabel:string, formatValue?:(v:number)=>string, colorIndex?:number, emptyMessage?:string}} options
 */
export function renderHorizontalBarChart(container, options) {
  const { data = [], ariaLabel = "Classement", formatValue, colorIndex = 1 } = options;
  if (!data.length) return mount(container, null, options.emptyMessage);

  const format = formatValue || ((value) => String(value));
  const margin = { top: 12, right: 104, bottom: 12, left: 196 };
  const rowHeight = Math.min(30, (VIEW.height - margin.top - margin.bottom) / data.length);
  const height = margin.top + margin.bottom + rowHeight * data.length;
  const plotWidth = VIEW.width - margin.left - margin.right;
  const maxValue = niceCeiling(Math.max(...data.map((item) => item.value)));

  const svg = createSvg(ariaLabel);
  // Ce graphique-ci s'étire en hauteur avec le nombre de lignes.
  svg.setAttribute("viewBox", `0 0 ${VIEW.width} ${height}`);

  const plot = el("g", { transform: `translate(${margin.left},${margin.top})` });

  data.forEach((item, index) => {
    const y = index * rowHeight;
    const barHeight = Math.max(6, rowHeight * 0.66);
    const width = maxValue ? Math.max(1, (item.value / maxValue) * plotWidth) : 0;

    plot.appendChild(
      text(truncate(item.label, 32), {
        x: -10,
        y: y + rowHeight / 2 + 4,
        "text-anchor": "end",
        class: "chart-tick"
      })
    );

    const bar = el("rect", {
      x: 0,
      y: y + (rowHeight - barHeight) / 2,
      width,
      height: barHeight,
      rx: 3,
      fill: SERIES_COLORS[colorIndex % SERIES_COLORS.length],
      class: "chart-bar"
    });
    plot.appendChild(withTitle(bar, item.title || `${item.label} : ${format(item.value)}`));

    plot.appendChild(
      text(format(item.value), {
        x: width + 8,
        y: y + rowHeight / 2 + 4,
        class: "chart-value"
      })
    );
  });

  svg.appendChild(plot);
  return mount(container, svg);
}

/**
 * Courbe de concentration (Lorenz) : part cumulée des recettes détenue par la
 * fraction cumulée des prélèvements, comparée à la diagonale d'égalité.
 * @param {HTMLElement} container
 * @param {{points: Array<{x:number,y:number}>, ariaLabel:string, emptyMessage?:string}} options
 */
export function renderLorenzChart(container, options) {
  const { points = [], ariaLabel = "Courbe de concentration" } = options;
  if (points.length < 2) return mount(container, null, options.emptyMessage);

  const margin = { top: 18, right: 20, bottom: 46, left: 58 };
  const plotWidth = VIEW.width - margin.left - margin.right;
  const plotHeight = VIEW.height - margin.top - margin.bottom;
  const percent = (value) => `${Math.round(value * 100)} %`;

  const toX = (x) => x * plotWidth;
  const toY = (y) => plotHeight - y * plotHeight;

  const svg = createSvg(ariaLabel);
  const plot = el("g", { transform: `translate(${margin.left},${margin.top})` });

  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4;
    const y = toY(ratio);
    plot.appendChild(el("line", { x1: 0, y1: y, x2: plotWidth, y2: y, class: "chart-grid" }));
    plot.appendChild(
      text(percent(ratio), { x: -10, y: y + 4, "text-anchor": "end", class: "chart-tick" })
    );
    plot.appendChild(
      text(percent(ratio), {
        x: toX(ratio),
        y: plotHeight + 20,
        "text-anchor": "middle",
        class: "chart-tick"
      })
    );
  }

  // Diagonale : ce que serait une répartition parfaitement égale.
  plot.appendChild(
    el("line", {
      x1: 0,
      y1: plotHeight,
      x2: plotWidth,
      y2: 0,
      class: "chart-reference"
    })
  );

  const path = points.map((point) => `${toX(point.x)},${toY(point.y)}`).join(" ");

  plot.appendChild(
    el("polygon", {
      points: `0,${plotHeight} ${path} ${plotWidth},${plotHeight}`,
      class: "chart-area",
      fill: SERIES_COLORS[2]
    })
  );
  plot.appendChild(
    el("polyline", { points: path, fill: "none", stroke: SERIES_COLORS[2], class: "chart-line" })
  );

  plot.appendChild(
    el("line", { x1: 0, y1: plotHeight, x2: plotWidth, y2: plotHeight, class: "chart-axis" })
  );
  plot.appendChild(
    text("Part cumulée des prélèvements (du plus petit au plus grand)", {
      x: plotWidth / 2,
      y: plotHeight + 40,
      "text-anchor": "middle",
      class: "chart-axis-label"
    })
  );

  svg.appendChild(plot);
  return mount(container, svg);
}

/**
 * Nuage de points année de création × recette, l'axe des recettes en échelle
 * logarithmique (elles s'étalent sur cinq ordres de grandeur).
 * @param {HTMLElement} container
 * @param {{points: Array<{x:number,y:number,label:string}>, ariaLabel:string, formatValue?:(v:number)=>string, emptyMessage?:string}} options
 */
export function renderScatterChart(container, options) {
  const { points = [], ariaLabel = "Nuage de points", formatValue } = options;
  const usable = points.filter((point) => Number.isFinite(point.x) && point.y > 0);
  if (!usable.length) return mount(container, null, options.emptyMessage);

  const format = formatValue || ((value) => String(value));
  const margin = { top: 18, right: 20, bottom: 46, left: 66 };
  const plotWidth = VIEW.width - margin.left - margin.right;
  const plotHeight = VIEW.height - margin.top - margin.bottom;

  const xValues = usable.map((point) => point.x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const spanX = Math.max(1, maxX - minX);

  const logs = usable.map((point) => Math.log10(point.y));
  const minLog = Math.floor(Math.min(...logs));
  const maxLog = Math.ceil(Math.max(...logs));
  const spanLog = Math.max(1, maxLog - minLog);

  const toX = (value) => ((value - minX) / spanX) * plotWidth;
  const toY = (value) => plotHeight - ((Math.log10(value) - minLog) / spanLog) * plotHeight;

  const svg = createSvg(ariaLabel);
  const plot = el("g", { transform: `translate(${margin.left},${margin.top})` });

  for (let exponent = minLog; exponent <= maxLog; exponent++) {
    const y = toY(10 ** exponent);
    plot.appendChild(el("line", { x1: 0, y1: y, x2: plotWidth, y2: y, class: "chart-grid" }));
    plot.appendChild(
      text(format(10 ** exponent), { x: -10, y: y + 4, "text-anchor": "end", class: "chart-tick" })
    );
  }

  const xTicks = 5;
  for (let i = 0; i <= xTicks; i++) {
    const value = Math.round(minX + (spanX * i) / xTicks);
    plot.appendChild(
      text(String(value), {
        x: toX(value),
        y: plotHeight + 20,
        "text-anchor": "middle",
        class: "chart-tick"
      })
    );
  }

  for (const point of usable) {
    const dot = el("circle", {
      cx: toX(point.x),
      cy: toY(point.y),
      r: 4,
      fill: SERIES_COLORS[0],
      class: "chart-dot"
    });
    plot.appendChild(withTitle(dot, `${point.label} — ${point.x} — ${format(point.y)}`));
  }

  plot.appendChild(
    el("line", { x1: 0, y1: plotHeight, x2: plotWidth, y2: plotHeight, class: "chart-axis" })
  );
  plot.appendChild(
    text("Année de création (recette en échelle logarithmique)", {
      x: plotWidth / 2,
      y: plotHeight + 40,
      "text-anchor": "middle",
      class: "chart-axis-label"
    })
  );

  svg.appendChild(plot);
  return mount(container, svg);
}
