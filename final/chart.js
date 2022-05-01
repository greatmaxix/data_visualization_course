async function drawCarEmissionChart() {
  let data = await d3.json("kaz.geo.json")
  let carsData = await loadCarsData()
  data = connectData(data, carsData)

  let dimensions = {
    width: window.innerWidth * 0.5,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60
    }
  }

  //draw chart 
  let svg = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
    .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")"
    )

  //draw x axis
  svg.append("g")
    .style('transform', `translateY(${dimensions.boundedHeight}px)`)


  let width = dimensions.width
  let height = dimensions.height

  // Map and projection
  let projection = d3.geoMercator()
    .center([70, 45])                // GPS of location to zoom on
    .scale(700) // This is like the zoom
    .translate([width / 2, height / 2])

  let means = data.features.map(d => {
    return Math.round(d3.mean(d.properties.carsInfo, el => el.avgEmission))
  })
  // Create a color scale
  var color = d3.scaleSequential()
    .domain(d3.extent(means.sort()))
    .range(['green', 'red'])

  const legendGroup = svg.append('g')

  const defs = legendGroup.append("defs")
  const legendGradientId = "legend-gradient"
  const gradient = defs.append("linearGradient")
    .attr("id", legendGradientId)
    .selectAll("stop")
    .data(color.range())
    .join("stop")
    .attr("stop-color", d => d)
    .attr("offset", (d, i) => `${i * 100 / 2}%`)

  const legendGradient = legendGroup.append("rect")
    .attr("x", width / 2)
    .attr("y", height - 100)
    .attr("height", 20)
    .attr("width", 150)
    .attr("fill", `url(#${legendGradientId})`)

  function onRegionClick(e, data) {
    console.log(data)
    document.getElementById("card").style = {
      "display": "block"
    }
    document.getElementById("card-title").innerHTML = `${data.properties.NAME_1} ${data.properties.TYPE_1 || ''} `
    drawBar(data)
  }
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .join('path')
    .attr("fill", "none")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("fill-rule", "evenodd")
    .attr("data-name", d => d.properties.name)
    .attr("fill", function (d) {
      return color(Math.round(d3.mean(d.properties.carsInfo, el => el.avgEmission)))
    })
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .style("stroke", "black")
    .style("opacity", .9)
    .on("mouseover", function (d) {
      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "gray")
        .style("stroke-width", 3)
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("opacity", .9)
        .style("stroke", "black")
        .style("stroke-width", 1)
    })
    .on("click", onRegionClick)
}

drawCarEmissionChart();


async function loadCarsData() {
  let carsData = await d3.csv("kolesa_cars_202203301958.csv")
  let columns = carsData.columns
  return getCitiesData(carsData)
}

function getCitiesData(carsData) {
  let cities = carsData.map(d => d.city)
  cities = [...new Set(cities)]
  let newData = {}
  for (let i = 0; i < carsData.length; i++) {
    const element = carsData[i];
    if (newData[element.city]) {
      newData[element.city].push(getCarInfo(element))
    } else {
      newData[element.city] = [getCarInfo(element)]
    }
  }
  return newData
}

function getCarInfo(carInfo) {
  let year = carInfo.year.replace(/[^\d.-]/g, '')
  let milleage = carInfo.milleage.replace(/[^\d.-]/g, '')
  let eng_vol = carInfo.eng_vol.replace(/[^\d.-]/g, '')
  let newObj = {
    ...carInfo,
    year: year > 2022 ? 2022 : year,
    milleage,
    eng_vol: eng_vol || 2.0
  }
  newObj.avgEmission = getEmissionForCar(newObj)
  return newObj
}

const yearWhenDataObtained = 2022

function getEmissionForCar(carInfo) {
  let milleagePerYear = carInfo.year && carInfo.milleage ? (carInfo.milleage || 1) / ((yearWhenDataObtained - carInfo.year) || 1) : 13000
  let yearOfProduction = carInfo.year || 2002
  let engType = carInfo.eng_type || 'бензин'
  let eng_vol = carInfo.eng_vol || 2.0
  return (milleagePerYear * eng_vol * getEmissionForCarType(engType, yearOfProduction)) / 1000
}

function getEmissionForCarType(engType, yearOfProduction) {
  let euroStandart = euroStandartData.find(el => el.from <= yearOfProduction && el.to >= yearOfProduction)
  if (engType === 'дизель') {
    return euroStandart.diesel_co
  }
  return euroStandart.petrol_co
}

function connectData(mapData, carsData) {
  for (let i = 0; i < mapData.features.length; i++) {
    mapData.features[i].properties.carsInfo = []
    for (let j = 0; j < mapData.features[i].properties.cities.length; j++) {
      const city = mapData.features[i].properties.cities[j]
      mapData.features[i].properties.carsInfo.push(...carsData[city])
    }
  }
  return mapData
}

const euroStandartData = [
  {
    "name": "Euro1",
    "from": "1900",
    "to": "1995",
    "diesel_co": "2.72",
    "petrol_co": "2.72"
  },
  {
    "name": "Euro2",
    "from": "1996",
    "to": "1999",
    "diesel_co": "1.0",
    "petrol_co": "2.2"
  },
  {
    "name": "Euro3",
    "from": "2000",
    "to": "2004",
    "diesel_co": "0.64",
    "petrol_co": "2.3"
  },
  {
    "name": "Euro4",
    "from": "2005",
    "to": "2008",
    "diesel_co": "0.5",
    "petrol_co": "1.0"
  },
  {
    "name": "Euro5",
    "from": "2009",
    "to": "2013",
    "diesel_co": "0.5",
    "petrol_co": "1.0"
  },
  {
    "name": "Euro6",
    "from": "2014",
    "to": "2022",
    "diesel_co": "0.5",
    "petrol_co": "1.0"
  },
]

//#region Bar chart
const width = 500
let dimensions = {
  width: width,
  height: width * 0.6,
  margin: {
    top: 10,
    right: 30,
    bottom: 10,
    left: 30,
  },
}
dimensions.boundedWidth = dimensions.width
  - dimensions.margin.left
  - dimensions.margin.right
dimensions.boundedHeight = dimensions.height
  - dimensions.margin.top
  - dimensions.margin.bottom

const wrapper = d3.select("#card-graph")
  .append("svg")
  .attr("width", dimensions.width)
  .attr("height", dimensions.height);

const bounds = wrapper.append("g")
  .style("translate", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

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

let mIndex = 0

function drawBar(data) {
  let dataset = data.properties.carsInfo

  const drawHistogram = metric => {
    //Accessor
    const metricAccessor = d => d[metric];
    const yAccessor = d => d.length;

    const exitTransition = d3.transition().duration(600)
    const updateTransition = exitTransition.transition().duration(600)

    const xScaler = d3.scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice()

    const binsGen = d3.bin()
      .domain(xScaler.domain())
      .value(metricAccessor)
      .thresholds(xScaler.ticks(10));

    const bins = binsGen(dataset);

    const yScaler = d3.scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.boundedHeight, 0])

    let binGroups = bounds.select(".bins").selectAll(".bin").data(bins)

    const oldBinGroups = binGroups.exit()
    oldBinGroups.selectAll("rect")
      .style("fill", "orangered")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)
      .attr('height', 0)
    oldBinGroups.selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)

    oldBinGroups.transition(exitTransition).remove()

    const newBinGroups = binGroups.enter().append("g")
      .attr("class", "bin")

    newBinGroups.append("rect")
    newBinGroups.append("text")

    binGroups = newBinGroups.merge(binGroups)

    const barPadding = 1

    const barRect = binGroups.select("rect")
      .transition(updateTransition)
      .attr("x", d => xScaler(d.x0) + barPadding / 2)
      .attr("y", d => yScaler(yAccessor(d)))
      .attr("width", d => d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
      .attr("height", d => dimensions.boundedHeight - yScaler(yAccessor(d)))
      .transition()
      .style("fill", "cornflowerblue")


    const barText = binGroups.select("text")
      .transition(updateTransition)
      .attr("x", d => xScaler(d.x0) + (xScaler(d.x1) - xScaler(d.x0)) / 2)
      .attr("y", d => yScaler(yAccessor(d)) - 5)
      .text(d => yAccessor(d) || "")
      .attr("text-anchor", "middle")
      .style("font-size", "10px")



    const mean = d3.mean(dataset, metricAccessor);
    const meanLine = bounds.selectAll(".mean")
      .transition(updateTransition)
      .attr("x1", xScaler(mean))
      .attr("x2", xScaler(mean))
      .attr("y1", -15)
      .attr("y2", dimensions.boundedHeight)

    const xAxisGen = d3.axisBottom()
      .scale(xScaler);

    const xAxis = bounds.select(".x-axis")
      .transition(updateTransition)
      .call(xAxisGen)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`);

    binGroups.select("rect")
      .on("mouseenter", onMouseEnter)
      .on("mouseleave", onMouseLeave)

    const tooltip = d3.select("#tooltip")

    function onMouseEnter(e, datum) {
      tooltip.select("#count")
        .text(yAccessor(datum))

      const formatHumidity = d3.format(".2f")
      tooltip.select("#range")
        .text([
          formatHumidity(datum.x0),
          formatHumidity(datum.x1)
        ].join(" - "))

      const x = xScaler(datum.x0)
        + (xScaler(datum.x1) - xScaler(datum.x0)) / 2
        + dimensions.margin.left
      const y = yScaler(yAccessor(datum))
        + dimensions.margin.top

      tooltip.style("transform", `translate(`
        + `calc( -50% + ${x}px),`
        + `calc( 100% + ${y}px)`
        + `)`)

      tooltip.style("opacity", 1)
    }

    function onMouseLeave() {
      tooltip.style("opacity", 0)
    }
  }

  const metrics = [
    "avgEmission",
    "eng_vol",
    "milleage",
    "price",
    "year",
  ]

  drawHistogram(metrics[mIndex])
  let select = document.getElementById("form-select")
  select.addEventListener("change", onClick)

  function onClick() {
    drawHistogram(select.options[select.selectedIndex].value)
    mIndex = metrics.indexOf(select.options[select.selectedIndex].value)
  }

}
//#endregion Bar chart

// Оценка уровня загрязнения воздуха на основе экологичности автомобилей страны