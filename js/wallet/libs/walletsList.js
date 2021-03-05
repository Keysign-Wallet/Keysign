class WalletsList {
	constructor() {
		this.wallets = { list: [] };
	}
	init(wallets, last_wallet) {
		if (wallets) {
			this.wallets.list = wallets.list.map(
				({ name, signingKey }) =>
					new Wallet(name, new tnb.Account(signingKey))
			);
			this.wallets.hash = wallets.hash;

			// Sort the wallets by name
			this.wallets.list.sort((a, b) =>
				a.name < b.name ? -1 : a.name > b.name ? 1 : 0
			);

			// Add the last wallet selected to the front of the wallet list.
			if (last_wallet) {
				let last = this.wallets.list.find(a => a.name === last_wallet);
				if (last) {
					this.wallets.list.splice(
						this.wallets.list.indexOf(last),
						1
					);
					this.wallets.list.unshift(last);
				}
			}
		}
	}
	getList() {
		return this.wallets.list || [];
	}
	get(name) {
		return this.getList().find(e => e.name === name);
	}
	getByAccountNumber(accountNumber) {
		return this.getList().find(
			e => e.account.accountNumberHex === accountNumber
		);
	}
	save(mk) {
		chrome.storage.local.set({
			wallets: this.encrypt(mk),
		});
	}
	clear() {
		chrome.storage.local.clear();
		this.wallets = {};
	}
	isEmpty() {
		return !this.wallets.list || !this.wallets.list.length;
	}
	import(wallets, mk) {
		for (const wallet of wallets) {
			if (!this.wallets.list.find(acc => acc.name === wallet.name))
				this.wallets.list.push(
					new Wallet(wallet.name, new tnb.Account(wallet.signingKey))
				);
		}
		this.save(mk);
	}
	encrypt(mk) {
		const wallets = {
			...this.wallets,
			list: this.wallets.list.map(wallet => ({
				name: wallet.name,
				signingKey: wallet.account.signingKeyHex,
			})),
		};
		return encryptJson(wallets, mk);
	}
	add(wallet) {
		if (!this.wallets.list) this.wallets.list = [];
		this.wallets.list.push(
			new Wallet(wallet.name, new tnb.Account(wallet.signingKey))
		);
		return this;
	}
	delete(name) {
		this.wallets.list = this.wallets.list.filter(i => i.name !== name);
		return this;
	}
	changeBank(bank) {
		this.wallets.list = this.wallets.list.map(wallet => {
			wallet.bankUrl = bank;
			return wallet;
		});
		return this;
	}
}
