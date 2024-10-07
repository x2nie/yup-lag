// import { DOMParser } from "@xmldom/xmldom";
import { Interpreter } from "./interpreter";

const code1 = document.getElementById('code1') as HTMLTextAreaElement;
const pre1 = document.getElementById('result1') as HTMLPreElement;
document.getElementById('btn1').addEventListener('click', () => exec(code1, pre1));

const code2 = document.getElementById('code2') as HTMLTextAreaElement;
const pre2 = document.getElementById('result2') as HTMLPreElement;
document.getElementById('btn2').addEventListener('click', () => exec(code2, pre2));

const MX = 15, MY = MX, MZ =1, STEPS=200;

async function exec(code:HTMLTextAreaElement, pre:HTMLPreElement){
    console.log('vite oke!',code);
    const elem = xmlParse(code.value);
    const ip = await Interpreter.load(
        elem, MX, MY, MZ
    );
    const curr = ip.run(undefined, STEPS);
    let result = curr.next();
    while(!result.done){
        console.log(result);
        result = curr.next();
    }
    const [grid, chars] = ip.state();
    let s = '';
    let i = 0;
    for (let y = 0; y < MY; y++) {
        for (let x = 0; x < MX; x++) {
            s += grid[i] == 0 ? '-' : chars[grid[i]];
            i++;
        }
        s += '\n';
    }
    pre.textContent = s;
    // debugger
    document.title = String(ip.changes.length);
}

function xmlParse(text: string) {
    // text = `<sequence>${text}</sequence>` // ! doesn work
    // text = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");
    return doc.documentElement;
}