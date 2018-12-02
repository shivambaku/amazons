import Utility from './utility';

export class AmazonsState {

    constructor(board, player, left_player_piece_indices, right_player_piece_indices) {
        this.board = board;
        this.player = player;
        this.player_piece_indices = {
            [Amazons.leftPlayer] : left_player_piece_indices,
            [Amazons.rightPlayer] : right_player_piece_indices
        }
    }

    duplicate() {
        return new AmazonsState(this.board.slice(), this.player,
                this.player_piece_indices[Amazons.leftPlayer].slice(),
                this.player_piece_indices[Amazons.rightPlayer].slice());
    }
}

export class AmazonsMove {

    constructor(source_x, source_y, destination_x, destination_y, cross_x, cross_y) {
        this.source_x = source_x;
        this.source_y = source_y;
        this.destination_x = destination_x;
        this.destination_y = destination_y;
        this.cross_x = cross_x;
        this.cross_y = cross_y;
    }
}

export default class Amazons {

    static get blank() {
        return 0;
    }

    static get leftPlayer() {
        return 1;
    }

    static get rightPlayer() {
        return 2;
    }

    static get cross() {
        return 3;
    }

    static opponent(player) {
        return player === Amazons.leftPlayer ? Amazons.rightPlayer : Amazons.leftPlayer;
    }

    static convertIndexToXY(i) {
        return {
            x: i % Amazons.width,
            y: Math.floor(i / Amazons.width)
        };
    }

    static convertXYToIndex(x, y) {
        return y * Amazons.width + x;
    }

    static insideBoard(x, y) {
        return x >= 0 && x < Amazons.width && y >= 0 && y < Amazons.height;
    }

    static get width() {
        return 10;
    }

    static get height() {
        return 10;
    }

    static build_initial_state() {
        let initial_board = [
            0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 2, 0, 0, 2, 0, 0, 0
        ];

        // let initial_board = [
        //     1, 3, 0, 2,
        //     0, 0, 0, 3
        // ]

        // Shows optimal play instead of scope function
        // let initial_board = [
        //     3, 0, 3,
        //     2, 3, 0,
        //     3, 0, 3,
        //     1, 3, 3
        // ]

        // let initial_board = [
        //     2, 3, 0, 0, 0,
        //     0, 0, 0, 3, 0,
        //     0, 0, 0, 0, 0,
        //     0, 0, 0, 0, 0,
        //     0, 0, 0, 0, 1
        // ]

        let left_player_piece_indices = [];
        let right_player_piece_indices = [];

        for (let i = 0; i < initial_board.length; ++i) {
            if (initial_board[i] === Amazons.leftPlayer) {
                left_player_piece_indices.push(i);
            } else if (initial_board[i] === Amazons.rightPlayer) {
                right_player_piece_indices.push(i);
            }
        }

        return new AmazonsState(initial_board,
                                Amazons.leftPlayer,
                                left_player_piece_indices,
                                right_player_piece_indices);
    }

    static applyMove(amazons_state, move, duplicate = true) {

        let new_amazons_state = duplicate === true ? amazons_state.duplicate() : amazons_state;

        let source_index = Amazons.convertXYToIndex(move.source_x, move.source_y);
        let destination_index = Amazons.convertXYToIndex(move.destination_x, move.destination_y);
        let cross_index = Amazons.convertXYToIndex(move.cross_x, move.cross_y);

        new_amazons_state.board[source_index] = Amazons.blank;
        new_amazons_state.board[destination_index] = amazons_state.player;
        new_amazons_state.board[cross_index] = Amazons.cross;

        let index = new_amazons_state.player_piece_indices[amazons_state.player].indexOf(source_index);
        new_amazons_state.player_piece_indices[amazons_state.player][index] = destination_index;

        new_amazons_state.player = Amazons.opponent(amazons_state.player);

        return new_amazons_state;
    }

    static stateValue(state, player, depth, moves) {
        if (moves === undefined) {
            moves = Amazons.listMoves(state);
        }
        if (moves.length === 0) {
            return state.player === player ? 0.0 : 1.0;
        }
        return null;
    }

    static simulationUsingRandom(state, moves, duplicate = true) {
        if (moves === undefined) {
            moves = Amazons.listMoves(state);
        }

        let random_index = Utility.getRandomInt(0, moves.length - 1);
        return Amazons.applyMove(state, moves[random_index], duplicate);
    }

    static simulationUsingScope(state, moves, duplicate = true) {
        if (moves === undefined) {
            moves = Amazons.listMoves(state);
        }

        let scopes = [];
        let max_player_scope = 0;
        for (let i = 0; i < moves.length; ++i) {
            let new_state = Amazons.applyMove(state, moves[i]);
            let scope = {
                player_scope: Amazons.listMoves(new_state, state.player, true).length,
                opponent_scope: Amazons.listMoves(new_state, Amazons.opponent(state.player), true).length
            };

            if (max_player_scope < scope.player_scope) {
                max_player_scope = scope.player_scope;
            }
            scopes.push(scope);
        }

        let min_opponent_scope = Number.MAX_SAFE_INTEGER;
        let index = 0;
        for (let i = 0; i < scopes.length; ++i) {
            if (scopes[i].player_scope === max_player_scope) {
                if (min_opponent_scope > scopes[i].opponent_scope) {
                    min_opponent_scope = scopes[i].opponent_scope;
                    index = i;
                }
            }
        }

        return Amazons.applyMove(state, moves[index], duplicate);
    }

    static hasLost(amazons_state, player) {
        let moves = this.listMoves(amazons_state, player);
        return moves.length === 0;
    }

    static listMoves(amazons_state, player, only_destination = false) {
        if (player === undefined) {
            player = amazons_state.player;
        }
        let moves = [];
        amazons_state.player_piece_indices[player].forEach(i => {
            this.pieceQueenMoves(amazons_state, i, moves, only_destination);
        });
        return moves;
    }

    static listDestinationMovesForPiece(amazons_state, source_index) {
        let moves = [];
        this.pieceQueenMoves(amazons_state, source_index, moves, true);
        return moves;
    }

    static listCrossMovesForPiece(amazons_state, source_index, destination_index) {
        let moves = [];
        amazons_state.board[source_index] = Amazons.blank;
        Amazons.crossQueenMoves(amazons_state, source_index, destination_index, moves);
        amazons_state.board[source_index] = amazons_state.player;
        return moves;
    }

    static pieceQueenMoves(amazons_state, source_index, moves, only_destination = false) {

        // find all moves from that position
        let point = this.convertIndexToXY(source_index);

        let next_func = destination_index => {

            if (only_destination) {
                let source = this.convertIndexToXY(source_index);
                let destination = this.convertIndexToXY(destination_index);
                moves.push(new AmazonsMove(source.x, source.y, destination.x, destination.y, destination.x, destination.y));
            }
            else {
                amazons_state.board[source_index] = Amazons.blank;
                Amazons.crossQueenMoves(amazons_state, source_index, destination_index, moves);
                amazons_state.board[source_index] = amazons_state.player;
            }
        };

        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => x, y => --y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => --y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => --y, next_func);
    }

    static crossQueenMoves(amazons_state, source_index, destination_index, moves) {

        let point = this.convertIndexToXY(destination_index);

        let next_func = cross_index => {
            let source = this.convertIndexToXY(source_index);
            let destination = this.convertIndexToXY(destination_index);
            let cross = this.convertIndexToXY(cross_index);
            moves.push(new AmazonsMove(source.x, source.y, destination.x, destination.y, cross.x, cross.y));
        };

        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => x, y => --y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => ++x, y => --y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => ++y, next_func);
        this.queenMoves(amazons_state, point.x, point.y, x => --x, y => --y, next_func);
    }

    static queenMoves(amazons_state, x, y, x_change, y_change, next_func) {
        while (true) {
            let index = this.convertXYToIndex(x = x_change(x), y = y_change(y));
            if (!this.insideBoard(x, y) || amazons_state.board[index] !== Amazons.blank) {
                break;
            }
            next_func(index);
        }
    }

    static sumOfGamesCount(amazons_state) {
        let counter = 0;

        let mask = [];
        for (let i = 0; i < amazons_state.board.length; ++i) {
            mask.push(0);
        }

        let left_player_indices = amazons_state.player_piece_indices[Amazons.leftPlayer];
        let right_player_indices = amazons_state.player_piece_indices[Amazons.rightPlayer];

        counter += this.sumOfGamesCountFromPlayerIndices(amazons_state, mask, left_player_indices);
        counter += this.sumOfGamesCountFromPlayerIndices(amazons_state, mask, right_player_indices);

        console.log(mask);

        return counter;
    }

    static sumOfGamesCountFromPlayerIndices(amazons_state, mask, player_indices) {
        let counter = 0;
        for (let i = 0; i < player_indices.length; ++i) {
            let index = player_indices[i];
            if (mask[index] === 0) {
                let filled_with_pieces = this.dijkstra(amazons_state, mask, index, counter + 1);
                if (!filled_with_pieces) {
                    counter += 1;
                }
            }
        }
        return counter;
    }

    static dijkstra(amazons_state, mask, index, counter) {
        let squares_covered = 0;
        let number_of_pieces = 0;
        let queue = [index];

        while (queue.length !== 0) {
            index = queue.shift();
            mask[index] = counter;
            squares_covered += 1;
            if (amazons_state.board[index] !== 0) {
                number_of_pieces +=1;
            }
            this.addNeighborsQueue(amazons_state, queue, mask, index);
        }
        // filled with pieces
        return squares_covered === number_of_pieces;
    }

    static addNeighborsQueue(amazons_state, queue, mask, index) {
        let point = this.convertIndexToXY(index);

        let x_offset = [1, -1, 0, 0, 1, 1, -1, -1];
        let y_offset = [0, 0, 1, -1, 1, -1, 1, -1];

        for (let i = 0; i < x_offset.length; ++i) {
            let x = point.x + x_offset[i];
            let y = point.y + y_offset[i];

            index = this.convertXYToIndex(x, y);

            if (amazons_state.board[index] !== Amazons.cross &&
                this.insideBoard(x, y) &&
                mask[index] === 0) {
                queue.push(index);
            }
        }
    }
}