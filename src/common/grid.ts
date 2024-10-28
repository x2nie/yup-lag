import { Helper } from "./helpers/helper";
import { XmlElement } from "./lib/xml";

export interface IGridStorage {
    MX: number;
    MY: number;
    MZ: number;
    transparent?: number;
    characters: string;
    data: string;
}

export class Grid {
    public state: Uint8Array;
    public padded: Uint8Array;

    public mask: Uint8Array; // bool array

    public MX: number;
    public MY: number;
    public MZ: number;

    public characters: string;
    public values: Map<number, number> = new Map();
    public waves: Map<number, number> = new Map();
    public folder: string;

    private transparent: number;
    // private statebuffer: Uint8Array;

    public static build(elem: XmlElement, 
        mx: number = 0,
        my: number = 0,
        mz: number = 0,
    ) {
        const g = new Grid();
        const MX = g.MX = mx || elem.numberAttribute('MX');
        const MY = g.MY = my || elem.numberAttribute('MY');
        const MZ = g.MZ = mz || elem.numberAttribute('MZ');

        const valueString = elem.getAttribute("values")?.replaceAll(" ", "");
        if (!valueString) {
            console.error(elem, "no values specified");
            return null;
        }

        g.characters = valueString;
        for (let i = 0; i < g.C; i++) {
            const c = valueString.charCodeAt(i);

            if (g.values.has(c)) {
                console.error(elem, "contains repeating value");
                return null;
            }

            g.values.set(c, i);
            g.waves.set(c, 1 << i);
        }

        const transparentString = elem.getAttribute("transparent");
        if (transparentString) g.transparent = g.wave(transparentString);

        const unions = [
            ...Helper.matchTags(elem, "markov", "sequence", "union"),
        ].filter((x) => x.tagName === "union");
        g.waves.set("*".charCodeAt(0), (1 << g.C) - 1);

        for (const union of unions) {
            const symbol = union.getAttribute("symbol").charCodeAt(0);
            if (g.waves.has(symbol)) {
                console.error(
                    union,
                    `repeating union type "${String.fromCharCode(symbol)}"`
                );
                return null;
            } else {
                const w = g.wave(union.getAttribute("values"));
                g.waves.set(symbol, w);
            }
        }

        let pot = 1;
        while (pot < MX * MY * MZ) pot <<= 2;
        g.padded = new Uint8Array(pot);
        g.state = g.padded.subarray(0, MX * MY * MZ);
        // g.statebuffer = new Uint8Array(MX * MY * MZ);
        g.mask = new Uint8Array(MX * MY * MZ);
        g.folder = elem.getAttribute("folder");

        return g;
    }

    get C() {
        return this.characters.length;
    }

    public clear() {
        this.state.fill(0);
    }

    public wave(values: string) {
        let sum = 0;
        for (let i = 0; i < values.length; i++)
            sum += 1 << this.values.get(values.charCodeAt(i));
        return sum;
    }

    public toJSON():IGridStorage{
        const {MX,MY,MZ,characters,padded} = this;
        let s = '';
		let i = 0;
		for (let z = 0; z < MZ; z++) {
            for (let y = 0; y < MY; y++) {
                for (let x = 0; x < MX; x++) {
                    s += padded[i] == 0 ? '-' : characters[padded[i]];
                    i++;
                }
                s += '/';
            }
            if(MZ>1) s += ' ';
        }
        return {
            characters, MX, MY, MZ, 
            transparent:this.transparent,
            data:s
        };
    }

    public fromJSON(o : IGridStorage){
        if(!o) return;
        const {MX,MY,MZ,characters,data} = o;
        let i = 0;
		for (const sz of  data.split(' ')) {
            for (const sy of  sz.split('/')) {
                for (const s of  sy.split('')) {
                    // this.padded[i] = this.values.get(s.charCodeAt(0));
                    this.padded[i] = s=='-'? 0 : characters.indexOf(s);
                    i++;
                }
            }
        }

    }
}
