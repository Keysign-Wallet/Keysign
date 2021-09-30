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

$('#sync_keys').click(() => {
	syncKeys();
});

const syncKeys = () => {
	$('#import_settings').hide();
	$('#sync').show();
};

$('#submit_sync').click(() => {
	if (mk == $('#sync_pwd').val()) {
		obj = {};
		walletsList.wallets.list.forEach(i => {
			obj[i.name] = i.account.signingKeyHex;
		});
		var qr = qrcode(0, 'L');
		qr.addData(JSON.stringify(obj));
		qr.make();
		qrImg = qr.createDataURL();
		$('#sync_guide_text').hide();
		$('#sync_pwd').hide();
		$('#sync img').hide();
		$('#sync_warning_1').text(
			'Make sure no one is in the room when you have this page open. Also make sure you are not sharing screens.'
		);
		$('#submit_sync').text('Done');
		$('#sync_qr_code').show().attr('src', qrImg);
		$('#submit_sync').click(() => {
			$('#sync_guide_text').show();
			$('#sync_pwd').show();
			$('#submit_sync').text('Submit');
			$('#sync_warning_1').text(
				'ON CLICKING SYNC IT WILL DISPLAY A QR THAT SHOULD NOT BE SEEN BY ANYONE OTHER THAN YOU. KEYSIGN WILL NEVER ASK YOU TO SHARE YOUR SCREEN WHEN ON THIS PAGE OR ASK FOR YOU QR EVER.'
			);
			$('#sync_qr_code').hide();
		});
	}
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
