import {
  MAXWIDTH, MAXHEIGHT, MINWIDTH, MINHEIGHT,
  margin, sortDirection
} from './constants.js';

 /**
 * My idea of the perfectly sized chart is one where the
 *  aspect ratio is properly maintained to maximize clarity or the data.
 *  Not only that but the white space around the chart respects
 *  responsive design decisions.
 */
export function computeOptimalSize(el) {
      var width = Math.max(Math.min(MAXWIDTH, el.clientWidth), MINWIDTH) ;
      if(width > window.innerWidth) width  = window.innerWidth;

      var height = Math.max(Math.min(MAXHEIGHT, el.clientHeight),MINHEIGHT);
      if(height > window.innerHeight) height = window.innerHeight;

      return {
        width: width - margin.left - margin.right,
        height: height -  margin.top - margin.bottom
      };
};

// creates the svg and sets the required attrs
export function createContainer(el) { 
    var dimensions = computeOptimalSize(el.parentElement);

    var container = d3.select(el).append("svg")
        .attr("width",dimensions.width + margin.left + margin.right)
        .attr("height", dimensions.height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return container;
}