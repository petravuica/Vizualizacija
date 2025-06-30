function parseMoney(value) {
  if (!value || value === "-" || value === "NaN") return 0;
  value = value.replace("€", "").trim();
  let multiplier = 1;
  if (value.includes("M")) {
    multiplier = 1_000_000;
    value = value.replace("M", "");
  } else if (value.includes("K")) {
    multiplier = 1_000;
    value = value.replace("K", "");
  }
  const numeric = parseFloat(value);
  return isNaN(numeric) ? 0 : numeric * multiplier;
}

// GLOBALNI render
window.render = function(players) {
  drawBarChart(players);
  drawBoxPlot(players);
  drawScatterPlot(players);
  drawDonutChart(players);
  drawRadarChart(players);
};

// GLOBALNI update
window.update = function() {
  const selectedPosition = d3.select("#positionFilter").property("value");
  const selectedLeague = d3.select("#leagueFilter").property("value");
  const maxAge = +d3.select("#ageFilter").property("value");
  const maxValue = +d3.select("#valueFilter").property("value");
  const minPotential = +d3.select("#potentialFilter").property("value");

  const filtered = window.allData.filter(d =>
    (selectedPosition === "SVE" || d.Position === selectedPosition) &&
    (selectedLeague === "SVE" || d.League === selectedLeague) &&
    d.Age <= maxAge &&
    d.Value <= maxValue &&
    d.Potential >= minPotential
  );

  window.render(filtered);
};

d3.csv("all_fifa_players.csv").then(data => {
  // Globalno spremi podatke
  window.allData = data;

  data.forEach(d => {
    d.Value = parseMoney(d.Value);
    d.Wage = parseMoney(d.Wage);
    d["Release Clause"] = parseMoney(d["Release Clause"]);
    d.Age = +d.Age || 0;
    d.Overall = +d["Overall Score"] || 0;
    d.Potential = +d["Potential Score"] || 0;
    d.Position = d.Position?.split(",")[0];
  });

  // Populate dropdowns
  const positions = Array.from(new Set(data.map(d => d.Position))).sort();
  const leagues = Array.from(new Set(data.map(d => d.League))).sort();

  d3.select("#positionFilter")
    .selectAll("option")
    .data(["SVE", ...positions])
    .enter()
    .append("option")
    .text(d => d);

  d3.select("#leagueFilter")
    .selectAll("option")
    .data(["SVE", ...leagues])
    .enter()
    .append("option")
    .text(d => d);

  d3.select("#ageFilter").on("input", function() {
    d3.select("#ageValue").text(this.value);
    window.update();
  });

  d3.select("#valueFilter").on("input", function() {
    d3.select("#valueValue").text(formatMoney(this.value));
    window.update();
  });

  d3.select("#potentialFilter").on("input", function() {
    d3.select("#potentialValue").text(this.value);
    window.update();
  });

  d3.selectAll("select").on("change", window.update);

  function formatMoney(val) {
    val = +val;
    return val >= 1_000_000 ? (val / 1_000_000).toFixed(1) + "M" :
           val >= 1_000 ? (val / 1_000).toFixed(1) + "K" :
           val;
  }

  // Prvi prikaz
  window.update();
  drawWorldMap(data);
});
