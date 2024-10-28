import * as vscode from 'vscode';
// import { YupKernel } from './controller';
// import { YupContentSerializer } from './serializer';

// const NOTEBOOK_TYPE = 'yup-notebook-serializer';
import { extentionActivated } from './notebook';

export function activate(context: vscode.ExtensionContext) {
	console.log('context:',context);
	extentionActivated(context);
}
