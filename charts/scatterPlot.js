function drawScatterPlot(data) {
  const svg = d3.select("#scatterPlot");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const filtered = data.filter(d => d.Overall > 0 && d.Value > 0);

  const x = d3.scaleLinear()
    .domain([d3.min(filtered, d => d.Value), d3.max(filtered, d => d.Value)])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([d3.min(filtered, d => d.Overall), d3.max(filtered, d => d.Overall)])
    .range([height - margin.bottom, margin.top]);

  svg.selectAll("circle")
    .data(filtered)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Value))
    .attr("cy", d => y(d.Overall))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .attr("opacity", 0.6)
    .append("title")
    .text(d => `${d.Player}: €${d.Value}, Overall: ${d.Overall}`);

  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0,${height - margin.bottom})`);

  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left},0)`);
}
