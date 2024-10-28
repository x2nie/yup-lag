import { Grid } from "../grid";
import { SymmetryHelper } from "../helpers/symmetry";
import { Helper } from "../helpers/helper";
import { Node, Branch, SequenceNode, MapNode, WFCNode, RunState } from ".";
import { XmlElement } from "../lib/xml";

/**
 * Same as Sequence, but it will lazily load the children
 * Each child is loaded on running.
 * It should not defined in the xml code
 */
// export class TrayNode<T extends Node = Node> extends  Branch<T> {
export class TrayNode extends  SequenceNode {
    public symmetry: Uint8Array;

    public override async load(
        elem: XmlElement,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        this.symmetry = parentSymmetry; 
        // const tasks: Promise<Node>[] = [];
        for (const child of Helper.elemChildren(elem)) {
            
            if (child.tagName == 'env'){
                this.parseEnv(child, parentSymmetry);
                continue;
            }

            if (!Node.isValidTag(child.tagName)) continue;

            // tasks.push(
            //     (async () => {
                    const node = await Node.factory(
                        child,
                        this.symmetry,
                        this.ip,
                        grid,
                        // true
                    );
                    if (!node) continue;
                    if (node instanceof Branch) {
                        node.parent =
                            node instanceof MapNode || node instanceof WFCNode
                                ? null
                                : this;
                    }
                    // return node;
                    this.children.push(node);
            //     })()
            // );
        }
        // const nodes = await Promise.all(tasks);
        // if (nodes.some((n) => !n)) return false;
        // (<Node[]>this.children).splice(0, this.children.length, ...nodes);
        return true;
    }

    public run0() {
        for (; this.n < this.children.length; this.n++) {
            const node = this.children[this.n];
            
            // await node.load(node.source, this.symmetry, this.grid);

            if (node instanceof Branch) {
                this.ip.current = node;
            }

            const status = node.run();
            if (status === RunState.SUCCESS || status === RunState.HALT)
                return status;
        }
        this.ip.current = this.ip.current.parent;
        this.reset();
        return RunState.FAIL;
    }

    parseEnv(env: XmlElement, parentSymmetry: Uint8Array,){
        const symmetryString = env.getAttribute("symmetry");
        if (symmetryString){
    
            const symmetry = SymmetryHelper.getSymmetry(
                this.ip.grid.MZ === 1,
                symmetryString,
                parentSymmetry
            );
            
            if (!symmetry) {
                console.error(env, `unknown symmetry ${symmetryString}`);
                return false;
            } else {
                this.symmetry = symmetry;
            }
        }
    }
}

// export class EnvNode extends  Node {

// }