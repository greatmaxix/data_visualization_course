let meanLineMax, confidenceIntervalLineMax = null
let meanLineMin, confidenceIntervalLineMin = null
let yScale, xScale = null
let yScaleDomain = null
let yMaxMean, yMinMean, xMean = null

const dateParser = d3.timeParse('%Y-%m-%d')

const yMaxTempAccessor = (d) => {
    // console.log(d)
    return toCelcius(d.temperatureMax)
}
const xAccessor = (d) => dateParser(d.date)
const yMinTempAccessor = (d) => { 
    // console.log(d)
    return toCelcius(d.temperatureMin) 
}
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

    yMaxMean = d3.mean(data, yMaxTempAccessor)
    yMinMean = d3.mean(data, yMinTempAccessor)
    xMean = d3.mean(data, xAccessor)

    yScaleDomain = [
        d3.extent(data, yMinTempAccessor)[0],
        d3.extent(data, yMaxTempAccessor)[1]
    ]
    yScale = d3.scaleLinear()
        .domain(yScaleDomain)
        .range([dimensions.boundedHeight, 0])

    xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])

    drawConfidenceInterval(data, bounds)

    drawLines(data, bounds)
}

function drawLines (data, bounds) {

    const limitTemperatureVal = yScale(d3.extent(data, yMaxTempAccessor)[1])
    // const limitTemperature = bounds.append('rect')
    //     .attr('x', 0)
    //     .attr('width', dimensions.boundedWidth)
    //     .attr('y', limitTemperatureVal)
    //     .attr('height', dimensions.boundedHeight - limitTemperatureVal)
    //     .attr('fill', '#eeee')

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

    meanLineMin = bounds.append('line')
        .attr('visibility', 'hidden')
        .attr('x1', xScale(d3.min(data, xAccessor)))
        .attr('y1', yScale(yMinMean))
        .attr('x2', xScale(d3.max(data, xAccessor)))
        .attr('y2', yScale(yMinMean))
        .attr('stroke', '#00000f')
        .attr('stroke-width', 1)
        .attr('fill', 'none')


    meanLineMax = bounds.append('line')
        .attr('visibility', 'hidden')
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
}

function drawConfidenceInterval (data, bounds) {
    // get confidence interval
    const deviationMax = d3.deviation(data, yMaxTempAccessor)
    const deviationMin = d3.deviation(data, yMinTempAccessor)

    confidenceIntervalLineMax = bounds.append("path")
        .datum(data)
        .attr('visibility', 'hidden')
        .attr("fill", "#cce5df")
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x((d) => xScale(xAccessor(d)))
            .y0((d) => yScale(yMaxTempAccessor(d) - deviationMax))
            .y1((d) => yScale(yMaxTempAccessor(d) + deviationMax))
    )

    confidenceIntervalLineMin = bounds.append("path")
        .datum(data)
        .attr('visibility', 'hidden')
        .attr("fill", "#cce5df")
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x((d) => xScale(xAccessor(d)))
            .y0((d) => yScale(yMinTempAccessor(d) - deviationMin))
            .y1((d) => yScale(yMinTempAccessor(d) + deviationMin))
    )
}

function showMeans() {
    // get visibility of mean lines
    if (meanLineMax.style('visibility') === 'visible') {
        meanLineMax.attr('visibility', 'hidden')
        meanLineMin.attr('visibility', 'hidden')
    } else {
        meanLineMax.attr('visibility', 'visible')
        meanLineMin.attr('visibility', 'visible')
    }
    
}

function showStd(type) {
    switch (type) {
        case 'max':
            if (confidenceIntervalLineMax.style('visibility') === 'visible') {
                confidenceIntervalLineMax.attr('visibility', 'hidden')
            }
            else {
                confidenceIntervalLineMax.attr('visibility', 'visible')
            }
            break;
        case 'min':
            if (confidenceIntervalLineMin.style('visibility') === 'visible') {
                confidenceIntervalLineMin.attr('visibility', 'hidden')
            }
            else {
                confidenceIntervalLineMin.attr('visibility', 'visible')
            }
            break;
        default:
            break;

    }
}

drawLineChart()