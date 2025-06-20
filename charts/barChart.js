function drawBarChart(data) {
  const svg = d3.select("#barChart");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 30, right: 20, bottom: 60, left: 140 };

  const topPlayers = data
    .filter(d => d.Overall > 0)
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 10);

  const x = d3.scaleLinear()
    .domain([0, d3.max(topPlayers, d => d.Overall)])
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(topPlayers.map(d => d.Player))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(topPlayers.map(d => d.Player))
    .range(d3.schemeSet2); // ili d3.schemeCategory10

  const tooltip = d3.select("#tooltip");

  const bars = svg.selectAll("rect")
    .data(topPlayers)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.Player))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => color(d.Player))
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("fill", "#ff9933");

      tooltip
        .style("display", "block")
        .html(`<strong>${d.Player}</strong><br>Overall: ${d.Overall}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("fill", color(d.Player));

      tooltip.style("display", "none");
    });

  bars.transition()
    .duration(800)
    .attr("width", d => x(d.Overall) - x(0));

  svg.selectAll("text.score")
    .data(topPlayers)
    .enter()
    .append("text")
    .attr("class", "score")
    .attr("x", d => x(d.Overall) + 5)
    .attr("y", d => y(d.Player) + y.bandwidth() / 2 + 4)
    .text(d => d.Overall)
    .style("font-size", "12px")
    .style("fill", "#333");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "12px");

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text")
    .style("font-size", "12px");
}
