// console.log('popup js');
$('document').ready(() => {
    // const JM_DASHBOARD_URL = 'https://account.jinnmail.com', JM_API_URL = 'https://whatismyname2.xyz/api/v1/'; // 'https://jinnmailapp.herokuapp.com/api/v1/';
    // const JM_DASHBOARD_URL = 'https://testling.xyz', JM_API_URL = 'https://api.testling.xyz/api/v1/';
    const JM_DASHBOARD_URL = 'http://localhost:3001', JM_API_URL = 'http://localhost:3000/api/v1/';

    chrome.storage.local.get("verifyCode", function(res) {
      if (res.verifyCode === true) {
        window.location.href = '../pages/verificationCode.html';
        // chrome.storage.local.set({"verifyCode": false}, function() {})
      }
    });

    // alert(localStorage.getItem('verifyCode'))
    // if (localStorage.getItem('verifyCode')) {
    //   window.location.href = '../pages/verificationCode.html';
    //   localStorage.setItem('verifyCode', false);
    // }

    function decoder(base64url) {
        try {
            //Convert base 64 url to base 64
            var base64 = base64url.replace('-', '+').replace('_', '/')
            //atob() is a built in JS function that decodes a base-64 encoded string
            var utf8 = atob(base64)
            //Then parse that into JSON
            var json = JSON.parse(utf8)
            //Then make that JSON look pretty
            var json_string = JSON.stringify(json, null, 4)
        } catch (err) {
            json_string = "Bad Section.\nError: " + err.message
        }
        return json_string
    }

    let url = JM_API_URL;

    var em = localStorage.getItem('loggedIn_email');
    var ps = localStorage.getItem('loggedIn_pass');
    // console.log('Stored...Data',em,ps)

    var emailOld = localStorage.getItem('email');
    var passOld = localStorage.getItem('pass');

    if(emailOld && emailOld.length > 0){
        $('#signUpDialogEmail').val(emailOld);
        $('#loginDialogEmail').val(emailOld);
    }
    if(passOld && passOld.length > 0){
        $('#signUpDialogPassword').val(passOld);
        $('#loginDialogPassword').val(passOld);
    }
    chrome.storage.sync.get(['sessionToken','verified'], (result) => {
        const jinnmailToken = JSON.parse(atob(result.sessionToken.split('.')[1]));
        if (Date.now() >= jinnmailToken.exp * 1000) {
            return
        }
        if (result.sessionToken) {
            window.location.href = '../pages/dashboard.html';
        }else if(result.verified==false){
            window.location.href = '../pages/verificationCode.html';
        }
    });

    let v_em = localStorage.getItem("verifiedEmail");
    if (v_em){
        $('#loginDialogEmail').val(v_em);
    }

    
    // clearing local storage
    localStorage.clear();

    // let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
    // let url = 'http://localhost:3000/api/v1/';
    // let url = 'http://localhost:9001/api/v1/'
    $('#logInButton').click(() => {
        // clearing local storage
        localStorage.clear();
        // var emailOld = $("#loginDialogEmail").val();
        // var passOld = $("#loginDialogPassword").val();
        // localStorage.setItem(
        //     'loggedIn_email', emailOld,
        // );
        // localStorage.setItem(
        //     'loggedIn_pass', passOld
        // );

        let password = $('#loginDialogPassword').val();
        let email = $('#loginDialogEmail').val();
        let isValidEmail = isEmail(email);
        // console.log(isValidEmail)
        if (email == '' || password == '' || !isValidEmail || password.length < 8) {
            $("#result").hide();
            $('input[type="email"],input[type="password"]').css("border", "1px solid red");
            $('input[type="email"],input[type="password"]').css("box-shadow", "0 0 1px red");
        }
        else {
            // console.log(email, password);
            let data = { email: email, password: password };
            data = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: url + 'user/session',
                data: data,
                success: (success) => {
                    // console.log(success)
                    $(".credintials-error").hide();
                    $(".success-msg").show();
                    // console.log(success.data.sessionToken)
                    chrome.storage.sync.set({ sessionToken: success.data.sessionToken, isLogged: 1 ,email:email }, function () {
                        // console.log('Value is set to ');
                        window.location.href = '../pages/dashboard.html';
                    });
                },
                error: (err) => {
                    // alert(err.responseJSON.error)
                    // console.log(err)
                    if(err.responseJSON.status=="403"){
                        chrome.storage.sync.set({ email:email }, function () {
                            // console.log('Value is set to ');
                            window.location.href = '../pages/verificationCode.html';
                        });
                    }

                   
                    $(".credintials-error").text(err.responseJSON.error)
                    $(".credintials-error").show()
                },
                contentType: 'application/json'
            });
        }
        if ($("#loginDialogPassword").val().length < 8) {
            // $(".password-error").show();
        }
        else {
            $(".password-error").hide();
            $('input[type="password"]').css("border", "2px solid #C4CCD1");
            $('input[type="password"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
        }
        let userEmail = $("#loginDialogEmail").val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!regex.test(userEmail)) {
            $(".email-error").show();
            $('input[type="emali"]').css("border", "2px solid red");
            $('input[type="email"]').css("box-shadow", "0 0 3px red");
        }
        else {
            $(".email-error").hide();
            $('input[type="email"]').css("border", "2px solid #C4CCD1");
            $('input[type="email"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
        }
    });

    $("#loginDialogEmail").keyup(function () {
        let userEmail = $("#loginDialogEmail").val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (regex.test(userEmail)) {
            $(".email-error").hide();
            $('input[type="email"]').css("border", "1px solid #C4CCD1");
            $('input[type="email"]').css("box-shadow", "none");
        }
    });

    $("#loginDialogPassword").keyup(function (event) {

        // $('#result').html(checkPasswordStrength($("#loginDialogPassword").val()))

        if(event.key == "Enter"){
            $('#logInButton').click();
        }
        if ($("#loginDialogPassword").val().length > 8) {
            $(".password-error").hide();
            $('input[type="password"]').css("border", "1px solid #C4CCD1");
            $('input[type="password"]').css("box-shadow", "none");
        }
    });

    checkPasswordStrength = (password) => {
        var strength = 0
        $(".password-error").hide();
        if (password.length == 0) {
            $(".password-error").hide();
            $("#result").hide();
            $("#result").removeClass();
            return "";
        } else if(password.length < 8){
            $('#result').removeClass();
            $("#result").hide();
            $(".password-error").show();
        } else {
            if (password.length > 7) strength += 1
            // If password contains both lower and uppercase characters, increase strength value.
            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
            // If it has numbers and characters, increase strength value.
            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
            // If it has one special character, increase strength value.
            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
            // If it has two special characters, increase strength value.
            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
    
            // Calculated strength value, we can return messages
            // If value is less than 2
            // console.log(strength)
            if (strength < 4) {
                $('#result').removeClass()
                $('#result').addClass('weak')
                $("#result").show();
                return ' Weak'
            // } else if (strength == 2 || strength < 4) {
            //     $('#result').removeClass()
            //     $('#result').addClass('stronger')
            //     $("#result").show();
            //     return ' Stronger'
            } else if(strength == 4 || strength > 4){
                $('#result').removeClass()
                $('#result').addClass('strongest')
                $("#result").show();
                return ' Strong'
            }
        }
    }

    $('#newToLastPass').click(() => {
        var emailOld = $("#loginDialogEmail").val();
        var passOld = $("#loginDialogPassword").val();
        localStorage.setItem(
            'email', emailOld,
        );
        localStorage.setItem(
            'pass', passOld
        );
        window.location.href = './pages/signup.html'
    });

    $('#newToLastPassLogin').click(() => {
        var emailOld = $("#signUpDialogEmail").val();
        var passOld = $("#signUpDialogPassword").val();
        localStorage.setItem(
            'email', emailOld,
        );
        localStorage.setItem(
            'pass', passOld
        );
        window.location.href = '../popup.html'
    });



    $('#signUpButton').click(() => {
        // clearing local storage
        localStorage.clear();
        let password = $('#signUpDialogPassword').val();
        let email = $('#signUpDialogEmail').val();
        let isValidEmail = isEmail(email);
        // console.log(isValidEmail)
        let isValidPassword = isPassword(password);
        if (email == '' || password == '' || !isValidEmail || !isValidPassword) {
            if(!email){
                $('input[type="text"]').css("border", "1px solid red");
                $('input[type="text"]').css("box-shadow", "0 0 1px red");
                $(".credintials-error").text("Email can't be empty.")
                $(".credintials-error").show()
            }
            else if(!password){
                $('input[type="password"]').css("border", "1px solid red");
                $('input[type="password"]').css("box-shadow", "0 0 1px red");
                $(".credintials-error").text("Password can't be empty.")
                $(".credintials-error").show()
            }
            else if(!isValidEmail)
            {
                $('input[type="text"]').css("border", "1px solid red");
                $('input[type="text"]').css("box-shadow", "0 0 1px red");
                $(".credintials-error").text("Email format mis-matched.")
                $(".credintials-error").show()
            }
            else if(!isValidPassword)
            {
                $('input[type="password"]').css("border", "1px solid red");
                $('input[type="password"]').css("box-shadow", "0 0 1px red");
                {$(".credintials-error").text("Password format mis-matched.")
                $(".credintials-error").show()}
            }
        } else {
            // console.log(email, password);
            let data = { email: email, password: password };
            data = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: url + 'user',
                data: data,
                success: (success) => {
                    // console.log(success)
                    $(".credintials-error").hide()
                    $(".success-msg").show();
                    chrome.storage.sync.set({ verified:false,email:email }, function () {
                        // console.log('Value is set to ');
                        chrome.storage.local.set({"verifyCode": true}, function() {})
                        // chrome.storage.local.get("verifyCode", function(res) {
                        //   if (res.verifyCode === true) {
                        //     chrome.storage.local.set({"verifyCode": false}, function() {})
                        //   } else {
                        //     chrome.storage.local.set({"verifyCode": true}, function() {})
                        //   }
                        // });
                        window.location.href = '../pages/verificationCode.html';
                    });
                },
                error: (err) => {
                    // console.log(err)
                    $(".credintials-error").text(err.responseJSON.error.message)
                    // $(".credintials-error").show()
                    $(".credintials-error").text("Email Already Exists")
                    $(".success-msg").hide()
                    $(".credintials-error").show()
                },
                contentType: 'application/json'
            });
        }

        if ($("#signUpDialogPassword").val().length < 8) {
            $(".password-error").show();
        }
        else {
            $(".password-error").hide();
            $('input[type="password"]').css("border", "2px solid #C4CCD1");
            $('input[type="password"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
        }
        let userEmail = $("#signUpDialogEmail").val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!regex.test(userEmail)) {
            $(".email-error").show();
            $('input[type="emali"]').css("border", "2px solid red");
            $('input[type="email"]').css("box-shadow", "0 0 3px red");
        }
        else {
            $(".email-error").hide();
            $('input[type="email"]').css("border", "2px solid #C4CCD1");
            $('input[type="email"]').css("box-shadow", "0 0 3px rgba(140, 150, 157, .3)");
        }

       


    });

    $("#signUpDialogEmail").keyup(function(){
        let userEmail = $("#signUpDialogEmail").val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (regex.test(userEmail)) {
            $(".email-error").hide();
            $('input[type="text"]').css("border", "1px solid #C4CCD1");
            $('input[type="text"]').css("box-shadow", "none");
        }
    });

    $("#signUpDialogPassword").keyup(function () {

        $('#result').html(checkPasswordStrength($("#signUpDialogPassword").val()))

        // if ($("#signUpDialogPassword").val().length > 8) {
        //     $(".password-error").hide();
        //     $('input[type="password"]').css("border", "1px solid #C4CCD1");
        //     $('input[type="password"]').css("box-shadow", "none");
        // }
    });

    let isEmail = (email) => {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    let isPassword = password => {
        let regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/;
        return regex.test(password);
    }
    $('#forgotPassword').click(() => {
        $('#forgetPasswordSubmit').show();
        $('#forgetPasswordTitle').show();
        $('#reLogin').show();
        $('#sep').show();
        $('.credintials-error').hide();
        $('#loginTitle').hide();
        $('#loginPassword').hide();
        $('#loginButton').hide();
        $('#forgotPassword').hide();
    });

    $('#forgetPasswordSubmit').click(() => {
        let email = $('#loginDialogEmail').val();
        let isValidEmail = isEmail(email);
        // console.log(isValidEmail)
        if (email == '' || !isValidEmail ) {
            $("#result").hide();
            $('input[type="email"]').css("border", "1px solid red");
            $('input[type="email"]').css("box-shadow", "0 0 1px red");
        } else {
            let data = { email: email};
            data = JSON.stringify(data);
            // console.log("Request generated. Email: ", email);
            $.ajax({
                type: "POST",
                url: url + 'user/forgot/password',
                data: data,
                success: (success) => {
                    // console.log(success);

                     $(".success-msg").text('an email is sent ')
                    $(".success-msg").show()
                },
                error: (err) => {
                    // console.log(err)
                   
                },
                contentType: 'application/json'
            });
        }
    });

    $('#reLogin').click(() => {
        window.location.href = '../popup.html'
    });

});

