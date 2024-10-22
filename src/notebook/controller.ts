import * as vscode from 'vscode';
import { Helper } from '../helpers/helper';
import { InterpreterState, Interpreter } from '../interpreter';
// import { DOMParser } from "@xmldom/xmldom";
// import { Loader } from '../loader';

const /* MX = 15, MY = MX, MZ =1, */ STEPS = 1000;

export class YupKernel {
	private readonly _id = 'yup-notebook-serializer-kernel';
	private readonly _label = 'Yup Notebook Kernel';
	private readonly _supportedLanguages = ['json', 'xml', 'yup'];

	private _executionOrder = 0;
	private readonly _controller: vscode.NotebookController;

	constructor() {

		this._controller = vscode.notebooks.createNotebookController(this._id,
			'yup-notebook-serializer',
			this._label);

		this._controller.supportedLanguages = this._supportedLanguages;
		this._controller.supportsExecutionOrder = true;
		this._controller.executeHandler = this._executeAll.bind(this);
	}

	dispose(): void {
		this._controller.dispose();
	}

	private async _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController) {
		let ips: InterpreterState = null;
		for (const cell of cells) {
			ips = ips || this._getPreviousState(cell);
			ips = await this._doExecution(cell, ips);
		}
	}

	private _getPreviousState(cell: vscode.NotebookCell): InterpreterState {
		let prevCell:vscode.NotebookCell = null;
		let last = cell.index;
		// while (last >= 0 && prevCell && prevCell.kind != vscode.NotebookCellKind.Code ) {
		// 	last++
		// };
		do {
			last--;
			prevCell = cell.notebook.cellAt(last);
		} while (last >= 0 && prevCell.kind != vscode.NotebookCellKind.Code );
		if (last >= 0 && prevCell) {
			for (const o1 of prevCell.outputs) {

				for (const o2 of o1.items) {
					if (o2.mime == 'x-application/yup-ipstate+json') {
						return JSON.parse(o2.data.toString());
					}
				}
			}
		}
		return null;
	}

	private async _doExecution(cell: vscode.NotebookCell, ips: InterpreterState): Promise<InterpreterState> {
		const execution = this._controller.createNotebookCellExecution(cell);

		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now());

		try {
			const elem = Helper.parseXml(cell.document.getText());
			//? reuse old state first
			if (ips) {
				elem.setAttribute("values", ips.grid.characters);
				elem.setAttribute("symmetry", ips.symmetry);
				elem.setAttribute("MX", String(ips.grid.MX));
				elem.setAttribute("MY", String(ips.grid.MY));
				elem.setAttribute("MZ", String(ips.grid.MZ));
			}

			//? then, maybe override the state by <env>
			const ip = await Interpreter.load(elem);
			let curr;
			if (ips) {
				curr = ip.advance(STEPS, ips);
			} else {
				curr = ip.run(STEPS);
			}
			let result = curr.next();
			while (!result.done) {
				// console.log(result);
				result = curr.next();
			}

			// cell.metadata['ip'] = ip.toJSON()

			const [grid, chars, MX, MY, MZ] = ip.state();
			let s = '';
			let i = 0;
			for (let y = 0; y < MY; y++) {
				for (let x = 0; x < MX; x++) {
					s += grid[i] == 0 ? '-' : chars[grid[i]];
					i++;
				}
				s += '\n';
			}
			// pre.textContent = s;

			const xml2json = (txt: string) => {
				return elem.toJSON();
			};
			/*const xml2json0 = (txt: string) => {
				// const parser = new DOMParser();
				// const doc = parser.parseFromString(txt, "text/xml");
				// const el = doc.firstChild as XmlElement;
				// const el = Loader.xmlParse(txt);
				const el = Helper.xmlParse(txt);
				// const el = xmlParse(txt);
				const attributes = {};
				for (let i = 0; i < el.attributes.length; i++) {
					const attr = el.attributes[i];
					attributes[attr.name] = attr.value;
				}
				// for (const name of el.getAttributeNames()) {
				// for (const name of el.attributes) {
				// 	const value = el.getAttribute(name);
				// 	attributes[name] = value;
				// }
				// @ts-ignore
				const {tagName, lineNumber} = el;
				// console.log(attributes);
				return {tagName, lineNumber, attributes };
			};*/

			let fun: any;
			const text = cell.document.getText();
			switch (cell.document.languageId) {
				case 'json':
					fun = JSON.parse;
					break;
				case 'xml':
					fun = xml2json;
					break;

				default:
					break;
			}

			const state = ip.toJSON();
			execution.replaceOutput([
				new vscode.NotebookCellOutput([
					// vscode.NotebookCellOutputItem.json(fun(text)),
					vscode.NotebookCellOutputItem.text(s, 'text/plain'),
					vscode.NotebookCellOutputItem.json(state, 'x-application/yup-ipstate+json'),
					vscode.NotebookCellOutputItem.json(state, 'application/json'),
				]
				),
				// new vscode.NotebookCellOutput([
				// 	vscode.NotebookCellOutputItem.json(fun(text)),
				// 	// vscode.NotebookCellOutputItem.text(s, 'text/plain'),
				// 	]
				// )
			]);

			execution.end(true, Date.now());
			return state;
		} catch (err) {
			execution.replaceOutput([new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.error(err as Error)
			])]);
			execution.end(false, Date.now());
		}
	}
}

/* 
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
} */