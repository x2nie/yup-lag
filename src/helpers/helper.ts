import { Random } from "../random";
import { DOMParser } from "@xmldom/xmldom";
import { Parser, ParserOptions } from "./xmlParser";

interface WritableArray<T> {
    readonly length: number;
    [n: number]: T;
}

interface DOMCollection<T> {
    readonly length: number;
    item(index: number): T;
}

export class Helper {
    public static split2(s: string, s1: string, s2: string) {
        return s.split(s1).map((l) => l.split(s2));
    }

    public static parseXml(text: string, options?: ParserOptions) {
        options = Object.assign({includeOffsets:true}, options);
        return (new Parser(text, options)).document;
    }

    public static xmlParse(text: string) {
        // text = `<sequence>${text}</sequence>` //  doesn work
        // text = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
        const textWrapper = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(textWrapper, "text/xml");
        const children = [...Helper.elemChildren(doc.documentElement)];
        if(children.length > 1)
            return doc.documentElement;
        else {
            return parser.parseFromString(text, "text/xml").documentElement;
            // return doc.documentElement.children[0];
        }
    }

    public static mergeEnv(elem: Element){
        for (const child of Helper.elemChildren(elem)) {
            if(child.tagName=="env"){
                for (let i = 0; i < child.attributes.length; i++) {
                    const attr = child.attributes[i];
                    elem.setAttribute(attr.name, attr.value);
                }
            } else 
                // currently doesn't support <env> after non-env element. 
                // due that is hard to think set config after runnning = after a valid node: setting is disabled.
                break; 
        }
    }

    public static firstNonZeroPosition(w: number) {
        for (let p = 0; p < 32; p++, w >>= 1) if ((w & 1) === 1) return p;
        return 0xff;
    }

    public static nonZeroPositions(w: number) {
        const result: number[] = [];
        for (let p = 0; p < 32; p++, w >>= 1) if ((w & 1) == 1) result.push(p);
        return result;
    }

    public static sampleWeights(weights: Float64Array, r: number) {
        let sum = 0;
        for (let i = 0; i < weights.length; i++) sum += weights[i];
        const threshold = r * sum;

        let partialSum = 0;
        for (let i = 0; i < weights.length; i++) {
            partialSum += weights[i];
            if (partialSum >= threshold) return i;
        }
        return 0;
    }

    public static *elemChildren(e: Element) {
        for (const n of Helper.collectionIter(e.childNodes)) {
            if (n.nodeType !== 1) continue;
            const c = <Element>n;
            yield c;
        }
    }

    public static *childrenByTag(e: Element, tag: string) {
        for (const n of Helper.collectionIter(e.childNodes)) {
            if (n.nodeType !== 1) continue;
            const c = <Element>n;
            if (c.tagName === tag) yield c;
        }
    }

    public static *childrenByTags(e: Element, tags: string[]) {
        for (const n of Helper.collectionIter(e.childNodes)) {
            if (n.nodeType !== 1) continue;
            const c = <Element>n;
            if (tags.includes(c.tagName)) yield c;
        }
    }

    public static collectionToArr<T>(c: DOMCollection<T>) {
        const arr: T[] = [];
        for (let i = 0; i < c.length; i++) {
            arr.push(c.item(i));
        }
        return arr;
    }

    public static *collectionIter<T>(c: DOMCollection<T>) {
        for (let i = 0; i < c.length; i++) {
            yield c.item(i);
        }
    }

    public static *matchTags(elem: Element, ...tags: string[]) {
        const queue = [elem];

        while (queue.length) {
            const e = queue.shift();
            if (e !== elem) yield e;
            for (const x of this.childrenByTags(e, tags)) queue.push(x);
        }
    }

    public static matchTag(e: Element, tag: string) {
        for (const n of Helper.collectionIter(e.childNodes)) {
            if (n.nodeType !== 1) continue;
            const c = <Element>n;
            if (c.tagName === tag) return c;
        }
        return null;
    }

    public static maxPositiveIndex<T extends ArrayLike<number>>(amounts: T) {
        let max = -1,
            argmax = -1;
        for (let i = 0; i < amounts.length; i++) {
            const amount = amounts[i];
            if (amount > 0 && amount > max) {
                max = amount;
                argmax = i;
            }
        }
        return argmax;
    }

    public static shuffleFill<T extends WritableArray<number>>(
        array: T,
        rng: Random
    ) {
        for (let i = 0; i < array.length; i++) {
            const j = range(rng, i + 1);
            array[i] = array[j];
            array[j] = i;
        }
    }

    public static pick<E, T extends ArrayLike<E>>(array: T, rng: Random) {
        return array[range(rng, array.length)];
    }

    public static indexBoolArr(array: Uint8Array) {
        let result = 0,
            power = 1;
        for (let i = 0; i < array.length; i++, power *= 2)
            if (array[i]) result += power;
        return result;
    }

    public static indexByteArr(p: Uint8Array, C: bigint) {
        let result = 0n,
            power = 1n;
        for (let i = 0; i < p.length; i++, power *= C)
            result += BigInt(p[p.length - 1 - i]) * power;
        return result;
    }

    public static ords(
        data: Int32Array,
        uniques: number[] = []
    ): [Uint8Array, number] {
        const result = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            let ord = uniques.indexOf(d);
            if (ord == -1) {
                ord = uniques.length;
                uniques.push(d);
            }
            result[i] = ord;
        }
        return [result, uniques.length];
    }

    public static intPower(a: number, n: number) {
        let product = 1;
        for (let i = 0; i < n; i++) product *= a;
        return product;
    }

    public static compareArr<T extends ArrayLike<number>>(t1: T, t2: T) {
        if (t1.length !== t2.length) return false;
        for (let i = 0; i < t1.length; i++) if (t1[i] !== t2[i]) return false;
        return true;
    }

    public static hex2rgba(hex: string, alpha = 255) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return new Uint8ClampedArray([r, g, b, alpha]);
        }
        return null;
    }

    public static rgb2hex(rgba: Uint8Array | Uint8ClampedArray) {
        if (rgba.length < 3) return "#000000";
        let str = `#`;
        for (let i = 0; i < 3; i++) {
            str += rgba[i].toString(16).padStart(2, "0");
        }
        return str;
    }
}

// exclusive
export const range = (rng: Random, upper: number) => Math.floor(rng.nextDouble() * upper);

export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
