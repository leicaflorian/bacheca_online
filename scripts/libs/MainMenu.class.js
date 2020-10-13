function MainMenu() {
    /**
     * Aggiunge gli eventi ai vari pulsanti del main menu
     * @returns {undefined}
     */
    function addEvents() {

        $("#mainMenu_btn").click(showMenu);
        $("#mainMenu_close_btn").click(closeMenu);
        $("#tooltip_btn").click(toggleTooltip);

        $("#mainMenu_accedi").click(handleAuthClick);
        $("#mainMenu_esci").click(handleSignoutClick);
    }

    /**
     * Mostra nel menu i dati dell'utente
     * @returns {undefined}
     */
    function showUserData() {
        var menu = $("#mainMenu");
        if (user) {
            menu.find(".userName").text(user.getName());
            menu.find(".userEmail").text(user.getEmail());
            menu.find(".userInfo").removeClass("hidden");

            menu.find("#mainMenu_esci").removeClass("hidden");
            menu.find("#mainMenu_accedi").addClass("hidden");

            menu.find(".genericMessage").addClass("hidden");

            getMainFolderPermissions(showMenuOptions);
        }
    }

    /**
     * Cancella i dati dell'utente dal mainMenu e mostra una scritta generica che invita ad accedere con Gmail.
     * @returns {undefined}
     */
    function hideUserData() {
        var menu = $("#mainMenu");

        menu.find(".userName").text("");
        menu.find(".userEmail").text("");
        menu.find(".userInfo").addClass("hidden");

        menu.find("#mainMenu_esci").addClass("hidden");
        menu.find("#mainMenu_accedi").removeClass("hidden");

        menu.find(".genericMessage").removeClass("hidden");
        menu.find(".noPermissions").addClass("hidden");

        $("#mainMenu .menuItems").html("");
    }

    /**
     * Mostra effettivamente il mainMenu
     * @returns {undefined}
     */
    function showMenu() {
        var tl = new TimelineMax();
        tl.to($("#mainMenuContainer"), .5, {"background-color": "rgba(0,0,0,.7)"}, "start")
                .to($("#mainMenu"), .5, {left: 0}, "start");

        tl.eventCallback("onStart", function () {
            $("body").css("overflow", "hidden");
        });
        tl.eventCallback("onComplete", function () {
            $("#mainMenuContainer").addClass("opened");
        });

        toggleTooltip("off");
    }

    /**
     * Nasconde il MainMenu
     * @returns {undefined}
     */
    function closeMenu() {
        var tl = new TimelineMax();
        tl.to($("#mainMenuContainer"), .5, {"background-color": "rgba(0,0,0,0)"}, "start")
                .to($("#mainMenu"), .5, {left: -250}, "start");

        tl.eventCallback("onComplete", function () {
            $("body").css("overflow", "auto");
            $("#mainMenuContainer").removeClass("opened");
        });

        toggleTooltip("off");
    }

    /**
     * Mostra o nasconde i tooltip dei vari pulsanti del mainMenu.<br>
     * Se si passa il parametro "off", chiude immediatamente i tooltip.
     * @param {String} type
     * @returns {undefined}
     */
    function toggleTooltip(type) {
        var menu = $("#mainMenu");
        var tooltips = menu.find(".tooltip");
        var h = tooltips.height();
        var tl = new TimelineMax();

        if (h > 0) {
            tl.to(tooltips, .5, {height: 0});
        } else if (type === "off") {
            tl.to(tooltips, .5, {height: 0});
        } else {
            tl.to(tooltips, .5, {height: 26});
        }
    }

    /**
     * Recupera il permissionId in base all'email dell'user e poi recupera i permessi dell'utente sulla mainFolder
     * @param {function} callback
     * @returns {undefined}
     */
    function getMainFolderPermissions(callback) {
        var request = gapiclient.permissions.getIdForEmail({
            'email': user.getEmail(),
        });
        request.execute(function (resp) {
            var id = resp.id;

            var request = gapiclient.permissions.get({
                'fileId': mainFolderId,
                'permissionId': id
            });
            request.execute(function (resp) {
                callback(resp)
            });
        });
    }

    /**
     * Aggiunge al mainMenu le varie opzioni selezionabili.
     * Queste vengono aggiunte in base ai permessi dell'utente sulla MainFolder
     * @param {Object} resp
     * @returns {undefined}
     */
    function showMenuOptions(resp) {
        $("#mainMenu .menuItems").html("");

        /**
         * Funzione che permette di rinominare il nome della congregazione.
         * Manca da aggiornare il file sul mio server con i nuovi dati. da fare in un secondo momento.
         * @returns {none}
         */
        function renameCongregation() {
            var pu;
                    
            /**
             * Applica il cambiamento del nome, inoltrando al server google il nuovo nome da impostare.
             * Una volta ricevuta una risposta positiva, aggiorna l'interfaccia.
             * Aggiorna anche il file php contente i dati essenziali della congregazione.
             * @returns {none}
             */
            function apply() {
                var folderTitle = $("#renameInput").val();
                var folderId = $("#puContainer").attr("target");

                if (folderTitle != "") {
                    
                    // Invia ai server Google la richiesta per rinominare la cartella
                    new GapiFiles().renameFolder(folderId, folderTitle, function (resp) {
                        if (!resp.code) {
                            $("main.main .toolbar .text").text("Congregazione " + folderTitle);
                            $("main.main .toolbar").attr("cong", folderTitle);
                            $("main.main").attr("cong", folderTitle.replace(/ /g, "").toLowerCase());

                            congregation = folderTitle.replace(/ /g, "").toLowerCase();

                            //Chiude il popup quando si riceve esito positivo.
                            pu.close();
                        } else {
                            pu.showErrors(resp);
                        }
                    });
                }
            }

            pu = new Popup({
                title: "Cambia nome",
                subtitle: "Immetti un nuovo nome per la congregazione:",
                type: "rename",
                referenceId: mainFolderId,
                applyEvent: apply,
                inputs: [{id: "renameInput", value: $(".main .toolbar").attr("cong")}]}
            );

            // Imposta l'evento del pulsante "OK"
            pu.show();

            //Chiude il Main Menu
            closeMenu();
        }

        /**
         * Cambia i permessi della cartella principale.
         * @returns {none}
         */
        function changePermissions() {
            /**
             * Evento da avviare quando si apre la finestra popup.
             * Carica i vari permessi della cartella.
             * @returns {none}
             */
            function onLoad() {
                var permissions = new Permissions();

                permissions.loadTemplateData(mainFolderId);

                pu.permissions = permissions;
            }

            /**
             * Applica i cambiamenti ai permessi.
             * @returns {none}
             */
            function apply() {
                pu.permissions.applyPermissions();
            }

            var pu = new Popup({
                title: "Cambia permessi",
                subtitle: "Immetti i permessi degli utenti sulla cartella principale:",
                type: "permissions",
                referenceId: mainFolderId,
                onLoad: onLoad,
                applyEvent: apply
            });

            // Imposta l'evento del pulsante "OK"
            pu.show();

            //Chiude il Main Menu
            closeMenu();
        }

        /**
         * Aggiunge una nuova sezione alla cartella principale.
         * @returns {none}
         */
        function addSection() {
            function apply() {
                var folderTitle = pu.getInputValue("renameInput");

                folderTitle = ($(".card").length + 1) + " - " + folderTitle;

                // Invia ai server Google la richiesta per aggiungere la cartella
                new GapiFiles().addFolder(mainFolderId, folderTitle, function (folder) {
                    if (folder.id) {
                        new Folder().add(folder.id, folderTitle);

                        pu.close();
                    }
                    ;
                });
            }
            ;

            var pu = new Popup({
                title: "Aggiungi Sezione",
                subtitle: "Aggiungi una nuova sezione alla cartella principale:",
                type: "rename",
                referenceId: mainFolderId,
                applyEvent: apply,
                inputs: [{id: "renameInput", value: "Nuova Sezione"}]
            });

            // Imposta l'evento del pulsante "OK"
            pu.show();

            //Chiude il Main Menu
            closeMenu();
        }
        
        /**
         * Se l'utente non ha alcun permesso sulla cartella principale,
         * mostra un avviso che non ha permessi e che può solo visualizzare.
         * @returns {none}
         */
        function userHasNoPermissions() {
            $("#mainMenu .noPermissions").removeClass("hidden");
        }

        /**
         * Se l'utente ha i permessi di modificare la cartella principale,
         * nasconde il messaggio dei permessi e mostra le opzioni a sua disposizione.
         * @returns {none}
         */
        function userHasPermissions() {
            $("#mainMenu .noPermissions").addClass("hidden");
        }

        // Se esiste il parametro "code" vuol dire che ha un errore. 
        // L'utente non ha alcun permesso sulla MainFolder se non quello di visualizzare.
        if (resp.code != null) {
            userHasNoPermissions();
        } else {
            // Se è "writer" o "owner" mostra tutte le opzioni
            if (resp.role === "writer" || resp.role === "owner") {
                var menuEntrys = [
                    {label: "Aggiungi Sezione", action: addSection, icon: "&#xE2CC;"},
                    {label: "Cambia Permessi Generali", action: changePermissions, icon: "&#xE7EF;"},
                    {label: "Cambia Nome Congregazione", action: renameCongregation, icon: "&#xE22B;"}
                ];

                $.each(menuEntrys, function (key, obj) {
                    var icon;
                    var entry;

                    if (obj.icon != null) {
                        icon = "<i class='material-icons'>" + obj.icon + "</i>";
                    }
                    ;

                    entry = $("<li>" + icon + "<span>" + obj.label + "</span></li>");

                    if (obj.action != null) {
                        entry.click(obj.action);
                    }
                    ;

                    $("#mainMenu .menuItems").append(entry);
                });

                userHasPermissions();
            } else {// Altrimenti non mostra nulla
                userHasNoPermissions();
            }
        }
    }

    //
    // Funzioni Pubbliche
    //

    /**
     * Avvia il caricamento dei dati nel mainMenu
     * Funzione chiamata dal file "oauth2_scripts.js" quando si effettua il login
     * @returns {undefined}
     */
    this.loadUserData = function () {
        showUserData();
    };
    /**
     * Avvia la cancellazione dei dati dell'utente dal mainMenu
     * Funzione chiamata dal file "oauth2_scripts.js" quando si effettua il loout
     * @returns {undefined}
     */
    this.unloadUserData = function () {
        hideUserData();
    };

    /**
     * Inizializza il MainMenu
     * @returns {undefined}
     */
    function init() {
        addEvents();
    }

    init();
}

