let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let walletsList = new WalletsList();
let idleListenerReady = false;
let autolock = null;
let interval = null;
// Lock after the browser is idle for more than 10 minutes

chrome.storage.local.get(['autolock'], items => {
	if (items.autolock) startAutolock(JSON.parse(items.autolock));
});

chrome.storage.local.set({
	bank_list: ['http://54.193.31.159'],
	current_bank: 'http://54.193.31.159',
});

//Listen to the other parts of the extension

const chromeMessageHandler = (msg, sender, sendResp) => {
	// Send mk upon request from the extension popup.
	switch (msg.command) {
		case 'getMk':
			chrome.runtime.sendMessage({
				command: 'sendBackMk',
				mk: mk,
			});
			break;
		case 'stopInterval':
			clearInterval(interval);
			break;
		case 'setBANK':
			bank.setOptions(msg.bank);
			break;
		case 'sendMk':
			//Receive mk from the popup (upon registration or unlocking)
			mk = msg.mk;
			try {
				chrome.storage.local.get(['wallets'], function (items) {
					walletsList.init(decryptToJson(items.wallets, mk));
				});
			} catch (e) {
				console.log(e);
			}
			break;
		case 'sendAutolock':
			startAutolock(JSON.parse(msg.autolock));
			break;
		case 'sendRequest':
			// Receive request (website -> content_script -> background)
			// create a window to let users confirm the transaction
			tab = sender.tab.id;
			checkBeforeCreate(msg.request, tab, msg.domain);
			request = msg.request;
			request_id = msg.request_id;
			break;
		case 'unlockFromDialog':
			// Receive unlock request from dialog
			unlockFromDialog(msg);
			break;
		case 'acceptTransaction':
			confirmed = true;
			performTransaction(msg.data, msg.tab, false);
			// upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.
			break;
		case 'acceptVerification':
			confirmed = true;
			performTransaction(msg.data, msg.tab, false);
			break;
		case 'importKeys':
			try {
				chrome.storage.local.get(['wallets'], function (items) {
					const decrypt = decryptToJson(items.wallets, mk);
					if (!decrypt)
						chrome.runtime.sendMessage({
							command: 'importResult',
							result: false,
						});
					walletsList.init(decrypt);
					const wallets = decryptToJson(msg.fileData, mk);
					walletsList.import(wallets.list, mk);
					chrome.runtime.sendMessage({
						command: 'importResult',
						result: true,
					});
				});
			} catch (e) {
				console.log(e);
				chrome.runtime.sendMessage({
					command: 'importResult',
					result: false,
				});
			}
			break;
	}
};

const unlockFromDialog = msg => {
	chrome.storage.local.get(['wallets'], function (items) {
		if (!items.wallets) {
			mk = msg.mk;
			checkBeforeCreate(msg.data, msg.tab, msg.domain);
		} else {
			if (decryptToJson(items.wallets, msg.mk) != null) {
				mk = msg.mk;
				startAutolock(autolock);
				checkBeforeCreate(msg.data, msg.tab, msg.domain);
			} else {
				chrome.runtime.sendMessage({
					command: 'wrongMk',
				});
			}
		}
	});
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
