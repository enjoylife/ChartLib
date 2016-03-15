import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import "./charts.less";

import StreamGraph from './StreamGraph.jsx';

fetch('/data/test.json')
  .then(function(response) {
    return response.json()
  }).then(function(json) {
    console.log('parsed json', json)
    ReactDOM.render(<StreamGraph />, document.getElementById('streamgraph'));
  }).catch(function(ex) {
    console.log('parsing failed', ex)
  })

