import React from 'react';
import * as d3 from 'd3';
import { extent } from 'd3';


const ScatterPlot = ({
    config:{
        colorScale,
        containerWidth,
        containerHeight,
        margin,
        tooltipPadding,
    },
    radius,
    data,
    updateData,
}) => {

    const svgRef = React.useRef();

    const chart = React.useRef();
    const xAxisG = React.useRef();
    const yAxisG = React.useRef();
    const bars = React.useRef();
    const _colorScale = React.useRef();
    const width = React.useRef();
    const height = React.useRef();
    const xScale = React.useRef();
    const yScale = React.useRef();
    const xAxis = React.useRef();
    const yAxis = React.useRef();
    const _containerWidth = React.useRef();
    const _containerHeight = React.useRef();
    const [ initialized, setInitialized ] = React.useState(false)
    const _tooltipPadding = React.useRef()
    const _margin = React.useRef();

    const colors = ['#FF0000', '#AA00FF', '#B9D7ED', '#00EAFF', '#FF7F00', '#BFFF00', '#0095FF', '#FF00AA', '#FFD400', '#EDB9B9'];

    React.useEffect(() =>{
        initVis();
    }, [])

    React.useEffect(() => {
        if (initialized) {
            updateVis();
        }        
    }, [data, radius])  

    var oldx = 0
    var oldy = 0

    var dragging = true;

    const initVis = () => {
        let svg = d3.select(svgRef.current);
        _tooltipPadding.current = tooltipPadding || 15
        _containerWidth.current = containerWidth || 800;
        _containerHeight.current =  containerHeight || 600;
        svg.attr('width', _containerWidth.current).attr('height', _containerHeight.current);
        _margin.current = margin || {top: 25, right: 20, bottom: 20, left: 40};
        width.current = _containerWidth.current - _margin.current.left - _margin.current.right;
        height.current = _containerHeight.current - _margin.current.top - _margin.current.bottom;
        
        xScale.current = d3.scaleLinear().range([0, width.current]);
        yScale.current = d3.scaleLinear().range([height.current, 0]);

        xAxis.current = d3.axisBottom(xScale.current)
            .ticks(6)
            .tickSize(-height.current - 10)
            .tickPadding(10)
            .tickFormat(d => d);
        yAxis.current = d3.axisLeft(yScale.current)
            .ticks(6)
            .tickSize(-width.current - 10)
            .tickPadding(10);
        
        chart.current = svg.append('g').attr('transform', `translate(${_margin.current.left},${_margin.current.top})`);
        xAxisG.current = chart.current.append('g').attr('class', 'axis x-axis').attr('transform', `translate(0,${height.current})`);
        yAxisG.current = chart.current.append('g').attr('class', 'axis y-axis');
        svg.append('text').attr('class', 'axis-title').attr('x', 0).attr('y', 0).attr('dy', '.71em').text('Y');
        svg.append('text').attr('class', 'axis-title').attr('x', width.current+_margin.current.left+10).attr('y',height.current+_margin.current.bottom+10).attr('dy', '.71em').text('X');

        _colorScale.current = d3.scaleOrdinal()
            .range(['#a0a1e2', '#6495ed', '#04ea17']) 
            .domain(['Easy','Intermediate','Difficult']);

        setInitialized(true);
    }

    const updateVis = () => {
        let svg = d3.select(svgRef.current);
        let colorValue = d => d.cluster;
        let xValue = d => d.length;
        let yValue = d => d.width;

        xScale.current.domain([d3.min(data, xValue), d3.max(data, xValue)]);
        yScale.current.domain([d3.min(data, yValue), d3.max(data, yValue)]);

        // renderVis()
        bars.current = chart.current.selectAll('.point')
        .data(data, d => d.trail)
        .join('circle')
        .attr('class', 'point')
        .attr('r', radius || 6)
        .attr('cy', d => yScale.current(yValue(d)))
        .attr('cx', d => xScale.current(xValue(d)))
        .attr('fill', d => colors[colorValue(d)])
        .on("click", function() {
            if (d3.event.shiftKey) {
                dragging = false;
                var cls = d3.select(this)._groups[0][0].classList.value
                if (cls.includes("selected")){
                    d3.select(this).classed("selected", false)
                }
                else{
                    d3.select(this).classed("selected", true)
                }
                dragging = true;
            };
        })

        svg.call(d3.drag()
        .on("start", function () {
            oldx = d3.event.x
            oldy = d3.event.y
        })
        .on("drag", function () {
            if (d3.event.sourceEvent.shiftKey) {return}
            if (!dragging) {return}
            var pts = d3.selectAll('.selected')._groups[0]
            for (var i = 0; i < pts.length; i++){
                var tmpx = d3.select(pts[i])._groups[0][0].cx.baseVal.value
                var tmpy = d3.select(pts[i])._groups[0][0].cy.baseVal.value
                d3.select(pts[i]).attr('cx', tmpx + d3.event.x - oldx)
                d3.select(pts[i]).attr('cy', tmpy + d3.event.y - oldy)
            }
            oldx = d3.event.x
            oldy = d3.event.y
        })
        .on("end", function () {
            if (d3.event.sourceEvent.shiftKey) {return}
            if (!dragging) {return}
            var pts = d3.selectAll('.selected')._groups[0]
            if (pts.length == 0) {return}

            var pos = []
            var values = []
            for (var i = 0; i < pts.length; i++){
                var oldl = d3.select(pts[i])._groups[0][0].__data__.length
                var oldw = d3.select(pts[i])._groups[0][0].__data__.width
                var tmpx = d3.select(pts[i])._groups[0][0].cx.baseVal.value
                var tmpy = d3.select(pts[i])._groups[0][0].cy.baseVal.value

                values.push([oldl, oldw])
                pos.push([tmpx, tmpy])
            }

            var tmp = []
            for (var i=0; i<data.length; i++){
                var found = false;
                var comp = [data[i].length, data[i].width]
                for (var j=0; j<values.length; j++) {
                    if (comp[0] == values[j][0] && comp[1] == values[j][1]){
                        var x1 = xScale.current.invert(pos[j][0])
                        var y1 = yScale.current.invert(pos[j][1])
                        tmp.push([x1, y1])
                        found = true;
                        break
                    }
                }
                if (!found) {
                    tmp.push([data[i].length, data[i].width]) 
                }
            } 
            updateData(tmp)
        }))

        xAxisG.current.call(xAxis.current);
        yAxisG.current.call(yAxis.current);
    }

    return (
        <svg ref={svgRef}></svg>
    );
}

export default ScatterPlot;