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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsChatSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const iframeView_1 = __importDefault(require("./iframeView"));
class VsChatSidebarProvider {
    _extensionUri;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                // show vschat panel
                case "success": {
                    this.openPanel(data);
                    break;
                }
                case "error": {
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }
    // Make panel's title readable
    // 
    prettifyPanelTitle(chatroomId) {
        switch (chatroomId) {
            case "dvchat":
                return "#General";
            case "frontend":
                return "#FrontEnd";
            case "backend":
                return "#BackEnd";
            case "mobiledev":
                return "#MobileDev";
            case "data_science":
                return "#DataScience";
            case "devops":
                return "#DevOps";
            case "gamedev":
                return "#GameDev";
            case "frameworks":
                return "#Frameworks";
            default:
                return "#dvChat";
        }
    }
    openPanel(data) {
        let username = data.username;
        let chatroomId = data.chatroomId;
        const panel = vscode.window.createWebviewPanel("dvChat", this.prettifyPanelTitle(chatroomId), vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableCommandUris: true,
            enableFindWidget: true,
        });
        panel.webview.html = (0, iframeView_1.default)(username, chatroomId);
        panel.iconPath = vscode.Uri.joinPath(this._extensionUri, "img", "chat-small.png");
    }
    getNonce() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"));
        // Use a nonce to only allow a specific script to be run.
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>vsChat</title>
			</head>
      <body>
      <div class="mylogo"></div>
      <h2>Welcome to vsChat</h2>
      <p>Chat with developers around the world.</p>
      
      <br>
				<label for="fname">Username:</label>
        <input type="text" id="username" name="username" placeholder="Your username">
        
        <label for="chatroom">Chatroom:</label>
        
          <select name="chatroom" id="chatroom">
            <option value="vschat">#General</option>
            <option value="frontend">#FrontEnd</option>
            <option value="backend">#BackEnd</option>
            <option value="mobiledev">#MobileDev</option>
            <option value="data_science">#DataScience</option>
            <option value="devops">#DevOps</option>
            <option value="gamedev">#GameDev</option>
            <option value="frameworks">#Frameworks</option>
          </select>
        <br>
        
        <h4>Rules</h4>
        <ul>
          <li>Be positive & helpful</li>
          <li>Be respectful</li>
          <li>Do not self promote</li>
          <li>Always be polite</li>
          <li>Have fun!</li>
        </ul>
        
        <br>
        
        <button id="enterBtn" class="bluebtn">Enter Chatroom 💬</button>

        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.VsChatSidebarProvider = VsChatSidebarProvider;
//# sourceMappingURL=VsChatSidebarProvider.js.map