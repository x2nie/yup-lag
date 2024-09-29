export class UndoRedo<T> {
    private maxSize: number;
    private stack: T[];       // Array untuk menyimpan history
    private redoStack: T[];   // Array untuk menyimpan redo history

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
        this.stack = [];
        this.redoStack = [];
    }

    // Tambahkan item baru ke history dan kosongkan redoStack
    add(item: T): void {
        if (this.stack.length >= this.maxSize) {
            this.stack.shift(); // Hapus item pertama jika sudah mencapai maxSize
        }
        this.stack.push(JSON.parse(JSON.stringify(item))); // Menyimpan salinan item
        this.redoStack = []; // Kosongkan redoStack
    }

    // Undo: Ambil item terakhir dan pindahkan ke redoStack
    undo(): T | null {
        if (this.stack.length === 0) return null;
        const lastItem = this.stack.pop() as T;
        this.redoStack.push(JSON.parse(JSON.stringify(lastItem)));
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }

    // Redo: Ambil item terakhir dari redoStack dan tambahkan kembali ke stack
    redo(): T | null {
        if (this.redoStack.length === 0) return null;
        const redoItem = this.redoStack.pop() as T;
        this.stack.push(JSON.parse(JSON.stringify(redoItem)));
        return redoItem;
    }

    // Lihat item terakhir tanpa menghapusnya
    peek(): T | undefined {
        return this.stack[this.stack.length - 1];
    }

    // Mengecek apakah history kosong
    isEmpty(): boolean {
        return this.stack.length === 0;
    }

    // Mendapatkan panjang history
    getSize(): number {
        return this.stack.length;
    }

    // Menghapus semua history
    clear(): void {
        this.stack = [];
        this.redoStack = [];
    }
}

/*
// Fungsi untuk menampilkan matrix 3x3 dengan baik
function printMatrix(matrix: number[][]): void {
    matrix.forEach(row => console.log(row.join(" ")));
}

// Contoh penggunaan untuk array 3x3
const history = new UndoRedo<number[][]>();

// Inisialisasi array 3x3
let matrix: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

// Tambahkan matrix awal ke history
history.add(matrix);

// Modifikasi matrix
matrix[0][0] = 1;
history.add(matrix); // Simpan ke history

matrix[1][1] = 2;
history.add(matrix); // Simpan ke history

matrix[2][2] = 3;
history.add(matrix); // Simpan ke history

console.log("Current Matrix:");
printMatrix(matrix);

// Undo
console.log("\nUndo:");
matrix = history.undo() || matrix;
printMatrix(matrix);

// Redo
console.log("\nRedo:");
matrix = history.redo() || matrix;
printMatrix(matrix);

// Lakukan beberapa undo
console.log("\nUndo x2:");
matrix = history.undo() || matrix;
matrix = history.undo() || matrix;
printMatrix(matrix);

// Tambah item baru
matrix[0][2] = 5;
history.add(matrix);
console.log("\nAdded new state after undo:");
printMatrix(matrix);

// Redo lagi (tidak ada perubahan karena ada item baru)
console.log("\nRedo (should not change):");
matrix = history.redo() || matrix;
printMatrix(matrix);

*/