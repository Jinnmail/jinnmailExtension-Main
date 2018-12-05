console.log('content script jinnmail loaded');

$(document).ready(() => {
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
                let buttonIcon = document.createElement('button');
                buttonIcon.className = "jinmail-icon-button";
                buttonIcon.id = "jnnmbtn";
                divIcon.appendChild(buttonIcon);
                input.appendChild(divIcon);
                input.parentNode.insertBefore(divIcon, input.nextSibling);
                input.parentNode.style.position = "relative";
            }
        }
    }, 1000);

    $(document).on('click', '#jnnmbtn', (e) => {
        console.log(e)
        e.preventDefault();
        chrome.runtime.sendMessage({ url: location.hostname, res: 'ok' }, (res) => {
            //console.log(res)
        });
    });
});
