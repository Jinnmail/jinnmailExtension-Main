console.log('background js');

let generateMaskHandler = (info, tab) => {
    let domain = getDomain(info.pageUrl);
    let token = randomString(6);
    let email_address = domain + '.' + token + '@jinnmail.com'
    var js = "if (document.activeElement != undefined) document.activeElement.value = '" + email_address + "';document.activeElement.dispatchEvent(new Event('input'))";
    chrome.tabs.executeScript(null, {
        allFrames: true,
        code: js
    });
}

//Listener from content script

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
    let domain = getDomain(sender.url);
    let token = randomString(6);
    let email_address = domain + '.' + token + '@jinnmail.com'
    let js = "if (document.activeElement != undefined) if(document.getElementsByClassName('jnmbtn-inpt').length){document.getElementsByClassName('jnmbtn-inpt')[0].value= '" + email_address + "';document.getElementsByClassName('jnmbtn-inpt')[0].dispatchEvent(new Event('input'))}";
    chrome.tabs.executeScript(null, {
        allFrames: true,
        code: js
    });
});

//End

// context menu events
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create(
        { "title": "Generate a jinnmail for this field", "contexts": ["editable"], "id": "jinnmail" }
    );
});

chrome.contextMenus.onClicked.addListener(generateMaskHandler);

//context menu event End

//parsing domain name 
let getHostName = (url) => {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    }
    else {
        return null;
    }
}

//end

// generating a random number 

let randomString = (string_length) => {
    let chars = "0123456789abcdefghiklmnopqrstuvwxyz";
    let randomstring = '';
    for (let i = 0; i < string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}


let getDomain = (url) => {
    let hostName = getHostName(url);
    let domain = hostName;

    if (hostName != null) {
        let parts = hostName.split('.').reverse();

        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];

            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                domain = parts[2] + '.' + domain;
            }
        }
    }

    return domain.split('.')[0];
}
//end