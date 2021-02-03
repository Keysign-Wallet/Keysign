$('title').text(chrome.i18n.getMessage('keysign'));

$('#error-ok').text(chrome.i18n.getMessage('dialog_ok'));
$('#yes-unlock').text(chrome.i18n.getMessage('dialog_unlock'));
$('#no-unlock').text(chrome.i18n.getMessage('dialog_cancel'));

$('#tx_loading').prepend(chrome.i18n.getMessage('dialog_broadcasting'));

// Info titles
$('#to').prev('h3').text(chrome.i18n.getMessage('dialog_to'));
$('#amount').prev('h3').text(chrome.i18n.getMessage('dialog_amount'));
$('#balance_title').text(chrome.i18n.getMessage('dialog_balance'));
$('#title').prev('h3').text(chrome.i18n.getMessage('dialog_title'));
$('#extensions').prev('h3').text(chrome.i18n.getMessage('dialog_extensions'));
$('#message_sign').prev('h3').text(chrome.i18n.getMessage('dialog_message'));

// Buttons
$('#cancel').text(chrome.i18n.getMessage('dialog_cancel'));
$('#proceed').text(chrome.i18n.getMessage('dialog_confirm'));

// Register
$('#master_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_new_password')
);
$('#confirm_master_pwd').attr(
	'placeholder',
	chrome.i18n.getMessage('popup_html_confirm')
);
$('#submit_master_pwd').html(chrome.i18n.getMessage('popup_html_submit'));
