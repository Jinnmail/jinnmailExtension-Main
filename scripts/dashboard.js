$('document').ready(() => {
    let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
    // let url = 'http://localhost:9001/api/v1/';
    $('#logoutIcon').click((e) => {
        chrome.storage.sync.clear(() => {
            window.location.href = '../popup.html'
        })
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let init = () => {
        $(".loader-container").hide();
        stoken().then((token) => {
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
                        let data = '<tr>' +
                            '<td class="email-cell text-left">' +
                            '<span class="email-address">' + success.data[index].alias + '</span>' +
                            '<div class="greyed-out" style="font-size: 0.9em;">' + new Date(success.data[index].created).getDate() + ' ' + monthNames[new Date(success.data[index].created).getMonth()] + '</div>' +
                            '</td>' +
                            '<td class="td-actions text-center">' +
                            '<button type="button" rel="tooltip" class="btn btn-info btn-icon btn-sm btn-neutral  copy-clip" ><i class="fa fa-copy"></i></button>'+
                            '<div  class="onoff bootstrap-switch wrapper bootstrap-switch-' + status + '" id=' + success.data[index].aliasId + ' style="width: 100px;">' +
                            '<div  class="bootstrap-switch-container" style="width: 150px; margin-left: 0px;"><span class="bootstrap-switch-handle-on bootstrap-switch-primary" style="width: 50px;">ON</span><span class="bootstrap-switch-label" style="width: 50px;"> </span><span class="bootstrap-switch-handle-off bootstrap-switch-default" style="width: 50px;">OFF</span></div>' +
                            '</div>' +
                            '<button type="button" rel="tooltip" class="remAlias btn btn-danger btn-icon btn-sm btn-neutral"><i id="remAlias" class="fa fa-times ui-1_simple-remove"></i></button>' +
                            '</td></tr>' +
                            '<tr class="confirmation">' +
                            '<td colspan="2"><span>Are you sure?</span><button id="yes_' + success.data[index].aliasId + '" class="yes_cnfrm btn btn-danger btn-sm">Yes</button><button class="no_cnfrm btn btn-sm">No</button></td>' +
                            '</tr>';
                        $('#append-mails').append(data);
                    }
                    $('#remaining-mails').text(50 - success.data.length);

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


    $(document).delegate(".onoff", "click", function (e) {
        e.stopImmediatePropagation();
        console.log(e, e.currentTarget.id, "hi")
        let currentSitu = e.currentTarget.classList.contains('bootstrap-switch-on') ? true : false;
        if (currentSitu) {
            e.currentTarget.classList.remove('bootstrap-switch-on');
            e.currentTarget.classList.add('bootstrap-switch-off');
            let p = changeStatus(!currentSitu, e.currentTarget.id)
        } else {
            e.currentTarget.classList.remove('bootstrap-switch-off');
            e.currentTarget.classList.add('bootstrap-switch-on');
            let p = changeStatus(!currentSitu, e.currentTarget.id)
        }
    });
    //end

    //remove Alias

    $(document).delegate("#remAlias", "click", function (e) {
        console.log(e, "remove")
        e.currentTarget.parentElement.parentElement.parentElement.nextElementSibling.classList.add('__visible');
    });

    $(document).delegate(".yes_cnfrm", "click", function (e) {
        console.log(e, "remove yes")
        let id = e.currentTarget.id.split('_')[1];
        console.log(id)
        let p = removeAlias(id)
    });

    $(document).delegate(".no_cnfrm", "click", function (e) {
        console.log(e, "remove no")
        e.currentTarget.parentElement.parentElement.classList.remove('__visible')

    });


    $(document).delegate(".copy-clip", "click", function (e) {
        console.log(e, "remove no")
        let copy_email=e.currentTarget.parentElement.parentElement.firstElementChild.firstElementChild.innerText;
        copyToClipboard(copy_email)

    });
    //end
    let changeStatus = (val, id) => {
        return new Promise((resolve, reject) => {
            stoken().then((token) => {
                let sendObj = { "status": val, aliasId: id }
                sendObj = JSON.stringify(sendObj);
                console.log(sendObj)
                $.ajax({
                    type: "PUT",
                    url: url + 'alias/status',
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", token);
                    },
                    data: sendObj,
                    success: (success) => {
                        console.log(success);
                    },
                    error: (err) => {
                        // alert(err.responseJSON.error)
                        console.log(err)
                    },
                    contentType: 'application/json'
                })
            })

        })
    }

    let removeAlias = (id) => {
        return new Promise((resolve, reject) => {
            stoken().then((token) => {


                $.ajax({
                    type: "DELETE",
                    url: url + 'alias/' + id,
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", token);
                    },

                    success: (success) => {
                        console.log(success);
                        $('#append-mails').empty();
                        init();
                    },
                    error: (err) => {
                        // alert(err.responseJSON.error)
                        console.log(err)
                    },
                    contentType: 'application/json'
                })
            })

        })
    }

    $('#changepwdsubmit').click((e) => {
        let oldPassword = $('#changepwdold').val();
        let newPassword = $('#changepwdnew').val();
        console.log(oldPassword, newPassword);
        //
        stoken().then((token) => {
            let sendObj = { oldPassword: oldPassword, newPassword: newPassword }
            sendObj = JSON.stringify(sendObj);
            console.log(sendObj)
            $.ajax({
                type: "POST",
                url: url + 'user/reset/password',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", token);
                },
                data: sendObj,
                success: (success) => {
                    console.log(success);
                    $(".success-message").show();
                },
                error: (err) => {
                    // alert(err.responseJSON.error)
                    console.log(err)
                },
                contentType: 'application/json'
            })
        })
    })

    init();

    //script to show the settings page 
    $("#setIcon").click(function () {
        $(".dashboard-container, .dashboard-btn, .top-right-buttons, .dashboard-msgs-icon").hide();
        $(".settings-wrapper, .settings-back-btn").show();
        $(".dashboard-welcome-title small").text("Settings");
    });

    $(".settings-back-btn").click(function () {
        $(".dashboard-container, .dashboard-btn, .top-right-buttons, .dashboard-msgs-icon").show();
        $(".settings-wrapper, .settings-back-btn").hide();
        $(".dashboard-welcome-title small").text("Manage your JinnMails");
        $(".reset-password-wrapper").hide();
    })
    $("#reset-password").click(function () {
        $(".settings-wrapper").hide();
        $(".reset-password-wrapper").show();
    })


    //open webpage
    $('.dashboard-btn').click((e) => {
        console.log('here ');
        chrome.tabs.create({ url: 'https://jinnmaildash.herokuapp.com/index.html' })
    })

    $('.mail-env-btn').click((e) => {
        chrome.tabs.create({ url: 'https://jinnmaildash.herokuapp.com/mailbox.html' })
    })
    //end
    
    function copyToClipboard(email) {
   console.log('here', email)
      
        var aux = document.createElement("input");
      
        
        aux.setAttribute("value", email);
      
        // Append it to the body
        document.body.appendChild(aux);
      
        // Highlight its content
        aux.select();
      
        // Copy the highlighted text
        document.execCommand("copy");
      
        // Remove it from the body
        document.body.removeChild(aux);
    }
      


    

})