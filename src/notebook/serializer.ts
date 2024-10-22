import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { ipState2Text } from './utils';

/**
 * An ultra-minimal sample provider that lets the user type in JSON, and then
 * outputs JSON cells. The outputs are transient and not saved to notebook file on disk.
 */

interface RawNotebookData {
	cells: RawNotebookCell[]
}

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
	editable?: boolean;
	ipState?: any;
}

export class YupContentSerializer implements vscode.NotebookSerializer {
	public readonly label: string = 'Yup Content Serializer';

	public async deserializeNotebook(data: Uint8Array, token: vscode.CancellationToken): Promise<vscode.NotebookData> {
		const contents = new TextDecoder().decode(data); // convert to String

		// Read file contents
		let raw: RawNotebookData;
		try {
			raw = <RawNotebookData>JSON.parse(contents);
		} catch {
			raw = { cells: [] };
		}

		// Create array of Notebook cells for the VS Code API from file contents
		const cells = raw.cells.map(item => {
			const cell = new vscode.NotebookCellData(
				item.kind,
				item.value,
				item.language
			);
			if (item.ipState){
				const state = item.ipState;
				cell.outputs = [
					new vscode.NotebookCellOutput([
						// vscode.NotebookCellOutputItem.json(fun(text)),
						vscode.NotebookCellOutputItem.text(ipState2Text(state), 'text/plain'),
						vscode.NotebookCellOutputItem.json(state, 'x-application/yup-ipstate+json'),
						vscode.NotebookCellOutputItem.json(state, 'application/json'),
					]
				)
			];
			}
			return cell;
		});
		// const cells = raw.cells.map(item => new vscode.NotebookCellData(
		// 	item.kind,
		// 	item.value,
		// 	item.language
		// ));

		return new vscode.NotebookData(cells);
	}

	public async serializeNotebook(data: vscode.NotebookData, token: vscode.CancellationToken): Promise<Uint8Array> {
		// Map the Notebook data into the format we want to save the Notebook data as
		const contents: RawNotebookData = { cells: [] };

		for (const cell of data.cells) {
			contents.cells.push({
				kind: cell.kind,
				language: cell.languageId,
				value: cell.value,
				ipState: this.getOutput(cell)
			});
		}

		return new TextEncoder().encode(JSON.stringify(contents));
	}

	private getOutput(cell: vscode.NotebookCellData):any{
		for (const o1 of cell.outputs) {
			for (const o2 of o1.items) {
				if (o2.mime == 'x-application/yup-ipstate+json') {
					return JSON.parse(o2.data.toString());
				}
			}
		}
	}
}
