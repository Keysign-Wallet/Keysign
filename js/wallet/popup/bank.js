async function loadBank() {
	const listBANK = await new Promise(resolve =>
		chrome.storage.local.get(['bank_list'], items =>
			resolve(items.bank_list)
		)
	);
	$('#custom_select_bank').html('<select></select>');
	$('#pref_div .wallets .select-selected').remove();
	$('#pref_div .wallets .select-items').remove();
	$('#custom_select_bank select').html(
		listBANK.reduce((acc, val) => {
			return acc + '<option>' + val + '</option>';
		}, '')
	);
	$('#custom_select_bank select').append(
		`<option>${chrome.i18n.getMessage('popup_bank_add')}</option>`
	);

	initiateCustomSelect();
	$('#currency_send select').children('option:first').text('TNBC');
	$('#currency_send select').children('option:first').val('TNBC');
	$('#wallet_currency .wallet_currency').eq(0).text('TNBC');
}

function switchBank(bank) {
	chrome.storage.local.set({
		current_bank: bank,
	});
}

function addNewBank(bank) {
	chrome.storage.local.get(['bank_list'], function (items) {
		let customBANKs = [];
		if (items.bank_list !== undefined) customBANKs = items.bank_list;
		customBANKs.push(bank);
		chrome.storage.local.set(
			{
				bank_list: customBANKs,
			},
			function () {
				$('.success_div')
					.html(chrome.i18n.getMessage('popup_bank_added'))
					.show();
				showCustomBank();
				setTimeout(function () {
					$('.success_div').html('').hide();
				}, 5000);
			}
		);
	});
}

function showCustomBank() {
	$('#custom_bank').empty();
	chrome.storage.local.get(['bank_list'], function (items) {
		if (items.bank_list) {
			for (bank of items.bank_list) {
				if (bank !== 'http://13.57.215.62') {
					$('#custom_bank').append(
						"<div><div class='pref_name'>" +
							bank +
							"</div><img class='deleteCustomBANK' src='../images/delete.png'/></div>"
					);
				}
			}
			$('.deleteCustomBANK')
				.unbind('click')
				.click(function () {
					banks = items.bank_list.filter(e => {
						return e !== $(this).prev().html();
					});
					chrome.storage.local.set(
						{
							bank_list: banks,
						},
						function () {
							showCustomBank();
						}
					);
				});
		}
	});
}
