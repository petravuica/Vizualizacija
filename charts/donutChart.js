function drawDonutChart(data) {
  const svg = d3.select("#donutChart");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Broj igrača po poziciji
  const positionCounts = d3.rollup(
    data,
    v => v.length,
    d => d.Position
  );

  const pie = d3.pie()
    .sort(null)
    .value(d => d[1]);

  const arc = d3.arc()
    .innerRadius(radius * 0.5) // donut!
    .outerRadius(radius - 10);

  const arcs = g.selectAll(".arc")
    .data(pie(Array.from(positionCounts)))
    .enter().append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data[0]))
    .transition()
    .duration(1000)
    .attrTween("d", function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return t => arc(i(t));
    });

  // Dodaj oznake (legende)
  arcs.append("title")
    .text(d => `${d.data[0]}: ${d.data[1]} igrača`);
}
