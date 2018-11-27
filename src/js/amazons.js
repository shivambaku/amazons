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
        return new AmazonsState(this.board, this.player,
                this.player_piece_indices[Amazons.leftPlayer],
                this.player_piece_indices[Amazons.rightPlayer]);
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
        //     0, 0,
        //     1, 0
        // ];

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

    static applyMove(amazons_state, move) {

        let new_amazons_state = amazons_state.duplicate();

        let source_index = Amazons.convertXYToIndex(move.source_x, move.source_y);
        let destination_index = Amazons.convertXYToIndex(move.destination_x, move.destination_y);
        let cross_index = Amazons.convertXYToIndex(move.cross_x, move.cross_y);

        new_amazons_state.board[source_index] = Amazons.blank;
        new_amazons_state.board[destination_index] = amazons_state.player;
        new_amazons_state.board[cross_index] = Amazons.cross;

        new_amazons_state.player_piece_indices[amazons_state.player].splice(
            new_amazons_state.player_piece_indices[amazons_state.player].indexOf(source_index),
            1
        );
        new_amazons_state.player_piece_indices[amazons_state.player].push(destination_index);

        return new_amazons_state;
    }

    static listMoves(amazons_state) {

        let moves = [];

        amazons_state.player_piece_indices[amazons_state.player].forEach(i => {
            this.pieceQueenMoves(amazons_state, i, moves);
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

        console.log(moves);

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
}