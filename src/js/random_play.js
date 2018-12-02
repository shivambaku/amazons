import Amazons from './amazons'

export default class RandomPlay {

    compute(state) {
        return Amazons.simulationUsingRandom(state);
    }
}