import React, { Component } from 'react';
//import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import autobind from 'class-autobind'
import * as d3 from 'd3'
import D3Container from './d3container'
import Amazons from './amazons'
import RandomPlay from './random_play'
import MinMax from './minmax';
import MCTS from './mcts'

export default class UI extends Component {

    constructor() {
        super();
        autobind(this);

        this.state = {
            amazons_state: undefined,
            destination_moves: [],
            cross_moves: [],
            transition_time: 300,
            //ai: new RandomPlay()
            min_max_ai: new MinMax(5),
            mcts_ai: new MCTS(1000)
        };
    }

    componentWillMount() {
        this.initialize();
    }

    componentDidMount() {
        this.createBoard();
        this.renderBoard();
    }

    initialize() {
        this.setState({ amazons_state: Amazons.build_initial_state() });
    }

    reset() {
    }

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
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
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
            .style('fill', 'none');

        grid.exit().remove();

        let walls = g.selectAll('.wall').data(this.state.amazons_state.board);

        walls.enter().append('rect')
            .attr('class', 'wall')
            .attr('x', (d, i) => this.x_scale(Amazons.convertIndexToXY(i).x))
            .attr('y', (d, i) => this.y_scale(Amazons.convertIndexToXY(i).y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .style('opacity', d => d === Amazons.cross ? 1.0 : 0.0)
            .style('fill', 'grey');

        walls.transition()
            .duration(1000)
            .style('opacity', d => d === Amazons.cross ? 1.0 : 0.0);

        walls.exit().remove();

        let left_pieces = g.selectAll('.left_piece').data(this.state.amazons_state.player_piece_indices[Amazons.leftPlayer]);

        left_pieces.enter().append('circle')
            .attr('class', 'left_piece')
            .attr('r', this.cell_size / 4.0)
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .attr('cx', d => this.x_scale(Amazons.convertIndexToXY(d).x) + this.x_scale(1) / 2.0)
            .attr('cy', d => this.y_scale(Amazons.convertIndexToXY(d).y) + this.y_scale(1) / 2.0)
            .on('click', function(d) {
                if (self.state.amazons_state.player === Amazons.leftPlayer) {
                    self.setState({ destination_moves: [], cross_moves: [] });
                    self.setState({ destination_moves: Amazons.listDestinationMovesForPiece(self.state.amazons_state, d) });
                }
            });

        left_pieces.transition()
            .duration(this.state.transition_time)
            .attr('cx', d => this.x_scale(Amazons.convertIndexToXY(d).x) + this.x_scale(1) / 2.0)
            .attr('cy', d => this.y_scale(Amazons.convertIndexToXY(d).y) + this.y_scale(1) / 2.0);

        left_pieces.exit().remove();

        let right_pieces = g.selectAll('.right_piece').data(this.state.amazons_state.player_piece_indices[Amazons.rightPlayer]);

        right_pieces.enter().append('circle')
            .attr('class', 'right_piece')
            .attr('r', this.cell_size / 4.0)
            .style('stroke', 'grey')
            .style('fill', 'white')
            .attr('cx', d => this.x_scale(Amazons.convertIndexToXY(d).x) + this.x_scale(1) / 2.0)
            .attr('cy', d => this.y_scale(Amazons.convertIndexToXY(d).y) + this.y_scale(1) / 2.0)
            .on('click', function(d) {
                // if (self.state.amazons_state.player === Amazons.rightPlayer) {
                //     self.setState({ destination_moves: [], cross_moves: [] });
                //     self.setState({ destination_moves: Amazons.listDestinationMovesForPiece(self.state.amazons_state, d) });
                // }
            });

        right_pieces.transition()
            .duration(this.state.transition_time)
            .attr('cx', d => this.x_scale(Amazons.convertIndexToXY(d).x) + this.x_scale(1) / 2.0)
            .attr('cy', d => this.y_scale(Amazons.convertIndexToXY(d).y) + this.y_scale(1) / 2.0);

        right_pieces.exit().remove();

        let destinations = g.selectAll('.destination').data(this.state.destination_moves);

        destinations.enter().append('rect')
            .attr('class', 'destination')
            .attr('x', d => this.x_scale(d.destination_x))
            .attr('y', d => this.y_scale(d.destination_y))
            .attr('width', this.x_scale(1))
            .attr('height', this.y_scale(1))
            .style('stroke', 'grey')
            .style('fill', 'grey')
            .style('opacity', 0.2)
            .on('mouseover', function(d) {
                g.select('.moving_piece')
                    .style('opacity', 1.0)
                    .style('fill', d => self.state.amazons_state.player === Amazons.leftPlayer ? 'grey' : 'white')
                    .attr('cx', self.x_scale(d.destination_x) + self.x_scale(1) / 2.0)
                    .attr('cy', self.y_scale(d.destination_y) + self.y_scale(1) / 2.0);
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
            .style('opacity', 0.2)
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
                let new_amazons_state = Amazons.applyMove(self.state.amazons_state, d);
                self.setState( {
                    destination_moves: [],
                    cross_moves: [],
                    amazons_state: new_amazons_state
                });

                setTimeout(function() {
                    let ai_moved_amazons_state = self.state.min_max_ai.compute(new_amazons_state);

                    if (ai_moved_amazons_state === null) {
                        ai_moved_amazons_state = self.state.mcts_ai.compute(new_amazons_state);
                    } else {
                        console.log('used min max');
                    }

                    self.setState( {
                        amazons_state: ai_moved_amazons_state
                    });
                }, 1000);
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
