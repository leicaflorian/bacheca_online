function File() {
    var self;
    var pendingFilesList = {};

    /**
     * 
     * @param {String} pId
     * @returns {File.LoadingState}
     */
    function LoadingState(pId) {
        var div;
        var parentId;
        var self;

        function init() {
            div = $("#card_" + parentId).find(".loadingSpinner");
            parentId = pId;
        }

        this.show = function (fileId, parentId, index, file) {
            if (index === 0) {
                pendingFilesList[parentId] = {};
            }

            pendingFilesList[parentId][fileId] = file;
        };

        this.checkIfHasToRemove = function (fileId, parentId) {
            if (pendingFilesList[parentId]) {
                delete pendingFilesList[parentId][fileId];

                var length = Object.keys(pendingFilesList[parentId]).length;

                if (length === 0) {
                    self.hide();
                }
            }
        };

        this.hide = function () {
            var tl = new TimelineMax();
            var spinner = $("#card_" + parentId).find(".loadingSpinner");

            tl.to(spinner, .35, {opacity: 0, onComplete: function () {
                    spinner.addClass("hidden");
                }});
        };

        this.isVisible = function () {
            return div.hasClass("hidden");
        };

        init();

        self = this;
    }

    /**
     * Classe che gestisce la scritta che avvisa che non ci sono filenella cartella
     * @param {String} parentId
     * @returns {File.NoFileMessage}
     */
    function NoFileMessage(parentId) {
        var visible;
        var div;
        var self;

        function init() {
            div = $("#card_" + parentId).find(".noFileMessage");
            visible = (div.css("display") === "none") ? false : true;
        }

        this.show = function () {
            div.removeClass("hidden");
            visible = true;

            var tl = new TimelineMax();
            tl.to(div, .35, {opacity: 1});
        };

        this.hide = function () {
            div.addClass("hidden");
            div.removeClass("pending");
            visible = false;
        };

        this.checkIfHasToShow = function () {
            var list = div.parents(".card").find(".list");

            if (self.getVisibility() === false && list.children().length === 0) {
                self.show();
            }
        };

        this.addPending = function () {
            div.addClass("pending");
        };
        this.isPending = function () {
            return div.hasClass("pending");
        };

        this.getVisibility = function () {
            return visible;
        };

        this.getDiv = function () {
            return div;
        };

        init();
        self = this;
    }

    /**
     * Aggiunge gli eventi relativi ad un singolo file passato come "target".
     * @param {String} target
     * @returns {none}
     */
    function addFilesEvents(target) {
        var entry = (target.hasClass("entry")) ? target : target.find(".entry");
        var extra_menu = target.find(".material-button.extra");
        var favBtn = target.find(".fav-star");

        /**
         * Evento attivato dal Click su un file. 
         * Apre il file per la visione in un altra scheda.
         * @param {Click Event} ev
         * @returns {none}
         */
        function entryClick(ev) {
            console.log("entry_click");

            var currentTarget = $(ev.currentTarget);
            var target = $(ev.target);


            var isButton = !(target.hasClass("material-icons") == false) || !(target.hasClass("material-button") == false);
            var isMenu = target.hasClass("extra") == true || target.parents(".extra_menu").length > 0;
            var menuOpened = currentTarget.find(".extra_menu").length > 0;

            if (isButton == false && isMenu == false && menuOpened == false) {
                window.open(currentTarget.find(".body").attr("link"));
            } else if (isButton == false && isMenu == false && menuOpened == true) {
                //closeMenu(ev, currentTarget.find(".extra"));
            }
        }

        /**
         * Evento generato dal Click sul pulsante "Extra Menu" del file.
         * Mostra un menu con diverse opzioni.
         * @param {Click Event} e
         * @returns {none}
         */
        function extraClick(e) {
            var menuButtons,
                    extraButton = $(e.currentTarget),
                    extraButtonParent = extraButton.parent(),
                    parentBody = extraButtonParent.parent(".entry").find(".content"),
                    card = parentBody.parents(".card"),
                    menu;

            /**
             * Evento quando si preme sul pulsante "Rename" del menu di un file..
             * @param {Event} e
             */
            var rename_click = function (e) {
                var caller = menu.getCaller();
                var fileId = caller.parents(".entry").attr("id").replace("entry_", "");
                var fileTitle = $("#entry_" + fileId).find(".footer .text").text().replace(/.pdf$/ig, "");
                var pu;

                /**
                 * Evento generato dal pulsante "OK" del popup. 
                 * Dopo che il server risponde, applica i cambiamenti anche sulla pagina HTML
                 * @returns {none}
                 */
                function apply() {
                    fileTitle = $("#renameInput").val();

                    new GapiFiles().renameFile(fileId, fileTitle, function (resp) {
                        var _f = $("#entry_" + fileId + "");
                        _f.attr("title", resp.title);
                        _f.find(".footer .text").text(resp.title);
                        
                        new FavFolder().renameFile(_f.find(".body").attr("link"), resp.title);

                        pu.close();
                    });
                }

                // Dichiara e istanzia il nuovo popup
                pu = new Popup({
                    title: "Rinomina File",
                    subtitle: "Immetti un nuovo nome per il file selezionato:",
                    type: "rename",
                    referenceId: fileId,
                    applyEvent: apply,
                    inputs: [{id: "renameInput", value: fileTitle}]}
                );
                pu.show();

                menu.close();
            };

            /**
             * Evento quando si preme sul pulsante "Delete" del menu di un file..
             * @param {Event} e
             */
            var delete_click = function (e) {
                var caller = menu.getCaller();
                var fileId = caller.parents(".entry").attr("id").replace("entry_", "");
                var fileTitle = $("#entry_" + fileId).find(".footer .text").text().replace(/.pdf$/ig, "");
                var pu;

                /**
                 * Evento generato dal pulsante "OK" del popup. 
                 * Dopo che il server risponde, elimina il file anche dalla pagina HTML
                 * @returns {none}
                 */
                function apply() {
                    var noFileMessage = new NoFileMessage(caller.parents(".card").attr("id").replace("card_", ""));

                    new GapiFiles().deleteFile(fileId, function () {
                        var tl = new TimelineMax();
                        var _f = $("#entry_" + fileId + "");

                        pu.close();
                        
                        new FavFolder().removeFavFile(_f.find(".body"));
                        
                        tl.to(_f, .35, {opacity: 0, zoom:0 , onComplete: function () {
                                _f.remove();

                                noFileMessage.checkIfHasToShow();
                            }});
                    });
                }

                // Dichiara e istanzia il nuovo popup
                pu = new Popup({
                    title: "Cancella File",
                    subtitle: "Sei sicuro di voler cancellare<br><b>" + fileTitle + "</b>?",
                    type: "delete",
                    referenceId: fileId,
                    applyEvent: apply
                });
                pu.show();

                menu.close();
            };

            /**
             * Evento quando si preme sul pulsante "Download" del menu di un file..
             * @param {Event} e
             */
            var download_click = function (e) {
                var caller = menu.getCaller();
                var _link = caller.parents(".entry").find(".body").attr("download_link");
                window.open(_link);

                menu.close();
            };

            /**
             * In base ai permessi dell'utente mostra alcune opzioni invece di altre
             */
            switch (card.attr("permission")) {
                case "writer":
                case "owner":
                    // Imposta gli eventi per ogni singolo elemento del menu
                    menuButtons = [
                        {text: "Rinomina", action: rename_click, icon: "&#xE22B;", id: "rename"},
                        {text: "Cancella", action: delete_click, icon: "&#xE872;", id: "delete"},
                        {text: "Scarica", action: download_click, icon: "&#xE2C4;", id: "download"}
                    ];
                    break;
                default:
                    menuButtons = [
                        {text: "Scarica", action: download_click, icon: "&#xE2C4;", id: "download"}
                    ];
                    break;
            }

            //Crea effettivamente il menu e lo mostra
            menu = new Menu(menuButtons, e,
                    {yPosition: "top", xPosition: "left"},
                    $(e.currentTarget).parents(".entry").find(".body"));

        }

        

        entry.click(entryClick);
        extra_menu.click(extraClick);
        favBtn.click(new FavFolder().favButtonClick);
    }


    /**
     * Evento chiamato quando si seleziona un file dall'input di tipo "file".
     * @param {Popup} _pu
     * @returns {File.fileInputSelection.file}
     */
    this.fileInputSelection = function (_pu) {
        var file = $('#addInput')[0].files[0];

        if (file) {
            var fType = file.type.split("/")[1];
            var rEx = new RegExp("." + fType, "i");
            fileData = file;
            fileData.mtype = fType;

            $("#addInputOriginalTitle").text(file.name);
            $("#addInputTitle").val(file.name.replace(rEx, ""));
        }

        return file;
    };

    /**
     * Aggiunge un singolo file alla pagina. Il parent viene preso dalle informazioni del file.
     * @param {Drive File} file
     * @returns {none}
     */
    this.addSingleFile = function (file) {
        var parentId = file.parents[0].id;
        var target = $("#list_" + parentId);
        var tl = new TimelineMax();

        //Per ogni singolo file, lo aggiunge alla pagina e poi aggiunge i suoi eventi.
        //$.each(data.items, function (index, item) {
        var fileTmpl = JSON.parse(JSON.stringify(file_template));
        var fileThumbnail = file.thumbnailLink;
        var noFileMessage = new NoFileMessage(parentId);

        if (!fileThumbnail) {
            fileThumbnail = "assets/puff.svg";

            fileTmpl = fileTmpl.replace('class="thumbnail"', 'class="thumbnail waiting"')
        }

        fileTmpl = fileTmpl.replace(/\$id/g, file.id);
        fileTmpl = fileTmpl.replace(/\$title/g, file.title);
        fileTmpl = fileTmpl.replace(/\$parent/g, file.parents[0].id);
        fileTmpl = fileTmpl.replace(/\$webContentLink/g, file.webContentLink);
        fileTmpl = fileTmpl.replace(/\$alternateLink/g, file.alternateLink);
        fileTmpl = fileTmpl.replace(/\$thumbnailLink/g, fileThumbnail);

        // Se il file è Favorite, lo imposta come tale
        if (file.properties) {
            var fav = $.grep(file.properties, function (e) {
                return e.key === "fav";
            });
            fileTmpl = fileTmpl.replace(/\$fav/g, fav[0].value);

            if (fav[0].value === "true") {
                new FavFolder().addFavFile(file);
            };

        } else {
            fileTmpl = fileTmpl.replace(/\$fav/g, "false");
        }

        fileTmpl = $(fileTmpl);

        // Sezione dedicata alla gestione della scritta quando non c'è alcun file nella cartella.
        function innerAdd(fileTmpl, target, tl) {
            //Imposta a 0 l'opacità del nuovo file così che non sia visibile quando viene aggiunto
            tl.set(fileTmpl, {opacity: 0, zoom: 0});

            //Aggiunge il file alla folder
            target.append(fileTmpl);
            
            new FavFolder().elaborateSingleButtonState(fileTmpl);

            fileTmpl.ready(function (e) {
                tl.to(fileTmpl, .35, {opacity: 1, zoom: 1, onComplete: function () {
                        var fileId = $(fileTmpl[fileTmpl.length - 1]).attr("id").replace("entry_", "");
                        var parendId = $(fileTmpl[fileTmpl.length - 1]).attr("parent").replace("parent_", "");

                        new LoadingState(parentId).checkIfHasToRemove(fileId, parendId);
                    }});
            });
        }

        if (noFileMessage.isPending() === false) {
            noFileMessage.addPending();

            tl.to(noFileMessage.getDiv(), .35, {opacity: 0, onComplete: function () {
                    noFileMessage.hide();

                    innerAdd(fileTmpl, target, tl);
                }});

        } else {
            innerAdd(fileTmpl, target, tl);
        }

        target.parent(".card").css("flex-grow", "1");

        // Aggiorna le ombre per lo ascroll se servono.
        new BoxShadow().update(target);

        //Aggiunge i vari eventi del file.
        addFilesEvents(fileTmpl);

        //Chiama l'evento scroll così vengono create le Box Shadow
        target.trigger("scroll");
        $("#favFolder").trigger("scroll");


    };


    /**
     * Per ogni elemento della lista, lo aggiunge alla pagina.
     * @param {Array} list
     * @returns {none}
     */
    this.addFilesFromList = function (list, parentId) {
        if (list.length === 0) {
            new LoadingState(parentId).hide();
        }

        $.each(list, function (index, file) {
            var fileId = file.id;

            new LoadingState(parentId).show(fileId, parentId, index, file);

            self.addSingleFile(file);
            
        });
    };

    /**
     * Recupera l'mmagine di anteprima di un file. 
     * Questa funzione serve quando si aggiunge un nuovo file ad una cartella in quanto
     * i nuovi file non hanno subito l'immagine di anteprima. Quindi si richiama questa funzione 
     * finchè non si riesce a recuperare l'immagine.
     * @param {String} fileId
     * @returns {none}
     */
    this.getFileThumbnail = function (fileId) {
        new GapiFiles().getFileInfo(fileId, function (resp) {
            if (resp.thumbnailLink) {
                var entryImg = $("#entry_" + resp.id).find(".thumbnail");
                var tl = new TimelineMax();

                //Quando si recupera l'immagine di anteprima, fadeOut dell'immagine di loading
                tl.to(entryImg, .35, {opacity: 0, onComplete: function () {
                        //Aspetta che la vera immagine sia caricata completamente e poi la mostra con fadeIn
                        entryImg.on("load", function () {
                            tl.to(entryImg, .35, {opacity: 1});
                        });

                        //Quando l'immagine di loading e nascosta, la cambia con la vera immagine.
                        entryImg.attr("src", resp.thumbnailLink);
                        entryImg.removeClass("waiting");
                    }});


            } else {
                self.getFileThumbnail(resp.id);
            }
        });
    };

    this.addFileEvents = function(target){
        addFilesEvents(target);
    };

    self = this;
}