// import { parseXml } from '@rgrove/parse-xml';
// import { ParserOptions } from '@rgrove/parse-xml/src/lib/Parser';
// import { Parser } from '@rgrove/parse-xml/dist/lib/Parser.js';
import { Interpreter } from "./interpreter";
import { Helper } from "./helpers/helper";
// import { XmlNode } from "@rgrove/parse-xml";
import { Parser, XmlNode, XmlElement, parseXml } from "./lib/xml";

const xx = new XmlElement('yo');
console.log(xx.find('zoo'));

let ip : Interpreter;

const code1 = document.getElementById('code1') as HTMLTextAreaElement;
const pre1 = document.getElementById('result1') as HTMLPreElement;
document.getElementById('btn1').addEventListener('click', async () => {
    ip = await exec(code1, pre1);
});
document.getElementById('parse1').addEventListener('click', () => parse(code1, pre1));

const code2 = document.getElementById('code2') as HTMLTextAreaElement;
const pre2 = document.getElementById('result2') as HTMLPreElement;
const reset = document.getElementById('reset') as HTMLInputElement;
document.getElementById('btn2').addEventListener('click', () => exec(code2, pre2, reset.checked?undefined:ip));
document.getElementById('parse2').addEventListener('click', () => parse(code2, pre2));

const MX = 15, MY = MX, MZ =1, STEPS=200;

async function exec(code:HTMLTextAreaElement, pre:HTMLPreElement, oldIP:Interpreter=undefined):Promise<Interpreter>{
    console.log('reset:',reset.checked);
    // const elem = Helper.xmlParse(code.value);
    const elem = Helper.parseXml(code.value);
    if(oldIP){
        elem.setAttribute("values", oldIP.grid.characters);
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

/*
class Parser2 extends Parser {
    //? Allow multiroot
    // constructor(xml: string, options: ParserOptions = {}) {
    //     let p: Parser2;
    //     try {
    //         p = super(xml, options);
    //     } catch (err) {
    //         // Tangkap error dan akses pesan errornya
    //         if(!(err as Error).message.startsWith('Extra content at the end of the document'))
    //             throw err; // Lempar kembali jika perlu, atau tangani sesuai kebutuhan
        
    //         while (!this.scanner.isEnd) {
    //             this.consumeElement();
    //             this.consumeMisc();
    //         }
    //     }
    // }
    // @ts-ignore
    constructor(xml: string, options: ParserOptions = {}) {
        let doc = this.document = new XmlDocument();
        let scanner = this.scanner = new StringScanner(xml);
    
        this.currentNode = doc;
        this.options = options;
    
        if (this.options.includeOffsets) {
          doc.start = 0;
          doc.end = xml.length;
        }
    
        scanner.consumeStringFast('\uFEFF'); // byte order mark
        this.consumeProlog();
    
        if (!this.consumeElement()) {
          throw this.error('Root element is missing or invalid');
        }
    
        while (this.consumeMisc()) {} // eslint-disable-line no-empty
    
        // if (!scanner.isEnd) {
        //   throw this.error('Extra content at the end of the document');
        // }
        while (!this.scanner.isEnd) {
            this.consumeElement();
            this.consumeMisc();
        }
      }
    // public roots : XmlNode[] = [];
}

// Extended class menggunakan prototype
function Parser3(xml: string, options: any = {}) {
    // Panggil superclass constructor
    Parser.call(this, xml, options);
    // try {
    //     Parser.call(this, xml, options);
    // } catch (err) {
    //     // Tangkap error dan akses pesan errornya
    //     if(!(err as Error).message.startsWith('Extra content at the end of the document'))
    //         throw err; // Lempar kembali jika perlu, atau tangani sesuai kebutuhan
    
    //     while (!this.scanner.isEnd) {
    //         this.consumeElement();
    //         this.consumeMisc();
    //     }
    // }
}
  
// Inherit prototype dari XmlParser
Parser3.prototype = Object.create(Parser.prototype);
Parser3.prototype.constructor = Parser3;

class Parser4 extends Parser {

}

function parseXml(xml: string, options?: ParserOptions) {
    // console.log(Parser.toString());
    // return (new Parser(xml, options)).document;
    return (new Parser4(xml, options)).document;
    // let a;
    // try {
    //     a = new Parser(xml);
    // } catch (err) {
    //     // Tangkap error dan akses pesan errornya
    //     if(!(err as Error).message.startsWith('Extra content at the end of the document'))
    //         throw err; // Lempar kembali jika perlu, atau tangani sesuai kebutuhan
    
    //     while (!this.scanner.isEnd) {
    //         this.consumeElement();
    //         this.consumeMisc();
    //     }
    // } 
    
}

*/

function parse(code:HTMLTextAreaElement, pre:HTMLPreElement) {
    let xml = code.value;
    // xml = `<wrapper>${xml}</wrapper>`;
    const doc = parseXml(xml, {preserveComments:true, includeOffsets:true});
    pre.textContent = JSON.stringify(doc.toJSON(), null, 2);
}
// function xmlParse(text: string) {
//     // text = `<sequence>${text}</sequence>` // ! doesn work
//     // text = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
//     const textWrapper = `<sequence values="BIPENDAWROYGUSKFZ">${text}</sequence>`;
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(textWrapper, "text/xml");
//     // if(doc.documentElement.children.length > 1)
//     if([...Helper.elemChildren(doc.documentElement)].length > 1)
//         return doc.documentElement;
//     else {
//         return parser.parseFromString(text, "text/xml").documentElement;
//         // return doc.documentElement.children[0];

//     }
// }