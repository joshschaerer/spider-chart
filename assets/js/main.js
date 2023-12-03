/*----------------------------------------*
 * main.js
 *
 * Description: Plot a spider chart using d3.js
 * Author: Joshua Schärer
 * Date: 20.11.2023
 *----------------------------------------*/

/*---------- SETUP ----------*/
// Initialize all data
let features1 = [
  "Deutsch",
  "Englisch",
  "Französisch",
  "Mathematik",
  "Natur, Mensch, Gesellschaft",
  "Bildnerisches, Textiles und Technisches Gestalten",
  "Musik",
  "Bewegung und Sport",
];
let features2 = [
  "Pünktlichkeit",
  "Aktive Beteiligung",
  "Selbständigkeit",
  "Zuverlässigkeit",
  "Selbsteinschätzung",
  "Rückmeldungen nutzen",
];
let features3 = [
  "Angemessene Umgangsformen",
  "Hilfsbereitschaft und Respekt",
  "Zusammenarbeit",
  "Regeln einhalten",
  "Kommunikation",
];

// Add all data to all dropdowns
var dropdowns1 = document
  .getElementById("section-1")
  .querySelectorAll(".dd-features");
fillDropdown(dropdowns1, features1);

var dropdowns2 = document
  .getElementById("section-2")
  .querySelectorAll(".dd-features");
fillDropdown(dropdowns2, features2);

var dropdowns3 = document
  .getElementById("section-3")
  .querySelectorAll(".dd-features");
fillDropdown(dropdowns3, features3);

/**
 * Helper function to fill a dropdown with a list of features
 * @param {*} element The dropdown element
 * @param {*} features The list of features
 */
function fillDropdown(element, features) {
  for (var i = 0; i < features.length; i++) {
    var opt = features[i];

    element.forEach((dd, j) => {
      var el = document.createElement("option");
      if (i < 5 && i === j) el.selected = true;
      el.textContent = opt;
      el.value = opt;
      dd.append(el);
    });
  }
}

/*---------- PLOTTING ----------*/
// Drawing an empty canvas
function drawChart(id, title, selectedFeatures, selectedValues) {
  let width = 800;
  let height = 800;

  // Remove previous chart
  d3.select(id).select("svg").remove();

  // Initialize new chart
  let svg = d3
    .select(id)
    .append("svg")
    .attr("id", id)
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "32px")
    .text(title);

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
      label_coord: angleToCoordinate(angle, 11),
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

  // Draw a clip path for the labels to follow
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "label-clip-path")
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", radialScale(11));

  /**
   * Helper function to calculate the rotation angle based on the label's position
   * @param {*} coordinates The coordinates of the label
   * @returns The label's rotation
   */
  function calculateLabelRotationAngle(coordinates) {
    const angle = Math.atan2(
      coordinates.y - height / 2,
      coordinates.x - width / 2
    );
    return (angle * 180) / Math.PI + 90;
  }

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
        .attr(
          "transform",
          (d) =>
            `rotate(${calculateLabelRotationAngle(d.label_coord)}, ${
              d.label_coord.x
            }, ${d.label_coord.y})`
        )
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

  // Draw the polygon
  svg
    .selectAll("path")
    .data([selectedValues])
    .join((enter) =>
      enter
        .append("path")
        .datum((d) => getPathCoordinates(d))
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", (_, i) => "hsl(214, 89%, 52%)")
        .attr("fill", (_, i) => "hsl(214, 89%, 52%)")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
    );

  // Draw little circles
  svg
    .selectAll("circle.intersect")
    .data(getPathCoordinates(selectedValues))
    .join((enter) =>
      enter
        .append("circle")
        .attr("class", "intersect")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 5)
        .attr("fill", "hsl(214, 89%, 52%)")
    );
}

// Initialize all charts
const id1 = "#spider-chart";
const title1 = "Fachkompetenzen";
const sF1 = [
  features1[0],
  features1[1],
  features1[2],
  features1[3],
  features1[4],
];
const sV1 = [10, 10, 10, 10, 10];
drawChart(id1, title1, sF1, sV1);

const id2 = "#spider-chart-2";
const title2 = "Selbstkompetenzen";
const sF2 = [
  features2[0],
  features2[1],
  features2[2],
  features2[3],
  features2[4],
];
const sV2 = [10, 10, 10, 10, 10];
drawChart(id2, title2, sF2, sV2);

const id3 = "#spider-chart-3";
const title3 = "Sozialkompetenzen";
const sF3 = [
  features3[0],
  features3[1],
  features3[2],
  features3[3],
  features3[4],
];
const sV3 = [10, 10, 10, 10, 10];
drawChart(id3, title3, sF3, sV3);

/**
 * Update the first chart
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

  drawChart(id1, title1, selectedFeatures, selectedValues);
  downloadChart(id1, "Fachkompetenzen.svg");
});

/**
 * Update the second chart
 */
document.getElementById("chart-form-2").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(e.target);

  // Reset all data
  selectedFeatures = [];
  selectedValues = [];

  // Add new data
  for (i = 1; i <= 6; i++) {
    const feature = data.get(`dd-features-${i}`);
    if (feature != -1) {
      selectedFeatures.push(feature);
      selectedValues.push(data.get(`in-features-${i}`) / 10);
    }
  }

  drawChart(id2, title2, selectedFeatures, selectedValues);
  downloadChart(id2, "Selbstkompetenzen.svg");
});

/**
 * Update the third chart
 */
document.getElementById("chart-form-3").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(e.target);

  // Reset all data
  selectedFeatures = [];
  selectedValues = [];

  // Add new data
  for (i = 1; i <= 5; i++) {
    const feature = data.get(`dd-features-${i}`);
    if (feature != -1) {
      selectedFeatures.push(feature);
      selectedValues.push(data.get(`in-features-${i}`) / 10);
    }
  }

  drawChart(id3, title3, selectedFeatures, selectedValues);
  downloadChart(id2, "Sozialkompetenzen.svg");
});

/**
 * Helper function to download any svg chart
 * @param {*} id The id of the element
 */
function downloadChart(id, fileName) {
  // Get svg element
  const svg = document.getElementById(id);

  // Create a new blob containing the svg data
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: "image/svg+xml",
  });

  // Create a data URL for the svg blob
  const url = URL.createObjectURL(blob);

  // Set the link
  const btn = document.getElementById(`btn-${id}`);
  btn.href = url;
  btn.download = fileName;
}

downloadChart(id1, `${title1}.svg`);
downloadChart(id2, `${title2}.svg`);
downloadChart(id3, `${title3}.svg`);
