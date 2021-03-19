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
	[...e.target.parentNode.children].splice(2).forEach(i => $(i).toggle());
});

const getAccountHistory = async () => {
	$('#acc_transfers #transfer_rows').empty();
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
			const date = transaction.timestamp.getDate();
			const month = [
				'JANUARY',
				'FEBRUARY',
				'MARCH',
				'APRIL',
				'MAR',
				'JUNE',
				'JULY',
				'AUGUST',
				'SEPTEMBER',
				'OCTOBER',
				'NOVEMBER',
				'DECEMBER',
			][transaction.timestamp.getMonth()];
			const year = transaction.timestamp.getFullYear();

			if (!$(`.${month}-${year}`).length)
				$('#transfer_rows')
					.append(`<div class="transfer_row-container ${month}-${year}">
			<h3 class="transfer_row-container-heading">${month.toUpperCase()} ${year}</h3>
			<img
			src="../assets/SVGs/arrow-down.svg"
			alt="arrow"
			class="transfer_row-close-icon"
			/>
			</div>`);
			const sent =
				activeWallet.account.accountNumberHex === transaction.sender;

			const heading = $(`.${month}-${year}`);
			heading.append(`<div class="transfer_row">
			<img src="${
				sent ? '../assets/SVGs/sent.svg' : '../assets/SVGs/receive.svg'
			}" alt="sent-icon" />
			<div class="transfer_row-inner">
				<h3>TNBC ${sent ? '-' : '+'}${transaction.amount}</h3>
				<h4>${date} ${month.substring(0, 3).toUpperCase()}</h4>
				<p>${sent ? 'Sent To' : 'Received From'}</p>
				<p class='transfer_recipient'>${
					sent ? transaction.recipient : transaction.sender
				}</p>
			</div>
		</div>`);
			console.log(transaction, heading);
		}
	} else
		$('#acc_transfers #transfer_rows').append(
			`<div class="transfer_row">${NO_RECENT_TRANSACTIONS}</div>`
		);

	closeIcons = $('.transfer_row-close-icon');
	for (var i = 0; i < closeIcons.length; i++) {
		$(closeIcons[i]).unbind('click');
		$(closeIcons[i]).click(e => {
			e.target.parentNode.classList.toggle(
				'transfer_row-container-closed'
			);
			[...e.target.parentNode.children]
				.splice(2)
				.forEach(i => $(i).toggle());
		});
	}
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
