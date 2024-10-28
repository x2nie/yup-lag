// import { parseXml } from '@rgrove/parse-xml';
// import { ParserOptions } from '@rgrove/parse-xml/src/lib/Parser';
// import { Parser } from '@rgrove/parse-xml/dist/lib/Parser.js';
import { InterpreterState, Interpreter } from "../common/interpreter";
import { Helper } from "../common/helpers/helper";
// import { XmlNode } from "@rgrove/parse-xml";
import { Parser, XmlNode, XmlElement, parseXml } from "../common/lib/xml";

import GIF from 'gif.js';
// import GIF = require("gif.js");
import { workerBlob } from "../common/lib/gif/gif.worker"; 

import { GifWriter } from "omggif";

document.getElementById('manualgif').addEventListener('click', async () => {

function createGIF() {
  // Buat canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set ukuran canvas
  const width = 15;
  const height = 15;
//   canvas.width = width;
//   canvas.height = height;

//   // Gambar kotak merah
//   ctx!.fillStyle = 'red';
//   ctx!.fillRect(10, 10, 80, 80);

  // Ambil piksel dari canvas
//   const imageData = ctx!.getImageData(0, 0, width, height);
//   const pixels = new Uint8Array(imageData.data.buffer);

  // Siapkan buffer untuk GIF
  const numFrames = 4; // Misalnya 10 frame
  const gifBuffer = new Uint8Array(width * height * 5 * numFrames); // Buffer ukuran besar
  const gif = new GifWriter(gifBuffer, width, height, { 
    palette: [
        0x00,   0xff0000, 0x0000ff, 0x00ff00, 
        0xffff00, 0x00ffff, 0xffffff, 0x88ff00,
    ],
    loop: 0 });

  // Tambahkan frame ke GIF
//   gif.addFrame(0, 0, width, height, pixels, {
//     palette: [0xff0000, 0x0000ff, 0xffffff, 0x00],
//     palette0: [
//         [0x0, 0x00, 0x00], // black
//         [0xff, 0x00, 0x00], // Palet merah
//     ],
//     delay: 200
//   });
    
    // Fungsi untuk menggambar frame dengan kotak bergerak
  for (let i = 0; i < numFrames; i++) {
    // Bersihkan canvas
    // ctx!.clearRect(0, 0, width, height);

    // // Gambar background (misalnya putih)
    // ctx!.fillStyle = 'white';
    // ctx!.fillRect(0, 0, width, height);

    // // Gambar kotak merah, posisi berubah tiap frame
    // ctx!.fillStyle = 'red';
    // ctx!.fillRect(10 + i * 5, 10, 30, 30); // Gerakkan kotak ke kanan

    // // Ambil piksel dari canvas untuk frame ini
    // const imageData = ctx!.getImageData(0, 0, width, height);
    // const pixels = new Uint8Array(imageData.data.buffer);

    const pixels = new Uint8Array(width*height);
    for (let j = 0; j < i*17; ++j) pixels[j] = 0x0;
    for (let j = i*17; j < width *10; ++j) pixels[j] = i+j & 0x7;

    // Tambahkan frame ke GIF
    gif.addFrame(0, 0, width, height, pixels, {
        // palette: [
        //     0x00,   0xff0000, 0x0000ff, 0x00ff00, 
        //     0xffff00, 0x00ffff, 0xffffff, 0x88ff00,
        // ],
        delay: 200, // 100ms per frame
    });
  }

  // Ekspor GIF sebagai Blob
  const gifBlob = new Blob([gifBuffer.subarray(0, gif.end())], { type: "image/gif" });
  const gifUrl = URL.createObjectURL(gifBlob);

  // Buat elemen <img> dan tampilkan GIF
//   const imgElement = document.createElement('img');
  const imgElement = document.getElementById('gif') as HTMLImageElement;
  imgElement.src = gifUrl;
//   document.body.appendChild(imgElement);
}

createGIF();

});

const xx = new XmlElement('yo');
console.log(xx.find('zoo'));

let ip : InterpreterState;

const code1 = document.getElementById('code1') as HTMLTextAreaElement;
const pre1 = document.getElementById('result1') as HTMLPreElement;
document.getElementById('btn1').addEventListener('click', async () => {
    ip = await exec(code1, pre1);
});
document.getElementById('parse1').addEventListener('click', () => parse(code1, pre1));
// document.getElementById('validate1').addEventListener('click', () => validate(code1, pre1));

const code2 = document.getElementById('code2') as HTMLTextAreaElement;
const pre2 = document.getElementById('result2') as HTMLPreElement;
const reset = document.getElementById('reset') as HTMLInputElement;
document.getElementById('btn2').addEventListener('click', () => exec(code2, pre2, reset.checked?undefined:ip));
document.getElementById('parse2').addEventListener('click', () => parse(code2, pre2));

const rng = document.getElementById('rng') as HTMLTextAreaElement;
const pre3 = document.getElementById('result3') as HTMLPreElement;
// document.getElementById('validate3').addEventListener('click', () => validate(rng, pre3));

const MX = 15, MY = MX, MZ =1, STEPS=200;

async function exec(
    code:HTMLTextAreaElement, 
    pre:HTMLPreElement, 
    oldIP:InterpreterState=undefined):Promise<InterpreterState>{
    console.log('reset:',reset.checked);
    // const elem = Helper.xmlParse(code.value);
    const elem = Helper.parseXml(code.value);
    const gif = new GIF({
        width: MX, height:MY, 
        workerScript:URL.createObjectURL(workerBlob),
        background: '#000001',
        globalPalette: true,
        // transparent: '#000001',
        // workers:3,
        // repeat: -1,
    });
    gif.on('finished', (blob) => {
        const img = document.getElementById('gif');//palette
        img.src = URL.createObjectURL(blob);
        img.classList.add('zoomed')
        // delta = now() - startTime
        // info.set 'text', """
        // 100%
        // #{ (delta / 1000).toFixed 2 }sec
        // #{ (blob.size / 1000).toFixed 2 }kb
        // """
    });
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    if(oldIP){
        elem.setAttribute("values", oldIP.grid.characters);
    }
    const ip = await Interpreter.load(
        elem
    );
    canvas.width = ip.grid.MX;
    canvas.height = ip.grid.MY;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle =  '#000001';
    ctx.clearRect(0,0,MX,MY);
    gif.addFrame(ctx, {copy: false, delay:500});
    
    let curr;
    if(!oldIP){
        curr = ip.run(STEPS);
    } else {
        curr = ip.advance(STEPS, oldIP);
    }
    let result = curr.next();

    let n = 0;
    while(!result.done){
        //? draw gif

        const start = ip.first[n-1];
        const finish = ip.first[n++];
        const positions = ip.changes.slice(start, finish);
        for (const [x,y,z] of  positions) {
            const pixel_index = y * MX + x;
            const color_index = ip.grid.padded[pixel_index];
            const color = ip.grid.characters[color_index]
            ctx.fillStyle =  PALETTE[color];
            // ctx.fillStyle =  '#0088ff';
            ctx.fillRect(x, y, 1, 1); // Menggambar satu pixel
        }
        // gif.addFrame(canvas, {delay:500});
        gif.addFrame(ctx, {copy: true, delay:500});

        // console.log(result);
        result = curr.next();

        //? draw first only
        // if (positions && positions.length) break;
    }
    gif.render();
    canvas.toBlob(blob => {
        const img = document.getElementById('palette');//
        img.src = URL.createObjectURL(blob);
    })
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
    console.log(ip.toJSON())
    return ip.toJSON();
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
    // const doc = parseXml(xml, {preserveComments:true, preserveWhiteSpace: true, includeOffsets:true});
    const doc = parseXml(xml, {preserveComments:true, preserveText:true, includeLineNumber:true, includeOffsets:false});
    pre.textContent = JSON.stringify(doc.toJSON(), null, 2);
}

// function validate(code:HTMLTextAreaElement, pre:HTMLPreElement) {
//     let xml = code.value;
//     // xml = `<wrapper>${xml}</wrapper>`;
//     const grammar = parseXml(xml, {preserveComments:false, includeLineNumber:true}).children[0];
//     const js = rngToJson(grammar);
//     pre.textContent = JSON.stringify(js, null, 2);
// }
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
const PALETTE = {
    "B": "#000000",
    "I": "#1D2B53",
    "P": "#7E2553",
    "E": "#008751",
    "N": "#AB5236",
    "D": "#5F574F",
    "A": "#C2C3C7",
    "W": "#FFF1E8",
    "R": "#FF004D",
    "O": "#FFA300",
    "Y": "#FFEC27",
    "G": "#00E436",
    "U": "#29ADFF",
    "S": "#83769C",
    "K": "#FF77A8",
    "F": "#FFCCAA",
    "b": "#291814",
    "i": "#111d35",
    "p": "#422136",
    "e": "#125359",
    "n": "#742f29",
    "d": "#49333b",
    "a": "#a28879",
    "w": "#f3ef7d",
    "r": "#be1250",
    "o": "#ff6c24",
    "y": "#a8e72e",
    "g": "#00b543",
    "u": "#065ab5",
    "s": "#754665",
    "k": "#ff6e59",
    "f": "#ff9d81",
    "C": "#00ffff",
    "c": "#5fcde4",
    "H": "#e4bb40",
    "h": "#8a6f30",
    "J": "#4b692f",
    "j": "#45107e",
    "L": "#847e87",
    "l": "#696a6a",
    "M": "#ff00ff",
    "m": "#9c09cc",
    "Q": "#9badb7",
    "q": "#3f3f74",
    "T": "#37946e",
    "t": "#323c39",
    "V": "#8f974a",
    "v": "#524b24",
    "X": "#ff0000",
    "x": "#d95763",
    "Z": "#ffffff",
    "z": "#cbdbfc",
};