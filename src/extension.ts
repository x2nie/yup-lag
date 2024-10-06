import * as vscode from 'vscode';
import { YupKernel } from './controller';
import { YupContentSerializer } from './serializer';

const NOTEBOOK_TYPE = 'yup-notebook-serializer';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('yup-notebook.createJsonNotebook', async () => {
		// const language = 'json';
		// const defaultValue = `{ "hello_yup": 123 }`;
		const language = 'xml';
		const defaultValue = `<env size="39" legend="BAZ" />\n<dot color="Z"/>`;
		const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
		const data = new vscode.NotebookData([cell]);
		data.metadata = {
			custom: {
				cells: [],
				metadata: {
					orig_nbformat: 4
				},
				nbformat: 4,
				nbformat_minor: 2
			}
		};
		const doc = await vscode.workspace.openNotebookDocument(NOTEBOOK_TYPE, data);
		await vscode.window.showNotebookDocument(doc);
	}));

	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			NOTEBOOK_TYPE, new YupContentSerializer(), { transientOutputs: true }
		),
		new YupKernel()
	);
}
