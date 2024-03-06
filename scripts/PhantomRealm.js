//spooooky
const cModuleName = "phantomtokens"

const cModuleIcon = ["fa-solid", "fa-ghost"];

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
		await pToken?.setFlag(cModuleName, cSpookyModeF, Number(pMode));
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
				
				SpookyRealmManager.updateSpookyVision();
			};
			
			vUpdateIcon();
		}
	}
	
	static updateSpookyVision() {
		
	}
}

Hooks.on("renderSceneControls", (pApp, pHTML, pInfos) => {SpookyRealmManager.addSpookyRealmButton(pApp, pHTML, pInfos)});

Hooks.on("init", () => {
	game.settings.register(cModuleName, "spookyrealmactive", {
		name: Translate("Settings.spookyrealmactive.name"),
		hint: Translate("Settings.spookyrealmactive.descrp"),
		scope: "world",
		config: false,
		type: Boolean,
		default: false,
		onChange : () => {console.log("test")}
	}); 
});

//the reason this file is so spooky is found in line 4, spooooky