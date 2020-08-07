// console.log('background js');

const JM_DASHBOARD_URL = 'https://account.jinnmail.com', JM_API_URL = 'https://whatismyname2.xyz/api/v1/'; // 'https://jinnmailapp.herokuapp.com/api/v1/';
// const JM_DASHBOARD_URL = 'https://testling.xyz', JM_API_URL = 'https://api.testling.xyz/api/v1/';
// const JM_DASHBOARD_URL = 'http://localhost:8000', JM_API_URL = 'http://localhost:3000/api/v1/';

let url = JM_API_URL;

// let url = 'https://jinnmailapp.herokuapp.com/api/v1/';
// let url = 'http://localhost:3000/api/v1/';
// let url = 'http://localhost:9001/api/v1/'
let generateMaskHandler = (info, tab) => {
    // let domain = getDomain(info.pageUrl);
    // let token = randomString(6);
    // let email_address = domain + '.' + token + '@jinnmail.com'
    registerAlias(info.pageUrl).then((data) => {
        let email_address = data;
        var js = "if (document.activeElement != undefined) document.activeElement.value = '" + email_address + "';document.activeElement.dispatchEvent(new Event('input'))";
        chrome.tabs.executeScript(null, {
            allFrames: true,
            code: js
        });
    })
}

//Listener from content script

let aliasList = {};

chrome.runtime.onMessage.addListener(async (response, sender, sendResponse) => {
    // let domain = getDomain(sender.url);
    // let token = randomString(6);
    // let email_address = domain + '.' + token + '@jinnmail.com'
    if (response.from == 'content_script') {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var js = `localStorage.setItem('jinnmailToken', '${response.message}');`;
            chrome.tabs.executeScript({
                allFrames: true,
                code: js
            });
        });
    } else if (response.buttonIcon == 'cust') {
        console.log('response')
        registerAlias(response.url, response.source).then((data) => {
            let email_address = data;
            // console.log(email_address)
            let js = "if (document.activeElement != undefined) if(document.getElementsByClassName('jnmbtn-inpt').length){document.getElementsByClassName('jnmbtn-inpt')[0].value= '" + email_address + "';document.getElementsByClassName('jnmbtn-inpt')[0].dispatchEvent(new Event('input'))}";
            chrome.tabs.executeScript(null, {
                allFrames: true,
                code: js
            });
        })
    } else {
        // console.log("response", response)
        chrome.storage.sync.get(['isLogged'], result => {
            console.log(result);
            if(result.isLogged)
            {
                console.log("Logged...")
                chrome.storage.local.get(['alias'], (token) => {
                    function registerNewAlias(){
                        registerAlias(response.url).then((data) => {
                            let email_address = data;
                            // console.log(email_address)
                            let js = `if (document.activeElement != undefined) if(document.getElementsByClassName('jnmbtn-inpt').length){document.querySelector('input[temp = "${response.value}"]').value='${email_address}';document.querySelector('input[temp = "${response.value}"]').dispatchEvent(new Event('input'))}`;
                            // $("#succMsg").append(`${email_address}`);
                            chrome.tabs.executeScript(null, {
                                allFrames: true,
                                code: js
                            });                         
                            chrome.storage.local.set({"alias":`${response.value} ${email_address}`}, () => {
                                console.log("Alias generated...");
                            })                 
                            aliasList[response.value]=email_address;
                        })
                    }
                    if(!token.alias)
                    {
                        registerNewAlias();
                    }
                    else
                    {
                        let temp = false;
                        let index = token.alias.substring(0,token.alias.indexOf(" "));
                        token = token.alias.substring((token.alias.indexOf(" ")+1),token.alias.length);
                        // console.log("Index:"+index,"Token:"+token);
                        for(x in aliasList)
                        {
                            if(x===response.value)
                                temp = true;
                        }
                        if(temp)
                        {
                            let js = `if (document.activeElement != undefined) if(document.getElementsByClassName('jnmbtn-inpt').length){document.querySelector('input[temp = "${response.value}"]').value='${aliasList[response.value]}';document.querySelector('input[temp = "${response.value}"]').dispatchEvent(new Event('input'))}`;
                            // $("#succMsg").append(`${email_address}`);
                            chrome.tabs.executeScript(null, {
                                allFrames: true,
                                code: js
                            });                       
                        }               
                        else{
                            registerNewAlias();
                        }
                    }
                })                
            }
            else
            {
                alert("Please login to Jinnmail to continue...")              
            }
        })  
    }

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

//registration of alias

let registerAlias = (siteurl, sourceType) => {
    console.log(siteurl+" ================= "+sourceType)
    return new Promise((resolve, reject) => {
        stoken().then((token) => {
            let data = { url: siteurl, source: sourceType };
            let json = JSON.stringify(data);
            console.log("JSON DATA: "+json);    
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url + 'alias', true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.setRequestHeader('Authorization', token)
            xhr.onload = function () {
                let alias = JSON.parse(xhr.responseText);
                console.log("ALias: " + alias)
                if (xhr.readyState == 4 && xhr.status == "200") {
                    // console.log(alias);
                    resolve(alias.data.alias)
                } else {
                    console.error(alias);
                    reject();
                    // registerAlias(siteurl, sourceType);
                }
            }
            xhr.send(json);
        })
    }).catch((err) => {
        resolve('')
    })

}


//end

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

//end