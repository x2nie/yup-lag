import { Random } from "./random";
import { Grid } from "./grid";
import { Helper, vec3 } from "./helpers/helper";
import { SymmetryHelper } from "./helpers/symmetry";
import { Node, Branch, MarkovNode } from "./mj-nodes";
import { XmlElement } from "./lib/xml";

export class Interpreter {
    public root: Branch;
    public current: Branch;

    public grid: Grid;
    public startgrid: Grid;

    origin: boolean;
    public rng: Random;
    // public time = 0;

    public readonly changes: vec3[] = [];
    public readonly first: number[] = [];
    public counter = 0;

    public static async load(
        elem: XmlElement,
        MX: number,
        MY: number,
        MZ: number
    ) {
        Helper.mergeEnv(elem);
        const ip = new Interpreter();
        ip.origin = elem.getAttribute("origin") === "True";
        ip.grid = Grid.build(elem, MX, MY, MZ);
        if (!ip.grid) {
            console.error("Failed to load grid");
            return null;
        }
        ip.startgrid = ip.grid;

        const symmetryString = elem.getAttribute("symmetry");

        const dflt = new Uint8Array(ip.grid.MZ === 1 ? 8 : 48);
        dflt.fill(1);

        const symmetry = SymmetryHelper.getSymmetry(
            ip.grid.MZ === 1,
            symmetryString,
            dflt
        );
        if (!symmetry) {
            console.error(elem, `unknown symmetry ${symmetryString}`);
            return null;
        }

        const topnode = await Node.factory(elem, symmetry, ip, ip.grid);
        if (!topnode) return null;
        ip.root =
            topnode instanceof Branch ? topnode : new MarkovNode(topnode, ip);
        return ip;
    }

    public *run(
        seed: number,
        steps: number
    ): Generator<[Uint8Array, string, number, number, number]> {
        this.rng = new Random(seed);
        this.grid = this.startgrid;
        this.grid.clear();

        if (this.origin) {
            const center =
                (this.grid.MX >>> 1) +
                (this.grid.MY >>> 1) * this.grid.MX +
                (this.grid.MZ >>> 1) * this.grid.MX * this.grid.MY;
            this.grid.state[center] = 1;
        }

        this.changes.splice(0, this.changes.length);
        this.first.splice(0, this.first.length);
        this.first.push(0);

        // this.time = 0;
        this.root.reset();
        this.current = this.root;

        this.counter = 0;

        while (this.current && (steps <= 0 || this.counter < steps)) {
            yield this.state();

            this.current.run();
            this.counter++;
            this.first.push(this.changes.length);
        }

        yield this.state();
    }

    /**
     * Same as `run` but with reuse a grid values
     * @param steps 
     * @param ip 
     */
    public *advance(
        // seed: number,
        steps: number, ip:Interpreter
    ): Generator<[Uint8Array, string, number, number, number]> {
        this.rng = ip.rng;
        // this.grid = ip.grid;
        this.grid.clear();
        this.grid.padded.set(ip.grid.padded);

        if (this.origin) {
            const center =
                (this.grid.MX >>> 1) +
                (this.grid.MY >>> 1) * this.grid.MX +
                (this.grid.MZ >>> 1) * this.grid.MX * this.grid.MY;
            this.grid.state[center] = 1;
        }

        this.changes.splice(0, this.changes.length);
        this.first.splice(0, this.first.length);
        this.first.push(0);

        // this.time = 0;
        this.root.reset();
        this.current = this.root;

        this.counter = 0;

        while (this.current && (steps <= 0 || this.counter < steps)) {
            yield this.state();

            this.current.run();
            this.counter++;
            this.first.push(this.changes.length);
        }

        yield this.state();
    }

    public state(): [Uint8Array, string, number, number, number] {
        const grid = this.grid;
        return [grid.padded, grid.characters, grid.MX, grid.MY, grid.MZ];
    }
}
