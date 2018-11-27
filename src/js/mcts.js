import Amazons from './amazons';
import Utility from './utility';

export class MCTSNode {
    constructor(state) {
        this.state = state;
        this.q = 0;
        this.visits = 0;
        this.parent = null;
        this.children = [];
    }

    addChild(state) {
        let child = new MCTSNode(state);
        child.parent = this;
        this.children.push(child);
    }

    updateStatistics(value) {
        this.visits += 1;
        this.q += (value - this.q) / this.visits;
    }

    hasChildren() {
        return this.children.length !== 0;
    }

    shuffleChildren() {
        this.children = Utility.shuffle(this.children);
    }
}

export default class MCTS {

    constructor(max_iterations, c) {
        this.max_iterations = max_iterations === undefined ? 100 : max_iterations;
        this.c = c === undefined ? Math.SQRT2 : c;
    }

    compute(state) {
        let root = new MCTSNode(state);

        this.expand(root);

        for (let i = 0; i < this.max_iterations; ++i) {
            let leaf = this.select(root);
            this.expand(leaf);
            let value = this.simulate(root, leaf);
            this.backup(leaf, value);
        }

        let best_child = Utility.maxByProperty(root.children, d => d.visits);

        return best_child.state;
    }

    select(root) {
        let node = root;

        while (node.hasChildren()) {
            if (node.state.player === root.state.player) {
                node = Utility.maxByProperty(node.children, d => {
                    if (d.visits === 0) {
                        return Number.MAX_VALUE;
                    } else {
                        return d.q + this.c * Math.sqrt(Math.log(d.parent.visits / d.visits));
                    }
                });
            } else {
                node = Utility.minByProperty(node.children, d => {
                    if (d.visits === 0) {
                        return -Number.MAX_VALUE;
                    } else {
                        return d.q - this.c * Math.sqrt(Math.log(d.parent.visits / d.visits));
                    }
                });
            }
        }

        return node;
    }

    expand(node) {
        let moves = Amazons.listMoves(node.state);
        for (let i = 0; i < moves.length; ++i) {
            node.addChild(Amazons.applyMove(node.state, moves[i]));
        }
        node.shuffleChildren();
    }

    simulate(root, leaf) {
        let final_state = leaf.state;

        let result = Amazons.stateValue(final_state, root.state.player);

        while (result === null) {
            final_state = Amazons.simulationPolicy(final_state);
            result = Amazons.stateValue(final_state, root.state.player);
        }

        return result;
    }

    backup(node, value) {
        while (node != null) {
            node.updateStatistics(value);
            node = node.parent;
        }
    }
}