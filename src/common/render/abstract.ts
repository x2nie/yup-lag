// import { action, computed, makeObservable, observable } from "mobx";
import { Helper } from "../helpers/helper";

export abstract class Renderer {
    // @observable
    private _chars = "";

    // @observable
    public palette: Map<string, Uint8ClampedArray> = new Map();
    // @observable.ref
    protected colors = new Uint8Array();

    private _cache: Uint8Array;
    public forcedState: Uint8Array;

    public abstract get canvas(): HTMLCanvasElement;

    // @computed
    get colorHex() {
        return Array.from({ length: this.colors.length >> 2 }, (_, k) =>
            Helper.rgb2hex(this.colors.subarray(k << 2, (k << 2) + 4))
        );
    }

    // @computed
    get characters() {
        return this._chars;
    }

    // @action
    setCharacters(chars: string) {
        if (this._chars !== chars) {
            this._chars = chars;
            this.updateColors();
        }
    }

    // @action
    public updateSymbol(k: string, rgba: Uint8ClampedArray) {
        this.palette.set(k, rgba);
    }

    // @action
    public updateColors() {
        const colorArr = this._chars.split("").map((c) => this.palette.get(c));
        this.colors = new Uint8Array(colorArr.length * 4);
        for (let i = 0; i < colorArr.length; i++) {
            this.colors.set(colorArr[i], i * 4);
        }
        this.render();
    }

    public render(state = this._cache) {
        if (!state) return;
        this._cache = state;

        if (this.forcedState) {
            this._render(this.forcedState);
        } else {
            this._render(state);
        }
    }

    abstract update(MX: number, MY: number, MZ: number): void;
    protected abstract _render(state: Uint8Array): void;
    abstract clear(): void;
    abstract dispose(): void;

    constructor() {
        // makeObservable(this);
    }
}
