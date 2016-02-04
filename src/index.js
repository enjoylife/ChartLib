import d3 from 'd3';
import legend from 'd3-svg-legend/no-extend';


import {
  MAXWIDTH, MAXHEIGHT, MINWIDTH, MINHEIGHT,
  margin, sortDirection
} from './constants.js';

import "./charts.less";


// Main entry to charting lib
$('.chart-lib').each(function()  {
  var config = getChartConfigVIAGlobal(getChartID(this));

  var csvURL = config.data;

  applyStyle(this, config);

  var chart = createContainer(this);
  var tooltip = createToolTip(this);

  getAndParseChartData(csvURL, function(rows) {
      var dimensions = getChartDimensions(chart);
      var scales = inferSimpleScales(dimensions, rows);

      var axes = inferSimpleAxes(config, scales);

      createAxes(chart, axes, config, dimensions.height);
      createChart(chart, tooltip, rows, scales, dimensions.height);
      window.setTimeout(function() {
        barChartSortAnimation(chart, axes, rows, scales, sortDirection.descending);
      },2000)
  });

});





/**
 * CODE WHICH RELIES ON THE DOM AND ELEMENTS
 */


// Gets asyncronously gets chart data and then calls the callback with the rows
// as well as columns in the rows.columns property
function getAndParseChartData(url, cb) {
    d3.csv(url, function (rows) {
        rows.columns = inferColumns(rows);

        if(cb) cb(rows);
    });
}


// creates the svg and sets the required attrs
function createContainer(el) {
    var dimensions = computeOptimalSize(el.parentElement);

    var container = d3.select(el).append("svg")
        .attr("width",dimensions.width + margin.left + margin.right)
        .attr("height", dimensions.height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return container;
}

function createAxes(chart, axes, config, height) {
  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(axes.x);

  chart.append("g")
      .attr("class", "y axis")
      .call(axes.y)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(config.yAxisLabel);
}


function createToolTip(el) {
// Define the div for the tooltip
return  d3.select(el).append("div")
    .attr("class", "ca-gov-chart-tooltip")
    .style("opacity", 0);
}


function applyStyle(el, config) {
  el.className += " " + config.style;
}

function createChart(chart,tooltip, rows, scales, height) {

  var bars = chart.selectAll(".bar")
      .data(rows)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d, i) {
          return "translate(" + scales.x(d[scales.xProp]) +"," + 0 + ")"; });
    // .enter().append("rect");

    // Bar minimum
    bars.append("rect")
    .attr("x", d => {return 0  })
    .attr("width", scales.x.rangeBand())
    .attr("y", d => { return scales.y(d[scales.yProp]);  })
    .attr("height", d=> { return height - scales.y(d[scales.yProp]) })



  // Hover actions
  .on("mouseover", function(d) {
      tooltip.transition()
          .duration(200)
          .style("opacity", .9);
      tooltip	.html(scales.xProp + ": " + d[scales.xProp] + "<br/>" + scales.yProp + ": "  + d[scales.yProp])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  });

  // TODO: utilize transform
  // like http://bl.ocks.org/mbostock/1584697

  // Append Y values to bar tips
  bars.append("text")
    .attr("text-anchor", "middle")
    .attr("x", scales.x.rangeBand() / 2 )
    .attr("y", function(d) {return scales.y(d[scales.yProp]) + 12; } )
    .attr("dy", ".35em")
    .text(function(d, i) { return i; });

}

// Assuming the config was set on the window object
// using the format graph__config__[ID], without the brackets
function getChartConfigVIAGlobal(elemID) {
    return window['graph__config__' + elemID];
}


// Get the id of this chart
function getChartID(el) {
    return el.getAttribute("id");
}


// Pull out the url for the data
function getChartData(el) {
  return el.getAttribute('data-csv');
}

function getChartDimensions(el) {
if(el instanceof d3.selection) {
  return computeOptimalSize(el.node().parentElement);
}
return computeOptimalSize(el.parentElement);
}


/**
 * My idea of the perfectly sized chart is one where the
 *  aspect ratio is properly maintained to maximize clarity or the data.
 *  Not only that but the white space around the chart respects
 *  responsive design decisions.
 */
function computeOptimalSize(el) {
      var width = Math.max(Math.min(MAXWIDTH, el.clientWidth), MINWIDTH) ;
      if(width > window.innerWidth) width  = window.innerWidth;

      var height = Math.max(Math.min(MAXHEIGHT, el.clientHeight),MINHEIGHT);
      if(height > window.innerHeight) height = window.innerHeight;

      return {
        width: width - margin.left - margin.right,
        height: height -  margin.top - margin.bottom
      };
}




function barChartSortAnimation(chart, axes, data, scales, direction) {


    var cmpFunc;
    if(direction == sortDirection.ascending){
      cmpFunc = function (a, b) {
          return a[scales.yProp] - b[scales.yProp]
      }
    } else {
      cmpFunc = function (a, b) {
        return  b[scales.yProp] - a[scales.yProp]
      }
    }

  // Copy-on-write since tweens are evaluated after a delay.
  var x0 = scales.x.domain(data.sort(cmpFunc)
      .map(function(d) { return d[scales.xProp]; }))
      .copy();

  chart.selectAll(".bar")
        .sort(function(a, b) { return x0(a[scales.xProp]) - x0(b[scales.xProp]); });

var transition = chart.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("transform", function(d, i) {
            return "translate(" + scales.x(d[scales.xProp]) +"," + 0 + ")"; });

    transition.select(".x.axis")
        .call(axes.x)
      .selectAll("g")
        .delay(delay);

}

/**
 * CODE WHICH HAS NO DEPENDENCY ON DOM, JUST PURE JS
 */


// Assumes we have just two dimensions within the row data
function inferSimpleScales(dimensions, rows) {
  cbug(rows.columns.length == 2, "inferSimpleScales was not given data with two dimensions. It was given:" + rows.columns.join(","));

  let xProp = rows.columns[0]
  let yProp = rows.columns[1];

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, dimensions.width], .1);

  var y = d3.scale.linear()
    .range([dimensions.height, 0]).nice();

  x.domain(rows.map( d => {return d[xProp]; } ));
  y.domain([0, d3.max(rows, (d) => { return +d[yProp];})]);

  return {x, y, xProp, yProp};
}


function inferSimpleAxes(config, scales) {
  var xAxis = d3.svg.axis()
    .scale(scales.x)
    .orient("bottom");

  var yAxis = customAxis()
      .scale(scales.y)
      .orient("left")
      .outerTickSize(0)
      .useMinimal(config.style == 'minimal')
      .simpleFormat(config.yAxisFormat);


  return {x : xAxis, y:  yAxis}
}


function customAxis() {

    var axis = d3.svg.axis();

     axis.useMinimal = function(bool) {
      if(bool) {
        return  axis.tickValues(axis.scale().domain());
      }
      return axis
    }

    axis.simpleFormat = function(format) {
      switch (format) {
        case  "currency":
          return  axis.tickFormat(d3.format("$g"));
        case "scientific":
           return  axis.tickFormat(d3.format("s"));
        case "percentage":
           return axis.tickFormat(d3.format("%"));
        default:
           return axis;
      }
    }

    return axis;
}




// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}


function cbug(check, message) {
  if(!check) {
    console.error(message);
    throw message;
  }

}
