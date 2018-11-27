import React, { Component } from 'react';
//import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import autobind from 'class-autobind'
import * as d3 from 'd3'
import D3Container from './d3container'
import Amazons from './amazons'

export default class UI extends Component {

    constructor() {
        super();
        autobind(this);

        this.state = {
            amazons_state: undefined,
            destination_moves: [],
            cross_moves: []
        };
    }

    componentWillMount() {
        this.initialize();
    }

    componentDidMount() {
        this.createBoard();
        this.renderBoard();

        console.log(Amazons.listMoves(this.state.amazons_state));
    }

    initialize() {
        // let initial_state = Amazons.build_initial_state();

        this.setState({ amazons_state: Amazons.build_initial_state() });
    }

    reset() {
    }

    // createEmptyColorMask(size) {
    //     let empty_mask = [];
    //     for (let i = 0; i < size; ++i) {
    //         empty_mask.push('none');
    //     }
    //     return empty_mask;
    // }

    createBoard() {

        // define the screen size of the board
        let margin = { top: 10, right: 10, bottom: 10, left: 10 };
        let padding = { top: 10, right: 10, bottom: 10, left: 10 };

        this.container = new D3Container(margin, padding, 500, 500);

        // // scale to map board size to screen size
        this.x_scale = d3.scaleLinear().domain([0, Amazons.width]).range([0, this.container.width]);
        this.y_scale = d3.scaleLinear().domain([0, Amazons.height]).range([0, this.container.height]);

        this.cell_size = Math.min(this.x_scale(1), this.y_scale(1));

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

        g.append('circle')
            .attr('class', 'moving_piece')
            .attr('r', this.cell_size / 4.0)
            .style('stroke', 'grey')
            .style('fill', 'red')
            .style('opacity', 0.0);

        g.append('rect')
            .attr('class', 'moving_cross')
            .attr('height', this.cell_size)
            .attr('width', this.cell_size)
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .style('opacity', 0.0);
    }

    renderBoard() {

        let self = this;

        let g = d3.select(this.refs.div_board).select('svg').select('#board_group');

        // create a grid to show all positions on the board
        let grid = g.selectAll('.square').data(this.state.amazons_state.board);

        grid.enter().append('rect')
            .attr('class', 'square')
            .attr('x', (d, i) => this.x_scale(Amazons.convertIndexToXY(i).x))
            .attr('y', (d, i) => this.y_scale(Amazons.convertIndexToXY(i).y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .merge(grid)
            .style('fill', d => d === Amazons.cross ? 'grey' : 'none');

        grid.exit().remove();

        // create a grid to show all positions on the board
        let pieces = g.selectAll('.piece').data(this.state.amazons_state.player_piece_indices[Amazons.leftPlayer]);

        pieces.enter().append('circle')
            .attr('class', 'piece')
            .attr('r', this.cell_size / 4.0)
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .merge(pieces)
            .attr('cx', d => this.x_scale(Amazons.convertIndexToXY(d).x) + this.cell_size / 2.0)
            .attr('cy', d => this.y_scale(Amazons.convertIndexToXY(d).y) + this.cell_size / 2.0)
            .on('click', d => {
                this.setState({ destination_moves: [], cross_moves: [] });
                this.setState({ destination_moves: Amazons.listDestinationMovesForPiece(this.state.amazons_state, d) });
            });

        pieces.exit().remove();

        let destinations = g.selectAll('.destination').data(this.state.destination_moves);

        destinations.enter().append('rect')
            .attr('class', 'destination')
            .attr('x', d => this.x_scale(d.destination_x))
            .attr('y', d => this.y_scale(d.destination_y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .style('opacity', 0.1)
            .on('mouseover', function(d) {
                g.select('.moving_piece')
                    .style('opacity', 1.0)
                    .attr('cx', self.x_scale(d.destination_x) + self.cell_size / 2.0)
                    .attr('cy', self.y_scale(d.destination_y) + self.cell_size / 2.0);
            })
            .on('mouseout', function(d) {
                if (self.state.cross_moves.length === 0) {
                    g.select('.moving_piece')
                    .style('opacity', 0);
                }
            })
            .on('click', function(d) {
                let source_index = Amazons.convertXYToIndex(d.source_x, d.source_y);
                let destination_index = Amazons.convertXYToIndex(d.destination_x, d.destination_y);

                self.setState({ destination_moves: [], cross_moves: [] });
                self.setState({ cross_moves: Amazons.listCrossMovesForPiece(self.state.amazons_state, source_index, destination_index) });
            });

        destinations.exit().remove();

        let crosses = g.selectAll('.cross').data(this.state.cross_moves);

        crosses.enter().append('rect')
            .attr('class', 'cross')
            .attr('x', d => this.x_scale(d.cross_x))
            .attr('y', d => this.y_scale(d.cross_y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .style('opacity', 0.1)
            .on('mouseover', function(d) {
                g.select('.moving_cross')
                    .style('opacity', 1.0)
                    .attr('x', self.x_scale(d.cross_x))
                    .attr('y', self.y_scale(d.cross_y));
            })
            .on('mouseout', function(d) {
                g.select('.moving_cross')
                    .style('opacity', 0);
            })
            .on('click', function(d) {
                console.log(d);
                let new_amazons_state = Amazons.applyMove(self.state.amazons_state, d);
                self.setState( { destination_moves: [], cross_moves: [] });
                self.setState( { amazons_state: new_amazons_state } );
                console.log(new_amazons_state);
            });

        crosses.exit().remove();
    }

    render() {

        if (this.container !== undefined) {
            this.renderBoard();
        }

        return (
            <div>
                {/* <div> Hello World!</div> */}
                <div ref='div_board'/>
            </div>
        );
    }
}
