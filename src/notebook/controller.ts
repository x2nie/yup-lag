import * as vscode from 'vscode';
import { Helper } from '../helpers/helper';
// import { DOMParser } from "@xmldom/xmldom";
// import { Loader } from '../loader';


export class YupKernel {
	private readonly _id = 'yup-notebook-serializer-kernel';
	private readonly _label = 'Yup Notebook Kernel';
	private readonly _supportedLanguages = ['json','xml'];

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

	private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
		for (const cell of cells) {
			this._doExecution(cell);
		}
	}

	private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
		const execution = this._controller.createNotebookCellExecution(cell);

		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now());

		const xml2json = (txt: string) => {
			return Helper.parseXml(txt).toJSON();
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

		try {
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

			execution.replaceOutput([new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.json(fun(text))
			])]);

			execution.end(true, Date.now());
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