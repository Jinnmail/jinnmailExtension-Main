// console.log('content script jinnmail loaded');
$(document).ready(() => {
  // const JM_DASHBOARD_URL = 'https://account.jinnmail.com', JM_API_URL = 'https://whatismyname2.xyz/api/v1/'; // 'https://jinnmailapp.herokuapp.com/api/v1/';
  // const JM_DASHBOARD_URL = 'https://testling.xyz', JM_API_URL = 'https://api.testling.xyz/api/v1/';
  const JM_DASHBOARD_URL = 'http://localhost:3001', JM_API_URL = 'http://localhost:3000/api/v1/';

    let url = JM_API_URL;

    // let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
    // let url = 'http://localhost:3000/api/v1/';
    // let url = 'http://localhost:9001/api/v1/'

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let count = 0, mailCount=0;
    let buttonIcon;
    let forms = document.getElementsByTagName('form');
    let body = document.getElementsByTagName('body')[0];
    
    chrome.storage.local.remove(['alias'],() => {
        console.log("Removed alias");
    })

    // $("input").keypress(funxfction(e){
    //     // console.log("e: "+ JSON.stringify(e))
    //     if(e.keyCode === 13){
    //         e.preventDefault();
    //         // console.log(e)
    //     }
    // });

    $(body).on('click', () => {
        // console.log("Click Event")
        start();
    });

    function start(){
        // console.log(forms)
        setTimeout(() => {
            // if(forms.length){
            //     for (let i = 0; i < forms.length; i++) {
            //         let form = forms[i];
            //         dispButton(form)
            //     }
            // }
            // else{
                dispButton(body)      
            // }

            function dispButton(elem){
                elem = (elem == undefined)?document:elem;
                let inputs = elem.querySelectorAll("input[type=email], input[type=text][placeholder*=email i], input[type=text][placeholder*=e-mail i], input[type=text][name*=email i], input[type=text][id*=email i], input[type=text][autocomplete*=email i]");
                for (let j = 0; j < inputs.length; j++) {
                    let input = inputs[j];
                    if(!$(input).hasClass("jnmbtn-inpt") ){
                        $(input).addClass("jnmbtn-inpt");  
                        let divIcon = document.createElement("div");
                        divIcon.className = "jinnmail-icon-div";
                        $(divIcon).attr("tabindex","-1");

                        divIcon.style.height = ((input.offsetHeight == 0)? input.style.height : input.offsetHeight + "px");
                        divIcon.style.width = ((input.offsetWidth == 0)? input.style.width : input.offsetWidth + "px");
                        // divIcon.style.top = ((input.offsetTop == 0)?input.offsetTop:Math.abs(input.parentElement.offsetTop - input.offsetTop)) + "px";
                        // divIcon.style.left = ((input.offsetLeft == 0)?input.offsetLeft:Math.abs(input.parentElement.offsetLeft - input.offsetLeft)) + "px";
                        
                        let pos = $(input).position();
                        divIcon.style.top = (pos.top + parseInt($(input).css('marginTop'))) + "px";
                        divIcon.style.left = pos.left + "px";

                        // divIcon.style.top = "0px";
                        // divIcon.style.left = "0px";
                        
                        if(input.type === "hidden" || input.style.display === "none"){
                            divIcon.style.display = "none";
                        }
                        buttonIcon = document.createElement('div');
                        buttonIcon.className = "jinnmail-icon-button";
                        // buttonIcon.id = `jnnmbtn`;

                        buttonIcon.style.height = ((parseInt(divIcon.style.height)-5)<28.2?(parseInt(divIcon.style.height)-5):28.2)+"px";
                        buttonIcon.style.width = buttonIcon.style.height;
                        $(buttonIcon).attr("tabindex","-1");
                        $(input).removeAttr('onFocus');

                        buttonIcon.value = count;
                        $(input).attr("temp", count++);
                        divIcon.appendChild(buttonIcon);
                        input.appendChild(divIcon);
                        input.parentNode.insertBefore(divIcon, input.nextSibling);

                        // console.log($(input).parent().css("display"));
                        // console.log("top",$(input).css("padding-top"));
                        // console.log("left",$(input).css("padding-left"));
                        // console.log("right",$(input).css("padding-right"));
                        // console.log("bottom",$(input).css("padding-bottopm"));
                        
                        if($(input).parent().css("display") === "none" || $(input).parent().css("display") === "inline" || $(input).parent().css("display") === "")
                        {
                            input.parentNode.style.display = "block";     
                        }
                        
                    }
                    else if($('.jinnmail-icon-div').css("width") === "0px" || $('.jinnmail-icon-div').css("height") === "0px")
                    {
                        $('.jinnmail-icon-div').css("height", ((input.offsetHeight == 0)? input.style.height : input.offsetHeight + "px"));
                        $('.jinnmail-icon-div').css("width", ((input.offsetWidth == 0)? input.style.width : input.offsetWidth + "px"))
                    }
                    // $(input).keypress(function(e){
                    //     // console.log("e: "+ JSON.stringify(e))
                    //     if(e.keyCode === 13){
                    //         e.preventDefault();
                    //     }
                    // });
                }
            }
        }, 1500);
    }
    start();
    let init = () => {
        $(".loader-container").hide();
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['sessionToken'], (token) => {
                if (token){
                    // console.log("token is:",token)
                    resolve(token.sessionToken);
                }
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
                    // console.log("Data Retrieved: "+JSON.stringify(success.data));
                    mailCount = 0;
                    for (let index = 0; index < success.data.length; index++) {
                        let status = success.data[index].status ? 'on' : 'off';
                        mailCount += success.data[index].mailCount;
                        let data ='<div id="row-content" class="d-lg-flex justify-content-between px-3">' +
                            '<div class="mb-2 cols-1">' +
                            '<span>' +
                            ' <span>' + success.data[index].alias + '</span>' +
                            ' </span>' +
                            '<div class="heading"></div>' +
                            ' </div>' +
                            '<div class="mb-2 cols-2">' +
                            '<span data-toggle="tooltip" data-placement="top" title="'+success.data[index].refferedUrl+'">'+success.data[index].alias.substring(0, (success.data[index].alias.indexOf('.') < success.data[index].alias.indexOf('@'))?success.data[index].alias.indexOf('.'):success.data[index].alias.indexOf('@'))+'</span>' +
                            '<div class="heading">Description</div>' +
                            '</div>' +
                            '<div class="mb-2 cols-3">' +
                            '<div>' + new Date(success.data[index].created).getDate() + ' ' + monthNames[new Date(success.data[index].created).getMonth()] + '</div>'+
                            '<div class="heading">Created At</div>' +
                            '</div>' +

                            '<div class="mb-2 cols-4">' +
                            '<div>'+((success.data[index].mailCount)?(success.data[index].mailCount):0)+'</div>' +
                            '<div class="heading">Forwarded</div>' +
                            '</div>' +
                            ' <div class="mb-2 cols-5">' +
                            '<div>0</div>' +
                            '<div class="heading">Blocked</div>' +
                            ' </div>'+

                            ' <div class="mb-2 cols-6">' +
                            '<div>2 January 2019</div>' +
                            '<div class="heading">Last Used date</div>' +
                            ' </div>'+
                                                     
                            '<div class="mb-2 cols-7">' +
                            '<div class="td-actions text-center">' +
                            '<button type="button" rel="tooltip" class="btn btn-info btn-icon btn-sm btn-neutral  copy-clip" ><i class="fa fa-copy"></i></button>'+
                            '<div  class="onoff bootstrap-switch wrapper bootstrap-switch-' + status + '" id=' + success.data[index].aliasId + ' style="width: 100px;">' +
                            '<div  class="bootstrap-switch-container" style="width: 150px; margin-left: 0px;"><span class="bootstrap-switch-handle-on bootstrap-switch-primary" style="width: 50px;">ON</span><span class="bootstrap-switch-label" style="width: 50px;"> </span><span class="bootstrap-switch-handle-off bootstrap-switch-default" style="width: 50px;">OFF</span></div>' +
                            '</div>' +
                            '<button type="button" rel="tooltip" class="remAlias btn btn-icon btn-sm btn-neutral"><i id="remAlias" class="fa fa-times ui-1_simple-remove"></i></button>' +
                            '</div>' +
                            '<div class="confirmation">' +
                            '<div colspan="2"><span>Are you sure?</span><button id="yes_' + success.data[index].aliasId + '" class="yes_cnfrm btn btn-danger btn-sm">Yes</button><button class="no_cnfrm btn btn-sm">No</button></div>' +
                            '</div>'
                            '</div>' +
                            '</div>';
                        
                        $('#append-mails-web').append(data);
                    }
                    $("p.title")[2].innerHTML = mailCount;
                    $('#userDetails').text(((success.data.length==0)?"No Data":success.data[0].email))
                    $('#no-of-jinn').text(success.data.length);

                },
                error: (err) => {
                    // alert(err.responseJSON.error)
                    // console.log(err)
                },
                contentType: 'application/json'
            });
        }).catch((err) => {
            // console.log(err);
        })

    }
    
//     if(window.location.href === JM_DASHBOARD_URL)
//     // if(window.location.href === 'https://jinnmaildash.herokuapp.com/index.html')
//     // if(window.location.href === 'http://localhost:8000/index.html')
//     // if(window.location.href === 'http://localhost/jinnmail-dash/index.html')
//     {
//         init();
//     }        

//     $("#generate-jinnmail-web").click((e) => {
//         // console.log('here', $('#domain-alias').val());

//         setTimeout( () => {
//             $('#domain-alias').focus();
//         },1000)
//     })

//     $("#custom-alias").on('keydown', () => {
//         $("#custom-alias").css({
//             "border": "1px solid rgba(0, 0, 0, .15)"
//         })
//     })

//     $("#custom-jinnmail-web").click((e) => {
//         // console.log('here')
//         $("#custom-alias").focus();
//         let randomStr = randomString(6);
//         $("#custom-rand").text(randomStr)

//         setTimeout( () => {
//             $('#custom-alias').focus();
//         }, 1000)
//     });

//     $("#generate-alias-domain-submit").click((e) => {
//         // console.log('here at submit');
//         var str = "http://" + $('#domain-alias').val() + ".com"
//         chrome.runtime.sendMessage({ url: str, res: 'ok', buttonIcon: buttonIcon }, (res) => {
//         });
//         setTimeout(() => {
//             $("#domainModal").removeClass('show');
//             $('#append-mails-web').empty();
//             $('#domain-alias').val("");
//             $(".modal-header").find('.close').click();
//             init();
//         }, 2000)
//     })

//     $("#generate-custom-jinnmail-submit").click((e) => {
//         // console.log('here at submit');
//         let randStr = $("#custom-rand").text();
//         let alias = $("#custom-alias").val();
//         let domainAlias = $('#custom-domain-alias').val();
//         console.log(alias, domainAlias, randStr)
//         //alias = 'http://'+alias +'.com'
//         if(domainAlias)
//         {
//             checkAlias(`${alias}.${domainAlias}@jinnmail.com`, `${alias}@jinnmail.com`, `${domainAlias}@jinnmail.com`)
//         }else{
//             checkAlias(`${alias}@jinnmail.com`, alias, domainAlias)
//         }
//         console.log(alias);
//         // chrome.runtime.sendMessage({ url: alias, source: "cust", res: 'ok', buttonIcon: 'cust' }, (res) => {
//         // });
//         // setTimeout(() => {
//         //     $("#createModal").removeClass('show');
//         //     $('#append-mails-web').empty();
//         //     $('#custom-alias').val("");
//         //     $('#custom-domain-alias').val("");
//         //     $(".modal-header").find('.close').click();
//         //     init();
//         // }, 2000)
//     })

//     function checkAlias(link, alias, domainAlias) {
//         chrome.storage.sync.get(['sessionToken'], (token) => {
//             if (token){
//                 function emailAddressAllowed(email) {
//                     var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
                
//                     if (!email)
//                         return false;
//                     if(email.length > 254)
//                         return false;
//                     var valid = emailRegex.test(email);
//                     if(!valid)
//                         return false;
//                     var parts = email.split("@");
//                     if(parts[0].length > 64)
//                         return false;
//                     var domainParts = parts[1].split(".");
//                     if(domainParts.some(function(part) { return part.length > 63; }))
//                         return false;
                
//                     return true;
//                 }
//                 // console.log("token is:",token.sessionToken)
//                 function matchAlias(alias) {
//                     // console.log(alias.alias+"---"+link)
//                     return alias.alias === link;
//                 }
//                 function AliasFound(){
//                     $("#custom-alias").css({
//                         "border":"2px solid red"
//                     })
//                     console.log(true)
//                 }
//                 function AliasNotFound(){
//                     console.log(false)
//                     link = link.substring(0, link.lastIndexOf('@'))
//                     alias = `http://${link}.com`
//                     chrome.runtime.sendMessage({ url: alias, source: "cust", res: 'ok', buttonIcon: 'cust' }, (res) => {
//                     });
//                     setTimeout(() => {
//                         $("#createModal").removeClass('show');
//                         $('#append-mails-web').empty();
//                         $('#custom-alias').val("");
//                         $('#custom-domain-alias').val("");
//                         $(".modal-header").find('.close').click();
//                         init();
//                     }, 2000)
//                 };
//                 $.ajax({
//                     type: "GET",
//                     url: url + 'alias/checkAlias',
//                     beforeSend: function (request) {
//                         request.setRequestHeader("Authorization", token.sessionToken);
//                     },
//                     success: (success) => {
//                         if (emailAddressAllowed(link)) {
//                             console.log(JSON.stringify(success));
//                             (success.data.filter(matchAlias).length>0)?AliasFound():AliasNotFound();
//                         } else {
//                             if (!emailAddressAllowed(alias)) {
//                                 $("#custom-alias").css({
//                                     "border":"2px solid red"
//                                 })
//                             }
//                             if (!emailAddressAllowed(domainAlias)) {
//                                 $("#custom-domain-alias").css({
//                                     "border":"2px solid red"
//                                 })
//                             }
//                         }
//                     },
//                     error: (err) => {
//                         // alert(err.responseJSON.error)
//                         console.log(err)
//                     },
//                     contentType: 'application/json'
//                 })
//             }
//             else
//                 reject('no token');
//         })
//     }

//     let randomString = (string_length) => {
//         let chars = "0123456789abcdefghiklmnopqrstuvwxyz";
//         let randomstring = '';
//         for (let i = 0; i < string_length; i++) {
//             let rnum = Math.floor(Math.random() * chars.length);
//             randomstring += chars.substring(rnum, rnum + 1);
//         }
//         return randomstring;
//     }

//     let registerAlias = () => {
//         return new Promise((resolve, reject) => {
//             stoken().then((token) => {
//                 let data = { url: location.hostname };
//                 let json = JSON.stringify(data);
//                 let xhr = new XMLHttpRequest();
//                 xhr.open("POST", url + 'alias', true);
//                 xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//                 xhr.setRequestHeader('Authorization', token)
//                 xhr.onload = function () {
//                     let alias = JSON.parse(xhr.responseText);
//                     if (xhr.readyState == 4 && xhr.status == "200") {
//                         // console.log(alias);
//                         resolve(alias.data.alias)
//                     } else {
//                         console.error(alias);
//                         registerAlias(siteurl);
//                     }
//                 }
//                 xhr.send(json);
//             })
//         }).catch((err) => {
//             resolve('')
//         })

//     }


//     //get token 
//     let stoken = () => {
//         return new Promise((resolve, reject) => {
//             chrome.storage.sync.get(['sessionToken'], (token) => {
//                 if (token)
//                     resolve(token.sessionToken);
//                 else
//                     reject('no token');
//             })
//         })


//     }

    $(document).on('click', '.jinnmail-icon-button', (e) => {
        // console.log(e)
        // console.log(e.target.value)
        e.preventDefault();
        chrome.runtime.sendMessage({ url: location.hostname, value: e.target.value, res: 'ok', buttonIcon: buttonIcon }, (res) => {
        });
    });

//     $(document).delegate(".onoff", "click", function (e) {
//         e.stopImmediatePropagation();
//         // console.log(e, e.currentTarget.id, "hi")
//         let currentSitu = e.currentTarget.classList.contains('bootstrap-switch-on') ? true : false;
//         if (currentSitu) {
//             e.currentTarget.classList.remove('bootstrap-switch-on');
//             e.currentTarget.classList.add('bootstrap-switch-off');
//             let p = changeStatus(!currentSitu, e.currentTarget.id)
//         } else {
//             e.currentTarget.classList.remove('bootstrap-switch-off');
//             e.currentTarget.classList.add('bootstrap-switch-on');
//             let p = changeStatus(!currentSitu, e.currentTarget.id)
//         }
//     });

//         //remove Alias

//         $(document).delegate("#remAlias", "click", function (e) {
//             // console.log(e, "remove")
//             e.currentTarget.parentElement.parentElement.nextSibling.classList.add('__visible');
//         });
    
//         $(document).delegate(".yes_cnfrm", "click", function (e) {
//             // console.log(e, "remove yes")
//             let id = e.currentTarget.id.split('_')[1];
//             // console.log(id)
//             let p = removeAlias(id)
//         });
    
//         $(document).delegate(".no_cnfrm", "click", function (e) {
//             // console.log(e, "remove no")
//             e.currentTarget.parentElement.parentElement.classList.remove('__visible')
    
//         });
    
//         let copyToClipboard = (email) => {
//             // console.log('here', email)
        
//             var aux = document.createElement("input");
        
            
//             aux.setAttribute("value", email);
        
//             // Append it to the body
//             document.body.appendChild(aux);
        
//             // Highlight its content
//             aux.select();
        
//             // Copy the highlighted text
//             document.execCommand("copy");
        
//             // Remove it from the body
//             document.body.removeChild(aux);
//         }

//         $(document).delegate(".copy-clip", "click", function (e) {
//             // console.log(e, "remove no")
//             let email=e.currentTarget.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerText;
//             copyToClipboard(email)
    
//         });


//     let changeStatus = (val, id) => {
//         return new Promise((resolve, reject) => {
//             stoken().then((token) => {
//                 let sendObj = { "status": val, aliasId: id }
//                 sendObj = JSON.stringify(sendObj);
//                 // console.log(sendObj)
//                 $.ajax({
//                     type: "PUT",
//                     url: url + 'alias/status',
//                     beforeSend: function (request) {
//                         request.setRequestHeader("Authorization", token);
//                     },
//                     data: sendObj,
//                     success: (success) => {
//                         // console.log(success);
//                     },
//                     error: (err) => {
//                         // alert(err.responseJSON.error)
//                         // console.log(err)
//                     },
//                     contentType: 'application/json'
//                 })
//             })

//         })
//     }

//     let removeAlias = (id) => {
//         return new Promise((resolve, reject) => {
//             stoken().then((token) => {
//                 $.ajax({
//                     type: "DELETE",
//                     url: url + 'alias/' + id,
//                     beforeSend: function (request) {
//                         request.setRequestHeader("Authorization", token);
//                     },

//                     success: (success) => {
//                         // console.log(success);
//                         $('#append-mails-web').empty();
//                         init();
//                     },
//                     error: (err) => {
//                         // alert(err.responseJSON.error)
//                         // console.log(err)
//                     },
//                     contentType: 'application/json'
//                 })
//             })
//         })
//     }

//     // $("#searchedInput").on("keyup", function () {
//     //     var value = $(this).val().toLowerCase();
//         // console.log("search value", value);
//     //     $(".burner-content").children().each(function (d,i) {
//     //         var str1 = $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)[0].innerHTML;
//     //         var str2 = value;
//             // console.log("found...", str1)
//     //         if (str1.indexOf(str2) != -1) {
//                 // console.log("Here..."+str2);
//     //         }
//     //     });
//     // });

//     $("#searchedInput").on("keyup", function () {
//         var value = $(this).val().toLowerCase();
//         console.log("search value", value);
//         $(".burner-content").children().each(function (d,i) {
//             var str1 = $(this).children().toggle($(this).text().toLowerCase().indexOf(value) > -1)[0].innerHTML;
//         });
//     });

//     /* login web */

//     $('#btn-login').click(() => {
//         let password = $('#key').val();
//         let email = $('#email').val();
//         let isValidEmail = isEmail(email);
//         $(".email-web-error").hide();
//         $(".password-web-error").hide();
//         if (email == '' || password == '' || !isValidEmail || password.length < 8) {
//             $('input[name="email"],input[type="password"]').css("border", "1px solid red");
//             $('input[name="email"],input[type="password"]').css("box-shadow", "0 0 1px red");
//         }
//         else {
//             $('input[name="email"],input[type="password"]').css("border", "2px solid #C4CCD1");
//             $('input[name="email"],input[type="password"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
//             $(".credintials-error").hide();
//             // console.log(email, password);
//             let data = { email: email, password: password };
//             data = JSON.stringify(data);
//             $.ajax({
//                 type: "POST",
//                 url: url + 'user/session',
//                 data: data,
//                 success: (success) => {
//                     // console.log(success)
//                     $(".success-msg").show();
//                     // console.log(success.data.sessionToken)
//                     chrome.storage.sync.set({ sessionToken: success.data.sessionToken, isLogged: 1 }, function () {
//                         // console.log('Value is set to ');
//                         // window.location.href = '../pages/dashboard.html';
//                         chrome.runtime.sendMessage({ from: 'content_script', message: success.data.sessionToken });
//                         window.location.href = JM_DASHBOARD_URL;
//                         // window.location.href = 'https://jinnmaildash.herokuapp.com/index.html';
//                         // window.location.href = 'http://localhost:8000/index.html';
//                         // window.location.href = 'http://localhost/jinnmail-dash/index.html';
                        
//                     });
//                 },
//                 error: (err) => {
//                     // alert(err.responseJSON.error)
//                     // console.log(err)
//                     $(".credintials-error").text(err.responseJSON.error)
//                     $(".credintials-error").show()
//                 },
//                 contentType: 'application/json'
//             });
//         }
//         if (password.length < 8) {
//             $('input[name="email"]').css("border", "2px solid #C4CCD1");
//             $('input[name="email"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
//             $(".password-web-error").show();
//             $(".credintials-error").hide();
//         }
//         else {
//             $(".password-web-error").hide();
//             $(".credintials-error").hide();
//             $('input[type="password"]').css("border", "2px solid #C4CCD1");
//             $('input[type="password"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
//         }
//         let userEmail = $("#email").val();
//         var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//         if (!regex.test(userEmail)) {
//             $(".email-web-error").show();
//             $(".credintials-error").hide();
//             $('input[type="emali"]').css("border", "2px solid red");
//             $('input[type="email"]').css("box-shadow", "0 0 3px red");
//         }
//         else {
//             $(".email-web-error").hide();
//             $(".credintials-error").hide();
//             $('input[type="email"]').css("border", "2px solid #C4CCD1");
//             $('input[type="email"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
//         }
//     });

//     let isEmail = (email) => {
//         var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//         return regex.test(email);
//     }
});
