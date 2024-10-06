import { DOMParser } from "@xmldom/xmldom";
import { Interpreter } from "./interpreter"

document.getElementById('btn1').addEventListener('click', exec)
const code1 = document.getElementById('code1') as HTMLTextAreaElement
const pre1 = document.getElementById('result1') as HTMLPreElement

const MX = 11, MY = 11, MZ =1;

async function exec(){
    console.log('vite oke!',code1)
    const elem = xmlParse(code1.value)
    const ip = await Interpreter.load(
        elem, MX, MY, MZ
    )
    const curr = ip.run(undefined, 5)
    let result = curr.next();
    while(!result.done){
        console.log(result)
        result = curr.next();
    }
    const [grid] = ip.state()
    let s = ''
    let i = 0
    for (let y = 0; y < MY; y++) {
        for (let x = 0; x < MX; x++) {
            s += grid[i] == 0 ? '▒' : '█';
            i++;
        }
        s += '\n'
    }
    pre1.textContent = s;
    // debugger
}

function xmlParse(text: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");
    return doc.documentElement;
}