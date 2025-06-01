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

d3.csv("all_fifa_players.csv").then(data => {
  data.forEach(d => {
    d.Value = parseMoney(d.Value);
    d.Wage = parseMoney(d.Wage);
    d["Release Clause"] = parseMoney(d["Release Clause"]);
    d.Age = +d.Age || 0;
    d.Overall = +d["Overall Score"] || 0;
    d.Potential = +d["Potential Score"] || 0;
    d.Position = d.Position?.split(",")[0]; // uzmi glavnu poziciju
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

  // Update range label values
  d3.select("#ageFilter").on("input", function() {
    d3.select("#ageValue").text(this.value);
    update();
  });

  d3.select("#valueFilter").on("input", function() {
    d3.select("#valueValue").text(formatMoney(this.value));
    update();
  });

  d3.select("#potentialFilter").on("input", function() {
    d3.select("#potentialValue").text(this.value);
    update();
  });

  // Dropdown change events
  d3.selectAll("select").on("change", update);

  function formatMoney(val) {
    val = +val;
    return val >= 1_000_000 ? (val / 1_000_000).toFixed(1) + "M" :
           val >= 1_000 ? (val / 1_000).toFixed(1) + "K" :
           val;
  }

  function update() {
    const selectedPosition = d3.select("#positionFilter").property("value");
    const selectedLeague = d3.select("#leagueFilter").property("value");
    const maxAge = +d3.select("#ageFilter").property("value");
    const maxValue = +d3.select("#valueFilter").property("value");
    const minPotential = +d3.select("#potentialFilter").property("value");

    const filtered = data.filter(d =>
      (selectedPosition === "SVE" || d.Position === selectedPosition) &&
      (selectedLeague === "SVE" || d.League === selectedLeague) &&
      d.Age <= maxAge &&
      d.Value <= maxValue &&
      d.Potential >= minPotential
    );

    render(filtered);
  }

  // Privremeno: prikaži listu imena kao test
  function render(players) {
    const container = d3.select("#viz");
    container.html(""); // očisti prethodni prikaz

    container.selectAll("div.player")
      .data(players.slice(0, 10)) // ograniči na 10 za test
      .enter()
      .append("div")
      .attr("class", "player")
      .style("padding", "10px")
      .style("margin", "5px")
      .style("background", "#fff")
      .style("border-radius", "8px")
      .style("box-shadow", "0 0 5px rgba(0,0,0,0.1)")
      .text(d => `${d.Player} (${d.Position}) – ${formatMoney(d.Value)} €`);
  }

  update(); // početni prikaz

  // Pozovi grafove nakon filtriranja
function render(players) {
  drawBarChart(players);
  drawBoxPlot(players);
  drawScatterPlot(players);
  drawDonutChart(players);
  drawWorldMap(data);


}

});
