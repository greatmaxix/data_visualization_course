let meanLineMax, confidenceIntervalLineMax = null
let meanLineMin, confidenceIntervalLineMin = null
let yScale, xScale = null
let yScaleDomain = null
let yMaxMean, yMinMean, xMean = null
let data

const dateParser = d3.timeParse('%Y-%m-%d')

const yMaxTempAccessor = (d) => {
    // console.log(d)
    return toCelcius(d.temperatureMax)
}
const xAccessor = (d) => dateParser(d.date)
const yMinTempAccessor = (d) => { 
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
    data = await d3.json('./my_weather_data.json')

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

    yMaxMean = d3.median(data, yMaxTempAccessor)
    yMinMean = d3.median(data, yMinTempAccessor)
    xMean = d3.median(data, xAccessor)

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

    dispersion()
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

function showMedians() {
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

function dispersion () {
    const wrapper = d3.select('#dispersion-wrapper')
    const svg = wrapper.append('svg')
    var x = d3.scaleLinear()
      .domain([-10,15])
      .range([0, dimensions.width]);
    let margin = {top: 30, right: 30, bottom: 30, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom

        svg.attr('width', dimensions.width)
        svg.attr('height', dimensions.height)
    
        const bounds = svg.append('g').style(
            'transform',
            `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
        )

    let fuckMe = data.map(e => e.temperatureMax)

    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
  
    // add the y Axis
    var y = d3.scaleLinear()
              .range([height, 0])
              .domain([0, 0.12]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("path")
        .attr("class", "mypath")
        .datum(kde(fuckMe))
        .attr("fill", "#69b3a2")
        .attr("opacity", ".6")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x((d) => xScale(d[0]) )
          .y((d) => yScale(d[1]) )
            // .x(function(d) { return xScale(xAccessor(d)) })
            // .y(function(d) { return yScale(yMaxTempAccessor(d)) })
        );
  
    // Plot the area
    svg.append("path")
        .attr("class", "mypath")
        .datum(data)
        .attr("fill", "#404080")
        .attr("opacity", ".6")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.line()
          .curve(d3.curveBasis)
            .x(function(d) {
                return xScale(xAccessor(d))
            })
            .y(function(d) {
                return yScale(yMinTempAccessor(d))
            })
        );


    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = svg.append('g')
        .call(yAxisGenerator)
    
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)
    
    const xAxis = svg.append('g')
        .call(xAxisGenerator)
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)
}

function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })]
        });
    };
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

drawLineChart()