import { Grid } from "../grid";
import { Helper } from "../helpers/helper";
import { SymmetryHelper } from "../helpers/symmetry";
import { Interpreter } from "../interpreter";

import {
    AllNode,
    ConvChainNode,
    ConvolutionNode,
    DotNode,
    MapNode,
    OneNode,
    OverlapNode,
    ParallelNode,
    PathNode,
    RunState,
    TileNode,
    WFCNode,
} from ".";

interface NodeConstructor {
    new (): Node;
}

export abstract class Node {
    public abstract load(
        elem: Element,
        symmetry: Uint8Array,
        grid: Grid
    ): Promise<boolean>;

    public abstract reset(): void;
    public abstract run(): RunState;

    public source: Element & { lineNumber: number; columnNumber: number };
    public comment: string;

    public ip: Interpreter;
    public grid: Grid;

    public static async factory(
        elem: Element,
        symmetry: Uint8Array,
        ip: Interpreter,
        grid: Grid,
        lazyLoad: boolean = false
    ) {
        const name = elem.tagName.toLowerCase();
        if (!Node.VALID_TAGS.has(name)) {
            console.error(elem, `unknown node type: ${name}`);
            return null;
        }

        const node: Node = {
            dot: () => new DotNode(),
            one: () => new OneNode(),
            all: () => new AllNode(),
            prl: () => new ParallelNode(),
            markov: () => new MarkovNode(),
            sequence: () => new SequenceNode(),
            path: () => new PathNode(),
            map: () => new MapNode(),
            convolution: () => new ConvolutionNode(),
            convchain: () => new ConvChainNode(),
            wfc: () => {
                if (elem.getAttribute("sample")) return new OverlapNode();
                if (elem.getAttribute("tileset")) return new TileNode();
                return null;
            },
        }[name]();

        node.ip = ip;
        node.grid = grid;
        node.source = <typeof node.source>elem;
        node.comment = elem.getAttribute("comment");

        if (lazyLoad) return node;
        
        const success = await node.load(elem, symmetry, grid);
        if (!success) console.error(elem, "failed to load");

        return success ? node : null;
    }

    private static readonly VALID_TAGS = new Set([
        // "tray", //x2nie. for free dormant notebook.run
        // "env",
        "dot",
        "one",
        "all",
        "prl",
        "markov",
        "sequence",
        "path",
        "map",
        "convolution",
        "convchain",
        "wfc",
    ]);

    public static isValidTag(tag: string) {
        return this.VALID_TAGS.has(tag);
    }
}

export abstract class Branch<T extends Node = Node> extends Node {
    public parent: Branch;
    public readonly children: T[] = [];
    public n: number;

    public override async load(
        elem: Element,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        const symmetryString = elem.getAttribute("symmetry");
        const symmetry = SymmetryHelper.getSymmetry(
            this.ip.grid.MZ === 1,
            symmetryString,
            parentSymmetry
        );

        if (!symmetry) {
            console.error(elem, `unknown symmetry ${symmetryString}`);
            return false;
        }

        const tasks: Promise<Node>[] = [];
        for (const child of Helper.elemChildren(elem)) {
            if (!Node.isValidTag(child.tagName)) continue;
            tasks.push(
                (async () => {
                    const node = await Node.factory(
                        child,
                        symmetry,
                        this.ip,
                        grid
                    );
                    if (!node) return null;
                    if (node instanceof Branch) {
                        node.parent =
                            node instanceof MapNode || node instanceof WFCNode
                                ? null
                                : this;
                    }
                    return node;
                })()
            );
        }
        const nodes = await Promise.all(tasks);
        if (nodes.some((n) => !n)) return false;
        (<Node[]>this.children).splice(0, this.children.length, ...nodes);
        return true;
    }

    public override reset() {
        this.children.forEach((n) => n.reset());
        this.n = 0;
    }

    public override run() {
        for (; this.n < this.children.length; this.n++) {
            const node = this.children[this.n];

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
}

export class SequenceNode<T extends Node = Node> extends Branch<T> {

}

export class MarkovNode<T extends Node = Node> extends Branch<T> {
    constructor(child?: Node, ip?: Interpreter) {
        super();

        if (child) (<Node[]>this.children).push(child);
        this.ip = ip;
        this.grid = ip?.grid;
    }

    public override run() {
        this.n = 0;
        return super.run();
    }
}