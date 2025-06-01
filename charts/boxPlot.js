function drawBoxPlot(data) {
  const svg = d3.select("#boxPlot");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };

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
    .range([height - margin.bottom, margin.top]);

  svg.selectAll("g")
    .data(stats)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x(d.position)},0)`)
    .each(function(d) {
      const g = d3.select(this);
      g.append("line") // min-max line
        .attr("y1", y(d.min))
        .attr("y2", y(d.max))
        .attr("x1", x.bandwidth() / 2)
        .attr("x2", x.bandwidth() / 2)
        .attr("stroke", "black");

      g.append("rect") // box
        .attr("y", y(d.q3))
        .attr("height", y(d.q1) - y(d.q3))
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2");

      g.append("line") // median
        .attr("y1", y(d.median))
        .attr("y2", y(d.median))
        .attr("x1", 0)
        .attr("x2", x.bandwidth())
        .attr("stroke", "black");
    });

  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left},0)`);
}
