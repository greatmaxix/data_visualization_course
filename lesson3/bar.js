async function drawBar() {

    const dataset = await d3.json("./my_weather_data.json")
    //Accessor
    const Accessor = d => d.humidity;
    const yAccessor = d => d.length;

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

    const xScaler = d3.scaleLinear()
        .domain(d3.extent(dataset, Accessor))
        .range([0, dimensions.boundedWidth])
        .nice()

    const binsGenerator = d3.bin()
        .domain(xScaler.domain())
        .value(Accessor)
        .thresholds(12)

    const bins = binsGenerator(dataset)
    console.log(bins)

    const yScaler = d3.scaleLinear()
        .domain([0, d3.max(bins, yAccessor)])
        .range([dimensions.boundedHeight, 0])

    const binsGroup = bounds.append('g')
    const binGroups = binsGroup.selectAll('g')
        .data(bins)
        .enter()
        .append('g')


    const barPadding = 1
    const barRect = binGroups.append('rect')
        .attr('x', d => xScaler(d.x0) + barPadding / 2)
        .attr('y', d => yScaler(yAccessor(d)))
        .attr('width', d => d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
        .attr('height', d => dimensions.boundedHeight - yScaler(yAccessor(d)))
        .attr('fill', '#AA1111')
}

drawBar()