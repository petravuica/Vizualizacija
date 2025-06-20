function drawBoxPlot(data) {
  const svg = d3.select("#boxPlot");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };

  const tooltip = d3.select("#tooltip");

  const grouped = d3.groups(data.filter(d => d.Value > 0), d => d.Position);
  const stats = grouped.map(([key, values]) => {
    const sorted = values.map(d => d.Value).sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return { position: key, min, q1, median, q3, max };
  });

  const x = d3.scaleBand()
    .domain(stats.map(d => d.position))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(stats, d => d.max)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal(d3.schemeSet2)
    .domain(stats.map(d => d.position));

  const g = svg.append("g");

  const groups = g.selectAll(".box")
    .data(stats)
    .enter()
    .append("g")
    .attr("class", "box")
    .attr("transform", d => `translate(${x(d.position)},0)`);

  // Linija od min do max
  groups.append("line")
    .attr("x1", x.bandwidth() / 2)
    .attr("x2", x.bandwidth() / 2)
    .attr("y1", d => y(d.min))
    .attr("y2", d => y(d.max))
    .attr("stroke", "#333")
    .attr("stroke-width", 1.5);

  // Box
  groups.append("rect")
    .attr("x", 0)
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.q3))
    .attr("height", d => y(d.q1) - y(d.q3))
    .attr("fill", d => color(d.position))
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 1);
      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.position}</strong><br>
           Min: €${d.min.toLocaleString()}<br>
           Q1: €${d.q1.toLocaleString()}<br>
           Median: €${d.median.toLocaleString()}<br>
           Q3: €${d.q3.toLocaleString()}<br>
           Max: €${d.max.toLocaleString()}`
        );
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 0.7);
      tooltip.style("display", "none");
    });

  // Medijan linija
  groups.append("line")
    .attr("x1", 0)
    .attr("x2", x.bandwidth())
    .attr("y1", d => y(d.median))
    .attr("y2", d => y(d.median))
    .attr("stroke", "#000")
    .attr("stroke-width", 2);

  // Osi
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d => `€${d / 1_000_000}M`));
}
