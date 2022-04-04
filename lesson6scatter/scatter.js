async function scatterPlot() {
    const dataWeather = await d3.json('my_weather_data.json')
    const xAcc = d => d.humidity
    const yAcc = d => d.dewPoint
    const rAcc = d => d.temperatureMin

    let dimensions = {
        width: window.innerWidth * 0.5,
        height: 300,
        margin: {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
        }
    }

    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

    const wrapper = d3.select('#wrapper')
    const svg = wrapper.append('svg')
    svg.attr('width', dimensions.width)
    svg.attr('height', dimensions.height)

    const bounds = svg.append('g').style(
        'transform',
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    )

    bounds.style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    let xScale = d3.scaleLinear()
        .domain(d3.extent(dataWeather, xAcc))
        .range([dimensions.margin.left, dimensions.boundedWidth])
    
    let yScale = d3.scaleLinear()
        .domain(d3.extent(dataWeather, yAcc))
        .range([dimensions.boundedHeight, dimensions.margin.right])

    let rScale = d3.scaleLinear()
        .domain(d3.extent(dataWeather, rAcc))
        .range([1, 10])

    let viz = bounds.selectAll('circles')
        .data(dataWeather)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('cx', d => xScale(xAcc(d)))
        .attr('cy', d => yScale(yAcc(d)))
        .attr('r', d => rScale(rAcc(d)))
        .attr('fill', '#AA1111')

    const tooltip = d3.select("#tooltip")
    function onMouseEnter(e, datum) {

        xVal = xAcc(datum)
        yVal = yAcc(datum)
        rVal = rAcc(datum)
        
        tooltip.select("#range")
            .text(xVal)

        tooltip.select("#count")
          .text(yVal)

        tooltip.select("#count2")
          .text(rVal)
          
        const x = xScale(xVal) + dimensions.margin.left
        const y = yScale(yVal) + dimensions.margin.top
        
        tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)

        tooltip.style("opacity", 1)
    }

    function onMouseLeave() {
        tooltip.style("opacity", 0)
    }
    
    bounds.selectAll('circle')
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

    let xAxis = d3.axisBottom(xScale).scale(xScale)
    let yAxis = d3.axisLeft(yScale).scale(yScale)

    bounds.append('g')
        .call(xAxis)
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)
    bounds.append('g')
        .call(yAxis)
        .style('transform', `translateX(${dimensions.margin.left}px)`)
}

scatterPlot()