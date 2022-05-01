async function drawCarEmissionChart() {
    let data = await d3.json("kaz.geo.json")
    let carsData = await loadCarsData()

    let dimensions = {
        width: window.innerWidth * 0.9,
        height: 400,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        }
    }

    //draw chart 
    let svg = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
        .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")"
            )
        ;

    //draw x axis
    svg.append("g")
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)


    let width = dimensions.width
    let height = dimensions.height
    
    // Map and projection
    let projection = d3.geoMercator()
        .center([70, 45])                // GPS of location to zoom on
        .scale(700) // This is like the zoom
        .translate([ width/2, height/2 ])
    

    // Create a color scale
    var color = d3.scaleOrdinal()
        .domain(data.features)
        .range(d3.schemeCategory10);
        

    // Add a scale for bubble size
    var size = d3.scaleLinear()
      .domain([1,100])  // What's in the data
      .range([ 4, 50])  // Size in pixel

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
          .attr("fill", "none")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "black")
        .style("opacity", .3)

    // // Add circles:
    svg
      .selectAll("myCircles")
      .data(data.features)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.properties.center.long, d.properties.center.lat])[0] })
        .attr("cy", function(d){ return projection([d.properties.center.long, d.properties.center.lat])[1] })
        .attr("r", function(d){ return size(10) })
        .style("fill", function(d){ return color(d.properties.name) })
        .attr("stroke", function(d){ return color(d.properties.name) })
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)

}

drawCarEmissionChart();


async function loadCarsData () {
    let carsData = await d3.csv("kolesa_cars_202203301958.csv")
}

// Оценка уровня загрязнения воздуха на основе экологичности автомобилей страны

// 