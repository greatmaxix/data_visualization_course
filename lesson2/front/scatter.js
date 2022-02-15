async function scatterPlot() {
    const data = await d3.json('../forwiz.json')
    const dataWeather = await d3.json('../../lesson1/my_weather_data.json')
    console.log(dataWeather)
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
        .attr('cx', d => xScale(xAcc(d)))
        .attr('cy', d => yScale(yAcc(d)))
        .attr('r', d => rScale(rAcc(d)))
        .attr('fill', '#AA1111')

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