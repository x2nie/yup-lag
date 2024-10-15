// Fix the public path so that any async import()'s work as expected.
// eslint-disable-next-line @typescript-eslint/naming-convention
// declare const __webpack_relative_entrypoint_to_root__: string;
// declare const scriptUrl: string;
// __webpack_public_path__ = new URL(scriptUrl.replace(/[^/]+$/, '') + __webpack_relative_entrypoint_to_root__).toString();
// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------
export const activate = context => {
    return {
        renderOutputItem(outputItem, element) {
            // let shadow = element.shadowRoot;
            // if (!shadow) {
            //     shadow = element.attachShadow({ mode: 'open' });
            //     // eslint-disable-next-line no-undef
            //     const root = document.createElement('div');
            //     root.id = 'root';
            //     shadow.append(root);
            // }
            // const root = shadow.querySelector('#root');
            // root.innerHTML = "hello moto";
            let canvas = element.querySelector('canvas'); // Cek apakah sudah ada canvas
            if (!canvas) {
                // Jika belum ada canvas, buat canvas baru
                    // eslint-disable-next-line no-undef
                canvas = document.createElement('canvas');
                element.appendChild(canvas);
            }
            // Ambil data GIF dari output item
            const gifData = outputItem.json().grid;
            // Gambar GIF di atas canvas (baik baru atau yang sudah ada)
            renderGifOnCanvas(canvas, gifData);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        disposeOutputItem(outputId) {
            // Do any teardown here. outputId is the cell output being deleted, or
            // undefined if we're clearing all outputs.
        }
    };
};
/**
 * Fungsi untuk menggambar GIF di atas canvas.
 * @param {HTMLCanvasElement} canvas - Elemen canvas tempat menggambar GIF.
 * @param {IGridStorage} ip - Data GIF dalam Uint8Array.
 */
function renderGifOnCanvas(canvas, ip) {
    const { MX, MY, MZ, characters, data } = ip;
    const pal = ip.characters.split('').map(c => PALETTE[c] || 'black');
    canvas.width = MX; // Set ukuran canvas
    canvas.height = MY;
    canvas.style.height = '256px';
    canvas.style.imageRendering = 'pixelated';
    const ctx = canvas.getContext('2d');
    for (const sz of data.split(' ')) {
        let y = 0;
        for (const sy of sz.split('/')) {
            let x = -1;
            for (let s of sy.split('')) {
                x++;
                if(s=='-') s = characters[0];
                ctx.fillStyle = pal[characters.indexOf(s)];
                ctx.fillRect(x, y, 1, 1); // Menggambar satu pixel
            }
            y++;
        }
        break;
    }
}
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