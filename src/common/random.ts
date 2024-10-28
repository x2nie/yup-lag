/**
 * Original Code: 
 *      https://github.com/microsoft/referencesource/blob/master/mscorlib/system/random.cs
 *      https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.CoreLib/src/System/Random.cs
 * Converted to TypeScript By: x2nie
 * Date: 2023-11-19
 * 
 */

// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

const Int32 = {
    MinValue: Math.pow(2, 31) * -1,
    MaxValue: Math.pow(2, 31) - 1
};
const MBIG = Int32.MaxValue;
const MSEED = 161803398;

export class Random {
    //
    // Member Variables
    //
    public seed : number;
    private inext: number;
    private inextp: number;
    //private int[] SeedArray = new int[56];
    private SeedArray: Int32Array;

    //? REPLAY & FAST-FORWARD STUFF
    private _counter: number = 0;
    public get counter(){
        return this._counter;
    }
    public skips(count:number){
        for (let i = 0; i < count; i++) {
            this.internalSample();
        }
    }

    // public Random(Seed:number) {}
    constructor(seed: number | null = null, skips:number=0) {
        this.seed = seed; // save actual parameter;
        this.inext = 0;
        this.inextp = 21;
        this.SeedArray = new Int32Array(56);
        this.SeedArray.fill(0);

        if (!seed) {
            //this(Environment.TickCount);
            seed = Math.floor(Math.random() * MBIG);
        }
        seed = Math.floor(seed); // = int()Seed

        let ii: number;
        let mj: number, mk: number;
        //Initialize our Seed array.
        //This algorithm comes from Numerical Recipes in C (2nd Ed.)
        let subtraction = (seed == Int32.MinValue) ? Int32.MaxValue : Math.abs(seed);
        mj = MSEED - subtraction;
        this.SeedArray[55] = mj;
        mk = 1;
        for (let i = 1; i < 55; i++) {  //Apparently the range [1..55] is special (Knuth) and so we're wasting the 0'th position.
            ii = (21 * i) % 55;
            this.SeedArray[ii] = mk;
            mk = mj - mk;
            if (mk < 0) mk += MBIG;
            mj = this.SeedArray[ii];
        }
        for (let k = 1; k < 5; k++) {
            for (let i = 1; i < 56; i++) {
                this.SeedArray[i] -= this.SeedArray[1 + (i + 30) % 55];
                if (this.SeedArray[i] < 0) this.SeedArray[i] += MBIG;
            }
        }
        if(skips && this.seed) this.skips(skips);
    }

    public next(maxValue: number = 0): number {
        if (maxValue == 0)
            return this.internalSample();

        if (maxValue < 0) {
            throw new Error("ArgumentOutOfRange_MustBePositive");
        }
        return Math.floor(this.sample() * maxValue);
    }

    public nextDouble(): number {
        return this.sample();
    }

    protected sample(): number { //Float.double
        //Including this division at the end gives us significantly improved
        //random number distribution.

        //? C# :
        // return (this.InternalSample()*(1.0/MBIG));

        //? however, it actually produces identical result with C# (tested on Chrome | Ubuntu 24.04 x64 | .NET v8.0.108 | 2024-09-28)
        return this.internalSample() * (1.0 / MBIG);

        //? Old Implementation & Slow :
        // const jsFloat = this.internalSample() * (1.0 / MBIG);
        // const csharpDouble = jsFloat.toPrecision(15); //got string
        // return Number(csharpDouble); // will identical to C# value

        //? Faster JavaScript & identical to C# :
        // const f32arr = new Float32Array(1)
        // f32arr[0] = this.internalSample()*(1.0/MBIG);
        // return f32arr[0]

        //? same as above, but with reuse, like its fastest, but is not thread-safe
        // CLAMPER[0] = this.internalSample()*OneBIGth;
        // return CLAMPER[0]
    }

    private internalSample(): number { // int
        let retVal: number;
        let locINext = this.inext;
        let locINextp = this.inextp;

        if (++locINext >= 56) locINext = 1;
        if (++locINextp >= 56) locINextp = 1;

        retVal = this.SeedArray[locINext] - this.SeedArray[locINextp];

        if (retVal == MBIG) retVal--;
        if (retVal < 0) retVal += MBIG;

        this.SeedArray[locINext] = retVal;

        this.inext = locINext;
        this.inextp = locINextp;

        this._counter++;

        return retVal;
    }
}