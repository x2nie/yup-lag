import { InterpreterState } from "../../common/interpreter";

export function ipState2Text(ips:InterpreterState): string {
    
    const {grid} = ips;
    const {characters, MX, MY, MZ} = grid;
    let s = '';
    let i = 0;
    for (let y = 0; y < MY; y++) {
        for (let x = 0; x < MX; x++) {
            s += grid[i] == 0 ? '-' : characters[grid[i]];
            i++;
        }
        s += '\n';
    }
    return s;
}