const checkBeforeCreate = (request, tab, domain) => {
	// if not locked
	chrome.storage.local.get(['wallets'], function (items) {
		if (!items.wallets && !mk) {
			createPopup(() => {
				chrome.runtime.sendMessage({
					command: 'sendDialogError',
					msg: {
						success: false,
						error: 'register',
						result: null,
						data: request,
						message: chrome.i18n.getMessage(
							'dialog_register_error'
						),
						display_msg: chrome.i18n.getMessage(
							'dialog_register_error'
						),
					},
					tab,
					domain,
				});
			});
		} else if (!mk) {
			// if locked
			createPopup(() => {
				chrome.runtime.sendMessage({
					command: 'sendDialogError',
					msg: {
						success: false,
						error: 'locked',
						result: null,
						data: request,
						message: chrome.i18n.getMessage('hs_auth_locked'),
						display_msg: chrome.i18n.getMessage(
							'hs_auth_locked_desc'
						),
					},
					tab,
					domain,
				});
			});
		} else {
			walletsList.init(decryptToJson(items.wallets, mk));
			if (request.type === 'transfer') {
				if (walletsList.getList().length !== 0) {
					createPopup(() =>
						chrome.runtime.sendMessage({
							command: 'sendDialogConfirm',
							data: request,
							domain,
							wallets: {
								list: walletsList
									.getList()
									.map(({ name, account }) => ({
										name,
										signingKey: account.signingKeyHex,
									})),
								hash: walletsList.hash,
							},
							tab,
						})
					);
				}
			} else if (request.type === 'verify') {
				createPopup(() =>
					chrome.runtime.sendMessage({
						command: 'sendDialogConfirm',
						data: request,
						wallets: {
							list: walletsList
								.getList()
								.map(({ name, account }) => ({
									name,
									signingKey: account.signingKeyHex,
								})),
							hash: walletsList.hash,
						},
						domain,
						tab,
					})
				);
			}
		}
	});
};
