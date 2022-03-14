async function drawLineChart() {
    const data = await d3.json("my_weather_data.json");
    const dateParser = d3.timeParse("%Y-%m-%d");

    let allGroup = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax"
    ]

    let selectedOption = allGroup[0]

    function xAccesor(d) {
        return dateParser(d.date);
    }

    let dimensions = {
        width: window.innerWidth * 0.9,
        height: 600,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60,
        },
    }

    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    function yAccesor(d) {
        return d[selectedOption];
    }

    xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccesor))
        .range([0, dimensions.boundedWidth])


    let svg = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("g")
        .attr("transform",
            "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })

    let myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    let line = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(xAccesor)
            .y(yAccesor)
        )
        .attr("stroke", function (d) { return myColor("valueA") })
        .style("stroke-width", 4)
        .style("fill", "none")

    svg.append("g")
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)
        .call(d3.axisBottom().scale(xScale));

    svg.append("g").attr("class", "y-axis")

    // A function that update the chart
    function update(selectedGroup) {

        let yScale = d3.scaleLinear()
            .domain(d3.extent(data, yAccesor))
            .range([dimensions.boundedHeight, 0])
    
        console.log(svg.select("y-axis"))
        svg.select(".y-axis")
            .call(d3.axisLeft().scale(yScale))

        line
            .datum(data)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(d => xScale(xAccesor(d)))
                .y(d => yScale(yAccesor(d)))
            )
            .attr("stroke", function (d) { return myColor(selectedGroup) })
    }

    d3.select("#selectButton").on("change", function (d) {
        selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })

    update(selectedOption)

}


drawLineChart();