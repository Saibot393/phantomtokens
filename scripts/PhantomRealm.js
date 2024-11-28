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
		
		vMode = (cModes.length + vMode - 1) % cModes.length;
		
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
			
			this.SpookyIconupdate = vUpdateIcon;
			
			vButton.onclick = async (pEvent) => {
				await game.settings.set(cModuleName, "spookyrealmactive", !game.settings.get(cModuleName, "spookyrealmactive"));
				
				//vUpdateIcon();
			};
			
			vUpdateIcon();
		}
	}
	
	static addSpookyTokenHUD(pHUD, pHTML, pTokenData) {
		let vToken = canvas.tokens.get(pTokenData._id)?.document;
		
		if (vToken) {
			if (game.settings.get(cModuleName, "spookyrealmactive") || (SpookyFlags.getModeName(vToken) != "normal")) {
				if (game.user.isGM) {
					let vButton =  document.createElement("div");
					vButton.classList.add("control-icon");
					vButton.setAttribute("data-action", "changePahntomMode");
					
					let vIcon = document.createElement("i");
					
					vButton.appendChild(vIcon);
					
					let vUpdateIcon = () => {
						vIcon.classList.forEach(vClass => vIcon.classList.remove(vClass));
						
						vIcon.classList.add(...cIcons[SpookyFlags.getModeName(vToken)]);
						
						vIcon.setAttribute("title", Translate("Titles.modes." + SpookyFlags.getModeName(vToken) + ".descrp"));
					}
					
					vButton.onclick = async (pEvent) => {
						if (game.settings.get(cModuleName, "spookyrealmactive")) {
							await SpookyFlags.increaseMode(vToken);
							
							SpookyRealmManager.setModeofTokens(SpookyFlags.getModeName(vToken));
							
							vUpdateIcon();
						}
					}
					
					vButton.oncontextmenu = async (pEvent) => {
						if (game.settings.get(cModuleName, "spookyrealmactive")) {
							await SpookyFlags.decreaseMode(vToken);
							
							SpookyRealmManager.setModeofTokens(SpookyFlags.getModeName(vToken));
							
							vUpdateIcon();
						}
					}
					
					pHTML[0].querySelector("div.col.right").prepend(vButton);
					
					vUpdateIcon();
				}
			}
		}
	}
	
	static updateSpookyVision(pForAll = true) {
		console.log("updatingVision", pForAll);
		if (canvas.tokens._activate) {
			canvas.tokens._activate();
		}
		else {
			canvas.tokens.activate();
		}
		
		if (pForAll) {
			game.socket.emit("module.phantomtokens", {pFunction : "updateSpookyVisionRequest", pData : {pSender : game.user.id}});
		}	
	}
	
	static updateSpookyIcon() {
		if (this.SpookyIconupdate) this.SpookyIconupdate();
	}
	
	static spookyPatches() {
		function canDrag(pToken) {
			if (!game.settings.get(cModuleName, "spookyrealmactive")) {
				return SpookyFlags.getModeName(pToken) != "anchor";
			}
			return true;
		}
		
		function canControl(pToken) {
			if (!game.settings.get(cModuleName, "spookyrealmactive")) {
				return SpookyFlags.getModeName(pToken) != "unclickable";
			}
			return true;
		}
		
		function canHover(pToken) {
			if (!game.settings.get(cModuleName, "spookyrealmactive")) {
				return SpookyFlags.getModeName(pToken) != "unclickable";
			}
			return true;
		}
		
		function isVisible(pToken) {
			if (!game.settings.get(cModuleName, "spookyrealmactive")) {
				return SpookyFlags.getModeName(pToken) != "phantom";
			}
			return true;
		}
		
		if (game.modules.get(cLibWrapper)?.active) {
			//use lib wrapper to monkey patch
			libWrapper.register(cModuleName, "Token.prototype._canDrag", function(vWrapped, ...args) {if (canDrag(this.document)) {return vWrapped(...args)} return false}, "MIXED");
			
			libWrapper.register(cModuleName, "Token.prototype._canControl", function(vWrapped, ...args) {if (canControl(this.document)) {return vWrapped(...args)} return false}, "MIXED");
			
			libWrapper.register(cModuleName, "Token.prototype._canHover", function(vWrapped, ...args) {if (canHover(this.document)) {return vWrapped(...args)} return false}, "MIXED");
			
			libWrapper.register(cModuleName, "CONFIG.Token.objectClass.prototype.isVisible", function(vWrapped, ...args) {if (isVisible(this.document)) {return vWrapped(...args)} return false}, "MIXED");
		}
		else {
			//release the (spooky) monkeys
			const vOldDragCall = Token.prototype._canDrag;
			Token.prototype._canDrag = function (...args) {
				let vCallOld = canDrag(this.document);
				
				if (vCallOld) {
					let vCallBuffer = vOldDragCall.bind(this);
					return vCallBuffer(...args);
				}
			}
			
			const vOldControlCall = Token.prototype._canControl;
			Token.prototype._canControl = function (...args) {
				let vCallOld = canControl(this.document);
				
				if (vCallOld) {
					let vCallBuffer = vOldControlCall.bind(this);
					return vCallBuffer(...args);
				}
			}
			
			const vOldHoverCall = Token.prototype._canHover;
			Token.prototype._canHover = function (...args) {
				let vCallOld = canHover(this.document);
				
				if (vCallOld) {
					let vCallBuffer = vOldHoverCall.bind(this);
					return vCallBuffer(...args);
				}
			}
			
			const vOldVisibleCall = CONFIG.Token.objectClass.prototype.__lookupGetter__("isVisible");
			CONFIG.Token.objectClass.prototype.__defineGetter__("isVisible", function (...args) {
				let vCallOld = isVisible(this.document);
				
				if (vCallOld) {
					let vCallBuffer = vOldVisibleCall.bind(this);
					return vCallBuffer(...args);
				}
			});
		}
	}
	
	static async setModeofTokens(pMode, pTokens = canvas.tokens.controlled.map(pToken => pToken.document)) {
		for (let vToken of pTokens) {
			await SpookyFlags.setMode(vToken, pMode);
		};
		
		SpookyRealmManager.updateSpookyVision();
	}
	
	static async increaseModeofTokens(pTokens = canvas.tokens.controlled.map(pToken => pToken.document)) {
		for (let vToken of pTokens) {
			await SpookyFlags.increaseMode(vToken);
		};
		
		SpookyRealmManager.updateSpookyVision();
	}
	
	static async decreaseModeofTokens(pTokens = canvas.tokens.controlled.map(pToken => pToken.document)) {
		for (let vToken of pTokens) {
			await SpookyFlags.decreaseMode(vToken);
		};
		
		SpookyRealmManager.updateSpookyVision();
	}
}

function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "updateSpookyVisionRequest":
			SpookyRealmManager.updateSpookyVision(false);
	}
}

Hooks.on("renderSceneControls", (pApp, pHTML, pInfos) => {SpookyRealmManager.addSpookyRealmButton(pApp, pHTML, pInfos)});

Hooks.on("renderTokenHUD", (pHUD, pHTML, pTokenData) => SpookyRealmManager.addSpookyTokenHUD(pHUD, pHTML, pTokenData));

Hooks.on("init", () => {
	SpookyRealmManager.spookyPatches();
	
	game.settings.register(cModuleName, "spookyrealmactive", {
		scope: "client",
		config: false,
		type: Boolean,
		default: false,
		onChange : () => {SpookyRealmManager.updateSpookyVision(false); SpookyRealmManager.updateSpookyIcon()}
	}); 
	
	game.settings.register(cModuleName, "anchorpreventteleport", {
		name: Translate("Settings.anchorpreventteleport.name"),
		hint: Translate("Settings.anchorpreventteleport.descrp"),
		scope: "world",
		config: game.modules.get("stairways")?.active,
		type: Boolean,
		default: true
	}); 
	
	game.modules.get(cModuleName).api = {
		flags : SpookyFlags,
		setModeofTokens : SpookyRealmManager.setModeofTokens,
		increaseModeofTokens : SpookyRealmManager.increaseModeofTokens,
		decreaseModeofTokens : SpookyRealmManager.decreaseModeofTokens
	};
	
	//spooky keys
	game.keybindings.register(cModuleName, "TogglePhantomRealm", {
		name: Translate("Keys.TogglePhantomRealm.name"),
		onDown: () => { game.settings.set(cModuleName, "spookyrealmactive", !game.settings.get(cModuleName, "spookyrealmactive")) },
		restricted: false,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});
	
	game.keybindings.register(cModuleName, "IncreaseModeSelected", {
		name: Translate("Keys.IncreaseModeSelected.name"),
		onDown: () => { SpookyRealmManager.increaseModeofTokens() },
		restricted: false,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});
	
	game.keybindings.register(cModuleName, "DecreaseModeSelected", {
		name: Translate("Keys.DecreaseModeSelected.name"),
		onDown: () => { SpookyRealmManager.decreaseModeofTokens() },
		restricted: false,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
	});
	
	//compatibility with stairways
	Hooks.on("PreStairwayTeleport", (pData) => {
		if (!game.settings.get(cModuleName, "anchorpreventteleport")) return;
		if (game.settings.get(cModuleName, "spookyrealmactive")) return;
		
		pData.selectedTokenIds = pData.selectedTokenIds.filter((vID) => {
			let vToken = canvas.tokens.get(vID)?.document;
			
			if (vToken && SpookyFlags.getModeName(vToken) == "anchor") {
				return false;
			}
			
			return true;
		})
	});
	
	/*
	//compatibility with MATT teleports
	Hooks.on("preTriggerTile", (pTile, palsoTile, pTrigger, pInfos, pUserID, pData) => {
		if (pInfos.action == "teleport" && pInfos.data.location.sceneId) {
			if (!game.settings.get(cModuleName, "anchorpreventteleport")) return;
			if (game.settings.get(cModuleName, "spookyrealmactive")) return;
			
			let v = pTrigger;
			let vValidCopy = pTrigger.filter(vToken => !(SpookyFlags.getModeName(vToken) == "anchor"));
			
			for (let i = 0; i < vValidCopy.length; i++) {
				pTrigger[i] = vValidCopy[i];
			}
			
			while(pTrigger.length > vValidCopy.length) {
				pTrigger.pop();
			}
			
			pData.tokens = pData.tokens.filter(vToken => !(SpookyFlags.getModeName(vToken) == "anchor"));
			
			console.log(pData.tokens);
			console.log(v);
			console.log(pTrigger);
		}
	});
	*/
});

Hooks.once("ready", () => { game.socket.on("module.phantomtokens", organiseSocketEvents); });
//the reason this file is so spooky is found in line 4, spooooky