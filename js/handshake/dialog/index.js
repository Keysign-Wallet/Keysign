chrome.runtime.onMessage.addListener(function(request, sender, sendResp) {
    if (request) {
        chrome.runtime.sendMessage({
            command: 'stopInterval',
        });
        if (request.command === 'sendDialogError') {
            // Display error window
            if (!request.msg.success) {
                $('#tx_loading').hide();
                if (request.msg.error === 'locked') {
                    $('.unlock').show();
                    $('#error-ok').hide();
                    $('#no-unlock').click(function() {
                        window.close();
                    });
                    $('#yes-unlock').click(function() {
                        chrome.runtime.sendMessage({
                            command: 'unlockFromDialog',
                            data: request.msg.data,
                            tab: request.tab,
                            mk: $('#unlock-dialog').val(),
                            domain: request.domain,
                            request_id: request.request_id,
                        });
                    });
                    $('#unlock-dialog').keypress(function(e) {
                        if (e.keyCode === 13) $('#yes-unlock').click();
                    });
                    $('#unlock-dialog').focus();
                }
                $('#dialog_header').text(
                    request.msg.error === 'locked' ?
                    chrome.i18n.getMessage('dialog_header_unlock') :
                    chrome.i18n.getMessage('dialog_header_error')
                );
                $('#dialog_header').addClass('error_header');
                $('#error_dialog').text(request.msg.display_msg);
                $('#modal-body-msg').hide();
                $('.modal-body-error').show();
                $('.dialog-message').hide();
                $('#error-ok').click(function() {
                    window.close();
                });
            }
        } else if (request.command === 'wrongMk') {
            $('#error-mk').text(
                chrome.i18n.getMessage('dialog_header_wrong_pwd')
            );
        } else if (request.command === 'sendDialogConfirm') {
            // Display confirmation window
            $('#confirm_footer').show();
            $('#modal-body-msg').show();
            const {
                type,
                display_msg,
                txs,
                bank,
                code
            } = request.data;

            const titles = {
                transfer: chrome.i18n.getMessage('dialog_title_transfer'),
                verify: chrome.i18n.getMessage('dialog_title_verify'),
            };

            const header = titles[type];
            $('#dialog_header').text(header);

            if (display_msg) {
                $('#modal-body-msg .msg-data').css('max-height', '245px');
                $('#dialog_message').show();
                $('#dialog_message').text(display_msg);
            }

            const walletsList = new WalletsList();

            if (request.wallets) {
                walletsList.init(request.wallets);
                $('#modal-body-msg .msg-data').css('max-height', '200px');
                for (acc of walletsList.getList()) {
                    if (acc !== undefined)
                        $('#select_transfer').append(
                            '<option>' + acc.name + '</option>'
                        );
                }
                initiateCustomSelect(request.data, walletsList);
            }

            $('.' + type).show();
            $('.modal-body-error').hide();
            $('#modal-content').css('align-items', 'flex-start');
            $('#confirm_footer button').css('margin-top', '30px');
            switch (type) {
                case 'transfer':
                    if (bank) {
                        walletsList.changeBank(bank);
                    }
                    $('.balance_loading').hide();
                    txs.forEach(tx => {
                        $('#transfer_info').append(
                            `<tr><td>${tx.amount}</td><td>${
								tx.to.substring(0, 10) + '...'
							}</td><td>${tx.memo}</td></tr>`
                        );
                    });
                    break;
                case 'verify':
                    $('table').hide();
                    $('#acct_list').show();
                    $('#verify_ac').show();
                    $('#verify_ac').text(
                        request.data.accountNumber === '' ?
                        walletsList.getList()[0].account.accountNumberHex :
                        request.data.accountNumber
                    );
            }

            // Closes the window and launch the transaction in background
            $('#proceed').click(function() {
                if (type === 'transfer') {
                    chrome.runtime.sendMessage({
                        command: 'acceptTransaction',
                        data: {
                            ...request.data,
                            from: $('.select-selected').text(),
                            sig: walletsList
                                .get($('.select-selected').text())
                                .account.createSignature(code),
                        },
                        tab: request.tab,
                        domain: request.domain,
                    });
                    $('#tx_loading').show();
                } else if (type === 'verify') {
                    if (
                        walletsList.getByAccountNumber(
                            $('#verify_ac').text()
                        ) === walletsList.get($('.select-selected').text())
                    ) {
                        let accountNumber = request.data.accountNumber;
                        if (!accountNumber) {
                            accountNumber = $("#verify_ac").text();
                        }
                        chrome.runtime.sendMessage({
                            command: 'acceptVerification',
                            data: {
                                ...request.data,
                                result: {
                                    verified: true,
                                    accountNumber,
                                    sig: walletsList
                                        .getByAccountNumber(accountNumber)
                                        .account.createSignature(code),
                                },
                            },
                            tab: request.tab,
                            domain: request.domain,
                        });
                    } else {
                        let accountNumber = request.data.accountNumber;
                        chrome.runtime.sendMessage({
                            command: 'acceptVerification',
                            data: {
                                ...request.data,
                                result: {
                                    verified: false,
                                    accountNumber,
                                    sig: walletsList
                                        .getByAccountNumber(accountNumber)
                                        .account.createSignature(code),
                                },
                            },
                            tab: request.tab,
                            domain: request.domain,
                        });
                    }
                }
                $('#confirm_footer').hide();
                $('#modal-body-msg').hide();
                $('.dialog-message').hide();
            });

            // Closes the window and notify the content script (and then the website) that the user refused the transaction.
            $('#cancel').click(function() {
                window.close();
            });
        } else if (request.command === 'answerRequest') {
            $('#tx_loading').hide();
            $('#dialog_header').text(
                request.msg.success ?
                `${chrome.i18n.getMessage('dialog_header_success')} !` :
                `${chrome.i18n.getMessage('dialog_header_error')} !`
            );
            $('#error_dialog').show();
            $('#error_dialog').html(request.msg.message);
            $('.modal-body-error').show();
            $('#error-ok').click(function() {
                window.close();
            });
        }
    }
});

function initiateCustomSelect(data, walletsList) {
    /*look for any elements with the class "custom-select":*/
    let prev_username = null;
    x = document.getElementsByClassName('custom-select');

    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName('select')[0];

        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement('DIV');
        a.setAttribute('class', 'select-selected');
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement('DIV');
        b.setAttribute('class', 'select-items select-hide');
        for (j = 0; j < selElmnt.length; j++) {
            /*for each option in the original select element,
            create a new DIV that will act as an option item:*/
            c = document.createElement('DIV');
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener('click', function(e) {
                /*when an item is clicked, update the original select box,
                and the selected item:*/
                let y, i, k, s, h;
                s =
                    this.parentNode.parentNode.getElementsByTagName(
                        'select'
                    )[0];
                h = this.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML === this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y =
                            this.parentNode.getElementsByClassName(
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
        a.addEventListener('click', function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            const username = $(this).text();
            if (username !== prev_username) {
                $('#balance , #balance_after').hide();
                $('#balance_loading').show();
                $('#username').text(username);
                switch (data.type) {
                    case 'transfer':
                        $('.balance_loading').hide();
                    case 'verify':
                        if (!data.accountNumber)
                            $('#verify_ac').text(
                                walletsList.get(username).account
                                .accountNumberHex
                            );
                }
                prev_username = username;
            }
            this.nextSibling.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');
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