var congregation = "";
var files;
var file_template = "";
var folder_template = "";
var mainFolderId = "";
var api_key;
var main_url;
var gapiclient;
var body_ready = false;
var oauth_ready = false;
var folders_ready = false;
var main_info_ready = false;
var popup = {};
var fav_folder;
var fCounter = {};
var commento_template;
var user;
var mainMenu;

// Funzione che avviene una volta completamente caricata la pagina.	
$("body").ready(function (ev) {
    console.log("*** body ready ***");
    
    
    body_ready = true;

    if (main_info_ready) {
        if (oauth_ready == false) {
            /*
             * Carica ed avvia l'autenticazione tramite oAuth2
             */
            oauth_ready = true;

            loadGapiAuth2(); // inizia il login per l'utente;
        }
        if (folders_ready == false) {
            /*
             * Mostra i file contenuti in ogni cartella, aggiungendoli alle rispettive "section"
             */
            folders_ready = true;

            getMainMenu();
            showFoldersContent();
        }
    }

    /**
     * Inizializza l'elemento MainMenu riferendosi alla sua classe.
     */
    mainMenu = new MainMenu();
});

/**
 * Funzione quando avviene il resize della pagina. 
 */
$(window).on('resize', function () {
    $.each($(".list"), function (index, item) {
        $(item).trigger("scroll");
    });
});

/**
 * Recupera dal server locale i dati relativi ai template del vari componenti e dei dati di accesso Google Drive 
 * @param {Function} callback
 */
getMainInfo = function (callback) {
    congregation = $(".main").attr("cong");

    $.get("/getTemplates", {cong: congregation}, function (data) {
        file_template = data.file;
        folder_template = data.folder;
        mainFolderId = data.mainFolderId;
        api_key = data.api_key;
        main_url = data.main_url;
        popup.index = data.popup;
        popup.rename = data.popup_rename;
        popup.delete = data.popup_delete;
        popup.insert = data.popup_insert;
        popup.commentDelete = data.popup_commentdelete;
        popup.commentEdit = data.popup_commentedit;
        popup.permissions = data.popup_permissions;
        popup.permissionsEntry = data.popup_permissionsentry;
        popup.mainfolderrename = data.popup_mainfolderrename;
        fav_folder = data.fav_folder;
        commento_template = data.commento;

        callback();
    }, "json");
};

/**
 * Avvia il caricamento dele Google API
 * @param {Function} callback
 */
initGapi = function (callback) {
    gapi.load('client', function () {
        gapi.client.init({
            'apiKey': api_key,
            'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v2/rest']
        }).then(function () {
            console.log("gapi loaded");

            gapiclient = gapi.client.drive;

            callback();
        });
    });
};

/**
 * Recupera dal server locale i dati necessari per l'oAuth2 di Google
 * @param {Function} callback
 */
getOauthData = function (callback) {
    $.post("/oauth2", {fields: ["oauthid", "scopes"], cong: congregation})
            .done(function (data) {
                data = $.parseJSON(data);
                oauth.id = data.oauthid;
                oauth.scopes = data.scopes;

                callback();
            });
};

/**
 * Mostra l'animazione del caricamento aggiungendolo ad un "target" che viene indicato come parametro<br>
 * Lo spinner è gestito tramite jQuery da una libreria separata: jRoll.
 * @param {jQuery Reference} target
 */
showLoadingSpinner = function (target) {
    /* target.append('	<div class="loadingAnimation"></div>');
     target.find(".loadingAnimation").jRoll({
     animation: "jumpdots",
     radius: 50,
     colors: ["#262626"],
     monocolor:true
     }); */
};
/**
 * Nasconde l'animazione del caricamento rimuovendola da un "target" che viene indicato come parametro<br>
 * Lo spinner è gestito tramite jQuery da una libreria separata: jRoll.
 * @param {jQuery Reference} target
 */
hideLoadingSpinner = function (target) {
    target.removeClass("loading");
    target.find(".mdl-spinner").remove();
};

/*
 * Inizia a recuperare tutti i dati necessari dal server principale
 */
getMainInfo(function () {
    /*
     * Carica le varie API di Google
     */
    initGapi(function () {
        console.log("*** main info ready ***");

        main_info_ready = true;

        /*
         * Carica ed avvia l'autenticazione tramite oAuth2
         */
        getOauthData(function () {
            console.log("*** oauth ready ***");

            oauth_ready = true;

            if (body_ready)
                loadGapiAuth2(); // inizia il login per l'utente;
        });
        /*
         * Mostra i file contenuti in ogni cartella, aggiungendoli alle rispettive "section"
         */
        console.log("*** folders ready ***");

        folders_ready = true;

        if (body_ready) {
            //getMainMenu();
            //showFoldersContent();
            new Folder().startFoldersPopulation();
        }
    });
});
