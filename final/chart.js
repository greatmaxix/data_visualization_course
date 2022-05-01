async function drawCarEmissionChart() {
  let data = await d3.json("kaz.geo.json")
  let carsData = await loadCarsData()
  data = connectData(data, carsData)

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

  //draw chart 
  let svg = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
    .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")"
    )
    ;

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


  // Create a color scale
  var color = d3.scaleOrdinal()
    .domain(data.features)
    .range(d3.schemeCategory10);


  // Add a scale for bubble size
  var size = d3.scaleLinear()
    .domain([0, d3.max(Object.values(carsData).flat(), d => {
      return d.avgEmission
    })])
    .range([4, 50])
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("fill-rule", "evenodd")
    // .attr("fill", d => d.properties.name)
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .style("stroke", "black")
    .style("opacity", .3)

  // // Add circles:
  svg
    .selectAll("myCircles")
    .data(data.features)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return projection([d.properties.center.long, d.properties.center.lat])[0] })
    .attr("cy", function (d) { return projection([d.properties.center.long, d.properties.center.lat])[1] })
    .attr("r", function (d) {
      return size(d3.mean(d.properties.carsInfo, el => el.avgEmission))
    })
    .style("fill", function (d) { return color(d.properties.name) })
    .attr("stroke", function (d) { return color(d.properties.name) })
    .attr("stroke-width", 3)
    .attr("fill-opacity", .4)

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
  let year = carInfo.year.replace(/\D/g, '')
  let milleage = carInfo.milleage.replace(/\D/g, '')
  let eng_vol = carInfo.eng_vol.replace(/\D/g, '')

  let newObj = {
    ...carInfo,
    year: year > 2022 ? 2022 : year,
    milleage: milleage,
    eng_vol: eng_vol || 2.0
  }
  newObj.avgEmission = getEmissionForCar(carInfo)
  return newObj
}

const yearWhenDataObtained = 2022

function getEmissionForCar(carInfo) {
  let milleagePerYear = carInfo.year && carInfo.milleage ? (carInfo.milleage || 1) / ((yearWhenDataObtained - carInfo.year) || 1) : 13000
  let yearOfProduction = carInfo.year || 2002
  let engType = carInfo.eng_type || 'бензин'
  let eng_vol = carInfo.eng_vol || 2.0
  return milleagePerYear * eng_vol * getEmissionForCarType(engType, yearOfProduction)
}

function getEmissionForCarType(engType, yearOfProduction) {
  let euroStandart = euroStandartData.find(el => el.from <= yearOfProduction && el.to >= yearOfProduction)
  if (!euroStandart) console.log(engType, yearOfProduction)
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

// Оценка уровня загрязнения воздуха на основе экологичности автомобилей страны

// "Тарановское"
// "Жалагаш"
// "Шамалган"
// "Боралдай"
// "Сарканд"
// "Аркалык"
// "Чкалово"
// "Косшы"
// "Махамбет"
// "Казыгурт"
// "Таскала"
// "Курчатов"
// "Шалкар"
// "Уштобе"
// "Сарыозек"
// "Явленка"
// "Шелек"
// "Большенарымское"
// "Кашыр"
// "Эмба"
// "Курык"
// "Отеген-Батыр"
// "Асыката"
// "Карабалык (Карабалыкский р-н)"
// "Смирново"
// "Алтай"
// "Сарыкемер"
// "Казалинск"
// "Макинск"
// "Приозерск"
// "Катон-Карагай"
// "Шетпе"
// "Кулан"
// "Бауыржана Момышулы"
// "Шар"
// "Денисовка"
// "Байсерке"
// "Федоровка (Федоровский р-н)"
// "Комсомольское"
// "Новоишимский"
// "Сай-Отес"
// "Чапаев"
// "Сарань"
// "Калбатау"
// "Карабулак (Ескельдинский р-н)"
// "Есиль"
// "Каркаралинск"
// "Новая Шульба"
// "Затобольск"
// "Акшукур"
// "Теренозек"
// "Молодежный (Уланский р-н)"
// "Житикара"
// "Акжар"
// "Жосалы"
// "Шубаркудук"
// "Карабулак"
// "Саумалколь"
// "Ащибулак"
// "Железинка"
// "Жанатас"
// "Кенкияк"