async function drawBar() {

    const dataset = await d3.json("./my_weather_data.json")

    const width = 600
    let dimensions = {
        width: width,
        height: width * 0.6,
        margin: {
            top: 30,
            right: 10,
            bottom: 50,
            left: 50,
        },
    }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left
        - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top
        - dimensions.margin.bottom

    // 3. Draw canvas

    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        ;

    const bounds = wrapper.append('g').style(
        'transform',
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    )

    bounds.style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    // init static elements
    bounds.append("g")
        .attr("class", "bins")

    bounds.append("line")
        .attr("class", "mean")

    bounds.append("g")
        .attr("class", "x-axis")
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .append("text")
        .attr("class", "x-axis-label")
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margin.bottom - 10)

    const drawHistogram = (metric) => {
        //Accessor
        const Accessor = d => d[metric];
        const yAccessor = d => d.length;

        const exitTransition = d3.transition()
            .duration(600)
        
        const updateTransition = exitTransition.transition()
            .duration(600)
        
        const xScaler = d3.scaleLinear()
            .domain(d3.extent(dataset, Accessor))
            .range([0, dimensions.boundedWidth])
            .nice()

        const binsGenerator = d3.bin()
            .domain(xScaler.domain())
            .value(Accessor)
            .thresholds(12)

        const bins = binsGenerator(dataset)

        const yScaler = d3.scaleLinear()
            .domain([0, d3.max(bins, yAccessor)])
            .range([dimensions.boundedHeight, 0])

        let binGroups = bounds.select('.bins')
            .selectAll('.bin')
            .data(bins)
        
        const oldBinGroups = binGroups.exit()
        oldBinGroups.selectAll('rect')
            .style('fill', 'orangered')
            .transition(exitTransition)
            .attr('y', dimensions.boundedHeight)
            .attr('height', 0)

        oldBinGroups.selectAll('text')
            .transition(exitTransition)
            .attr('y', dimensions.boundedHeight)

        oldBinGroups.transition(exitTransition).remove()

        const newBinGroups = binGroups.enter().append('g')
            .attr('class', 'bin')
        
        newBinGroups.append('rect')
        newBinGroups.append('text')
        newBinGroups.append('mean')

        binGroups = newBinGroups.merge(binGroups)
        
        const barPadding = 1

        const barRect = binGroups.select('rect')
            .transition(updateTransition)
            .attr('x', d => xScaler(d.x0) + barPadding / 2)
            .attr('y', d => yScaler(yAccessor(d)))
            .attr('width', d => d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
            .attr('height', d => dimensions.boundedHeight - yScaler(yAccessor(d)))
            .attr('fill', 'steelblue')
            .transition()
            .style('fill', 'cornflowerblue')

        const barText = binGroups.filter(yAccessor)
            .select('text')
            .transition(updateTransition)
            .attr('x', d => xScaler(d.x0) + (xScaler(d.x1) - xScaler(d.x0)) / 2)
            .attr('y', d => yScaler(yAccessor(d)) - 5)
            .attr('fill', 'black')
            .text(d => yAccessor(d) || '')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')

        const mean = d3.mean(dataset, Accessor)

        const meanLine = bounds.selectAll('.mean')
            .transition(updateTransition)
            .attr('x1', xScaler(mean))
            .attr('y1', -20)
            .attr('x2', xScaler(mean))
            .attr('y2', dimensions.boundedHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '6px 2px')

        // const meanLabel = bounds.append('text')
        //     .attr('x', xScaler(mean))
        //     .attr('y', -20)
        //     .attr('fill', 'black')
        //     .text(`Mean: ${mean}`)
        //     .attr('font-size', '12px')
        //     .attr('text-anchor', 'middle')

        const xAxis = bounds.select('x-axis')
            .transition(updateTransition)
            .call(d3.axisBottom(xScaler))
            .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top + dimensions.boundedHeight})`)

        // const yAxis = bounds.select('y-axis')
        //     .call(d3.axisLeft(yScaler))
        //     .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
    }

    const metrics = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax",
    ]

    let mIndex = 0
    const button = d3.select("body")
        .append("button")
        .text("Change Metric")

    button.node().addEventListener("click", () => {
        mIndex = (mIndex + 1) % metrics.length
        drawHistogram(metrics[mIndex])
    })

    drawHistogram(metrics[mIndex])
}

drawBar()