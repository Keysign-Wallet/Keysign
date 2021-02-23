class Wallet {
	constructor(name, account) {
		this.account = account;
		this.name = name;
	}

	async getBank() {
		return new Promise(resolve => {
			chrome.storage.local.get(['current_bank'], items => {
				resolve(new tnb.Bank(items.current_bank));
			});
		});
	}

	async getPV() {
		const bank = await this.getBank();
		const { primary_validator } = await bank.getConfig();
		return new tnb.PrimaryValidator(
			`${primary_validator.protocol}://${primary_validator.ip_address}${
				primary_validator.port === null
					? ''
					: ':' + primary_validator.port
			}`
		);
	}

	async getBalance() {
		const pv = await this.getPV();
		const balanceObject = await pv.getAccountBalance(
			this.account.accountNumberHex
		);
		return balanceObject.balance === null ? 0 : balanceObject.balance;
	}

	async getTransactions() {
		const bank = await this.getBank();
		const transactions = await axios.get(bank.url + '/bank_transactions', {
			params: { account_number: this.account.accountNumberHex },
		});
		return transactions.data.results;
	}

	async sendTransaction(recipient, amount, callback) {
		if (amount + (await this.getTxFees()) > this.getBalance())
			callback('Exceeding balance');
		const paymentHandler = new tnb.AccountPaymentHandler({
			account: this.account,
			bankUrl: (await this.getBank()).url,
		});
		await paymentHandler.init();
		const data = await paymentHandler
			.sendCoins(recipient, parseInt(amount))
			.catch(err => callback(err));
		console.log(data);
		callback(undefined, data);
	}

	async getTxFees() {
		const config = await (await this.getBank()).getConfig();
		return {
			bank_fee: config.default_transaction_fee,
			val_fee: config.primary_validator.default_transaction_fee,
		};
	}
}
