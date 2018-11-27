import Utility from './utility'
import Amazons from './amazons'

export default class RandomPlay {

    compute(state) {

        let moves = Amazons.listMoves(state);

        let random_index = Utility.getRandomInt(0, moves.length);

        return Amazons.applyMove(state, moves[random_index]);
    }
}