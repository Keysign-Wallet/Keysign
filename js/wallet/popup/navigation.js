// All functions and events regarding the visibility and navigation

function prePopulatePage(pageId) {
	switch (pageId) {
		case 'send_div': {
			if (
				window.sk_params.hasOwnProperty('to') &&
				typeof window.sk_params.to === 'string'
			) {
				$('#recipient').val(window.sk_params.to);
				$('#amt_send').focus();
			}

			if (window.sk_params.hasOwnProperty('amount')) {
				$('#amt_send').val(window.sk_params.amount);
			}
			break;
		}
	}
}

// Visibility state on the main menu
function initializeVisibility(hideAll = false) {
	$('.hide-at-start').each(function () {
		const pageId = $(this).attr('id');
		if (hideAll || pageId !== window.sk_params.page) {
			$(this).hide();
		} else {
			$(this).show();
			prePopulatePage(pageId);

			if (
				window.sk_params.hasOwnProperty('page') &&
				window.sk_params.hasOwnProperty('noback') &&
				window.sk_params.noback
			) {
				$(`#${window.sk_params.page} .back_enabled`).addClass(
					'back_disabled'
				);
			}
		}
	});

	$('#accounts').html('');
	$('.error_div').hide();
	$('.success_div').hide();
	$('#walletName').val('');
	$('#pwd').val('');
	$('.error_div').html('');
	$('#accountNumber_key').prop('checked', true);
	$('#signingKey_key').prop('checked', true);
	$('.account_info_menu').removeClass('rotate180');
	$('#new_key').val('');
	$('#keys_info').empty();
	$('#add_wallet_div .back_enabled').removeClass('back_disabled');
	$('.wallet_currency').removeClass('dropdown-open');
	$('.dropdown').hide();
}

// Use "Enter" as confirmation button for unlocking, registration, and adding account/key
$('#unlock_pwd').keypress(function (e) {
	if (e.keyCode === 13) {
		e.preventDefault();
		$('#submit_unlock').click();
	}
});

$('#confirm_master_pwd').keypress(function (e) {
	if (e.keyCode === 13) $('#submit_master_pwd').click();
});

$('#pwd').keypress(function (e) {
	if (e.keyCode === 13) $('#check_add_wallet').click();
});

$('#new_key').keypress(function (e) {
	if (e.keyCode === 13) $('#add_new_key').click();
});

// Clicking back after "forgot password"
$('#back_forgot').click(function () {
	$('#forgot_div').hide();
	if ($(this).attr('id') === 'back_forgot_settings')
		$('#settings_div').show();
	else $('#unlock').show();
});

// Clicking back after "add key"
$('#add_key_div .back_enabled').click(function () {
	$('#add_key_div').hide();
	$('#manage_keys').show();
	$('.error_div').hide();
});

$('.back_account_types').click(() => {
	$('#add_wallet_types_div').show();
	$('#generate_wallet_account_div').hide();
});

$('#add_bank_div .back_enabled').click(function () {
	chrome.storage.local.get(['current_bank'], function (items) {
		loadBank(items.current_bank);
		initiateCustomSelect();
		$('#add_bank_div').hide();
		$('#pref_div').show();
	});
});

// Clicking back from the preferences menu
$('.back_pref').click(function () {
	$('.settings_child').hide();
	$('#settings_div').show();
	manageKey = false;
	getPref = false;
});

$('#confirm_send_div .back_enabled').click(() => {
	$('#send_div').show();
	$('#confirm_send_div').hide();
});

// Show forgot password
$('#forgot').click(function () {
	$('#forgot_div').show();
	$('#unlock').hide();
});

// Show settings
$('#settings').click(function () {
	$('#settings_div').show();
	$('#main').hide();
});

// Show about
$('#about').click(function () {
	$('#about_div').show();
	$('#about_div h3').html(
		`${chrome.runtime.getManifest().name} ${
			chrome.runtime.getManifest().version
		}`
	);
	$('#settings_div').hide();
});

// Open the manage keys info
$('#manage').click(function () {
	manageKey = true;
	$('#manage_keys').show();
	$('#settings_div').hide();
	manageWallets();
});

function manageWallets() {
	const selWallet = walletsList.get(
		$('#manage_keys .select-selected')[0].innerText
	);
	$('#accountNumber_key').text(selWallet.account.accountNumberHex);
	const signingKey = $('#signingKey_manage');
	signingKey.text('CLICK HERE TO REVEAL');
	signingKey.click(() =>
		signingKey.text(
			signingKey.text() === selWallet.account.signingKeyHex
				? 'CLICK HERE TO REVEAL'
				: selWallet.account.signingKeyHex
		)
	);
	$('#delete_account').click(() => {
		walletsList.delete(selWallet.name).save(mk);
		$('#manage_keys').hide();
		$('#add_wallet_types_div').show();
	});

	const accountCopy = $('.copy-acn');
	const signingKeyCopy = $('.copy-sign');
	accountCopy.click(() => {
		accountCopy.text('Copied!');
		setTimeout(() => accountCopy.text('Copy'), 2000);
		navigator.clipboard.writeText(selWallet.account.accountNumberHex);
	});
	signingKeyCopy.click(() => {
		signingKeyCopy.text('Copied!');
		setTimeout(() => signingKeyCopy.text('Copy'), 2000);
		navigator.clipboard.writeText(selWallet.account.signingKeyHex);
	});
}

// Go back
$('.back_menu').click(function () {
	initializeMainMenu();
	initializeVisibility();
});

// Click on the change password option of the settings
$('#change_pwd').click(function () {
	$('#settings_div').hide();
	$('#change_password').show();
});

// Navigate to preferences
$('#preferences').click(async function () {
	$('#pref_div').show();
	$('#settings_div').hide();
	getPref = true;
});

// After checking master key, go back to Add Account Page
$('.back_add_key').click(function () {
	$('#add_wallet_div').show();
});

// Go to clear wallet page
$('#clear').click(function () {
	$('#settings_div').hide();
	$('#forgot_div').show();
	$('#back_forgot').attr('id', 'back_forgot_settings');
});

// Show add a new key
$('#add_key').click(function () {
	$('#add_key_div').show();
});

// Navigate to autolock menu
$('#autolock').click(function () {
	$('#settings_div').hide();
	$('#autolock_div').show();
});

$('#import_export').click(function () {
	$('#settings_div').hide();
	$('#import_settings').show();
});

// Show transaction window
$('#send').click(function () {
	$('#send_div').show();
	$('#main').hide();
	// Show fees in send_transfer page
	activeWallet.getTxFees().then(fees => {
		$('#bank_fee').text('Bank Fee: ' + fees.bank_fee);
		$('#val_fee').text('Validator Fee: ' + fees.val_fee);
	});
});

// Show transaction history window
$('#history').click(function () {
	$('#acc_transfers').show();
	$('#main').hide();
});

// Show / hide password
$('.input_img_right_eye').click(function () {
	if ($('#unlock_pwd').prop('type') === 'password') {
		$('#unlock_pwd').prop('type', 'text');
		$('.input_img_right_eye').prop('src', '../images/icons8-eye-50.png');
		$('.input_img_right_eye').height('20.72px');
	} else {
		$('#unlock_pwd').prop('type', 'password');
		$('.input_img_right_eye').prop(
			'src',
			'../images/icons8-invisible-50.png'
		);
		$('.input_img_right_eye').height('29.93px');
	}
});

$('#add_new_bank').click(function () {
	chrome.storage.local.get(['bank_list'], items => {
		if (items.bank_list.includes($('#new_bank').val())) {
			$('.success_div')
				.html(chrome.i18n.getMessage('popup_bank_exists'))
				.show();
			setTimeout(function () {
				$('.success_div').html('').hide();
			}, 5000);
		} else {
			try {
				new tnb.Bank($('#new_bank').val());
				addNewBank($('#new_bank').val());
			} catch (error) {
				$('.success_div')
					.html(chrome.i18n.getMessage('popup_bank_invalid_url'))
					.show();
				setTimeout(function () {
					$('.success_div').html('').hide();
				}, 5000);
			}
		}
	});
});

// Handle pages visibility

function showRegister() {
	$('#main').hide();
	$('#register').show();
}

function showUnlock() {
	if (
		window.hasOwnProperty('sk_params') &&
		window.sk_params.hasOwnProperty('page')
	) {
		$(`#${window.sk_params.page}`).hide();
	}
	$('#main').hide();
	$('#unlock').show();
	$('#unlock_pwd').focus();
}

function showLoader() {
	$('#send_loader').show();
	$('#confirm_send_transfer').hide();
}

$('#add_new_account').click(function () {
	showaddWallet();
});

function showaddWallet() {
	$('#add_wallet_types_div').show();
	$('#main').hide();
	$('#settings_div').hide();
	$('#add_wallet_div .back_enabled')
		.unbind('click')
		.click(() => {
			$('#add_wallet_types_div').show();
			$('#add_wallet_div').hide();
		});
}
$('#add_import_keys').click(() => {
	importKeys();
});

$('#add_generate_keys').click(() => {
	$('#add_wallet_types_div').hide();
	$('#generate_wallet_account_div').show();
});

$('#add_by_keys').click(() => {
	$('#add_wallet_types_div').hide();
	$('#add_wallet_div .back_enabled').removeClass('back_menu');
	$('#add_wallet_div .back_enabled').addClass('back_account_types');
	$('#add_wallet_div').show();
});

$('.wallet_currency').click(function () {
	$('.wallet_currency').not(this).removeClass('dropdown-open');
	$('.dropdown').not($(this).next()).hide();
	$(this).toggleClass('dropdown-open');
	$(this).next().toggle();
});
