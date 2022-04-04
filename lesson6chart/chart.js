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

    let yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccesor))
        .range([dimensions.boundedHeight, 0])

    // A function that update the chart
    function update(selectedGroup) {

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

    const tooltip = d3.select("#tooltip")
    function onMouseEnter(e, datum) {

        const mousePosition = d3.pointer(e);
        const hoveredDate = xScale.invert(mousePosition[0]);

        const getDistanceFromHoveredDate = (d) => Math.abs(xAccesor(d) - hoveredDate);

        const closestIndex = d3.scan(data, (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b));
        
        const closestDataPoint = data[closestIndex];

        const closestXValue = xAccesor(closestDataPoint);
        const closestYValue = yAccesor(closestDataPoint);
        
        tooltip.select("#count")
          .text(closestXValue)

        tooltip.select("#range")
            .text(closestYValue)
          
        const x = Math.floor(xScale(closestXValue)) + dimensions.margin.left
        const y = Math.floor(yScale(closestYValue)) + dimensions.margin.top
        
        tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)

        tooltip.style("opacity", 1)
    }

    function onMouseLeave() {
        tooltip.style("opacity", 0)
    }

    svg.select("path")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

    d3.select("#selectButton").on("change", function (d) {
        selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })

    update(selectedOption)

}


drawLineChart();

// прочитать про event, код будет в гитхабе, по примеру барчарта сделать скаттер и лайн