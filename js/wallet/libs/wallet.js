class Wallet {
	constructor(name, account) {
		this.account = account;
		this.name = name;
	}

	async init() {
		this.bank = this.bankUrl
			? new tnb.Bank(this.bankUrl)
			: await new Promise(resolve => {
					chrome.storage.local.get(['current_bank'], items => {
						resolve(new tnb.Bank(items.current_bank));
					});
			  });
		const { primary_validator } = await this.bank.getConfig();
		this.pv = new tnb.PrimaryValidator(
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

	async sendTransaction(recipient, amount, memo, callback) {
		await this.init();
		const paymentHandler = new tnb.AccountPaymentHandler({
			account: this.account,
			bankUrl: this.bank.url,
		});
		await paymentHandler.init();
		const data = await paymentHandler
			.sendCoins(recipient, parseInt(amount), memo)
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
