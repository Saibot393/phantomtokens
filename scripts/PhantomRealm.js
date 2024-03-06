//spooooky
const cModuleName = "phantomtokens"

const cModuleIcon = ["fa-solid", "fa-ghost"];

const cLibWrapper = "lib-wrapper";

const cModes = ["normal", "anchor", "unclickable", "phantom"];

const cIcons = {
	normal: ["fa-solid", "fa-circle"],
	anchor: ["fa-solid", "fa-anchor"],
	unclickable: ["fa-solid", "fa-computer-mouse"],
	phantom: ["fa-solid", "fa-ghost"]
}

const cSpookyModeF = "SpookyModeFlag";

function Translate(pName, pWords = {}){
	let vContent = game.i18n.localize(cModuleName+"."+pName);
	
	for (let vWord of Object.keys(pWords)) {
		vContent = vContent.replace("{" + vWord + "}", pWords[vWord]);
	}
 
	return vContent;
}

class SpookyFlags {
	static getMode(pToken) {
		return pToken?.getFlag(cModuleName, cSpookyModeF) || 0;
	}
	
	static getModeName(pToken) {
		return cModes[SpookyFlags.getMode(pToken)];
	}
	
	static async setMode(pToken, pMode) {
		if (!isNaN(pMode)) {
			await pToken?.setFlag(cModuleName, cSpookyModeF, Number(pMode));
		}
		else {
			await pToken?.setFlag(cModuleName, cSpookyModeF, Number(cModes.indexOf(pMode)));
		}
	}
	
	static async increaseMode(pToken) {
		let vMode = SpookyFlags.getMode(pToken);
		
		vMode = (vMode + 1) % cModes.length;
		
		await SpookyFlags.setMode(pToken, vMode);
	}
	
	static async decreaseMode(pToken) {
		let vMode = SpookyFlags.getMode(pToken);
		
		vMode = (vMode - 1) % cModes.length;
		
		await SpookyFlags.setMode(pToken, vMode);
	}
}

class SpookyRealmManager {
	static addSpookyRealmButton (pApp, pHTML, pInfos) {
		if (game.user.isGM) {
			let vButton = document.createElement("li");
			vButton.classList.add("control-tool", "toggle");
			vButton.setAttribute("data-tool", "spookyrealmtoggle");
			vButton.setAttribute("role", "button");
			vButton.setAttribute("data-tooltip", Translate("Titles." + "togglePhantomVision"));
			
			let vIcon = document.createElement("i");
			vIcon.classList.add(...cModuleIcon);
			
			vButton.appendChild(vIcon);
			
			pHTML[0].querySelector(`[id="tools-panel-token"]`).appendChild(vButton);
			
			let vUpdateIcon = () => {
				if (game.settings.get(cModuleName, "spookyrealmactive")) {
					vButton.classList.add("active");
				}
				else {
					vButton.classList.remove("active");
				}
			}
			
			vButton.onclick = async (pEvent) => {
				await game.settings.set(cModuleName, "spookyrealmactive", !game.settings.get(cModuleName, "spookyrealmactive"));
				
				vUpdateIcon();
			};
			
			vUpdateIcon();
		}
	}
	
	static addSpookyTokenHUD(pHUD, pHTML, pTokenData) {
				let vButtonHTML = `<div class="control-icon" data-action="mount">
									<i class="${cRideableIcon}"></i>
							   </div>`;
				
				pHTML.find("div.col."+vButtonPosition).append(vButtonHTML);
	}
	
	static updateSpookyVision() {
		console.log(game.settings.get(cModuleName, "spookyrealmactive"));
	}
	
	static spookyPatches() {
		if (game.modules.get(cLibWrapper)?.active) {
			//use lib wrapper to monkey patch
		}
		else {
			//release the (spooky) monkeys
		}
	}
	
	static onpreUpdateToken(pToken, pChanges) {
		if (!game.settings.get(cModuleName, "spookyrealmactive")) {
			if (SpookyFlags.getModeName(pToken) == "anchor") {
				delete pChanges.x;
				delete pChanges.y;
				delete pChanges.elevation;
				delete pChanges.rotation;
			}
		}
	}
	
	static async setModeofTokens(pMode, pTokens = canvas.tokens.controlled.map(pToken => pToken.document)) {
		for (vToken of pTokens) {
			await SpookyFlags.setMode(vToken, pMode);
		};
		
		SpookyRealmManager.updateSpookyVision();
	}
}

Hooks.on("renderSceneControls", (pApp, pHTML, pInfos) => {SpookyRealmManager.addSpookyRealmButton(pApp, pHTML, pInfos)});

Hooks.on("renderTokenHUD", (pHUD, pHTML, pTokenData) => SpookyRealmManager.addSpookyTokenHUD(pHUD, pHTML, pTokenData));

Hooks.on("preUpdateToken", (pToken, pChanges) => {SpookyRealmManager.onpreUpdateToken(pToken, pChanges)});

Hooks.on("init", () => {
	SpookyRealmManager.spookyPatches();
	
	game.settings.register(cModuleName, "spookyrealmactive", {
		scope: "world",
		config: false,
		type: Boolean,
		default: false,
		onChange : () => {SpookyRealmManager.updateSpookyVision()}
	}); 
	
	game.modules.get(cModuleName).api = {
		flags : SpookyFlags,
		setModeofTokens : SpookyRealmManager.setModeofTokens
	}
});

//the reason this file is so spooky is found in line 4, spooooky