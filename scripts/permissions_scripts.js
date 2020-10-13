var Permissions = function () {
    var rolesDescription = {"owner": "E' il proprietario",
        "writer": "Può organizzare, aggiungere o modificare",
        "reader": "Può solo visualizzare"}
    var permissionsToDelete = [];
    var permissionsToChange = [];
    var permissionsToAdd = [];
    var amIowner = false;

    /**
     ******************************************
     ******************************************
     ******************************************
     ********** PRIVATE FUNCTIONS *************
     ******************************************
     ******************************************
     ******************************************
     */

    /**
     * In un array di Object trova l'elemento in base al valore "permissionId" passato.
     */
    function getIndexById(array, id) {
        var toReturn;

        $.each(array, function (index, value) {
            if (value.permissionId == id) {
                toReturn = index;
            }
        })

        return toReturn;
    }

    /**
     * Evento del DropDown menu dal quale si seleziona il tipo di permesso dell'utente.
     */
    function dropDownEvent(e) {
        var menu, pObj;
        var fId = $(e.currentTarget).parents("#puContainer").attr("target");
        var pRole = $(e.currentTarget).parents(".permissionsEntry").attr("role");

        /**
         * Evento quando si sceglie una voce dal DropDown Menu
         */
        function ddSelection(e) {
            var caller = menu.getCaller();
            var icon = $("<i>").addClass("material-icons");
            var cTarget = $(e.currentTarget);
            var pEntry = caller.parents(".permissionsEntry");
            var permissionId = pEntry.attr("pId");

            role = cTarget.attr("id");
            icon.html(cTarget.find("i").html())

            //Se il ruolo impostato è "owner", controlla che non ce ne siano altri. Se si li imposta su "writer".
            // Se ' "owner" disattiva anche il pulsante "Cancella".
            if (role == "owner") {
                onlyOneOwner()
                setDeleteButtonState("disabled", pEntry);
            } else {
                setDeleteButtonState("enabled", pEntry);
            }

            // Imposta l'icona in base alla scelta fatta e salva l'attributo "role".

            caller.html(icon)
            pEntry.attr("role", role)
            caller.attr("prole", role)

            setDropDownToopTips();
            appendPermissionsChange(role, permissionId);

            // Chiude il menu del dropdown
            menu.close();
        }

        /**
         * Verifica che ci sia solo un "owner" e lo imposta su "writer"
         */
        function onlyOneOwner() {
            otherOwners = $(".permissionsEntry[role=owner] .dropDown")
            otherOwners.html("<i class='material-icons'>&#xE3C9;</i>")
            otherOwners.parents(".permissionsEntry").attr("role", "writer")
            otherOwners.attr("prole", "writer")


            //Automaticamente, quando un utente viene impostato come "owner", in drive,
            //l'owner vecchio viene impostato come writer.
        }

        /**
         * Per ogni modifica ai permessi, aggiunge i dati relativi al cambiamento all'array "permissionsToChange",
         * così che poi, quando si preme su "Ok", l'array venga analizzato ed inviate ai server Drive i relativi cambi.
         */
        function appendPermissionsChange(role, id) {
            var changeIndex = getIndexById(permissionsToChange, id);
            var addIndex = getIndexById(permissionsToAdd, id);
            pObj = {role: role, permissionId: id, fileId: fId, transferOwnership: false};

            if (pObj.role == "owner") {
                pObj.transferOwnership = true;
            }

            // Se non c'è l'elemento in "change" ed in "add", allora lo aggiunge a "change".
            // Se l'elemento si trova in "add", allora aggiorna "add".
            // Se non si trova in "add" ma si trova in "change", aggiorna "change".
            if (changeIndex == null && addIndex == null) {
                permissionsToChange.push(pObj);
            } else if (addIndex != null) {
                permissionsToAdd[addIndex] = pObj;
            } else {
                permissionsToChange[changeIndex] = pObj;
            }
        }

        /**
         * Crea e mostra il dropdown menu.
         */
        function showMenu() {
            var menuList = [{text: rolesDescription.writer, action: ddSelection, icon: "&#xE3C9;", id: "writer"},
                {text: rolesDescription.reader, action: ddSelection, icon: "&#xE8F4;", id: "reader"}]

            // Se non sono più proprietario ma solo reader, non posso autoimpostarmi come proprietario.
            // Il proprietario soltanto può impostare un altro proprietario.
            if (amIowner === true) {
                menuList.unshift({text: rolesDescription.owner, action: ddSelection, icon: "&#xE2C9;", id: "owner"});
            }
            menu = new Menu(menuList, e,
                    {yPosition: "under", xPosition: "underLeft"})
        }

        // Se il "role" è "owner", non mostra alcun dropdown perchè l'owner non deve potersi togliere da "owner" da solo.
        if (pRole != "owner") {
            showMenu();

        }
    }

    /**
     * Evento del pulsante "Cancella Permesso" in corrispondenza di ogni PermissionEntry
     */
    function deleteEvent(e) {
        var cTarget = $(e.currentTarget)
        var pId = cTarget.parents(".permissionsEntry").attr("pId");
        var fId = cTarget.parents("#puContainer").attr("target");
        var role = cTarget.parents(".permissionsEntry").attr("role");
        var obj = {permissionId: pId, fileId: fId, role: role};
        var pEntry = cTarget.parents(".permissionsEntry");

        if (pEntry.hasClass("toBeDeleted") == true) {
            var index = getIndexById(permissionsToDelete, obj.permisionId);

            permissionsToDelete.splice(index, 1);
            pEntry.removeClass("toBeDeleted");
        } else {
            var isNew = (getIndexById(permissionsToAdd, obj.permissionId) != null) ? true : false;

            if (isNew) {
                var index = getIndexById(permissionsToAdd, obj.permissionId);
                permissionsToAdd.splice(index, 1);
            } else {
                var index = getIndexById(permissionsToChange, obj.permissionId);

                permissionsToDelete.push(obj);
                permissionsToChange.splice(index, 1); // Rimuove dall'array "permissionsToChange" il permesso corrente, così che non venga mandata unarichiesta di cambio permessi per un permesso che va eliminato.
            }

            pEntry.addClass("toBeDeleted");
        }
    }

    /**
     * Evento della "checkbox" che permette di impostare il nuovo utente su "anyoneWithLink"
     */
    function anyoneWithLinkEvent(e) {
        var checked = $(e.currentTarget).prop("checked");
        var inputDiv = $("#puAddPermission_email");

        if (checked == true) {
            inputDiv.addClass("disabled");
        } else {
            inputDiv.removeClass("disabled");
        }
    }

    /**
     * Evento del pulsante "Aggiungi Persona" nella sezione "Aggiungi Persone".
     */
    function addPersonEvent(e) {
        var checkBox = $("#puAddPermission_anyonewithlink");
        var email = $("#puAddPermission_email");

        if (checkBox && checkBox.prop("checked") == true) {
            addEntry("anyoneWithLink");

            permissionsToAdd.push({role: "reader", permissionId: "anyoneWithLink", fileId: $("#puContainer").attr("target")})

            email.val("");
            email.removeClass("error");
        } else {
            validateEmail(email.val(), function (resp) {
                if (resp == "ok") {
                    getIdForEmail(email.val(), function (permissionId) {
                        var alreadyExists = $(".permissionsEntry[pId=" + permissionId + "]")

                        // Se questa persona è già presente nella lista nonla aggiunge più
                        if (alreadyExists.length == 0) {
                            addEntry("writer", permissionId, email.val())

                            permissionsToAdd.push({role: "writer", permissionId: permissionId, fileId: $("#puContainer").attr("target")})

                            email.val("");
                            email.removeClass("error");
                        }
                    })
                }
            })
        }
    }

    /**
     * Aggiunge i permessi per ogni pulsante in riferimento alle entry dei permessi.
     */
    function addButtonsEvents() {
        $(".dropDown").click(dropDownEvent);
        $(".deleteUser").click(deleteEvent);
        $("#puAddPermission_anyonewithlink").change(anyoneWithLinkEvent);
        $("#puAddPermission_addbutton").click(addPersonEvent);
    }

    /**
     * Rimuove lo stato "loading" della lista dei permessi e quindi la mostra. 
     */
    function removeLoadingState() {
        var target = $("#puContainer .puPermissionsContainer");

        target.removeClass("loading");
    }

    /**
     * Convalida l'indirizzo email creato. Si assicura che sia scritto bene.
     */
    function validateEmail(email, callback) {
        var resp = "ok";

        if (email.indexOf("@") < 2 || email.indexOf("@") == -1 || email.indexOf("@") == email.length - 2 || email.indexOf(" ") > -1) {
            $("#puAddPermission_email").addClass("error");
            $("#puAddPermission_email").attr("title", "Email non valida perchè non scritta nel modo giusto.")

            resp = "notOk";
        }

        if (callback) {
            callback(resp)
        }
    }

    /**
     * Recupera il "permisionId" in base all'email fornita.
     */
    function getIdForEmail(email, callback) {
        var request = gapi.client.drive.permissions.getIdForEmail({
            'email': email,
        });
        request.execute(function (resp) {
            if (callback) {
                callback(resp.id);
            }
        });
    }

    /**
     * Aggiunge alla lista dei permessi il nuovo permesso
     * Lo aggiunge sia alla lista visible sia all'array "permissionsToAdd"
     */
    function addEntry(pType, pId, pEmail) {
        pEntryTemplate = JSON.parse(JSON.stringify(popup.permissionsEntry))

        // Se è la voce "Chiunque abbia il link", da solo la possibilità di cancellarlo.
        if (pType == "anyoneWithLink") {
            var pEt = $(pEntryTemplate).find("#pImg")[0].outerHTML;
            var pMail = $(pEntryTemplate).find("#pEmail")[0].outerHTML
            var pDropDown = $(pEntryTemplate).find("#pRole")[0].outerHTML

            pEntryTemplate = pEntryTemplate.replace(pEt, '<i class="material-icons">&#xE8D3;</i>');
            pEntryTemplate = pEntryTemplate.replace(pMail, "")
            pEntryTemplate = pEntryTemplate.replace(pDropDown, "")
            pEntryTemplate = pEntryTemplate.replace("$pName", "Chiunque accede al sito può <b>visualizzarlo</b>")
            pEntryTemplate = pEntryTemplate.replace("$pId", pType)
        } else {
            var pEt = $(pEntryTemplate).find("#pImg")[0].outerHTML;

            pEntryTemplate = pEntryTemplate.replace(pEt, '<i class="material-icons">&#xE7FD;</i>');
            pEntryTemplate = pEntryTemplate.replace("$pName", "");
            pEntryTemplate = pEntryTemplate.replace("$pEmail", pEmail);
            pEntryTemplate = pEntryTemplate.replace(/("\$pRole")/g, pType);
            pEntryTemplate = pEntryTemplate.replace("$pId", pId)
            pEntryTemplate = pEntryTemplate.replace("$pRoleContent", "<i class='material-icons'>&#xE3C9;</i>");
        }

        pEntryTemplate = $(pEntryTemplate);

        pEntryTemplate.find(".dropDown").click(dropDownEvent);
        pEntryTemplate.find(".deleteUser").click(deleteEvent);
        pEntryTemplate.find("#puAddPermission_anyonewithlink").change(anyoneWithLinkEvent);
        pEntryTemplate.find("#puAddPermission_addbutton").click(addPersonEvent);

        $(".puPermissionsContainer").append(pEntryTemplate)

        // Una volta aggiunto "anyoneWithLink" alla lista, elimina la checkbox nella sezione "Aggiunge Persone"
        hideAnyoneWithLink();
        $("#puAddPermission_email").removeClass("disabled");
    }

    /**
     * Se nell'elenco dei permessi esiste già il permesso "anyoneWithLink", elimina la checkbox relativa la sezione dove si aggiungono nuove persone.
     */
    function hideAnyoneWithLink() {
        var exists = $(".permissionsEntry[pId=anyoneWithLink]").length;

        if (exists > 0) {
            $("#puAddPermission_checkboxDiv").remove();
        }
    }

    /**
     * Per ogni Entry che ha come ruolo "owner", disattiva il pulsante di cancellazione.
     * E' importante che l'owner non si possa cancellare da solo dai permessi della cartella.
     * Allo stesso tempo, imposta tutti gli altri pulsanti che non sono "owner" come attivi.
     */
    function setDeleteButtonState(state, entry) {
        $(".permissionsEntry:not([role=owner])").find(".deleteUser").removeClass("disabled");

        switch (state) {
            case "enabled":
                entry.find(".deleteUser").removeClass("disabled");
                break;
            case "disabled":
                entry.find(".deleteUser").addClass("disabled");
                break;
        }
    }

    /**
     * Imposta i "tooltips" (suggerimenti) dei dropdownmenu al cambio del permessi dell'utente.
     */
    function setDropDownToopTips(role) {
        var buttons = $(".permissionsEntry .dropDown")

        $.each(buttons, function (index, button) {
            button = $(button);
            button.attr("title", rolesDescription[button.attr("prole")])
        })
    }

    /**
     * Imposta lo stato iniziale della lista dei permessi. Rimuove lo stato "loading", disattiva il pulsante "elimina" di un permesso che è "owner" e aggiunge i "tooltips" al dropdown dei permessi.
     */
    function setInitialState() {
        removeLoadingState();
        // Imposta lo stato iniziale del pulsante "Cancella" per la entry con "role" = "owner". Lo disattiva.
        setDeleteButtonState("disabled", $(".permissionsEntry[role=owner]"))
        setDropDownToopTips();
    }

    /**
     * Mostra la sezione "Aggiungi Persone".
     */
    function showAddNewPersonSection() {
        // Mostra la sezione dedicata all'aggiunta di una nuova persona tra i permessi.
        // Di default è nascosta
        $(".puAddPermission").css("display", "block");

        hideAnyoneWithLink();
    }



    /**
     ******************************************
     ******************************************
     ******************************************
     ********** PUBLIC FUNCTIONS **************
     ******************************************
     ******************************************
     ******************************************
     */

    /**
     * Carica il template per le "permissionsEntry" e lo popola con i vari dati. Poi lo aggiunge alla lista visibile.
     */
    this.loadTemplateData = function (target_id) {
        console.log("loadTemplateData");

        // Recupera i permessi associati alla cartella selezionata.
        new gGapiPermissions().getFolderPermissions(target_id, function (r) {

            // Per ogni persona nella lista dei permessi, la aggiunge al popup.
            $.each(r.items, function (key, pEntry) {
                var pEntryTemplate = JSON.parse(JSON.stringify(popup.permissionsEntry))

                // Se è la voce "Chiunque abbia il link", da solo la possibilità di cancellarlo.
                if (pEntry.id == "anyoneWithLink") {
                    var pEt = $(pEntryTemplate).find("#pImg")[0].outerHTML;
                    var pEmail = $(pEntryTemplate).find("#pEmail")[0].outerHTML
                    var pDropDown = $(pEntryTemplate).find("#pRole")[0].outerHTML

                    pEntryTemplate = pEntryTemplate.replace(pEt, '<i class="material-icons">&#xE8D3;</i>');
                    pEntryTemplate = pEntryTemplate.replace(pEmail, "")
                    pEntryTemplate = pEntryTemplate.replace(pDropDown, "")
                    pEntryTemplate = pEntryTemplate.replace("$pName", "Chiunque accede al sito può <b>visualizzarlo</b>")
                    pEntryTemplate = pEntryTemplate.replace("$pId", pEntry.id)
                } else {

                    if (pEntry.photoLink == null) {
                        var pEt = $(pEntryTemplate).find("#pImg")[0].outerHTML;
                        pEntryTemplate = pEntryTemplate.replace(pEt, '<i class="material-icons">&#xE7FD;</i>');
                    } else {
                        pEntryTemplate = pEntryTemplate.replace("$pPhoto", pEntry.photoLink)
                    }

                    pEntryTemplate = pEntryTemplate.replace("$pName", pEntry.name || "Senza Nome")
                    pEntryTemplate = pEntryTemplate.replace("$pEmail", pEntry.emailAddress)
                    pEntryTemplate = pEntryTemplate.replace(/("\$pRole")/g, pEntry.role)
                    pEntryTemplate = pEntryTemplate.replace("$pId", pEntry.id)

                    switch (pEntry.role) {
                        case "owner":
                            pEntryTemplate = pEntryTemplate.replace("$pRoleContent", "<i class='material-icons'>&#xE2C9;</i>");

                            // Se l'utente attualmente loggato è "owner", salva questo dato.
                            if (pEntry.emailAddress == oauth.profile.getEmail()) {
                                amIowner = true;
                            } else {
                                amIowner = false;
                            }
                            break;
                        case "writer":
                            pEntryTemplate = pEntryTemplate.replace("$pRoleContent", "<i class='material-icons'>&#xE3C9;</i>");
                            break;
                        case "reader":
                            pEntryTemplate = pEntryTemplate.replace("$pRoleContent", "<i class='material-icons'>&#xE8F4;</i>");
                            break;
                    }
                }

                //Aggiunge al container dei permessi la Entry appena creata
                $(".puPermissionsContainer").append($(pEntryTemplate))

                //Indica che è l'ultimo elementodell'array e quindi rimuove lo spinner di caricamento.
                if (key == r.items.length - 1) {
                    addButtonsEvents();
                    showAddNewPersonSection();
                    setInitialState();
                }
            });
        });
    };

    /**
     * Evento del pulsante "OK" del popup che applica tutti i cambiamenti fatti ai permessi.
     * Prima Cancella, poi Aggiorna ed infine Aggiunge i permessi.
     */
    this.applyPermissions = function () {
        console.log("applyPermissions");

        function deletePendingUsers() {
            $.each(permissionsToDelete, function (index, p) {
                var request = gapiclient.permissions.delete({
                    'fileId': p.fileId,
                    'permissionId': p.permissionId
                });
                request.execute(function (resp) {
                    console.log(resp)
                });
            })
        }

        function updatePendingUsers() {
            $.each(permissionsToChange, function (index, p) {
                // First retrieve the permission from the API.
                var request = gapiclient.permissions.get({
                    'fileId': p.fileId,
                    'permissionId': p.permissionId,
                    'transferOwnership': p.transferOwnership
                });
                request.execute(function (resp) {
                    resp.role = p.role;
                    var updateRequest = gapiclient.permissions.update({
                        'fileId': p.fileId,
                        'permissionId': p.permissionId,
                        'transferOwnership': p.transferOwnership,
                        'resource': resp
                    });
                    updateRequest.execute(function (resp) {
                        console.log(resp)
                    });
                });
            })
        }

        function addPendingUsers() {
            $.each(permissionsToAdd, function (index, p) {
                var body = {
                    'id': p.permissionId,
                    'type': (p.permissionId != "anyoneWithLink") ? "user" : "anyone", // "user" || "anyone"
                    'role': p.role,
                    'withLink': (p.permissionId != "anyoneWithLink") ? false : true
                };
                var request = gapiclient.permissions.insert({
                    'fileId': p.fileId,
                    'resource': body,
                    'emailMessage': "Cartella condivisa da 'bachecaonline.altervista.org/schionord'"
                });
                request.execute(function (resp) {
                    console.log(resp);
                });
            })
        }
        ;

        deletePendingUsers();
        updatePendingUsers();
        addPendingUsers();

        // Chiude il popup aperto.
        // Prima di chiuderlo si deve aspettare che le richieste al server abbiano ricevuto tutte una risposta.
        closePopUp();
    };

    this.getChangesLists = function () {
        return {
            permissionsToDelete: permissionsToDelete,
            permissionsToChange: permissionsToChange,
            permissionsToAdd: permissionsToAdd
        };
    };
    
    this.getIdFromEmail = function(email, callback) {
        getIdForEmail(email, callback);
    };
};