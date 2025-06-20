function drawScatterPlot(data) {
  const svg = d3.select("#scatterPlot");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const filtered = data.filter(d => d.Overall > 0 && d.Value > 0 && d.Position);

  const x = d3.scaleLinear()
    .domain([d3.min(filtered, d => d.Value), d3.max(filtered, d => d.Value)])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([d3.min(filtered, d => d.Overall), d3.max(filtered, d => d.Overall)])
    .range([height - margin.bottom, margin.top]);

  const tooltip = d3.select("#tooltip");

  // Boje po pozicijama
  const positions = Array.from(new Set(filtered.map(d => d.Position)));
  const color = d3.scaleOrdinal()
    .domain(positions)
    .range(d3.schemeSet2);

  // Krugovi
  const circles = svg.selectAll("circle")
    .data(filtered)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Value))
    .attr("cy", d => y(d.Overall))
    .attr("r", 0)
    .attr("fill", d => color(d.Position))
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("r", 8)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

      tooltip
        .style("display", "block")
        .html(`<strong>${d.Player}</strong><br>
               Pozicija: ${d.Position}<br>
               Vrijednost: €${d.Value.toLocaleString()}<br>
               Overall: ${d.Overall}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition().duration(200)
        .attr("r", 4)
        .attr("stroke", "none");

      tooltip.style("display", "none");
    });

  // Animacija
  circles.transition()
    .duration(600)
    .attr("r", 4);

  // Os x
  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0,${height - margin.bottom})`);

  // Os y
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left},0)`);
}
