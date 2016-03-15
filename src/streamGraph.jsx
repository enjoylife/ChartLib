/**
 * @name StreamGraph
 * @author Matthew Clemens
 * @version 0.0.1
 * 
 * @summary A streamgraph is a type of stacked area graph where its features result in a flowing, organic shape.
 * 
 * @description The primary goals are  to highlight and represent 2 ~ 10 dimensions of a data set
 * over some period of time. A StreamGraph will have applicability in constrained domains such as in 
 * mobile or dense dashboards, facilitated by using interactive elements like data filtering, annotations, and responsive elements, 
 * 
 * A StreamGraph will be a improvement over a standard area graph which is limited in the number of dimensions it can show. The tradtional 
 * area graph shows differing attributes by opacity or sorting and then laying of dimensions on top over each other.
 * Such a graph becomes too cluttered after only 3 or 4 dimensions and can't represent many side by side comparisons.
 * 
 */

import React, {Component, PropTypes} from 'react';

import {
    sortDirection, breakpoints, getBreakpoint
} from './constants';

import { debounce } from './helpers';

import d3 from 'd3';

class StreamGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hoveredOver: false,
            animating: false,
            caching: false,
            width: 0,
            height: 0,
            ready: false,
            margin: margins
        }

        // TODO: Should we use this? 
        //var format = d3.time.format("%m/%d/%y");

        // hold onto a reference so we can removeEventListener on componentWillUnmount
        this.onResize = debounce(this.setDimensions.bind(this), 50);




    }

    setDimensions(e) {

        // set to the dom node's width if availble
        var width = this.state.width;
        if (this.svg !== null) {
            width = this.svg.clientWidth;
        }

        console.log(width);
        this.setState({
            width,
            margin: optimalMargin(width)
        });

    }

    componentDidMount() {

        // setup our current dimensions, and prepare for resizes
        this.setDimensions();
        window.addEventListener('resize', this.onResize);

        this.initD3();

    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }


    render() {

        let width = this.getWidth();
        let height = this.getHeight();
        let trans = this.getTransform();


        return (
            <div className="stream-graph-wrapper">
                <svg width={width} height={height} ref={(ref) => this.svg = ref}>
                    <g transform={trans}> </g>
                </svg>
            </div>
        );
    }


    /**
     * Create / Update / Remove D3.js elements
     */



    initD3() {
        let svg = d3.select(this.svg);
        this.layers = svg.selectAll(".layer");

        this.xAxis = svg.append("g");
        this.yAxis = svg.append("g");

        this.xScale = d3.time.scale();
        this.yScale = d3.scale.linear();
        this.zScale = d3.scaleCategory20b();

        this.funcXAxis  = d3.svg.axis();
        this.funcYAxis = d3.svg.axis()


    }

    updateAxis() {

        let width = this.getWidth();
        let height = this.getHeight();

        this.xScale.range([0, width])
        .domain(d3.extent(data, function(d) { return d.date; }));
        
        this.yScale.range([height, 0])
        .domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
        
        this.funcXAxis
            .scale(this.xScale)
            .orient("bottom")
        // .ticks(d3.time.weeks);

        this.funcYAxis.scale(this.yScale);
    }


    createStreamD3() {


        var stack = d3.layout.stack()
            .offset("silhouette")
            .values(d => { return d[this.props.] })
            .x( d => { return d[this.props.xAxisKey]})
            .y(d => { return d[this.props.yAxisKey]});


        var nest = d3.nest()
            .key( d => {return d[this.props.GroupOnKey]});

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return x(d.date); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });


        this.props.data.forEach(function(d) {
            d.date = format.parse(d.date);
            d.value = +d.value;
        });

     


    }




    updateLayers() {

        const data = prepareData(this.props, this.state);
        // updating data 
        this.layers = this.layers.data(data);

        // entering 
        this.layers.enter().append("path")
            .attr("class", "layer");

        // entering & prexisiting
        this.layers
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d, i) { return z(i); });

        // old and unneeded
        this.layers.exit().remove();
    }

    /**
     * Helpers for getting dimensions
     */

    getWidth() {
        return this.state.width + this.state.margin.left + this.state.margin.right;
    }


    getHeight() {
        return this.state.height + this.state.margin.top + this.state.margin.bottom;
    }


    getTransform() {
        return "translate(" + this.state.margin.left + "," + this.state.margin.top + ")";
    }
}

/**
 * The StreamGraph exposed api
 */
StreamGraph.propTypes = {

    // The rows of data
    data: PropTypes.array,

    // The header strings for each row
    // aligned in array position with the data
    keys: PropTypes.array,

    GroupOnKey: PropTypes.string,
    xAxisKey: PropTypes.string,
    yAxisKey: PropTypes.string,

    xAxisConfig: PropTypes.object,
    yAxisConfig: PropTypes.object


};



/**
 * The default margin between a graph and the outer svg container
 */
const margins = { top: 20, right: 30, bottom: 0, left: 0 };


/**
* My idea of the perfectly sized chart is one where the
*  aspect ratio is properly maintained to maximize clarity or the data.
*  Not only that but the white space around the chart respects
*  responsive design decisions.
*  @param width {Number}
*/

function optimalMargin(width) {
    // get our defaults
    var margin = margins;

    switch (getBreakpoint(width)) {

        // minimalistic look when we are small
        case margins.sm:
            margin.right = 0;
            break;
        default:
        // nothing to change
    }

    return margin;
};


function prepareData(props, state) {
    return props.data;
}


/**
 * @param streamGraph {StreamGraph}
 */
function updateAxis(streamGraph) {

    streamGraph.xAxis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + streamGraph.state.height + ")")
        .call(streamGraph.xScale);

    streamGraph.yAxis
        .attr("class", "y axis")
        .attr("transform", "translate(" + streamGraph.state.width + ", 0)")
        .call(streamGraph.yScale.orient("right"));
}

export default StreamGraph;