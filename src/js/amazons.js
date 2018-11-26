export class AmazonsState {

    constructor(board, player) {
        this.board = board;
        this.player = player;
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

    static get width() {
        return 2;
    }

    static get height() {
        return 2;
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

    static build_initial_state() {
        // let initial_board = [
        //     0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //     0, 0, 0, 2, 0, 0, 2, 0, 0, 0
        // ];

        let initial_board = [
            0, 0,
            1, 0
        ];

        return new AmazonsState(initial_board, Amazons.leftPlayer);
    }

    static listMoves(amazons_state) {

        let moves = [];

        for (let i = 0; i < amazons_state.board.length; ++i) {

            // check if the piece is of the player
            if (amazons_state.player === amazons_state.board[i]) {
                this.pieceQueenMoves(amazons_state, i, moves);
            }
        }

        return moves;
    }

    static pieceQueenMoves(amazons_state, source_index, moves) {

        // find all moves from that position
        let point = this.convertIndexToXY(source_index);

        let next_func = destination_index => {

            amazons_state.board[source_index] = Amazons.blank;
            Amazons.crossQueenMoves(amazons_state, source_index, destination_index, moves);
            amazons_state.board[source_index] = amazons_state.player;
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