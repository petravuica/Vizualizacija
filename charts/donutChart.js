function drawDonutChart(data) {
  const svg = d3.select("#donutChart");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2;

  // ✅ Ljepše boje
  const color = d3.scaleOrdinal(d3.schemeSet2);

  // Tooltip kontejner (osiguraj da postoji <div id="tooltip"> u index.html)
  const tooltip = d3.select("#tooltip");

  // Glavna grupa
  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Grupiraj po poziciji
  const positionCounts = d3.rollup(data, v => v.length, d => d.Position);
  const pie = d3.pie().sort(null).value(d => d[1]);
  const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius - 10);
  const arcHover = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

  const arcs = g.selectAll(".arc")
    .data(pie(Array.from(positionCounts)))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Prstenasti graf sa animacijom
  arcs.append("path")
    .attr("fill", d => color(d.data[0]))
    .attr("cursor", "pointer")
    .transition()
    .duration(1000)
    .attrTween("d", function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return t => arc(i(t));
    });

  // Hover efekti i tooltip
  arcs.select("path")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("d", arcHover(d));

      tooltip
        .style("display", "block")
        .html(`<strong>${d.data[0]}</strong>: ${d.data[1]} igrača`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("d", arc(d));
      tooltip.style("display", "none");
    });
/*
  // Legenda
  const legend = svg.append("g")
    .attr("transform", `translate(10, 10)`);

  const keys = Array.from(positionCounts.keys());

  legend.selectAll("rect")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", width - 150)
    .attr("y", (d, i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => color(d));

  legend.selectAll("text")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", width - 130)
    .attr("y", (d, i) => i * 20 + 10)
    .text(d => d)
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");
    */
}
