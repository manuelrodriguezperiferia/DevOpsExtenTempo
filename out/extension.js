"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const prompt_tsx_1 = require("@vscode/prompt-tsx");
const vscode = __importStar(require("vscode"));
const play_1 = require("./play");
const CAT_NAMES_COMMAND_ID = 'devopsexten.namesInEditor';
const CAT_PARTICIPANT_ID = 'devopsexten.cat';
const MODEL_SELECTOR = { vendor: 'copilot', family: 'gpt-3.5-turbo' };
function activate(context) {
    console.log('Congratulations, your extension "chatdevopsts" is now active!');
    let helloWorld = vscode.commands.registerCommand('devopsexten.helloWorld', () => {
        vscode.window.showInformationMessage('wellcome to Devopschat!');
    });
    //
    let Perro = vscode.commands.registerCommand('devopsexten.Perro', () => {
        vscode.window.showInformationMessage('123....!');
    });
    //
    let cat = vscode.commands.registerCommand('devopsexten.cat', () => {
        //
        console.log('Congratulations, your extension "chatdevops" is now active!');
        vscode.window.showInformationMessage('Cat you!');
        vscode.window.showInformationMessage('wellcome to Devopschat!');
        vscode.commands.executeCommand("workbench.action.chat.open");
        //
        const handler = async (request, context, stream, token) => {
            stream.progress('Picking the right topic to teach...');
            stream.progress('Throwing away the computer science books and preparing to play with some Python code...');
            const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
            if (model) {
                // Here's an example of how to use the prompt-tsx library to build a prompt
                const { messages } = await (0, prompt_tsx_1.renderPrompt)(play_1.PlayPrompt, { userQuery: request.prompt }, { modelMaxPromptTokens: model.maxInputTokens }, new prompt_tsx_1.Cl100KBaseTokenizer());
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
exports.activate = activate;
function handleError(err, stream) {
    if (err instanceof vscode.LanguageModelError) {
        console.log(err.message, err.code, err.cause);
        if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
            stream.markdown(vscode.l10n.t('I\'m sorry, I can only explain computer science concepts.'));
        }
    }
    else {
        throw err;
    }
}
//
//
//
function getTopic(history) {
    const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
    // Filter the chat history to get only the responses from the cat
    const previousCatResponses = history.filter(h => {
        return h instanceof vscode.ChatResponseTurn && h.participant === CAT_PARTICIPANT_ID.toString();
    });
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
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map