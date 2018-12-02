import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import autobind from 'class-autobind'
import * as d3 from 'd3'
import D3Container from './d3container'
import Amazons from './amazons'
import RandomPlay from './random_play'
import MinMax from './minmax';
import ScopeAI from './scope_ai'
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
            game_status: 'On Going',
            left_player_ai_drop_down_open: false,
            right_player_ai_drop_down_open: false,
            left_player_ai_name: 'Human',
            right_player_ai_name: 'MCTS'
        };

        this.ais = {
            'Human': undefined,
            'Random Play': new RandomPlay(),
            'Scope AI': new ScopeAI(),
            'MCTS': new MCTS(150)
        };

        this.min_max = new MinMax(5);
    }

    componentWillMount() {
        this.initialize();
    }

    componentDidMount() {
        this.createBoard();
        this.renderBoard();
        this.createInfoBoard();
        this.renderInfoBoard();
    }

    initialize() {
        this.setState({
            amazons_state: Amazons.build_initial_state(),
            game_status: 'On Going',
            destination_moves: [],
            cross_moves: [],
        });
    }

    reset() {
        this.initialize();

        let g = d3.select(this.refs.div_board).select('svg').select('#board_group');
        g.select('.moving_piece').style('opacity', 0);
    }

    step() {

        if (this.state.game_status !== 'On Going') return;

        let ai = this.state.amazons_state.player === Amazons.leftPlayer ?
                    this.ais[this.state.left_player_ai_name] :
                    this.ais[this.state.right_player_ai_name];

        if (ai !== undefined) {
            let ai_moved_amazons_state = this.min_max.compute(this.state.amazons_state);
            if (ai_moved_amazons_state === null) {
                ai_moved_amazons_state = ai.compute(this.state.amazons_state);
            } else {
                console.log('used min max');
            }

            this.setState({
                amazons_state: ai_moved_amazons_state
            });

            this.checkWinner(ai_moved_amazons_state);
        }
    }

    checkWinner(amazons_state) {

        let l_has_lost = Amazons.hasLost(amazons_state, Amazons.leftPlayer);
        let r_has_lost = Amazons.hasLost(amazons_state, Amazons.rightPlayer);

        if (l_has_lost === true) {
            this.setState({  game_status: 'White Won' });
        }

        if (r_has_lost === true) {
            this.setState({  game_status: 'Black Won' });
        }
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

    createInfoBoard() {
        let margin = { top: 10, right: 10, bottom: 10, left: 10 };
        let padding = { top: 100, right: 100, bottom: 100, left: 100 };

        this.container_info = new D3Container(margin, padding, 500, 500);
        this.x_scale_info = d3.scaleLinear().domain([0, Amazons.width]).range([0, this.container.width]);
        this.y_scale_info = d3.scaleLinear().domain([0, Amazons.height]).range([0, this.container.height]);

        let svg = d3.select(this.refs.div_info_board)
            .append('svg')
            .attr('width', this.container_info.outer_width)
            .attr('height', this.container_info.outer_height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        let g = svg.append('g')
            .attr('id', 'info_group')
            .attr('transform', `translate(${padding.left}, ${padding.top})`);

        g.append('rect')
            .attr('width', this.container_info.width)
            .attr('height', this.container_info.height)
            .attr('fill', 'lightgrey')
            .style('opacity', 0.5);

        g.append('text')
            .attr('class', 'turn_text')
            .attr('x', this.container_info.width / 2.0)
            .attr('y', this.container_info.height / 3.0)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '22px');

        g.append('text')
            .attr('class', 'on_going_text')
            .attr('x', this.container_info.width / 2.0)
            .attr('y', this.container_info.height * 2.0 / 3.0)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '22px')
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
                if (self.state.amazons_state.player === Amazons.leftPlayer &&
                    self.state.left_player_ai_name === 'Human') {
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
                if (self.state.amazons_state.player === Amazons.rightPlayer &&
                    self.state.right_player_ai_name === 'Human') {
                    self.setState({ destination_moves: [], cross_moves: [] });
                    self.setState({ destination_moves: Amazons.listDestinationMovesForPiece(self.state.amazons_state, d) });
                }
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
                self.checkWinner(new_amazons_state);
            });

        crosses.exit().remove();
    }

    renderInfoBoard() {

        let g = d3.select(this.refs.div_info_board).select('svg').select('#info_group');

        g.select('.turn_text')
            .text(this.state.amazons_state.player === Amazons.leftPlayer ? "Black's Turn" : "White's Turn");

        g.select('.on_going_text')
            .text(this.state.game_status);
    }

    changeAlgorithm(player, ai_name) {
        if (player === Amazons.leftPlayer) {
            this.setState({left_player_ai_name: ai_name});
        } else {
            this.setState({right_player_ai_name: ai_name});
        }
    }

    toggleLeftPlayerAiDropDown() {
        this.setState(prevState => ({
            left_player_ai_drop_down_open: !prevState.left_player_ai_drop_down_open,
            destination_moves: [],
            cross_moves: [],
        }));
    }

    toggleRightPlayerAiDropDown() {
        this.setState(prevState => ({
            right_player_ai_drop_down_open: !prevState.right_player_ai_drop_down_open,
            destination_moves: [],
            cross_moves: [],
        }));
    }

    render() {
        if (this.container !== undefined) {
            this.renderBoard();
            this.renderInfoBoard();
        }

        let left_player_options = Object.keys(this.ais).map(ai_name =>
            <DropdownItem key={ai_name} onClick={() => this.changeAlgorithm(Amazons.leftPlayer, ai_name)}>
                {ai_name}
            </DropdownItem>
        );

        let right_player_options = Object.keys(this.ais).map(ai_name =>
            <DropdownItem key={ai_name} onClick={() => this.changeAlgorithm(Amazons.rightPlayer, ai_name)}>
                {ai_name}
            </DropdownItem>
        );

        return (
            <div>
                <div ref='div_board' style={{float: 'left'}}/>
                <div ref='div_info_board'/>
                <div className='row'>
                    <Button color='info' className='btn-sm' onClick={this.step}>
                        step
                    </Button>
                    &nbsp;
                    <Dropdown isOpen={this.state.left_player_ai_drop_down_open}
                        toggle={this.toggleLeftPlayerAiDropDown}>
                        <DropdownToggle color="secondary" caret>
                            {this.state.left_player_ai_name}
                        </DropdownToggle>
                        <DropdownMenu>
                            {left_player_options}
                        </DropdownMenu>
                    </Dropdown>
                    &nbsp;
                    <Dropdown isOpen={this.state.right_player_ai_drop_down_open}
                        toggle={this.toggleRightPlayerAiDropDown}>
                        <DropdownToggle color="secondary" caret>
                            {this.state.right_player_ai_name}
                        </DropdownToggle>
                        <DropdownMenu>
                            {right_player_options}
                        </DropdownMenu>
                    </Dropdown>
                    &nbsp;
                    <Button color='warning' className='btn-sm' onClick={this.reset}>
                        reset
                    </Button>
                    &nbsp;
                </div>
            </div>
        );
    }
}
