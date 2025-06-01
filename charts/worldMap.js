function getCountryFromLeague(leagueName) {
  const match = leagueName.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

function showLeaguesForCountry(country, data) {
  const leagues = data
    .filter(d => getCountryFromLeague(d.League) === country)
    .map(d => d.League);

  const uniqueLeagues = [...new Set(leagues)];

  const container = d3.select("#countryLeagues");
  container.html(""); // očisti prethodno

  if (uniqueLeagues.length === 0) {
    container.append("p").text(`Nema liga za ${country}.`);
  } else {
    container.append("h3").text(`Lige u zemlji: ${country}`);
    const ul = container.append("ul");
    uniqueLeagues.forEach(l => ul.append("li").text(l));
  }
}

function drawWorldMap(data) {
  const svg = d3.select("#worldMap");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.4]);

  const path = d3.geoPath().projection(projection);

  const g = svg.append("g").attr("id", "mapGroup");

  const playersByCountry = d3.rollup(
    data,
    v => v.length,
    d => getCountryFromLeague(d.League)
  );

  const color = d3.scaleSequential()
    .domain([0, d3.max(Array.from(playersByCountry.values()))])
    .interpolator(d3.interpolateBlues);

  d3.json("world_countries.json").then(worldData => {
    g.selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const country = d.properties.name;
        const val = playersByCountry.get(country);
        return val ? color(val) : "#eee";
      })
      .attr("stroke", "#ccc")
      .on("click", function (event, d) {
        const country = d.properties.name;
        showLeaguesForCountry(country, data);
        zoomToCountry(d, path);

        setTimeout(() => {
          resetZoom();
        }, 4000);
      })
      .append("title")
      .text(d => {
        const country = d.properties.name;
        const val = playersByCountry.get(country);
        return `${country}: ${val || 0} igrača`;
      });
  });
}

function zoomToCountry(d, path) {
  const svg = d3.select("#worldMap");
  const g = svg.select("#mapGroup");

  const bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / 800, dy / 500))),
    translate = [400 - scale * x, 250 - scale * y];

  g.transition()
    .duration(750)
    .attr("transform", `translate(${translate}) scale(${scale})`);
}
function resetZoom() {
  d3.select("#mapGroup")
    .transition()
    .duration(1000)
    .attr("transform", `translate(0,0) scale(1)`);
}

