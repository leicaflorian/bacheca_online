var oauth = {};
oauth.instance = null;
oauth.ready = false;
oauth.profile = {};

/*
 Access oAuth2 Functions
 */
loadGapiAuth2 = function () {
    oauth.ready = true;

    gapi.load('client:auth2', initAuth);
};

function initAuth() {
    gapi.auth2.init({
        client_id: oauth.id,
        scope: oauth.scopes
    }).then(function () {
        oauth.instance = gapi.auth2.getAuthInstance();
        oauth.instance.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(oauth.instance.isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    console.log("isSignedIn = " + isSignedIn);
    if (isSignedIn) {
        oauth.profile = oauth.instance.currentUser.get().getBasicProfile();

        user = oauth.profile;
        setSignedIn_status();
    } else {
        user = null;
        setSignedOut_status();
    }
}
function handleAuthClick(event) {
    oauth.instance.signIn();
}
function handleSignoutClick(event) {
    oauth.instance.signOut();

    setSignedOut_status();
}

setSignedIn_status = function () {
    mainMenu.loadUserData();

    new GapiFiles().getPropertyFolders(mainFolderId, function(resp){
        new Folder().elaboratePropertyFolders(resp.items);
    });
};
setSignedOut_status = function () {
    var folder = new Folder();
    oauth.profile = {};

    mainMenu.unloadUserData();

    //RImuove tutte le cartelle private ed i relativi fav files
    folder.removePrivateFolders();
    folder.updateAllFoldersButtonsState("reader");
};

