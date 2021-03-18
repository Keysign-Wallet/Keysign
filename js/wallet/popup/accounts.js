const TO = chrome.i18n.getMessage('popup_html_transfer_to');
const FROM = chrome.i18n.getMessage('popup_html_transfer_from');
const NO_RECENT_TRANSACTIONS = chrome.i18n.getMessage(
	'popup_accounts_no_recent_transfers'
);
const INCORRECT_KEY = chrome.i18n.getMessage('popup_accounts_incorrect_key');
const FILL = chrome.i18n.getMessage('popup_accounts_fill');

// All functions regarding the handling of a particular account

// The public key could be supplied by the user or derived from the private key

// Load account information
const loadWallet = async (name, options) => {
	if (options) await options;
	activeWallet = walletsList.get(name);
	$('#recipient');
	$('.wallet_infos').html('...');
	showUserData();
	getAccountHistory();
};

// Display all the account data
const showUserData = async () => {
	showBalances();
	$('.transfer_balance div')
		.eq(1)
		.html(numberWithCommas(await activeWallet.getBalance()));
};

$('.transfer_row-container .transfer_row-close-icon').click(e => {
	e.target.parentNode.classList.toggle('transfer_row-closed');
	$(e.target.parentNode.children[2]).toggle();
});

const getAccountHistory = async () => {
	// $('#acc_transfers #transfer_rows').empty();
	const showFees = $('#fees_toggle').prop('checked');
	let transactions = (await activeWallet.getTransactions()).map(
		({ amount, fee, recipient, block }) => ({
			amount,
			fee,
			recipient,
			timestamp: new Date(block.modified_date),
			sender: block.sender,
		})
	);
	transactions = showFees
		? transactions
		: transactions.filter(i => i.fee === '');
	if (transactions.length !== 0) {
		for (transaction of transactions) {
			const timestamp =
				transaction.timestamp.getMonth() +
				1 +
				'/' +
				transaction.timestamp.getDate() +
				'/' +
				transaction.timestamp.getFullYear();
			const transactions_element = $(
				`        <div class='transfer_row'><span class='transfer_date' title='${
					transaction.timestamp
				}'>
          ${timestamp}
          </span><span class='transfer_val'>
          ${
				transaction.sender === activeWallet.account.accountNumberHex
					? '-'
					: '+'
			} 
          ${transaction.amount}
          </span><span class='transfer_name' style="overflow: scroll; width: 100%;">
          ${TO + transaction.recipient + '\n' + FROM + transaction.sender}
          </span></div>`
			);
			// $('#acc_transfers #transfer_rows').append(transactions_element);
		}
	} else
		$('#acc_transfers #transfer_rows').append(
			`<div class="transfer_row">${NO_RECENT_TRANSACTIONS}</div>`
		);
};

$('#fees_toggle').click(getAccountHistory);

// Generates a new wallet
$('#add_wallet_generate_keys').click(async () => {
	const walletName = $('#wallet_name').val();
	if (walletName !== '') {
		if (walletsList && walletsList.get(walletName)) {
			showError(
				chrome.i18n.getMessage('popup_accounts_already_registered', [
					walletName,
				])
			);
		} else addWallet(walletName, new tnb.Account().signingKeyHex);
	} else showError(FILL);
});

$('#check_add_wallet').click(function () {
	const walletName = $('#walletName').val();
	const signingKey = $('#signingKey').val();
	if (walletName !== '' && signingKey.length === 64) {
		if (walletsList && walletsList.get(walletName)) {
			showError(
				chrome.i18n.getMessage('popup_accounts_already_registered', [
					walletName,
				])
			);
		}
		const account = new tnb.Account(signingKey);
		addWallet(walletName, account.signingKeyHex);
	} else {
		showError(FILL);
	}
});

// Add new Wallet to Chrome local storage (encrypted with AES)
const addWallet = (name, signingKey) => {
	walletsList.add({ name, signingKey }).save(mk);
	initializeMainMenu();
	initializeVisibility();
};

// show balance for this wallet
const showBalances = async () => {
	$('#wallet_amt div')
		.eq(0)
		.html(numberWithCommas(await activeWallet.getBalance()));
	$('#balance_loader').hide();
};

// Delete wallet (and encrypt the rest)
const deleteAccount = i => {
	walletsList.delete(i).save(mk);
	$('.settings_child').hide();
	initializeMainMenu();
	initializeVisibility();
};
