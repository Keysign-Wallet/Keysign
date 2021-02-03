const performTransaction = async (data, tab, no_confirm) => {
	let message = null;
	try {
		switch (data.type) {
			case 'transfer':
				message = await broadcastTransfer(data);
				break;
			case 'verify':
				if (data.result.verified)
					message = createMessage(
						undefined,
						undefined,
						data,
						'Verified!'
					);
				else
					message = createMessage(
						chrome.i18n.getMessage('hs_bgd_verify_error'),
						undefined,
						data,
						chrome.i18n.getMessage('hs_bgd_verify_error')
					);
				break;
		}
		chrome.tabs.sendMessage(tab, message);
	} catch (e) {
		sendErrors(
			tab,
			e,
			chrome.i18n.getMessage('unknown_error'),
			chrome.i18n.getMessage('unknown_error'),
			data
		);
	} finally {
		if (no_confirm) {
			if (id_win != null) {
				removeWindow(id_win);
			}
		} else chrome.runtime.sendMessage(message);
		key = null;
		wallets = new WalletsList();
	}
};

const broadcastTransfer = data => {
	return new Promise(async resolve => {
		const wallet = walletsList.get(data.from);
		wallet.sendTransaction(data.to, data.amount, (err, result) => {
			let message = createMessage(
				err,
				result,
				data,
				chrome.i18n.getMessage('hs_bgd_transfer_success', [
					data.amount,
					wallet.account.accountNumberHex,
					data.to,
				]),
				chrome.i18n.getMessage('hs_bgd_error_broadcasting', [
					data.amount,
					wallet.account.accountNumberHex,
					data.to,
				])
			);
			resolve(message);
		});
	});
};

const createMessage = (err, result, data, success_message, fail_message) => {
	return {
		command: 'answerRequest',
		msg: {
			success: !err,
			error: err,
			result: result,
			data: data,
			message: !err ? success_message : fail_message,
			request_id,
		},
	};
};
