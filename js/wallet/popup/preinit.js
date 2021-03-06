window.sk_params = {
	page: 'main',
};

function parseQueryString() {
	const queryString = window.location.search;
	const queryParamString = queryString.split('?').pop();
	const queryParams = queryParamString.split('&');
	for (let qi = 0; qi < queryParams.length; qi++) {
		const queryParam = queryParams[qi];
		const keyValue = queryParam.split('=');
		if (keyValue[0] && keyValue[1]) {
			let value = keyValue[1];
			value = value.replace(/\+/g, '%20');
			value = decodeURIComponent(value);
			window.sk_params[keyValue[0]] = value;
		}
	}
}

chrome.storage.local.get(['current_bank', 'bank_list'], items => {
	if (items.bank_list) {
		items.bank_list.push(defaultBank);
		if (!items.bank_list.includes(defaultBank))
			chrome.storage.local.set({
				bank_list: items.bank_list,
				current_bank: defaultBank,
			});
	} else
		chrome.storage.local.set({
			bank_list: [defaultBank],
			current_bank: defaultBank,
		});
});

parseQueryString();
initializeVisibility(true);

// Check if we have mk or if accounts are stored to know if the wallet is locked unlocked or new.
chrome.runtime.onMessage.addListener(function (msg) {
	if (msg.command === 'sendBackMk') {
		chrome.storage.local.get(
			['wallets', 'current_bank', 'bank_list'],
			function (items) {
				if (!msg.mk) {
					if (!items.wallets) {
						showRegister();
					} else {
						showUnlock();
					}
				} else {
					mk = msg.mk;
					initializeVisibility();
					initializeMainMenu(items.bank_list);
				}
			}
		);
	}
});
