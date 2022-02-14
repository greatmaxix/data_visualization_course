const dateParser = d3.timeParse('%Y-%m-%d')

const yMaxTempAccessor = (d) => toCelcius(d.temperatureMax)
const xAccessor = (d) => dateParser(d.date)
const yMinTempAccessor = (d) => toCelcius(d.temperatureMin)

const toCelcius = (f) => (f - 32) * 5 / 9

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
// draw line chart
async function drawLineChart () {
    let data = await d3.json('./my_weather_data.json')

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

    drawLines(data, bounds)
}

function drawLines (data, bounds) {
    const yMaxMean = d3.mean(data, yMaxTempAccessor)
    const yMinMean = d3.mean(data, yMinTempAccessor)
    const xMean = d3.mean(data, xAccessor)

    const yScaleDomain = [
        d3.extent(data, yMinTempAccessor)[0],
        d3.extent(data, yMaxTempAccessor)[1]
    ]
    const yScale = d3.scaleLinear()
        .domain(yScaleDomain)
        .range([dimensions.boundedHeight, 0])

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])

    const limitTemperatureVal = yScale(d3.extent(data, yMaxTempAccessor)[1])
    const limitTemperature = bounds.append('rect')
        .attr('x', 0)
        .attr('width', dimensions.boundedWidth)
        .attr('y', limitTemperatureVal)
        .attr('height', dimensions.boundedHeight - limitTemperatureVal)
        .attr('fill', '#eeee')

    const lineGeneratorMax = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yMaxTempAccessor(d)))

    const lineGeneratorMin = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yMinTempAccessor(d)))
    
    const maxLine = bounds.append('path')
        .attr('d', lineGeneratorMax(data))
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 1)
        .attr('fill', 'none')

    const minLine = bounds.append('path')
        .attr('d', lineGeneratorMin(data))
        .attr('stroke', '#0000ff')
        .attr('stroke-width', 1)
        .attr('fill', 'none')

    const meanLineMin = bounds.append('line')
        .attr('x1', xScale(d3.min(data, xAccessor)))
        .attr('y1', yScale(yMinMean))
        .attr('x2', xScale(d3.max(data, xAccessor)))
        .attr('y2', yScale(yMinMean))
        .attr('stroke', '#00000f')
        .attr('stroke-width', 1)
        .attr('fill', 'none')


    const meanLineMax = bounds.append('line')
        .attr('x1', xScale(d3.min(data, xAccessor)))
        .attr('y1', yScale(yMaxMean))
        .attr('x2', xScale(d3.max(data, xAccessor)))
        .attr('y2', yScale(yMaxMean))
        .attr('stroke', '#f00000')
        .attr('stroke-width', 1)
        .attr('fill', 'none')


    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = bounds.append('g')
        .call(yAxisGenerator)
    
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)
    
    const xAxis = bounds.append('g')
        .call(xAxisGenerator)
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)

    console.log(yMaxMean,
        yMinMean,
        xMean)
}

drawLineChart()