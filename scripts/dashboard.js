$('document').ready(() => {
    $('#logoutIcon').click((e) => {
        chrome.storage.sync.clear(() => {
            window.location.href = '../popup.html'
        })
    })
})