/*----------------------------------------*
 * main.js
 *
 * Description: Plot a spider chart using d3.js
 * Author: Joshua Schärer
 * Date: 20.11.2023
 *----------------------------------------*/

/*---------- SETUP ----------*/
// Initialize all data
let features = [
  "Deutsch",
  "Mathematik",
  "Natur, Mensch, Gesellschaft",
  "Bildnerisches, Textiles und Technisches Gestalten",
  "Musik",
  "Bewegung und Sport",
  "Pünktlichkeit",
  "Aktive Beteiligung",
  "Selbständigkeit",
  "Zuverlässigkeit",
  "Selbsteinschätzung",
  "Rückmeldungen nutzen",
  "Angemessene Umgangsformen",
  "Hilfsbereitschaft und Respekt",
  "Zusammenarbeit",
  "Regeln einhalten",
  "Kommunikation",
];
let selectedFeatures = [
  "Deutsch",
  "Mathematik",
  "Natur, Mensch, Gesellschaft",
  "Bildnerisches, Textiles und Technisches Gestalten",
  "Musik",
];
let selectedValues = [10, 10, 10, 10, 10];

// Add all data to all dropdowns
var dropdowns = document.querySelectorAll(".dd-features");

for (var i = 0; i < features.length; i++) {
  var opt = features[i];

  dropdowns.forEach((dd, j) => {
    var el = document.createElement("option");
    if (i < 5 && i === j) el.selected = true;
    el.textContent = opt;
    el.value = opt;
    dd.append(el);
  });
}

/*---------- PLOTTING ----------*/
// Drawing an empty canvas
let id = "#spider-chart";
let width = 800;
let height = 800;

function drawChart() {
  // Remove previous chart
  d3.select(id).select("svg").remove();

  // Initialize new chart
  let svg = d3
    .select(id)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Drawing the grid lines
  let radialScale = d3.scaleLinear().domain([0, 10]).range([0, 250]);
  let ticks = [
    0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5,
    10,
  ];

  svg
    .selectAll("circle")
    .data(ticks)
    .join((enter) =>
      enter
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", (d) =>
          d % 2.5 === 0 ? "hsla(0, 0%, 2%, 0.2)" : "hsla(0, 0%, 2%, 0.05)"
        )
        .attr("stroke-width", (d) => (d % 2.5 === 0 ? 1.25 : 1))
        .attr("r", (d) => radialScale(d))
    );

  // Drawing the axes

  /**
   * Maps an angle and a value into svg coordinates
   * @param {*} angle The angle
   * @param {*} value The value
   * @returns The svg coordinates
   */
  function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return { x: width / 2 + x, y: height / 2 - y };
  }

  let featureData = selectedFeatures.map((f, i) => {
    let angle = Math.PI / 2 + (2 * Math.PI * i) / selectedFeatures.length;
    return {
      name: f,
      angle: angle,
      line_coord: angleToCoordinate(angle, 10),
      label_coord: angleToCoordinate(angle, 12),
    };
  });

  // Draw the line
  svg
    .selectAll("line")
    .data(featureData)
    .join((enter) =>
      enter
        .append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", (d) => d.line_coord.x)
        .attr("y2", (d) => d.line_coord.y)
        .attr("stroke", "hsla(0, 0%, 2%, 0.8)")
        .attr("stroke-width", 1.5)
    );

  // Draw the label
  svg
    .selectAll("label")
    .data(featureData)
    .join((enter) =>
      enter
        .append("text")
        .attr("x", (d) => d.label_coord.x)
        .attr("y", (d) => d.label_coord.y)
        .attr("text-anchor", "middle")
        .text((d) => d.name)
    );

  // Plotting the data
  let line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  /**
   * Calculate the coordinates for all values of the polygone
   * @param {*} value The value
   * @returns An array with all coordinates
   */
  function getPathCoordinates(value) {
    let coordinates = [];
    for (var i = 0; i < selectedFeatures.length; i++) {
      let angle = Math.PI / 2 + (2 * Math.PI * i) / selectedFeatures.length;
      coordinates.push(angleToCoordinate(angle, value[i]));
    }
    return coordinates;
  }

  // Draw the polygone
  svg
    .selectAll("path")
    .data([selectedValues])
    .join((enter) =>
      enter
        .append("path")
        .datum((d) => getPathCoordinates(d))
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", (_, i) => "darkorange")
        .attr("fill", (_, i) => "darkorange")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
    );
}

drawChart();

/**
 * Update the chart
 */
document.getElementById("chart-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(e.target);

  // Reset all data
  selectedFeatures = [];
  selectedValues = [];

  // Add new data
  for (i = 1; i <= 8; i++) {
    const feature = data.get(`dd-features-${i}`);
    if (feature != -1) {
      selectedFeatures.push(feature);
      selectedValues.push(data.get(`in-features-${i}`) / 10);
    }
  }

  drawChart();
});
