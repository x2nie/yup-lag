import * as vscode from 'vscode';
import { YupKernel } from './controller';
import { YupContentSerializer } from './serializer';

const NOTEBOOK_TYPE = 'yup-notebook-serializer';

export function extentionActivated(context: vscode.ExtensionContext) {
	console.log('context:',context);
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

	// context.subscriptions.push(vscode.notebooks.registerNotebookCellStatusBarItemProvider(). .re.registerNotebookOutputRenderer({
	// 	renderOutputItem: (outputItem, element) => {
	// 		const canvas = document.createElement('canvas');
	// 		canvas.width = 300; // Set width sesuai kebutuhan
	// 		canvas.height = 300; // Set height sesuai kebutuhan
	// 		element.appendChild(canvas);

	// 		// Ambil data GIF dari output item
	// 		const gifData = outputItem.data();
			
	// 		// Panggil fungsi untuk menggambar GIF
	// 		renderGifOnCanvas(canvas, gifData);
	// 	}
	// }));
}
