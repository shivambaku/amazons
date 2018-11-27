import Amazons from './amazons'

export default class MinMax {

    constructor(max_depth) {
        this.max_depth = max_depth === undefined ? Number.MAX_SAFE_INTEGER : max_depth;
    }

    compute(state) {
        return this.minmax(state, state.player, 0, state.player, -Number.MAX_VALUE, Number.MAX_VALUE);
    }

    minmax(state, maximizing_player, depth, player, alpha, beta) {

        // compute the value of the current state
        let value = Amazons.stateValue(state, maximizing_player, depth);

        // the Amazons has not ended therefore has no value
        if (value === null) {

            if (depth >= this.max_depth) {
                return null;
            }

            let bestValue, bestState;

            // get all the states possible after one move
            let moves = Amazons.listMoves(state);

            if (player === maximizing_player) {
                bestValue = -Number.MAX_VALUE;

                for (let i = 0; i < moves.length; ++i) {
                    let next_state = Amazons.applyMove(state, moves[i]);
                    let value = this.minmax(next_state, maximizing_player, depth + 1, Amazons.opponent(player), alpha, beta);

                    if (value == null) return null;

                    // store the maximum value and the state corresponding to it
                    if (value > bestValue) {
                        bestValue = value;
                        bestState = next_state;
                    }

                    alpha = Math.max(alpha, bestValue);
                    if (alpha >= beta) {
                        break;
                    }
                }
            } else {
                bestValue = Number.MAX_VALUE;

                for (let i = 0; i < moves.length; ++i) {
                    let next_state = Amazons.applyMove(state, moves[i]);
                    let value = this.minmax(next_state, maximizing_player, depth + 1, Amazons.opponent(player), alpha, beta);

                    if (value == null) return null;

                    if (value < bestValue) {
                        bestValue = value;
                        bestState = next_state;
                    }
                    beta = Math.min(beta, bestValue);
                    if (alpha >= beta) {
                        break;
                    }
                }
            }

            return depth === 0 ? bestState : bestValue;
        }

        return value;
    }
}