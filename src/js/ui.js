import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import autobind from 'class-autobind'
import * as d3 from 'd3'
import D3Container from './d3container'

export default class UI extends Component {

    constructor() {
        super();
        autobind(this);

        this.state = {
            board: [],
            height: 5,
            width: 5
        };
    }

    componentWillMount() {
        this.initialize();
    }

    componentDidMount() {
        this.createBoard();
    }

    // converts index to x and y values using board width
    convertIndexToXY(i) {
        return {
            x: i % this.state.width,
            y: Math.floor(i / this.state.width)
        };
    }

    // convert x and y value to one dimensional index
    convertXYToIndex(x, y) {
        return x * this.state.width + y;
    }

    initialize() {
        let board = Array.apply(null, Array(this.state.width * this.state.height));
        this.setState({ board: board });
    }

    reset() {
    }

    createBoard() {

        // define the screen size of the board
        let margin = { top: 10, right: 10, bottom: 10, left: 10 };
        let padding = { top: 10, right: 10, bottom: 10, left: 10 };

        this.container = new D3Container(margin, padding, 300, 300);

        // // scale to map board size to screen size
        this.x_scale = d3.scaleLinear().domain([0, this.state.width]).range([0, this.container.width]);
        this.y_scale = d3.scaleLinear().domain([0, this.state.height]).range([0, this.container.height]);

        // create svg and translate by the margin
        let svg = d3.select(this.refs.div_board)
            .append('svg')
            .attr('width', this.container.outer_width)
            .attr('height', this.container.outer_height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // group that will contain all the content
        let g = svg.append('g')
            .attr('id', 'board_group')
            .attr('transform', `translate(${padding.left}, ${padding.top})`);

        // create a grid to show all positions on the board
        let grid = g.selectAll('.square').data(this.state.board);

        grid.enter().append('rect')
            .attr('class', 'square')
            .attr('x', (d, i) => this.x_scale(this.convertIndexToXY(i).x))
            .attr('y', (d, i) => this.y_scale(this.convertIndexToXY(i).y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .style('fill', 'none');

        grid.exit().remove();
    }

    renderBoard() {
        let g = d3.select(this.refs.div_board).select('svg').select('#board_group');

        // // display x, o, or nothing. x = -1, o = 1, nothing = 0
        // let pieces = g.selectAll('.piece').data(this.state.board);

        // pieces.enter().append('text')
        //     .attr('class', 'piece')
        //     .attr('x', (d, i) => this.xScale(this.convertIndexToXY(i).x))
        //     .attr('y', (d, i) => this.yScale(this.convertIndexToXY(i).y))
        //     .attr('dx', () => this.xScale(1) / 2.0)
        //     .attr('dy', () => this.yScale(1) / 2.0)
        //     .attr('text-anchor', 'middle')
        //     .attr('alignment-baseline', 'middle')
        //     .attr('font-size', 32)
        //     .merge(pieces)
        //     .text(d => {
        //         switch (d) {
        //             case Game.leftPlayer:
        //                 return 'x';
        //             case Game.rightPlayer:
        //                 return 'o';
        //             default:
        //                 return '';
        //         }
        //     })

        // pieces.exit().remove();
    }

    render() {
        this.renderBoard();

        return (
            <div>
                {/* <div> Hello World!</div> */}
                <div ref='div_board'/>
            </div>
        );
    }
}
