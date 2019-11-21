const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage');
const d3 = require('d3');


// change this to 'true' for local development
// change this to 'false' before deploying

// https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

// date,close
// 1-May-12,58.13
// 30-Apr-12,53.98

export const LOCAL = false;

function sortByDateAscending(a, b) {
  return a.date - b.date;
}

// write viz code here
const drawViz = (dataIn) => {
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%d-%b-%y");
  var parseTime2 = d3.timeParse("%Y%m%d");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);


  // define the line
  var valueline = d3.line()
    .x(function (d) { var scaled = x(d.date); return scaled; })
    .y(function (d) { return y(d.close); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  d3.select('body')
    .selectAll('svg')
    .remove();

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");



  // Get the data
  // d3.csv("data.csv").then(dataBackup => {

  var tblList = dataIn.tables.DEFAULT;
  var data = tblList.map(row => {
    return {
      date: parseTime2(row["dimID"][0]),
      close: row["metricID"][0]
    }
  }).sort(sortByDateAscending);

  // format the data
  // data.forEach(function (d) {
  //   d.date = parseTime(d.date);
  //   d.close = +d.close;
  // });




  // Scale the range of the data
  x.domain(d3.extent(data, function (d) { return d.date; }));
  y.domain([0, d3.max(data, function (d) { return d.close; })]);

  let style = {
    lineColor:
      dataIn.style.lineColor.value !== undefined
        ? dataIn.style.lineColor.value.color
        : dataIn.style.lineColor.defaultValue,
    lineWeight:
      dataIn.style.lineWeight.value !== undefined
        ? dataIn.style.lineWeight.value
        : dataIn.style.lineWeight.defaultValue
  }

  // Add the valueline path.
  svg.append("path")
    .data([data])
    // .attr("class", "line")    // this is where the style gets set in the css file.
    .attr("d", valueline)
    .attr("stroke", style.lineColor).attr("fill", "none").attr("stroke-width", style.lineWeight + "px")

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  d3.axisLeft(y)(svg.append("g"))
};


// write viz code here
// const drawViz = (data) => {
//   viz.readmeViz();
//   viz.firstViz(data);
// };




// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
