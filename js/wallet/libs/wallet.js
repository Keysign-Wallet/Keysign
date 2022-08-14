class Wallet {
	constructor(name, account) {
		this.account = account;
		this.name = name;
	}

	async init() {
		this.bank = this.bankUrl
			? new leap.Bank(this.bankUrl)
			: await new Promise(resolve => {
					chrome.storage.local.get(['current_bank'], items => {
						resolve(new leap.Bank(items.current_bank));
					});
			  });
		const { primary_validator } = await this.bank.getConfig();
		this.pv = new leap.PrimaryValidator(
			`${primary_validator.protocol}://${primary_validator.ip_address}${
				primary_validator.port === null
					? ''
					: ':' + primary_validator.port
			}`
		);
	}

	async getBalance() {
		await this.init();
		const balanceObject = await this.pv.getAccountBalance(
			this.account.accountNumberHex
		);
		return balanceObject.balance === null ? 0 : balanceObject.balance;
	}

	async getLocked() {
		await this.init();
		const lockedObject = await this.pv.getAccountLocked(
			this.account.accountNumberHex
		);
		return lockedObject.locked === null ? 0 : balanceObject.locked;
	}

	async getTransactions() {
		await this.init();
		const transactions = await axios.get(
			this.bank.url + '/bank_transactions',
			{
				params: { account_number: this.account.accountNumberHex },
			}
		);
		return transactions.data.results;
	}

	async sendTransaction(txs, callback) {
		await this.init();
		const paymentHandler = new leap.AccountPaymentHandler({
			account: this.account,
			bankUrl: this.bank.url,
		});
		await paymentHandler.init();
		txs = txs.map(tx => ({
			amount: tx.amount,
			memo: tx.memo,
			recipient: tx.to,
		}));
		txs = txs.sort((a, b) => (a.recipient > b.recipient ? 1 : -1));
		const data = await paymentHandler
			.sendBulkTransactions(txs)
			.catch(err => callback(err));
		callback(undefined, data);
	}

	async getTxFees() {
		await this.init();
		const config = await this.bank.getConfig();
		return {
			bank_fee: config.default_transaction_fee,
			val_fee: config.primary_validator.default_transaction_fee,
		};
	}
}
