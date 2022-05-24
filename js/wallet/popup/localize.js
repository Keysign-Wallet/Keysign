$('title').text(chrome.i18n.getMessage('keysign'));

// Register
$('#register p').html(chrome.i18n.getMessage('popup_html_register'));
$('#master_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_new_password')
);
$('#confirm_master_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_confirm')
);
$('#submit_master_pwd').html(chrome.i18n.getMessage('popup_html_submit'));

// Unlock
$('#unlock p').html(chrome.i18n.getMessage('popup_html_unlock'));
$('#unlock_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_password')
);
$('#submit_unlock').text(chrome.i18n.getMessage('popup_html_signin'));
$('#forgot').text(chrome.i18n.getMessage('popup_html_forgot'));

//Reset
$('#back_forgot').text(chrome.i18n.getMessage('popup_html_reset'));
$('#forgot_div p').text(chrome.i18n.getMessage('popup_html_reset_desc'));
$('#forgot_div button').text(chrome.i18n.getMessage('popup_html_confirm'));

// Main - buttons
$('#send').text(chrome.i18n.getMessage('popup_html_send_transfer'));
$('#history').text(chrome.i18n.getMessage('popup_html_history'));

$('#acc_transfers .back_menu').text(
	chrome.i18n.getMessage('popup_html_wallet_history')
);

// Set up
$('#add_wallet_div p').html(chrome.i18n.getMessage('popup_html_setup_text'));
$('#add_wallet_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_setup')
);
$('#accountNumber').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_accountNumber_key')
);
$('#signingKey').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_signingKey_key')
);
$('#check_add_wallet').text(chrome.i18n.getMessage('popup_html_import_keys'));

// Import keys
$('#import_success').html(chrome.i18n.getMessage('popup_html_import_success'));
$('#save_master').text(chrome.i18n.getMessage('popup_html_save'));

// Settings
$('#settings_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_settings')
);
$('#add_new_account span').text(
	chrome.i18n.getMessage('popup_html_add_wallet')
);
$('#manage span').text(chrome.i18n.getMessage('popup_html_manage_accounts'));
$('#change_pwd span').text(
	chrome.i18n.getMessage('popup_html_change_password')
);
$('#preferences span').text(chrome.i18n.getMessage('popup_html_pref'));
$('#autolock span').text(chrome.i18n.getMessage('popup_html_autolock'));
$('#sync_import_export span').text(
	chrome.i18n.getMessage('popup_html_sync_import_export')
);
$('#about span').text(chrome.i18n.getMessage('popup_html_about'));
$('#clear span').text(chrome.i18n.getMessage('popup_html_clear'));

// Autolock
$('#autolock_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_autolock')
);
$('#div_default .al_title').text(
	chrome.i18n.getMessage('popup_html_al_default_title')
);
$('#div_default .al_info').text(
	chrome.i18n.getMessage('popup_html_al_default_info')
);
$('#div_locked .al_title').text(
	chrome.i18n.getMessage('popup_html_al_locked_title')
);
$('#div_locked .al_info').text(
	chrome.i18n.getMessage('popup_html_al_locked_info')
);
$('#div_idle .al_title').text(
	chrome.i18n.getMessage('popup_html_al_idle_title')
);
$('#div_idle .al_info').text(chrome.i18n.getMessage('popup_html_al_idle_info'));
$('#save_autolock').text(chrome.i18n.getMessage('popup_html_save'));

// Import / Export
$('#import_settings .back_enabled').text(
	chrome.i18n.getMessage('popup_html_sync_import_export')
);
$('#import_settings p').html(
	chrome.i18n.getMessage('popup_html_sync_import_export_text')
);
$('#import_settings button')
	.eq(0)
	.html(chrome.i18n.getMessage('popup_html_sync'));
$('#import_settings p').html(
	chrome.i18n.getMessage('popup_html_import_export_text')
);
$('#sync .back_enabled').html(chrome.i18n.getMessage('popup_html_sync'));
$('#sync_guide_text').html(
	'You can add all your wallets to your Keysign mobile wallet. Open the "settings" tab and click to the "SYNC / IMPORT / EXPORT tab" in your keysign mobile wallet'
);
$('#sync_warning_1').html(
	'ON CLICKING SYNC IT WILL DISPLAY A QR THAT SHOULD NOT BE SEEN BY ANYONE OTHER THAN YOU. KEYSIGN WILL NEVER ASK YOU TO SHARE YOUR SCREEN WHEN ON THIS PAGE OR ASK FOR YOU QR EVER.'
);
$('#submit_sync').html('Submit');
$('#import_settings button')
	.eq(1)
	.html(chrome.i18n.getMessage('popup_html_import'));
$('#import_settings button')
	.eq(2)
	.html(chrome.i18n.getMessage('popup_html_export'));

//about
$('#about_div .back_enabled').text(chrome.i18n.getMessage('popup_html_about'));
$('.about-content').html(chrome.i18n.getMessage('popup_html_about_text'));

//manage accounts
$('#manage_keys .back_enabled').text(
	chrome.i18n.getMessage('popup_html_manage_accounts')
);
$('.remove_key').text(
	chrome.i18n.getMessage('popup_html_remove').toUpperCase()
);
$('#accountNumber_key_title').text(
	chrome.i18n.getMessage('popup_html_accountNumber').toUpperCase()
);
$('#signingKey_title').text(
	chrome.i18n.getMessage('popup_html_signingKey').toUpperCase()
);
$('#delete_account').text(chrome.i18n.getMessage('popup_html_delete_account'));

//preferences
$('#pref_div .back_enabled').text(chrome.i18n.getMessage('popup_html_pref'));
$('#select_bank').text(chrome.i18n.getMessage('popup_html_select_bank'));
$('#pref_div .info').text(chrome.i18n.getMessage('popup_html_pref_info'));
$('#add_bank_div p').text(chrome.i18n.getMessage('popup_html_add_bank_text'));
$('#add_bank_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_add_bank')
);
$('#new_bank').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_bank_node')
);
$('#add_new_bank').text(chrome.i18n.getMessage('popup_html_add_bank'));
$('#new_key').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_private_key')
);
$('#add_new_key').text(chrome.i18n.getMessage('popup_html_import_key'));

// Change Password
$('#change_password .back_enabled').text(
	chrome.i18n.getMessage('popup_html_change_password')
);
$('#change_password p').text(
	chrome.i18n.getMessage('popup_html_change_password_text')
);
$('#old_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_old_password')
);
$('#new_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_new_password')
);
$('#confirm_new_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_confirm')
);
$('#confirm_change_pwd').text(chrome.i18n.getMessage('popup_html_save'));

// transfers
$('#send_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_transfer_funds')
);
$('.send_max').text(chrome.i18n.getMessage('popup_html_send_max'));
$('#balance').text(chrome.i18n.getMessage('popup_html_balance', ['LEAP']));
$('#loading_balance').text(chrome.i18n.getMessage('popup_html_loading'));
$('#recipient').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_accountNumber_key').toUpperCase()
);
$('#send_transfer').text(chrome.i18n.getMessage('popup_html_send', ['']));
$('#confirm_send_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_transfer')
);
$('#confirm_send_div p').html(
	chrome.i18n.getMessage('popup_html_transfer_confirm_text')
);
$('#confirm_send_div h3')
	.eq(0)
	.text(chrome.i18n.getMessage('popup_html_transfer_from'));
$('#confirm_send_div h3')
	.eq(1)
	.text(chrome.i18n.getMessage('popup_html_transfer_to'));
$('#confirm_send_div h3')
	.eq(2)
	.text(chrome.i18n.getMessage('popup_html_transfer_amount'));
$('#confirm_send_transfer').text(chrome.i18n.getMessage('popup_html_confirm'));

//add wallets new
$('#add_by_keys').text(chrome.i18n.getMessage('popup_html_add_by_keys'));
$('#add_generate_keys').text(
	chrome.i18n.getMessage('popup_html_add_generate_keys')
);
$('#add_import_keys').text(chrome.i18n.getMessage('popup_html_import_keys'));

$('#add_wallet_types_div p').html(
	chrome.i18n.getMessage('popup_html_choose_add_method')
);
$('#add_wallet_types_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_setup')
);

//add by generate
$('#wallet_name').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_auth_placeholder_walletName')
);
$('#generate_wallet_account_div p').html(
	chrome.i18n.getMessage('popup_html_generate_wallet_text')
);
$('#generate_wallet_account_div .back_enabled').text(
	chrome.i18n.getMessage('popup_html_setup')
);
$('#generate_wallet_account_div button').text(
	chrome.i18n.getMessage('popup_html_save')
);
