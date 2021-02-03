// Change master password
$('#confirm_change_pwd').click(function () {
	if (mk === $('#old_pwd').val()) {
		if ($('#new_pwd').val() === $('#confirm_new_pwd').val()) {
			if (
				!$('#new_pwd')
					.val()
					.match(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/)
			) {
				mk = $('#new_pwd').val();
				walletsList.save(mk);
				sendMk(mk);
				initializeVisibility();
				showConfirm(chrome.i18n.getMessage('popup_master_changed'));
			} else showError(chrome.i18n.getMessage('popup_pwd_stronger'));
		} else showError(chrome.i18n.getMessage('popup_pwd_match'));
	} else showError(chrome.i18n.getMessage('popup_wrong_current_pwd'));
});

$('#import_keys').click(() => {
	importKeys();
});

const importKeys = () => {
	chrome.windows.getCurrent(w => {
		const win = {
			url: chrome.runtime.getURL('html/import.html'),
			type: 'popup',
			height: 566,
			width: 350,
			left: w.width - 350 + w.left,
			top: w.top,
		};
		if (typeof InstallTrigger === undefined) win.focused = true;
		chrome.windows.create(win);
	});
};

$('#export_keys').click(() => {
	const data = new Blob([walletsList.encrypt(mk)], { type: 'text/plain' });
	const url = window.URL.createObjectURL(data);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'wallets.txt';
	a.click();
});
