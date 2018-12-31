console.log('content script jinnmail loaded');

$(document).ready(() => {

    let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
    // let url = 'http://localhost:9001/api/v1/'
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let buttonIcon;
    let forms = document.getElementsByTagName('form');
    setTimeout(() => {
        for (let i = 0; i < forms.length; i++) {
            let form = forms[i];
            let inputs = form.querySelectorAll("input[type=email]");
            for (let j = 0; j < inputs.length; j++) {
                let input = inputs[j];
                $(input).addClass("jnmbtn-inpt");
                let divIcon = document.createElement("div");
                divIcon.className = "jinmail-icon-div";
                buttonIcon = document.createElement('button');
                buttonIcon.className = "jinmail-icon-button";
                buttonIcon.id = "jnnmbtn";
                divIcon.appendChild(buttonIcon);
                input.appendChild(divIcon);
                input.parentNode.insertBefore(divIcon, input.nextSibling);
                input.parentNode.style.position = "relative";
            }
        }
    }, 1000);

    let init = () => {
        $(".loader-container").hide();
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['sessionToken'], (token) => {
                if (token)
                    resolve(token.sessionToken);
                else
                    reject('no token');
            })
        }).then((token) => {
            $.ajax({
                type: "GET",
                url: url + 'alias',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", token);
                },
                success: (success) => {
                    console.log(success);
                    for (let index = 0; index < success.data.length; index++) {
                        let status = success.data[index].status ? 'on' : 'off';
                        let data = '<div class="d-lg-flex justify-content-between px-3">' +
                            '<div class="mb-2">' +
                            '<span>' +
                            ' <span>' + success.data[index].alias + '</span>' +
                            ' </span>' +
                            '<div class="heading">Generated Jinn Mail</div>' +
                            ' </div>' +
                            '<div class="mb-2">' +
                            '<span>No description</span>' +
                            '<div class="heading">Description</div>' +
                            '</div>' +
                            '<div class="mb-2">' +
                            '<div>' + new Date(success.data[index].created).getDate() + ' ' + monthNames[new Date(success.data[index].created).getMonth()] + '</div>'
                        '<div class="heading">Created At</div>' +
                            '</div>' +
                            '<div class="mb-2">' +
                            '<div>0</div>' +
                            '<div class="heading">Forwarded</div>' +
                            '</div>' +
                            ' <div class="mb-2">' +
                            '<div>0</div>' +
                            '<div class="heading">Blocked</div>' +
                            ' </div></div>';

                        $('#append-mails-web').append(data);
                    }
                    $('#no-of-jinn').text(success.data.length);

                },
                error: (err) => {
                    // alert(err.responseJSON.error)
                    console.log(err)
                },
                contentType: 'application/json'
            });
        }).catch((err) => {
            console.log(err);
        })

    }

    init();

    $("#generate-jinnmail-web").click((e) => {
        console.log('here')
        chrome.runtime.sendMessage({ url: location.hostname, res: 'ok', buttonIcon: buttonIcon }, (res) => {
        });
        setTimeout(() => {
            $('#append-mails-web').empty();
            init();
        }, 2000)
    })

    $("#custom-jinnmail-web").click((e) => {
        console.log('here')
        let randomStr = randomString(6);
        // console.log(x$("#custom-rand"))
        $("#custom-rand").text(randomStr)
    });

    $("#generate-custom-jinnmail-submit").click((e) => {
        console.log('here at submit');
        let randStr = $("#custom-rand").text();
        let alias = $("#custom-alias").val();
        console.log(alias, randStr)
        alias = 'http://'+alias + '.com'
        chrome.runtime.sendMessage({ url: alias, res: 'ok', buttonIcon: 'cust' }, (res) => {
        });
        setTimeout(() => {
            $("#createModal").removeClass('show');
            $('#append-mails-web').empty();
            init();
        }, 2000)
    })



    let randomString = (string_length) => {
        let chars = "0123456789abcdefghiklmnopqrstuvwxyz";
        let randomstring = '';
        for (let i = 0; i < string_length; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    }

    let registerAlias = () => {
        return new Promise((resolve, reject) => {
            stoken().then((token) => {
                let data = { url: location.hostname };
                let json = JSON.stringify(data);
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url + 'alias', true);
                xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                xhr.setRequestHeader('Authorization', token)
                xhr.onload = function () {
                    let alias = JSON.parse(xhr.responseText);
                    if (xhr.readyState == 4 && xhr.status == "200") {
                        console.log(alias);
                        resolve(alias.data.alias)
                    } else {
                        console.error(alias);
                        registerAlias(siteurl);
                    }
                }
                xhr.send(json);
            })
        }).catch((err) => {
            resolve('')
        })

    }


    //get token 
    let stoken = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['sessionToken'], (token) => {
                if (token)
                    resolve(token.sessionToken);
                else
                    reject('no token');
            })
        })


    }

    $(document).on('click', '#jnnmbtn', (e) => {
        console.log(e)
        e.preventDefault();
        chrome.runtime.sendMessage({ url: location.hostname, res: 'ok', buttonIcon: buttonIcon }, (res) => {
        });
    });
});
