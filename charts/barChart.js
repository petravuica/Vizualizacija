function drawBarChart(data) {
  const svg = d3.select("#barChart");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 30, right: 20, bottom: 60, left: 100 };

  const topPlayers = data
    .filter(d => d.Overall > 0)
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 10);

  const x = d3.scaleLinear()
    .domain([0, d3.max(topPlayers, d => d.Overall)])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(topPlayers.map(d => d.Player))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  // Animirani ulazak + hover efekti
  svg.append("g")
    .selectAll("rect")
    .data(topPlayers)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.Player))
    .attr("height", y.bandwidth())
    .attr("width", 0) // Start from 0
    .attr("fill", "steelblue")
    .on("mouseover", function () {
      d3.select(this)
        .transition().duration(200)
        .style("fill", "#ff9933");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition().duration(200)
        .style("fill", "steelblue");
    })
    .transition()
    .duration(800)
    .attr("width", d => x(d.Overall) - x(0)); // Animate width

  // y os (imena igrača)
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left},0)`);

  // x os 
  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0,${height - margin.bottom})`);
}
