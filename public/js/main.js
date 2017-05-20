// Contains code responsible for all of the front-end visualization

// Set up visualization title
const divTitle = document.createElement("div");
const title = document.createElement("p");
title.innerHTML = "Taxi Pickups in Manhattan <br>on 1/1/2016";
divTitle.appendChild(title);
divTitle.classList.add("title");
document.body.appendChild(divTitle);

// Set up tooltip
const divTip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Set up map properties
const multiplier = 3;
const width = 220 * multiplier;
const height = 200 * multiplier;
let path;
let projection;

const divMap = d3.select("body").append("div")
  .attr("id", "divMap")

const svg = divMap.append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("preserveAspectRatio", "xMidYMid")
  //.attr("viewBox", "0 0 " + width + " " + height)
  .attr("id", 'map')

svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)


const g = svg.append("g");


// Set up colors used in visualization
const color1 = '#ffffd9';
const color2 = '#edf8b1';
const color3 = '#c7e9b4';
const color4 = '#7fcdbb';
const color5 = '#41b6c4';
const color6 = '#1d91c0';
const color7 = '#225ea8';
const color8 = '#253494';
const color9 = '#081d58';
let colors = [color1, color2, color3, color4, color5, color6, color7, color8, color9];
colors.reverse();
let intervals = [500, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 0];


// Set up legend
let labels = ["<500", "500+", "1000+", "2000+", "3000+", "4000+", "6000+", "8000+", "10000+"];
labels.reverse();

const legGroup = d3.select("body").append("div")
  .attr("id", "legendGroup");

// Set up legend title
const divLegTitle = legGroup.append("div")
  .attr("id", "legendTitle")

const legendTitle = document.querySelector("#legendTitle");
legendTitleText = document.createElement("p");
legendTitleText.innerHTML = "Concentration: <br>Rides per square km";
legendTitle.appendChild(legendTitleText);

// Set up legend body
const divLeg = legGroup.append("div")
  .attr("id", "legend")

const svgLeg = divLeg.append("svg")
  .attr("id", "svgLeg")

const legend = svgLeg.selectAll("g.legend")
  .data(intervals)
  .enter().append("g")

const legendWidth = 24
const legendHeight = 24;

legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i) {
    return i * legendHeight;
  })
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", function(d, i) {
    return colors[i];
  })
  .style("opacity", 1);

legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i) {
    return i * legendHeight + 17;
  })
  .text(function(d, i) {
    return labels[i];
  });


// keep track of time frame
let buttonState = 3;
// viewState = 1 gives user abililty to zoom
let viewState = 0;


// Sets up map for a specific time frame as denoted by index
function setColor(index) {
  // set up zoom and drag once user advances to evening
  if (index === 2) {
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on("zoom", zoomed);

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }
    svg.call(zoom);
  }
  // sets view for late night
  if (!viewState && index === 3) {
    projection = d3.geoMercator()
      .center([-73.99, 40.75])
      .scale(120000 * multiplier)
      .translate([width / 2, height / 2])

    path = d3.geoPath()
      .projection(projection)
  }
  // sets view for morning
  if (!viewState && index === 0) {
    projection = d3.geoMercator()
      .center([-73.995, 40.755])
      .scale(150000 * multiplier)
      .translate([width / 2, height / 2])
    path = d3.geoPath()
      .projection(projection)
  }
  // sets view for afternoon
  if (!viewState && index === 1) {
    projection = d3.geoMercator()
      .center([-73.985, 40.76])
      .scale(100000 * multiplier)
      .translate([width / 2, height / 2])
    path = d3.geoPath()
      .projection(projection)
  }
  // sets view for evening
  if (!viewState && index === 2) {
    projection = d3.geoMercator()
      .center([-73.995, 40.745])
      .scale(140000 * multiplier)
      .translate([width / 2, height / 2])
    path = d3.geoPath()
      .projection(projection)
  }

  // once user reaches evening, let them freely view map
  // and don't allow setting view
  if (index === 2) {
    viewState = 1;
  }
  // read data and create map
  // blockColors.json contains data on taxi rides
  d3.json('/blockColors.json', function(err, data) {
    // blocks.geojson contains the geojson for NYC block groups
    d3.json('/blocks.geojson', function(err, blocks) {
      // clears the map and replaces with new map so no duplicate rendering
      d3.select("g").selectAll("*").remove();

      // loops through every block
      for (let i = 0; i < blocks.features.length; i++) {
        // only includes Manhattan land blocks
        if (blocks.features[i].properties['COUNTYFP'] === '061' && blocks.features[i].properties['AWATER'] === 0.0) {
          // id of the block
          const id = blocks.features[i].properties['OBJECTID'];
          let concentration;
          let frequency;
          let colorFill;
          // adds a specific block to the map
          g.append('path')
            .attr('d', path(blocks.features[i]))
            .attr("id", blocks.features[i].properties['OBJECTID'])
            .attr("class", "blocks")
            // sets the colors for each block based on concentration of rides
            .style("fill", function(d) {
              if (data[id] === undefined) {
                concentration = 0;
                frequency = 0;
                colorFill = color1;
                return color1;
              }
              else {
                frequency = data[id][index];
                // area in square meters -> convert to kilometers
                const area = blocks.features[i].properties['ALAND'] / 1000000;
                // round concentration to the hundredth
                concentration = Math.round((frequency / area * 100) / 100);

                if (concentration < intervals[0]) {
                  colorFill = color1;
                  return color1;
                }
                else if (concentration < intervals[1]) {
                  colorFill = color2;
                  return color2;
                }
                else if (concentration < intervals[2]) {
                  colorFill = color3;
                  return color3;
                }
                else if (concentration < intervals[3]) {
                  colorFill = color4;
                  return color4;
                }
                else if (concentration < intervals[4]) {
                  colorFill = color5;
                  return color5;
                }
                else if (concentration < intervals[5]) {
                  colorFill = color6;
                  return color6;
                }
                else if (concentration < intervals[6]) {
                  colorFill = color7;
                  return color7;
                }
                else if (concentration < intervals[7]) {
                  colorFill = color8;
                  return color8;
                }
                else {
                  colorFill = color9;
                  return color9;
                }
              }
            })

            // handles tooltip
            .on("mouseover", function(d) {
              d3.select(this).transition().duration(100).style("fill", "#ff7d73");
              divTip.transition().duration(100)
                .style("opacity", 0.7)

              divTip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 43) + "px")

              const tooltip = document.querySelector(".tooltip");
              tooltip.innerHTML = "Concentration: " + concentration + "<br>" + "Total Rides: " + frequency;
            })
            .on("mouseout", function() {
              d3.select(this)
                .transition().duration(100)
                .style("fill", colorFill);
              divTip.transition().duration(100)
                .style("opacity", 0);
            })
        }
      }
      // highlights special blocks
      for (let i = 0; i < blocks.features.length; i++) {
        const id = blocks.features[i].properties['OBJECTID'];
        let concentration;
        let frequency;
        let colorFill;
        if (index === 3 && blocks.features[i].properties['OBJECTID'] == 10031 || (index === 0 && (blocks.features[i].properties['OBJECTID'] == 9144 ||
            blocks.features[i].properties['OBJECTID'] == 9423))) {
          g
            //.append("g")
            .append('path')
            .attr('d', path(blocks.features[i]))
            .attr("id", blocks.features[i].properties['OBJECTID'])
            .attr("class", "blocks")
            // sets the colors for each block based on concentration of rides
            .style("fill", function(d) {
              if (data[id] === undefined) {
                concentration = 0;
                frequency = 0;
                colorFill = color1;
                return color1;
              }
              else {
                frequency = data[id][index];
                // area in square meters -> convert to kilometers
                const area = blocks.features[i].properties['ALAND'] / 1000000;
                // round concentration to the hundredth
                concentration = Math.round((frequency / area * 100) / 100);

                // nonspecial blocks
                if (concentration < intervals[0]) {
                  colorFill = color1;
                  return color1;
                }
                else if (concentration < intervals[1]) {
                  colorFill = color2;
                  return color2;
                }
                else if (concentration < intervals[2]) {
                  colorFill = color3;
                  return color3;
                }
                else if (concentration < intervals[3]) {

                  colorFill = color4;
                  return color4;
                }
                else if (concentration < intervals[4]) {
                  colorFill = color5;
                  return color5;
                }
                else if (concentration < intervals[5]) {
                  colorFill = color6;
                  return color6;
                }
                else if (concentration < intervals[6]) {
                  colorFill = color7;
                  return color7;
                }
                else if (concentration < intervals[7]) {
                  colorFill = color8;
                  return color8;
                }
                else {
                  colorFill = color9;
                  return color9;
                }
              }
            })
            // highlight special blocks
            .style("stroke", function(d) {
              return "#AA0114";
            })
            .style("stroke-width", function(d) {
              return 1.5;
            })

            // handles tooltip
            .on("mouseover", function(d) {
              d3.select(this).transition().duration(100).style("fill", "#ff7d73");
              divTip.transition().duration(100)
                .style("opacity", 0.7)

              divTip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 43) + "px")

              const tooltip = document.querySelector(".tooltip");
              tooltip.innerHTML = "Concentration: " + concentration + "<br>" + "Total Rides: " + frequency;
            })
            .on("mouseout", function() {
              d3.select(this)
                .transition().duration(100)
                .style("fill", colorFill);
              divTip.transition().duration(100)
                .style("opacity", 0);
            })
        }

      }
    });
  });
}

// intially set map to late night view
setColor(3);


// set up story logic
function story() {
  // add event listeners to previous and next buttons so
  // that they trigger changing of map
  const prev = document.querySelector(".previous");
  prev.addEventListener('click', clickPrevDelay);
  const next = document.querySelector(".next");
  next.addEventListener('click', clickNextDelay);
}

// set a delay to adding of event listeners so that they are added
// after buttons are loaded from flickity.js
setTimeout(story, 500);

function clickPrevDelay() {
  setTimeout(clickPrev, 1000);
}

function clickPrev() {
  if (buttonState === 0) {
    buttonState = 3;
    setColor(buttonState);
  }
  else {
    buttonState--;
    setColor(buttonState);
  }
}

function clickNextDelay() {
  setTimeout(clickNext, 1000);
}

function clickNext() {
  if (buttonState === 3) {
    buttonState = 0;
    setColor(buttonState);
  }
  else {
    buttonState++;
    setColor(buttonState);
  }
}
