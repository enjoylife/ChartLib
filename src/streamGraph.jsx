import React, {Component, PropTypes} from 'react';

import {  MAXWIDTH, MAXHEIGHT, MINWIDTH, MINHEIGHT, margin } from './constants.js';

class StreamGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredOver: false,
            animating: false,
            caching: false,
            width: MINWIDTH,
            height: MINHEIGHT,
            ready: false,
        }
    }
    
    componentDidMount() {
        this.setState({
            // set width and height
        });
    }
    
    
    render() {
        return (
            <div className="stream-graph-wrapper">
                <svg>
                <g> </g>
                </svg>
            </div>
        );
    }
}

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

export default StreamGraph;