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


  const circles = svg.selectAll("circle")
    .data(filtered)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Value))
    .attr("cy", d => y(d.Overall))
    .attr("r", 0) 
    .attr("fill", "steelblue")
    .attr("opacity", 0.6)
    .on("mouseover", function () {
      d3.select(this)
        .transition().duration(200)
        .attr("r", 8)
        .attr("fill", "#ff6600");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition().duration(200)
        .attr("r", 4)
        .attr("fill", "steelblue");
    });

  // Dodaj tooltip prije animacije
  circles.append("title")
    .text(d => `${d.Player}: €${d.Value}, Overall: ${d.Overall}`);

  // Animacija ulaska
  circles.transition()
    .duration(600)
    .attr("r", 4);

  // x os
  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0,${height - margin.bottom})`);

  // y os
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left},0)`);
}
