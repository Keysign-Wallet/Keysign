// Content script interfacing the website and the extension
let req = null;

const setupInjection = () => {
	try {
		const scriptTag = document.createElement('script');
		scriptTag.src = chrome.runtime.getURL('js/handshake/leap_keysign.js');
		const container = document.head || document.documentElement;
		container.insertBefore(scriptTag, container.children[0]);
	} catch (e) {
		console.error('LEAP Keysign injection failed.', e);
	}
};
setupInjection();

// Answering the handshakes
document.addEventListener('swHandshake_leap', function (request) {
	const req = JSON.stringify(request.detail);
	if (request.detail.extension)
		chrome.runtime.sendMessage(request.detail.extension, req);
	else
		window.postMessage(
			{
				type: 'leap_keysign_handshake',
			},
			window.location.origin
		);
});

// Answering the requests
document.addEventListener('swRequest_leap', function (request) {
	const prevReq = req;
	req = request.detail;
	// If all information are filled, send the request to the background, if not notify an error
	if (validate(req)) {
		if (prevReq) {
			const response = {
				success: false,
				error: 'ignored',
				result: null,
				message: 'User ignored this transaction',
				data: req,
				request_id: req.request_id,
			};
			sendResponse(response);
		} else
			chrome.runtime.sendMessage({
				command: 'sendRequest',
				request: req,
				domain: req.extensionName || window.location.hostname,
				request_id: req.request_id,
			});
	} else {
		const response = {
			success: false,
			error: 'incomplete',
			result: null,
			message: 'Incomplete data or wrong format',
			data: req,
			request_id: req.request_id,
		};
		sendResponse(response);
		req = prevReq;
	}
});

// Get notification from the background upon request completion and pass it to the website.
chrome.runtime.onMessage.addListener(function (obj) {
	if (obj.command === 'answerRequest') {
		sendResponse(obj.msg);
	}
});

const sendResponse = response => {
	if (response.data.extension && response.data.extensionName) {
		chrome.runtime.sendMessage(
			response.data.extension,
			JSON.stringify(response)
		);
	} else if (response.data.redirect_uri) {
		window.location = response.data.redirect_uri;
	} else {
		window.postMessage(
			{
				type: 'leap_keysign_response',
				response,
			},
			window.location.origin
		);
	}
};

const validate = req => {
	if (req && req.type) {
		switch (req.type) {
			case 'transfer':
				return validateTxs(req.txs) && typeof req.code === 'string';
				break;
			case 'verify':
				return (
					(req.accountNumber && req.accountNumber.length >= 64) ||
					(typeof req.code === 'string' && !req.accountNumber)
				);
				break;
		}
	}
};

function validateTxs(txs) {
	try {
		txs.forEach(tx => {
			if (tx.amount < 1 || tx.to.length < 64 || !validateMemo(tx.memo)) {
				return false;
			}
		});
		return true;
	} catch (error) {
		return false;
	}
}

function validateMemo(memo) {
	return memo.length <= 64 && /^[a-zA-Z0-9_ ]*$/.test(memo);
}
