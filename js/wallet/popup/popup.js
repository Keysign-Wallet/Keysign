let mk = null;
let activeWallet;
let custom_created = false;
let manageKey,
	getPref = false;
let walletsList = new WalletsList();

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
if (
	// From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
	window.screenLeft < 0 ||
	window.screenTop < 0 ||
	window.screenLeft > window.screen.width ||
	window.screenTop > window.screen.height
) {
	chrome.runtime.getPlatformInfo(function (info) {
		if (info.os === 'mac') {
			const fontFaceSheet = new CSSStyleSheet();
			fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
			fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
			document.adoptedStyleSheets = [
				...document.adoptedStyleSheets,
				fontFaceSheet,
			];
		}
	});
}

// Ask background if it is unlocked
getMK();

// Check if autolock and set it to background
function sendAutolock() {
	chrome.storage.local.get(['autolock'], function (items) {
		if (items.autolock !== undefined) {
			$('.autolock input').prop('checked', false);
			$('#' + JSON.parse(items.autolock).type).prop('checked', true);
			$('#mn').val(JSON.parse(items.autolock).mn);
			setAutolock(items.autolock);
			$('#mn').css(
				'visibility',
				JSON.parse(items.autolock).type === 'idle'
					? 'visible'
					: 'hidden'
			);
		}
	});
}

// Save autolock
$('.autolock').click(function () {
	$('.autolock input').prop('checked', false);
	$(this).find('input').prop('checked', 'true');
	$('#mn').css(
		'visibility',
		$(this).find('input').attr('id') === 'idle' ? 'visible' : 'hidden'
	);
});

// Saving autolock options
$('#save_autolock').click(function () {
	const autolock = JSON.stringify({
		type:
			$('.autolock input:checkbox:checked').eq(0).attr('id') || 'default',
		mn: $('#mn').val() || 10,
	});
	chrome.storage.local.set({
		autolock: autolock,
	});
	setAutolock(autolock);
	initializeVisibility();
	initializeMainMenu();
});

// Lock the wallet and destroy traces of the mk
$('#lock').click(function () {
	sendMk(null);
	walletsList.save(mk);
	$('#back_forgot_settings').attr('id', 'back_forgot');
	mk = null;
	showUnlock();
});

const sendMk = mk => {
	chrome.runtime.sendMessage({
		command: 'sendMk',
		mk,
	});
};
// Unlock with masterkey and show the main menu
$('#submit_unlock').click(function () {
	chrome.storage.local.get(['wallets'], function (items) {
		const pwd = $('#unlock_pwd').val();
		const accs = decryptToJson(items.wallets, pwd);
		if (accs) {
			mk = pwd;
			sendMk(mk);
			$('.error_div').html('');
			$('.error_div').hide();
			$('#unlock_pwd').val('');
			initializeMainMenu();
			initializeVisibility();
		} else {
			showError(chrome.i18n.getMessage('wrong_password'));
		}
	});
});

// If user forgot Mk, he can reset the wallet
$('#forgot_div button').click(function () {
	walletsList.clear();
	mk = null;
	chrome.storage.local.set({
		bank_list: ['http://54.193.31.159'],
		current_bank: 'http://54.193.31.159',
	});
	$('#forgot_div').hide();
	$('#register').show();
});

// Registration confirmation
$('#submit_master_pwd').click(function () {
	if (acceptMP($('#master_pwd').val())) {
		if ($('#master_pwd').val() === $('#confirm_master_pwd').val()) {
			mk = $('#master_pwd').val();
			sendMk(mk);
			initializeMainMenu();
			$('.error_div').hide();
		} else {
			showError(chrome.i18n.getMessage('popup_password_mismatch'));
		}
	} else {
		$('.error_div').css('height', '100px');
		showError(chrome.i18n.getMessage('popup_password_regex'));
	}
});

function acceptMP(mp) {
	return (
		mp.length >= 16 ||
		(mp.length >= 8 &&
			mp.match(/.*[a-z].*/) &&
			mp.match(/.*[A-Z].*/) &&
			mp.match(/.*[0-9].*/))
	);
}

// Set visibilities back to normal when coming back to main menu
function initializeMainMenu(options) {
	sendAutolock();
	manageKey = false;
	getPref = false;
	chrome.storage.local.get(
		['wallets', 'last_account', 'current_bank'],
		async function (items) {
			loadBank(items.current_bank);
			walletsList.init(
				decryptToJson(items.wallets, mk),
				items.last_account
			);
			$('#accounts').empty();
			if (!walletsList.isEmpty()) {
				$('.wallets').html('<select></select>');
				for (account of walletsList.getList()) {
					$('.wallets select').append(
						'<option>' + account.name + '</option>'
					);
				}
				$('.wallets select')
					.eq(0)
					.append(
						`<option name='add_wallet'>${chrome.i18n.getMessage(
							'popup_add_wallet'
						)}</option>`
					);
				initiateCustomSelect(options);
			} else {
				$('#main').hide();
				$('#register').hide();
				$('#add_wallet_types_div').show();
				$('#add_wallet_types_div .back_enabled').addClass(
					'back_disabled'
				);
			}
		}
	);
}
// Show Confirmation window before transfer
$('#send_transfer').click(function () {
	confirmTransfer();
});

function confirmTransfer() {
	const to = $('#recipient').val();
	const amount = $('#amt_send').val();
	const currency = $('#currency_send .select-selected').html();
	$('#amt_conf_transfer').text(amount + ' ' + currency);
	$('#confirm_send_div').show();
	$('#send_div').hide();
	$('#from_conf_transfer').text(activeWallet.name);
	$('#to_conf_transfer').text(to);
}

$('#confirm_send_transfer').click(function () {
	showLoader();
	sendTransfer();
});

// Send a transfer
async function sendTransfer() {
	const to = $('#recipient').val().replace(' ', '');
	const amount = $('#amt_send').val();
	if (to !== '' && amount !== '' && amount > 0) {
		await activeWallet.sendTransaction(
			to,
			parseInt(amount),
			(err, result) => {
				$('#send_loader').hide();
				$('#confirm_send_transfer').show();
				if (err == null) {
					$('#confirm_send_div').hide();
					$('#send_div').show();
					$('.error_div').hide();
					$('.success_div')
						.html(chrome.i18n.getMessage('popup_transfer_success'))
						.show();
					chrome.storage.local.get(
						{ transfer_to: JSON.stringify({}) },
						function (items) {
							let transfer_to = JSON.parse(items.transfer_to);
							if (!transfer_to[activeWallet.name])
								transfer_to[activeWallet.name] = [];
							if (
								transfer_to[activeWallet.name].filter(elt => {
									return elt === to;
								}).length === 0
							)
								transfer_to[activeWallet.name].push(to);
							chrome.storage.local.set({
								transfer_to: JSON.stringify(transfer_to),
							});
						}
					);
					setTimeout(function () {
						$('.success_div').hide();
					}, 5000);
				} else {
					$('.success_div').hide();
					showError(chrome.i18n.getMessage('unknown_error'));
				}
				$('#send_transfer').show();
			}
		);
	} else {
		showError(chrome.i18n.getMessage('popup_accounts_fill'));
		$('#send_loader').hide();
		$('#send_transfer').show();
	}
}
