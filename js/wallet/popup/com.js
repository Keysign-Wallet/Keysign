// Send new autolock to background;
function setAutolock(autolock) {
	chrome.runtime.sendMessage({
		command: 'sendAutolock',
		autolock: autolock,
	});
}

// get MK from background
function getMK() {
	chrome.runtime.sendMessage({
		command: 'getMk',
	});
}

// setBANK in the background
function setBANK(bank) {
	chrome.runtime.sendMessage({
		command: 'setBANK',
		bank: bank,
	});
}

setInterval(ping, 10000);
// ping the background to show that the extension is not idle
function ping() {
	chrome.runtime.sendMessage({
		command: 'ping',
	});
}
