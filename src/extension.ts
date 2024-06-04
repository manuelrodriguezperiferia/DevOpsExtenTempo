import { renderPrompt, Cl100KBaseTokenizer } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { PlayPrompt } from './play';

const CAT_NAMES_COMMAND_ID = 'devopsexten.namesInEditor';
const CAT_PARTICIPANT_ID = 'devopsexten.cat';

interface ICatChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "chatdevopsts" is now active!');
	
	let helloWorld = vscode.commands.registerCommand('devopsexten.helloWorld', ()  => {
		vscode.window.showInformationMessage('wellcome to Devopschat!');
	});
	//
	let Perro = vscode.commands.registerCommand('devopsexten.Perro', () => {
		vscode.window.showInformationMessage('123....!');
	});
	//
	let cat = vscode.commands.registerCommand('devopsexten.cat',()  =>  {
		//
		console.log('Congratulations, your extension "chatdevops" is now active!');
		vscode.window.showInformationMessage('Cat you!');
		vscode.window.showInformationMessage('wellcome to Devopschat!');
		vscode.commands.executeCommand("workbench.action.chat.open");
		//
		const handler: vscode.ChatRequestHandler = async (
			request: vscode.ChatRequest,
			context: vscode.ChatContext,
			stream: vscode.ChatResponseStream,
			token: vscode.CancellationToken
		  ): Promise<ICatChatResult> => {
			stream.progress('Picking the right topic to teach...');
			stream.progress('Throwing away the computer science books and preparing to play with some Python code...');
				const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
	
				if (model) {
					// Here's an example of how to use the prompt-tsx library to build a prompt
					const { messages } = await renderPrompt(
						PlayPrompt,
						{ userQuery: request.prompt },
						{ modelMaxPromptTokens: model.maxInputTokens },
						new Cl100KBaseTokenizer());
					const chatResponse = await model.sendRequest(messages, {}, token);
					for await (const fragment of chatResponse.text) {
						stream.markdown(fragment);
					}
				}
	
				stream.button({
					command: CAT_NAMES_COMMAND_ID,
					title: vscode.l10n.t('Use Cat Names in Editor')
				});
	
		   return { metadata: { command: 'play' } };
	
		  };
		  const cat = vscode.chat.createChatParticipant('devopsexten.cat', handler);
		  cat.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
		});

	context.subscriptions.push(helloWorld);
	context.subscriptions.push(Perro);
	context.subscriptions.push(cat);
}

function handleError(err: any, stream: vscode.ChatResponseStream): void {
    if (err instanceof vscode.LanguageModelError) {
        console.log(err.message, err.code, err.cause);
        if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
            stream.markdown(vscode.l10n.t('I\'m sorry, I can only explain computer science concepts.'));
        }
    } else {
        throw err;
    }
}
//
//
//
function getTopic(history: ReadonlyArray<vscode.ChatRequestTurn | vscode.ChatResponseTurn>): string {
    const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
    // Filter the chat history to get only the responses from the cat
    const previousCatResponses = history.filter(h => {
        return h instanceof vscode.ChatResponseTurn && h.participant === CAT_PARTICIPANT_ID.toString();}) as vscode.ChatResponseTurn[];
    // Filter the topics to get only the topics that have not been taught by the cat yet
    const topicsNoRepetition = topics.filter(topic => {
        return !previousCatResponses.some(catResponse => {
            return catResponse.response.some(r => {
                return r instanceof vscode.ChatResponseMarkdownPart && r.value.value.includes(topic);
            });
        });
    });

    return topicsNoRepetition[Math.floor(Math.random() * topicsNoRepetition.length)] || 'I have taught you everything I know. Meow!';
}
//
//
//
export function deactivate() {}
