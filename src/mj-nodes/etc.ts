import { RunState } from ".";
import { Grid } from "../grid";
// import { SymmetryHelper } from "../helpers/symmetry";
// import { Helper } from "../helpers/helper";
import { Node } from ".";
import { XmlElement } from "../lib/xml";
import { Branch } from "./node";

/** it mere a replacement of the root's attribute: `origin=True` */
export class DotNode extends Node {
    private color: string = "";
    private stepz = 0;
    public override async load(
        elem: XmlElement,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        // this.ip.origin = elem.getAttribute("origin") === "True";
        this.color = elem.getAttribute("color");
        return true;
    }

    public override reset() {
        this.stepz = 0;
    }

    public override run() {
        if (this.stepz > 0) return RunState.FAIL; //done
        
        // this.ip.current = this;
        if (this.color) {
            const charOffset = this.grid.values.get(
                this.color.charCodeAt(0)
            );
            const x = this.grid.MX >>> 1;
            const y = this.grid.MY >>> 1;
            const z = this.grid.MZ >>> 1;
            const center =
                x +
                y * this.grid.MX +
                z * this.grid.MX * this.grid.MY;
            this.grid.state[center] = charOffset;
            this.ip.changes.push([x,y,z]);
            this.stepz++;
        }
        return RunState.SUCCESS;
        return RunState.FAIL;
    }
}

/* 
export class EnvNode extends  Node {
    // constructor(child?: Node, ip?: Interpreter) {
    //     super();

    //     if (child) (<Node[]>this.children).push(child);
    //     this.ip = ip;
    //     this.grid = ip?.grid;
    // }

    public override async load(
        elem: XmlElement,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        for (const name of elem.getAttributeNames()) {
            const value = elem.getAttribute(name);
        }
        return true;
    }
    
    public override reset() {}
    
    public override run() {
        return RunState.FAIL;
    }
} */