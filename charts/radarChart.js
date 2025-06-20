function drawRadarChart(data) {
  const svg = d3.select("#radarChart");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2 - 40;

  const attributes = [
    "Pace/Diving",
    "Shooting/Handling",
    "Passing/Kicking",
    "Dribbling/Reflexes",
    "Defending/Pace",
    "Physical/Positioning"
  ];

  // Dinamički uzmi poziciju ako postoji selektor
  let position = "ST";
  const selectedPosition = d3.select("#positionFilter").property("value");
  if (selectedPosition && selectedPosition !== "SVE") {
    position = selectedPosition;
  }

  const positionPlayers = data.filter(d => d.Position === position);

  const avgStats = {};
  attributes.forEach(attr => {
    const vals = positionPlayers.map(d => +d[attr] || 0);
    avgStats[attr] = d3.mean(vals);
  });

  const angleSlice = (2 * Math.PI) / attributes.length;
  const rScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(avgStats))])
    .range([0, radius]);

  const colorScale = d3.scaleOrdinal()
    .domain(["GK", "ST", "CM", "CB", "LM", "RM", "CAM", "CDM", "LB", "RB"])
    .range(["#0077b6", "#e63946", "#f4a261", "#2a9d8f", "#a8dadc", "#6a4c93", "#264653", "#ffb703", "#8ecae6", "#219ebc"]);

  const fillColor = colorScale(position);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Axes
  attributes.forEach((attr, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = rScale(rScale.domain()[1]) * Math.cos(angle);
    const y = rScale(rScale.domain()[1]) * Math.sin(angle);
    g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#ccc");

    g.append("text")
      .attr("x", x * 1.1)
      .attr("y", y * 1.1)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text(attr)
      .on("mouseover", function () {
        d3.select(this).style("font-weight", "bold").style("fill", "#000");
      })
      .on("mouseout", function () {
        d3.select(this).style("font-weight", "normal").style("fill", null);
      });
  });

  const line = d3.lineRadial()
    .radius((d, i) => rScale(d.value))
    .angle((d, i) => i * angleSlice);

  const dataPoints = attributes.map(attr => ({ axis: attr, value: avgStats[attr] }));

  // Draw filled area
  g.append("path")
    .datum(dataPoints)
    .attr("d", line)
    .attr("fill", fillColor)
    .attr("fill-opacity", 0.4)
    .attr("stroke", d3.color(fillColor).darker())
    .attr("stroke-width", 2);

  // Add dots
// Tooltip selektor
const tooltip = d3.select("#tooltip");

g.selectAll(".dot")
  .data(dataPoints)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", (d, i) => rScale(d.value) * Math.cos(i * angleSlice - Math.PI / 2))
  .attr("cy", (d, i) => rScale(d.value) * Math.sin(i * angleSlice - Math.PI / 2))
  .attr("r", 4)
  .attr("fill", d3.color(fillColor).darker())
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .on("mouseover", function(event, d) {
    tooltip
      .style("display", "block")
      .html(`<strong>${d.axis}</strong>: ${d.value.toFixed(1)}`);
  })
  .on("mousemove", function(event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function() {
    tooltip.style("display", "none");
  });


  // Legenda (ispod SVG-a)
  d3.select("#radarChart")
    .append("title")
    .text(`Pozicija: ${position}`);
 // Prikaz pozicije ispod grafa
d3.select("#radarPositionLabel").text(`Pozicija: ${position}`);

}
