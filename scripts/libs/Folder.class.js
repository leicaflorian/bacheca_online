function Folder() {
    var self;

    /**
     * Recupera il nome della cartella con l'Id passato.
     * I dati li prende dalla pagina html seguendo l'id delle "card".
     * @param {String} folderId
     * @returns {String}
     */
    function getNormalFolderTitle(folderId) {
        var folderTitle = $("<span>" + $("#card_" + folderId).find(".toolbar .title").html() + "</span>");
        folderTitle.find("i").remove(); //Rimuove l'icona prima del testo. Esiste un icona solo per le cartelle riservate.

        return $(folderTitle).text().trim();
    }

    /**
     * Evento del pulsante <i><b>"Aggiungi File"</b></i> nella toolbar di ongi cartella.
     * @param {Click Event} e 
     * @returns {none}
     */
    function addFile_click(e) {
        var parentId = $(e.currentTarget).parents(".card").attr("id").replace("card_", "");
        var pu;

        function apply() {
            new GapiFiles().addFile(parentId, pu.getFileToUpload(), function (newFile) {
                var f = new File();
                f.addSingleFile(newFile);

                //Siccome il nuovo file non ha ancora un immagine di anteprima, aspetta e recupera l'anteprima.
                f.getFileThumbnail(newFile.id);

                pu.close();
            });
        }

        // Dichiara e istanzia il nuovo popup
        pu = new Popup({
            title: "Aggiungi File",
            subtitle: "Seleziona il file da caricare:",
            type: "insert",
            referenceId: parentId,
            applyEvent: apply,

        });
        pu.show();
    }

    function removeFolder(folder) {
        var type = folder.attr("type");
        var tl = new TimelineMax();

        if (type === "normal") {
            tl.to(folder, .5, {opacity: 0, zoom: 0, onComplete: function () {
                    folder.remove();
                }});
        } else {
            tl.to(folder, .5, {opacity: 0, zoom: 0, onComplete: function () {
                    var privateFolder = folder;
                    var favTarget = $("#favParent");

                    $.each(privateFolder.find(".body"), function (index, item) {
                        var favFile = favTarget.find(".body[link='" + $(item).attr("link") + "']");

                        new FavFolder().removeFavFile(favFile);
                    });

                    privateFolder.remove();
                }});

        }
    }

    /**
     * Evento del pulsante <i><b>"Extra Menu"</b></i> nella toolbar di ogni cartella
     * @param {Click Event} e
     * @returns {none}
     */
    function folderExtra_click(e) {
        var menu;

        /**
         * Evento quando si preme sul pulsante "Rename" dal menu di una cartella
         * @returns {none}
         */
        function rename_click() {
            var caller = menu.getCaller();
            var pu;
            var folderId = caller.parents(".card").attr("id").replace("card_", "");
            var folderTitle = getNormalFolderTitle(folderId);

            /**
             * Funzione del pulsante "OK" del popup che applica il cambiamento del nome
             * @returns {none}
             */
            function apply() {
                var newName = $("#renameInput").val();
                var folderId = $("#puContainer").attr("target");
                var folderTitle = $("#card_" + folderId).attr("index") + " - " + newName;

                if (newName != "") {
                    // Invia ai server Google la richiesta per rinominare la cartella
                    new GapiFiles().renameFolder(folderId, folderTitle, function (resp) {
                        if (!resp.code) {
                            var _f = $("#card_" + folderId + "");
                            _i = _f.find(".toolbar .title i")

                            //Verifica se il titolo è preceduto da un icona.
                            if (_i.length > 0) {
                                _f.find(".toolbar .title").html(_i[0].outerHTML + resp.title.split("-")[1].trim());
                            } else {
                                _f.find(".toolbar .title").text(resp.title.split("-")[1].trim());
                            }

                            pu.close();
                        } else {
                            pu.showErrors(resp);
                        }
                    });
                }
            }

            // Dichiara e istanzia il nuovo popup
            pu = new Popup({
                title: "Rinomina Sezione",
                subtitle: "Immetti un nuovo nome per la sezione selezionata:",
                type: "rename",
                referenceId: folderId,
                applyEvent: apply,
                inputs: [{id: "renameInput", value: folderTitle}]}
            );
            pu.show();

            menu.close();
        }

        /**
         * Evento quando si preme sul pulsante "Delete" dal menu di una cartella
         * @returns {none}
         */
        function delete_click() {
            var caller = menu.getCaller();
            var folderId = caller.parents(".card").attr("id").replace("card_", "");
            var folderTitle = getNormalFolderTitle(folderId);
            var pu;

            /**
             * Funzione del pulsante "OK" del popup che conferma la cancellazione
             * @returns {none}
             */
            function apply() {
                new GapiFiles().deleteFolder(folderId, function (resp) {
                    var folder = $("#card_" + folderId + "");

                    if (!resp.code) {
                        removeFolder(folder);

                        pu.close();
                    } else {
                        pu.showErrors(resp);
                    }
                });
            }

            // Dichiara e istanzia il nuovo popup
            pu = new Popup({
                title: "Cancella Sezione",
                subtitle: "Sei sicuro di voler cancellare<br><b>" + folderTitle + "</b>?",
                type: "delete",
                referenceId: folderId,
                applyEvent: apply
            });
            pu.show();

            menu.close();
        }

        /**
         * Evento quando si preme sul pulsante "Cambia Permessi" dal menu di una cartella.
         * @returns {none}
         */
        function permissions_click() {
            var caller = menu.getCaller();
            var folderId = caller.parents(".card").attr("id").replace("card_", "");
            var folderTitle = getNormalFolderTitle(folderId);
            var pu;
            var permissions = new Permissions();

            function onLoad() {
                permissions.loadTemplateData(folderId);

                pu.permissions = permissions;
            }

            /**
             * Funzione del pulsante "OK" del popup che conferma il cambio di permessi
             * @returns {none}
             */
            function apply() {
                new gGapiPermissions().updateFolderPermissions(permissions, function (resp) {
                    /*
                     * Quando finisce di applicare i nuovi permessi dovrebbe aggiornare i permessi di
                     * ciascun file, l'attribute "role", così che se l'utente ha cambiato i suoi stessi 
                     * permessi, magari diventando da "owner" a "writer" o viceversa, venga aggiornata 
                     * la pagina senza doverla ricaricare.
                     * Se l'utente non ha più permessi, aggiornare anche i pulsanti visibili.
                     * Toglierli se ha solo il permesso di visualizzare.
                     */

                    new gGapiPermissions().getFolderPermissions(folderId, function (folder) {
                        new gGapiPermissions().getIdFromEmail(user.getEmail(), function (cUsrId) {
                            function searchUserById(array, id) {
                                var toReturn;

                                $.each(array, function (index, value) {
                                    if (value.id == id) {
                                        toReturn = value;
                                    }
                                });

                                return toReturn;
                            }
                            /*
                             * Deve controllare che permessi ha ora l'utente.
                             * Constrollare se esiste ancora il link visibile a tutti.
                             */
                            var usr = searchUserById(folder.items, cUsrId);
                            var role = (usr) ? usr.role : "reader";
                            var usrAnyone = searchUserById(folder.items, "anyoneWithLink");
                            var isVisible = (usrAnyone) ? usrAnyone : undefined;



                            updateFolderButtons(role, $("#card_" + folder.id), isVisible);
                            updatePrivateFolder(folder.id);

                            pu.close();
                        })
                    });
                });
            }

            // Dichiara e istanzia il nuovo popup
            pu = new Popup({
                title: "Modifica Permessi",
                subtitle: "Imposta i permessi per la sezione<br><b>" + folderTitle + "</b>?",
                type: "permissions",
                referenceId: folderId,
                onLoad: onLoad,
                applyEvent: apply
            });
            pu.show();

            menu.close();
        }

        menu = new Menu([
            {text: "Rinomina Sezione", action: rename_click, icon: "&#xE22B;", id: "first"},
            {text: "Cancella Sezione", action: delete_click, icon: "&#xE872;", id: "second"},
            {text: "Modifica Permessi  Sezione", action: permissions_click, icon: "&#xE7EF;", id: "third"}],
                e,
                {yPosition: "bottom", xPosition: "left"},
                $("#" + $(e.currentTarget).parents(".card")[0].id.replace("card", "list")));
    }

    /**
     * Aggiorna lo stato dei pulsanti nella toolbar della cartella selezionata. 
     * Se l'utente ha role "owner" o "write" mostro i pulsanti "Aggiungi File" e "Extra Menu", 
     * altrimenti non mostra nessun pulsante.
     * @param {String} role - "owner" || "writer" || "reader"
     * @param {Object} folder - div con class ".card" che rappresenta tutta la cartella
     * @returns {none}
     */
    function updateFolderButtons(role, folder, webViewLink) {
        var _addBtn, _extraBtn, tl = new TimelineMax();

        _addBtn = folder.find(".material-button.add");
        _extraBtn = folder.find(".material-button.extraFolder");

        _addBtn.off();
        _extraBtn.off();

        switch (role) {
            case "writer":
            case "owner":
                _addBtn.css({"display": "inline-block", "opacity": "0"});
                _extraBtn.css({"display": "inline-block", "opacity": "0"});

                tl.to(_addBtn, .35, {opacity: 1}, "start");
                tl.to(_extraBtn, .35, {opacity: 1}, "start");

                _addBtn.click(addFile_click);
                _extraBtn.click(folderExtra_click);

                new FavFolder().showFolderFavButtons(folder);
                break;
            default:
                tl.to(_addBtn, .35, {opacity: 0}, "start");
                tl.to(_extraBtn, .35, {opacity: 0, onComplete: function () {
                        _addBtn.css("display", "none");
                        _extraBtn.css("display", "none");
                    }}, "start");

                new FavFolder().hideFolderFavButtons(folder);
                break;
        }

        // Imposta il type su riservato così che viene mostrata una icona prima del nome ad indicare che è privata
        if (webViewLink === undefined) {
            folder.attr("type", "riservato");
        } else {
            folder.attr("type", "normal");
        }

        folder.attr("permission", role);

        //new FavFolder().elaborateButtonsState($(folder[folder.length -1]));
    }

    /**
     * Funzione che controlla se una cartella è privata o pubblica. 
     * Se privata, aggiunge l'icona dell'occhio tqagliato prima del titolo della Folder.
     * Se pubblica rimuove quell'icona se c'è.
     * @param {String OR jQueryReference} f
     * @returns {none}
     */
    function updatePrivateFolder(f) {
        var folder, type;

        if ($.type(f) === "string") {
            folder = $("#card_" + f);
            type = folder.attr("type");
        } else {
            folder = f;
            type = folder.attr("type");
        }

        if (type === "riservato") {
            var i = folder.find(".toolbar .title i");

            if (i.length === 0) {
                folder.find(".toolbar .title").prepend('<i class="material-icons" title="Sezione Privata">&#xE8F5;</i>');
            }
        } else {
            var i = folder.find(".toolbar .title i");

            i.remove();
        }

    }


    //
    // FUNZIONI PUBBLICHE
    //


    /**
     * Aggiunge la cartella con l'id selezionato ed il titolo passato, all'elenco delle sezioni del sito.
     * Questa funzione non ha nulla a che fare con i server google. Avviene tutto lato Client.
     * @param {String} folderId
     * @param {String} folderTitle
     * @returns {none}
     */
    this.add = function (folderId, folderTitle, role, callback) {
        var folderTmpl = JSON.parse(JSON.stringify(folder_template));

        folderIndex = (folderTitle.split("-").length > 0) ? folderTitle.split("-")[0] : "00";
        folderTitle = (folderTitle.split("-").length > 0) ? folderTitle.split("-")[1] : folderTitle;

        folderTmpl = folderTmpl.replace(/\$id/g, folderId);
        folderTmpl = folderTmpl.replace(/\$title/g, folderTitle);
        folderTmpl = folderTmpl.replace(/\$index/g, folderIndex.trim());
        folderTmpl = $(folderTmpl);

        folderTmpl.attr("permission", "owner");

        if (role) {
            updateFolderButtons(role, folderTmpl);
        } else {
            updateFolderButtons("owner", folderTmpl);
        }

        if (callback) {
            callback();
        }

        folderTmpl.css("opacity", 0);

        var tl = new TimelineMax();

        // Mostra o meno l'icona dell'occhio sbarrato se una cartella è privata o meno
        updatePrivateFolder($(folderTmpl[folderTmpl.length - 1]));

        //Aggiunge la cartella alla pagina.
        $(".main").append(folderTmpl);

        tl.fromTo(folderTmpl, .35, {opacity: 0, zoom: 0}, {opacity: 1, zoom: 1});
        
        new BoxShadow(folderTmpl.find(".list"));
    };

    /**
     * Aggiorna lo stato dei pulsanti nelle toolbar di tutte le folder presenti sulla pagina.
     * Aggiorna anche gli attributi relativi ai permessi di ogni "card".
     * @param {String} role
     * @returns {none}
     */
    this.updateAllFoldersButtonsState = function (role) {
        $.each($(".card"), function (index, folder) {
            updateFolderButtons(role, $(folder), $(folder).attr("type"));
        });
    };

    /**
     * Popola ogni cartella con i suoi file. 
     * Manda la richiesta al server google e recupera i file della cartella, poi li aggiunge alla pagina HTML.
     * @param {String} folderId
     * @param {GapiFiles} gapiFiles
     * @returns {none}
     */
    this.populateFolder = function (folderId, gapiFiles) {
        if (gapiFiles === undefined) {
            var gapiFiles = new GapiFiles();
        }

        // Per ogni cartella,trova i file che contiene e li carica.
        if (folderId) {

            // Manda richiesta al server google per recuperare i file di ogni cartella
            gapiFiles.getAccessibleContent(folderId, null, function (data) {
                fCounter.current += 1;

                //Aggiunge il file alla cartella
                new File().addFilesFromList(data.items, folderId);

            });
        }

    }

    /**
     * Per ogni cartella di base, recupera i suoi singoli file e li aggiunge alla pagina.
     * @returns {none}
     */
    this.startFoldersPopulation = function () {
        var folders = $(".list");
        var gapiFiles = new GapiFiles();

        // Per ogni cartella,trova i file che contiene e li carica.
        for (var a = 0; a < folders.length; a++) {
            var folder = $(folders[a]);

            if (folder.attr("id")) {
                var folderId = folder.attr("id").replace("list_", "");

                self.populateFolder(folderId, gapiFiles);
            }
        }
    };

    /**
     * Dopo aver ricevuto dal server la lista delle cartelle alle quali l'utente ha accesso,
     * elabora i dati e mostra o meno i pulsanti nella toolbar della folder.
     * @param {Array} list
     * @returns {none}
     */
    this.elaboratePropertyFolders = function (list) {
        // Per ogni cartella, controlla innanzitutto se è già presente sulla pagina,
        // altrimenti la aggiunge.
        $.each(list, function (index, folder) {
            var folderId = folder.id;
            var role = folder.userPermission.role;
            var webViewLink = folder.webViewLink || null;
            var folderTitle = folder.title;
            var folder = $("#card_" + folderId);


            //Cartella essite già sulla pagina
            if (folder.length > 0) {
                updateFolderButtons(role, folder, webViewLink);
            } else {//Cartella non esiste sulla pagina. la aggiunge
                self.add(folderId, folderTitle, role, function () {
                    self.populateFolder(folderId);
                });
            }
        });
    };

    this.removePrivateFolders = function () {
        $.each($(".card[type='riservato']"), function (index, folder) {
            removeFolder($(folder));
        });
    };

    self = this;
}


function FavFolder() {
    var self;
    var spinningTL;

    /**
     * Aggiunge all'inizio della pagina la sezione Favorite.
     * @returns {none}
     */
    this.addFavFolder = function () {
        var folderTmpl = $(JSON.parse(JSON.stringify(fav_folder)));
        var firstSection = $(".card").get(0);
        var tl = new TimelineMax();

        tl.set(folderTmpl, {opacity: 0, zoom: 0});

        folderTmpl.attr("type", "normal")
        folderTmpl.insertBefore(firstSection);

        tl.fromTo(folderTmpl, .35, {opacity: 0, zoom: 0}, {opacity: 1, zoom: 1});

        new BoxShadow($("#favFolder"));
    };

    this.checkFavFolder = function () {
        if ($("#favParent").length > 0 && $("#favParent").find(".entry").length === 0) {
            self.removeFavFolder();
        } else if ($("#favParent").length === 0) {
            self.addFavFolder();
        }
    };

    this.removeFavFolder = function () {
        new TimelineMax().to($("#favParent"), .35, {
            opacity: 0, zoom: 0,
            onComplete: function () {
                $("#favParent").remove();
            }});
    };


    this.addFavFile = function (file) {
        var fileTmpl = JSON.parse(JSON.stringify(file_template));
        var favParent = $("#favFolder");

        fileTmpl = fileTmpl.replace(/\$id/g, "");
        fileTmpl = fileTmpl.replace(/\$title/g, file.title);
        fileTmpl = fileTmpl.replace(/\$parent/g, "");
        fileTmpl = fileTmpl.replace(/\$webContentLink/g, file.webContentLink);
        fileTmpl = fileTmpl.replace(/\$alternateLink/g, file.alternateLink);
        fileTmpl = fileTmpl.replace(/\$thumbnailLink/g, file.thumbnailLink);

        // Se la cartella Favorite non esiste, la aggiunge.
        if (favParent.length === 0) {
            self.checkFavFolder();

            favParent = $("#favFolder");
        }

        fileTmpl = $(fileTmpl);
        new TimelineMax().set(fileTmpl, {opacity: 0, zoom: 0});

        // Aggiunge il file alla cartella Favorite
        favParent.append(fileTmpl);

        new TimelineMax().to(fileTmpl, .35, {opacity: 1, zoom: 1});

        //Aggiunge gli eventi per il file
        new File().addFileEvents(fileTmpl);

        self.hideFavButton(fileTmpl.find(".fav-star"));
    };

    this.removeFavFile = function (file) {
        var favFile = $("#favFolder").find(".body[link='" + file.attr("link") + "']").parent();
        //var file = $(".entry").find(".body[link='" + file.attr("link") + "']").parent();

        new TimelineMax().to(favFile, .35, {opacity: 0, zoom: 0, onComplete: function () {
                // Elimina il file dalla sezione "In Primo Piano, dopo aver aggiornato il server"
                favFile.remove();
                
                self.checkFavFolder();
            }});

        self.setDisactiveState(file.find(".fav-star"));
        

        $("#favFolder").trigger("scroll");
    };
    
    this.renameFile = function(link, newName) {
        var favFile = $("#favFolder").find(".body[link='" + link + "']").parent();
        
        favFile.find(".footer .text").text(newName);
    };

    this.setSpinningState = function (star) {
        spinningTL = new TimelineMax({repeat: -1});

        star.addClass("spin");

        spinningTL.to(star, .5, {rotation: "+=360", ease: Power0.easeNone});
    };

    this.setActiveState = function (star) {
        var tl = new TimelineMax();

        tl.repeat(0);
        tl.to(star, 1.5, {rotation: "0", "background-color": "#ff9800", ease: Elastic.easeOut});

        if (spinningTL) {
            spinningTL.pause();
        }


        star.addClass("active");
        star.removeClass("spin");
    };

    this.setDisactiveState = function (star) {
        var tl = new TimelineMax();

        tl.repeat(0);
        tl.to(star, 1.5, {rotation: "0", "background-color": "#bdbdbd", ease: Elastic.easeOut});

        if (spinningTL) {
            spinningTL.pause();
        }

        star.removeClass("active");
        star.removeClass("spin");
    };

    this.elaborateSingleButtonState = function (file) {
        var isFav = $(file[file.length - 1]).attr("fav");
        var star = file.find(".fav-star");

        if (isFav === "true") {
            self.setActiveState(star);
        } else {
            self.setDisactiveState(star);
        }
    };

    /**
     * Evento generato dal click sul pulsante Favorite di un file.
     * @param {Clicke Event} e
     * @returns {none}
     */
    this.favButtonClick = function (e) {
        var target = $(e.currentTarget);
        var targetId = target.parents(".entry").attr("id").replace("entry_", "");
        var file = $("#entry_" + targetId).find(".body");
        var star = target;
        var isActive = !target.hasClass("active");

        if (star.hasClass("spin") === false) {

            self.setSpinningState(star);

            new GapiProperties().setFavParameter(targetId, isActive, function (resp) {
                if (resp.value === "true") {
                    var item = {};

                    item.title = file.parent().find(".footer .text").text();
                    item.webContentLink = file.attr("download_link");
                    item.alternateLink = file.attr("link");
                    item.thumbnailLink = file.find("img").attr("src");

                    self.addFavFile(item);
                    self.setActiveState(star);

                    $("#favFolder").trigger("scroll");
                } else {
                    self.removeFavFile(file);
                }

            });
        }
    };

    this.showFavButton = function (star) {
        star.removeClass("hidden");
    };
    this.showFolderFavButtons = function (folder) {
        var btnList = folder.find(".fav-star");

        $.each(btnList, function (index, star) {
            self.showFavButton($(star));
        });
    };

    this.hideFavButton = function (star) {
        star.addClass("hidden");
    };

    this.hideFolderFavButtons = function (folder) {
        var btnList = folder.find(".fav-star");

        $.each(btnList, function (index, star) {
            self.hideFavButton($(star));
        });
    };



    self = this;
}