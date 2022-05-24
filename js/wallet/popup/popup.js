let mk = null;
let activeWallet;
let custom_created = false;
let manageKey,
	getPref = false;
let walletsList = new WalletsList();
let defaultBank = 'https://bank.keysign.app';

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

// memo
$('.memo_checkbox').click(function () {
	$('.memo_checkbox input').prop(
		'checked',
		!$('.memo_checkbox input').prop('checked')
	);
	$('#send_memo').css(
		'display',
		$('.memo_checkbox input').prop('checked') ? 'inherit' : 'none'
	);
});

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
	sendMk(mk);
	chrome.storage.local.set({
		bank_list: [defaultBank],
		current_bank: defaultBank,
	});
	$('#forgot_div').hide();
	$('#register').show();
	$(':input').val('');
});

// Registration confirmation
$('#submit_master_pwd').click(function () {
	if (
		$('#master_pwd').val() === $('#confirm_master_pwd').val() &&
		acceptMP($('#master_pwd').val())
	) {
		mk = $('#master_pwd').val();
		sendMk(mk);
		initializeMainMenu();
		$('.error_div').hide();
	} else if ($('#master_pwd').val() !== $('#confirm_master_pwd').val()) {
		showError(chrome.i18n.getMessage('popup_password_mismatch'));
	} else if (!acceptMP($('#master_pwd').val())) {
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
$('#send_transfer').click(async function () {
	const to = $('#recipient').val();
	const amount = $('#amt_send').val();
	const memo = $('#send_memo').val();
	var fees = await activeWallet.getTxFees();
	fees = fees.bank_fee + fees.val_fee;
	const bal = await activeWallet.getBalance();
	console.log(bal, fees);
	if (fees + parseInt(amount) > (await activeWallet.getBalance())) {
		$('#send_loader').hide();
		$('#send_transfer').show();
		showError('You do not have enough funds to make this transaction!');
	} else {
		if (
			to !== '' &&
			to.length >= 64 &&
			amount !== '' &&
			amount > 0 &&
			validateMemo(memo || '')
		)
			confirmTransfer();
		else {
			showError(chrome.i18n.getMessage('popup_accounts_fill'));
			$('#send_loader').hide();
			$('#send_transfer').show();
		}
	}
});

function validateMemo(memo) {
	return memo.length <= 64 && /^[a-zA-Z0-9_ ]*$/.test(memo);
}

function confirmTransfer() {
	const to = $('#recipient').val();
	const amount = $('#amt_send').val();
	const memo = $('#send_memo').val();
	$('#amt_conf_transfer').text(amount + ' ' + 'LEAP');
	$('.confirm_transfer_text').html(
		chrome.i18n.getMessage('confirm_transfer_text', [amount, to, memo])
	);
	$('#send_div').hide();
	$('#confirm_send_div').show();
}

$('#confirm_send_transfer').click(function () {
	showLoader();
	sendTransfer();
});

// Send a transfer
async function sendTransfer() {
	const to = $('#recipient').val().replace(' ', '');
	const amount = $('#amt_send').val();
	const memo = $('#send_memo').val();
	await activeWallet.sendTransaction(
		[{ to, amount: parseInt(amount), memo }],
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
}
