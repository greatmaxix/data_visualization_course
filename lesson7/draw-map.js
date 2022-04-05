async function drawMap() {
    const countryShapes = await d3.json('world-geojson.json')
    const dataset = await d3.csv('data_bank_data.csv')

    const countryNameAccessor = d => d.properties['SOV_A3']
    const countryIdAccessor = d => d.properties['Country Code']
    const metric = "Population growth (annual %)"
    
    let metricDataByCountry = {}

    dataset.forEach(d => {
        if (d["Series Name"] !== metric) {
            return
        } else {
            metricDataByCountry[d["Country Code"]] = +d["2017 [YR2017]"] || 0
        }
    })
    
    let dimensions = {
        width: window.innerWidth * 0.9,
        margin: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        }
    }

    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    
    const sphere = ({type: "Sphere"})
    const projection = d3.geoEqualEarth()
        .fitWidth(dimensions.boundedWidth, sphere)

    const pathGenerator = d3.geoPath().projection(projection)

    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere)

    dimensions.boundedHeight = y1
    dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom

    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

    const bounds = wrapper.append('g')
        .style(
            "transform",
            `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
        )

    const metricValues = Object.values(metricDataByCountry)
    const metricValueExtent = d3.extent(metricValues)
    const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]])
    const colorScale = d3.scaleLinear()
        .domain([-maxChange, 0, maxChange])
        .range(['indigo', 'white', 'darkgreen'])

    const earth = bounds.append('path')
        .attr("class", "earth")
        .attr('d', pathGenerator(sphere))

    const graticuleJson = d3.geoGraticule10()
    const graticule = bounds.append('path')
        .attr("class", "graticule")
        .attr("d", pathGenerator(graticuleJson))

    const countries = bounds.selectAll('.country')
        .data(countryShapes.features)
        .join("path")
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr('fill', d => {
            const metricValue = metricDataByCountry[countryNameAccessor(d)]
            if (metricValue === undefined) {
                return 'lightgrey'
            }
            return colorScale(metricValue)
        })
    
    const legendGroup = wrapper.append('g')
        .attr('transform', `translate(${130}, ${dimensions.width < 800 ? dimensions.boundedHeight - 50 : dimensions.boundedHeight * 0.5})`)

    const legendTitle = legendGroup.append('text')
        .attr('class', 'legend-title')
        .attr('y', -23)
        .text('Population growth')

    const legendByLine = legendGroup.append('text')
        .attr('class', 'legend-byline')
        .attr("y", -9)
        .text("Percent change in 2017")

    const defs = wrapper.append("defs")
    const legendGradientId = "legend-gradient"
    const gradient = defs.append("linearGradient")
        .attr("id", legendGradientId)
        .selectAll("stop")
        .data(colorScale.range())
        .join("stop")
        .attr("stop-color", d => d)
        .attr("offset", (d, i) => `${i * 100 / 2}%`)
    
    const legendtWidth = 120
    const legendHeight = 16

    const legendGradient = legendGroup.append("rect")
        .attr("x", -legendtWidth / 2)
        .attr("height", legendHeight)
        .attr("width", legendtWidth)
        .attr("fill", `url(#${legendGradientId})`)

    const legendValueRight = legendGroup.append("text")
        .attr("class", "legend-value")
        .attr("x", (legendtWidth / 2) + 40)
        .attr("y", legendHeight / 2)
        .text(`${d3.format(".1f")(-maxChange)}%`)
        .style('text-anchor', 'end')

    const legendValueLeft = legendGroup.append("text")
        .attr("class", "legend-value")
        .attr("x", (legendtWidth / 2) - 125)
        .attr("y", legendHeight / 2)
        .text(`${d3.format(".1f")(-maxChange)}%`)
        .style('text-anchor', 'end')

    // display browsers location on map
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        const [x, y] = projection([longitude, latitude])
        console.log(x, y)
        const marker = bounds.append('cirlce')
            .attr('class', 'my-location')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 10)
    })

    
    const tooltip = d3.select("#tooltip")

    const onMouseEnter = (e, datum) => {
        tooltip.style("opacity", 1)
        const metricValue = metricDataByCountry[countryNameAccessor(datum)]
        tooltip.select("#country")
            .text(countryNameAccessor(datum))
        tooltip.select('#value')
            .text(`${d3.format(",.2f")(metricValue || 0)}%`)

        const [centerX, centerY] = pathGenerator.centroid(datum)
        const x = centerX + dimensions.margin.left
        const y = centerY + dimensions.margin.top
        tooltip.style("transform", `translate(${x}px, ${y}px)`)
    }

    const onMouseLeave = d => {
        tooltip.style("opacity", 0)
    }

    countries.on("mouseenter", onMouseEnter).on("mouseleave", onMouseLeave)
    
}

drawMap()