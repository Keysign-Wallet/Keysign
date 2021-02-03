// Show errors
function showError(message) {
	$('.error_div').html(message);
	$('.error_div').show();
	setTimeout(function () {
		$('.error_div').hide();
		$('.error_div').css('height', '100px');
	}, 5000);
}

function showConfirm(message) {
	$('.success_div').html(message);
	$('.success_div').show();
	setTimeout(function () {
		$('.success_div').hide();
	}, 5000);
}

// Custom select dropdown
function initiateCustomSelect(options) {
	/*look for any elements with the class "custom-select":*/
	x = document.getElementsByClassName('custom-select');

	for (i = 0; i < x.length; i++) {
		if (i === 5 && custom_created) return;
		if (i === 5 && !custom_created) custom_created = true;
		selElmnt = x[i].getElementsByTagName('select')[0];

		/*for each element, create a new DIV that will act as the selected item:*/
		if ($(x[i]).find('div.select-selected').length) continue;
		a = document.createElement('DIV');
		a.setAttribute('class', 'select-selected');
		if (selElmnt.options[selElmnt.selectedIndex])
			a.innerText = selElmnt.options[selElmnt.selectedIndex].innerHTML;
		x[i].appendChild(a);
		/*for each element, create a new DIV that will contain the option list:*/
		b = document.createElement('DIV');
		b.setAttribute('class', 'select-items select-hide show-scroll');
		for (j = 0; j < selElmnt.length; j++) {
			/*for each option in the original select element,
      create a new DIV that will act as an option item:*/
			c = document.createElement('DIV');
			c.innerText = selElmnt.options[j].innerHTML;
			c.addEventListener('click', function (e) {
				/*when an item is clicked, update the original select box,
        and the selected item:*/
				let y, i, k, s, h;
				s = this.parentNode.parentNode.getElementsByTagName(
					'select'
				)[0];
				h = this.parentNode.previousSibling;
				for (i = 0; i < s.length; i++) {
					if (s.options[i].innerHTML === this.innerHTML) {
						s.selectedIndex = i;
						h.innerText = this.innerHTML;
						y = this.parentNode.getElementsByClassName(
							'same-as-selected'
						);
						for (k = 0; k < y.length; k++) {
							y[k].removeAttribute('class');
						}
						this.setAttribute('class', 'same-as-selected');
						break;
					}
				}
				h.click();
			});
			b.appendChild(c);
		}
		x[i].appendChild(b);

		if (walletsList.get(a.innerHTML)) {
			loadWallet(a.innerHTML, options);
		}
		a.addEventListener('click', async function (e) {
			/*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
			e.stopPropagation();
			closeAllSelect(this);
			this.nextSibling.classList.toggle('select-hide');
			this.classList.toggle('select-arrow-active');
			if (
				this.innerHTML.includes(
					chrome.i18n.getMessage('popup_add_wallet')
				)
			) {
				$('#add_import_keys').hide();
				showaddWallet();
			} else if (
				!getPref &&
				!manageKey &&
				!this.classList.contains('select-arrow-active') &&
				this.innerHTML !== 'TNBC'
			) {
				chrome.storage.local.set({
					last_account: this.innerHTML,
				});
				loadWallet(this.innerHTML, options);
			} else if (this.innerHTML === 'TNBC') {
				const balance =
					(await activeWallet.getBalance()) -
					(await activeWallet.getTxFees());
				$('.transfer_balance div')
					.eq(0)
					.text(
						chrome.i18n.getMessage('popup_html_balance', ['TNBC'])
					);
				$('.transfer_balance div')
					.eq(1)
					.html(numberWithCommas(balance));
				$('#amt_send_max')
					.unbind('click')
					.click(() => {
						$('#amt_send').val(balance);
					});
				$('#amt_send').val(null);
			} else if (manageKey) {
				manageWallets(this.innerHTML);
			} else if (
				getPref &&
				$(this).parent().attr('id') !== 'custom_select_bank'
			) {
				setPreferences(this.innerHTML);
			} else if (
				getPref &&
				$(this).parent().attr('id') === 'custom_select_bank'
			) {
				if (
					this.innerHTML !== chrome.i18n.getMessage('popup_bank_add')
				) {
					chrome.storage.local.set({ current_bank: this.innerHTML });
					switchBank(this.innerHTML);
				} else {
					showCustomBank();
					$('#pref_div').hide();
					$('#add_bank_div').show();
				}
			}
		});
	}

	function closeAllSelect(elmnt) {
		/*a function that will close all select boxes in the document,
    except the current select box:*/
		let x,
			y,
			i,
			arrNo = [];
		x = document.getElementsByClassName('select-items');
		y = document.getElementsByClassName('select-selected');
		for (i = 0; i < y.length; i++) {
			if (elmnt === y[i]) {
				arrNo.push(i);
			} else {
				y[i].classList.remove('select-arrow-active');
			}
		}
		for (i = 0; i < x.length; i++) {
			if (arrNo.indexOf(i)) {
				x[i].classList.add('select-hide');
			}
		}
	}
	/*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
	document.addEventListener('click', closeAllSelect);
}

function getValFromString(string) {
	return parseFloat(string.split(' ')[0]);
}

let numberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
