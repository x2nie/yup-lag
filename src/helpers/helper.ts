export class Helper {
    public static split2(s: string, s1: string, s2: string) {
        return s.split(s1).map((l) => l.split(s2));
    }

    public static firstNonZeroPosition(w: number) {
        for (let p = 0; p < 32; p++, w >>= 1) if ((w & 1) === 1) return p;
        return 0xff;
    }
}
