// import { DOMParser } from "@xmldom/xmldom";
import { Interpreter } from "./interpreter";
let ip : Interpreter;

const code1 = document.getElementById('code1') as HTMLTextAreaElement;
const pre1 = document.getElementById('result1') as HTMLPreElement;
document.getElementById('btn1').addEventListener('click', async () => {
    ip = await exec(code1, pre1);
});

const code2 = document.getElementById('code2') as HTMLTextAreaElement;
const pre2 = document.getElementById('result2') as HTMLPreElement;
const reset = document.getElementById('reset') as HTMLInputElement;
document.getElementById('btn2').addEventListener('click', () => exec(code2, pre2, reset.checked?undefined:ip));

const MX = 15, MY = MX, MZ =1, STEPS=200;

async function exec(code:HTMLTextAreaElement, pre:HTMLPreElement, oldIP:Interpreter=undefined):Promise<Interpreter>{
    console.log('reset:',reset.checked);
    const elem = xmlParse(code.value);
    if(oldIP){
        elem.setAttribute("values", oldIP.grid.characters)
    }
    const ip = await Interpreter.load(
        elem, MX, MY, MZ
    );
    let curr;
    if(!oldIP){
        curr = ip.run(undefined, STEPS);
    } else {
        curr = ip.advance(STEPS, oldIP);
    }
    let result = curr.next();
    while(!result.done){
        // console.log(result);
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
    return ip;
}

function xmlParse(text: string) {
    // text = `<sequence>${text}</sequence>` // ! doesn work
    // text = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
    const textWrapper = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(textWrapper, "text/xml");
    if(doc.documentElement.children.length > 1)
        return doc.documentElement;
    else {
        return parser.parseFromString(text, "text/xml").documentElement;
        // return doc.documentElement.children[0];

    }
}