import Amazons from './amazons'

export default class ScopeAI {

    compute(state) {
        return Amazons.simulationUsingScope(state);
    }
}