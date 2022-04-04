// 

async function drawCarEmissionChart() {
    let data = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")

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
    
    
    // Create data for circles:
    let markers = [
      {lat: 43.2220, long: 76.8512, group: "A", size: 20}, // Almaty
      {lat: 51.1605, long: 71.4704, group: "A", size: 15}, // Astana
      {lat: 52.2873, long: 76.9674, group: "B", size: 4}, // Pavlodar
    ];
        
    console.log(data.features.filter( function(d){return d.properties.name=="Kazakhstan"} ))
    console.log(data.features.filter( function(d){return d.properties.name=="France"} ))
    // data.features = data.features.filter( function(d){return d.properties.name=="Kazakhstan"} )
    data.features = data.features.filter( function(d){return d.properties.name=="Kazakhstan"} )
    

    // Create a color scale
    var color = d3.scaleOrdinal()
      .domain(["A", "B", "C" ])
      .range([ "#402D54", "#D18975", "#8FD175"])

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
          .attr("fill", "#b8b8b8")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "black")
        .style("opacity", .3)

    // // Add circles:
    svg
      .selectAll("myCircles")
      .data(markers)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.long, d.lat])[1] })
        .attr("r", function(d){ return size(d.size) })
        .style("fill", function(d){ return color(d.group) })
        .attr("stroke", function(d){ return color(d.group) })
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)


    console.log(data)

}

drawCarEmissionChart();

// Оценка уровня загрязнения воздуха на основе экологичности автомобилей страны

// 