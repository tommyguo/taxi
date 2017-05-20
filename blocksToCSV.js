// server-side handling of taxi data to remove burden on front-end
// counts the number of taxi pickups in each block for each time frame

const d3 = require('d3');
const fs = require('fs');
const blocks = JSON.parse(fs.readFileSync('./public/blocks.geojson', 'utf8'));
const taxiC = fs.readFileSync('./public/taxiC.csv', 'utf8');
const parse = require('csv-parse/lib/sync');

// parse taxiC.csv file and process data
const data = parse(taxiC, {
  columns: true
});

const rides = {};
// counter for how many rows of the taxiC.csv file you want to go through
// all 1/1/2016 data is contained within the first 500,000 rows
const counter = 500000;

// keeps track of number of rides for each time frame and hour
let morning = 0;
let afternoon = 0;
let evening = 0;
let latenight = 0;
const hourCounter = [];
for (let i = 0; i < 24; i++) {
  hourCounter.push(0);
}

// go through each row in csv
for (let i = 0; i < counter; i++) {
  console.log(i);
  const d = data[i];
  const day = d.tpep_pickup_datetime.split(" ")[0].split("/")[1];
  if (day === '1') {
    for (let i = 0; i < blocks.features.length; i++) {
      // only check a block group if it's in Manhattan
      if (blocks.features[i].properties['COUNTYFP'] === '061' && blocks.features[i].properties['AWATER'] === 0.0) {
        for (let j = 0; j < blocks.features[i].geometry.coordinates.length; j++) {
          if (d3.polygonContains(blocks.features[i].geometry.coordinates[j], [d.pickup_longitude, d.pickup_latitude])) {
            const block = blocks.features[i].properties['OBJECTID'];
            const hour = d.tpep_pickup_datetime.split(" ")[1].split(":")[0];

            if (rides[block] === undefined) {
              rides[block] = [0, 0, 0, 0];
            }
            hourCounter[hour]++;
            // record ride in correct block and hour
            if (hour >= 0 && hour < 6) {
              rides[block][3]++;
              latenight++;
            }
            else if (hour >= 6 && hour < 12) {
              rides[block][0]++;
              morning++;
            }
            else if (hour >= 12 && hour < 18) {
              rides[block][1]++;
              afternoon++;
            }
            else {
              rides[block][2]++;
              evening++;
            }
          }
        }
      }
    }
  }
}

// prints the number of rides in each time frame and hour
console.log("morning rides:", morning);
console.log("afternoon rides:", afternoon);
console.log("evening rides:", evening);
console.log("latenight rides:", latenight);
console.log("rides in each hour");
for (let i = 0; i < hourCounter.length; i++) {
  console.log(i, hourCounter[i]);
}

fs.writeFile("./public/blockColors.json", JSON.stringify(rides), function(err) {
  if (err) {
    return console.log(err);
  }
});
