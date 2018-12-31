console.log('popup js');
$('document').ready(() => {

    chrome.storage.sync.get(['sessionToken'], (result) => {
        if (result.sessionToken) {
            window.location.href = '../pages/dashboard.html';
        }

    });



    let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
    // let url = 'http://localhost:9001/api/v1/'
    $('#logInButton').click(() => {
        let password = $('#loginDialogPassword').val();
        let email = $('#loginDialogEmail').val();
        let isValidEmail = isEmail(email);
        console.log(isValidEmail)
        if (email == '' || password == '' || !isValidEmail || password.length < 8) {
            $('input[type="email"],input[type="password"]').css("border", "1px solid red");
            $('input[type="email"],input[type="password"]').css("box-shadow", "0 0 1px red");
        }
        else {
            console.log(email, password);
            let data = { email: email, password: password };
            data = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: url + 'user/session',
                data: data,
                success: (success) => {
                    console.log(success)
                    $(".success-msg").show();
                    console.log(success.data.sessionToken)
                    chrome.storage.sync.set({ sessionToken: success.data.sessionToken, isLogged: 1 }, function () {
                        console.log('Value is set to ');
                        window.location.href = '../pages/dashboard.html';
                    });
                },
                error: (err) => {
                    // alert(err.responseJSON.error)
                    console.log(err)
                    $(".credintials-error").text(err.responseJSON.error)
                    $(".credintials-error").show()
                },
                contentType: 'application/json'
            });
        }
        if ($("#loginDialogPassword").val().length < 8) {
            $(".password-error").show();
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

    $("#loginDialogPassword").keyup(function () {

        if ($("#loginDialogPassword").val().length > 8) {
            $(".password-error").hide();
            $('input[type="password"]').css("border", "1px solid #C4CCD1");
            $('input[type="password"]').css("box-shadow", "none");
        }
    });

    $('#newToLastPass').click(() => {
        console.log('here');
        window.location.href = './pages/signup.html'
    });

    $('#newToLastPassLogin').click(() => {
        window.location.href = '../popup.html'
    });



    $('#signUpButton').click(() => {
        let password = $('#signUpDialogPassword').val();
        let email = $('#signUpDialogEmail').val();
        let isValidEmail = isEmail(email);
        console.log(isValidEmail)
        if (email == '' || password == '' || !isValidEmail || password.length < 8) {
            $('input[type="text"],input[type="password"]').css("border", "1px solid red");
            $('input[type="text"],input[type="password"]').css("box-shadow", "0 0 1px red");
        } else {
            console.log(email, password);
            let data = { email: email, password: password };
            data = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: url + 'user',
                data: data,
                success: (success) => {
                    console.log(success)
                    $(".credintials-error").hide()
                    $(".success-msg").show()
                },
                error: (err) => {
                    console.log(err)
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

        if ($("#signUpDialogPassword").val().length > 8) {
            $(".password-error").hide();
            $('input[type="password"]').css("border", "1px solid #C4CCD1");
            $('input[type="password"]').css("box-shadow", "none");
        }
    });

    let isEmail = (email) => {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }


});

