var currentFileId;
var currentFolderId;
var pu, pu_content;
var permissions;

/**
 * IMPORTANTE
 * - Evitare che ogni volta che si mostra il popup, venga inoltrata una richeista per il template al server.
 *		Caricare il template durante "getMainInfo()".
 * - Evitare che ogni volta che si mostra l'extra menu venga inoltrata una richeista per il template al server.
 * 	Caricare il template durante "getMainInfo()".
 * - Controllare, ordinare, descrivere le funzioni del file popup e dell'extra menu.
 */

/**
 * Crea il popup, carica i dati dal template, lo aggiunge alla pagina e poi lo mostra all'utente.
 * @param {String} _type
 * @param {String} target_id
 * @param {Event} e
 */
showPopup = function (type, target_id) {
    var _title;
    pu = JSON.parse(JSON.stringify(popup.index));
    pu = pu.replace("$targetId", target_id);

    switch (type) {
        case "insert":
            pu_content = JSON.parse(JSON.stringify(popup.insert));
            pu = pu.replace("$title", "Carica File");
            pu = pu.replace("$onclick", "applyInsert()");

            break;
        case "rename":
            _title = $("#entry_" + target_id).find(".footer .text").text().replace(/.pdf$/ig, "");

            pu_content = JSON.parse(JSON.stringify(popup.rename));
            pu_content = pu_content.replace("$renameValue", _title);
            pu = pu.replace("$title", "Rinomina");
            pu = pu.replace("$onclick", "applyRename()");

            break;
        case "delete":
            _title = $("#entry_" + target_id).find(".footer .text").text();

            pu_content = JSON.parse(JSON.stringify(popup.delete));
            pu_content = pu_content.replace("$fileTitle", _title);
            pu = pu.replace("$title", "Cancella");
            pu = pu.replace("$onclick", "applyDelete()");

            break;
        case "renameSection":
            _title = $("<span>" + $("#card_" + target_id).find(".toolbar .title").html() + "</span>")
            _title.find("i").remove() //Rimuove l'icona prima del testo. Esiste un icona solo per le cartelle riservate.
            _title = $(_title).text().trim();

            pu_content = JSON.parse(JSON.stringify(popup.rename));
            pu_content = pu_content.replace("$renameValue", _title);
            pu = pu.replace("$title", "Rinomina Sezione");
            pu = pu.replace("$onclick", "applyRenameSection()");

            break;
        case "deleteSection":
            _title = $("<span>" + $("#card_" + target_id).find(".toolbar .title").html() + "</span>")
            _title.find("i").remove() //Rimuove l'icona prima del testo. Esiste un icona solo per le cartelle riservate.
            _title = $(_title).text().trim();

            pu_content = JSON.parse(JSON.stringify(popup.delete));
            pu_content = pu_content.replace("$fileTitle", _title);
            pu = pu.replace("$title", "Cancella Sezione");
            pu = pu.replace("$onclick", "applyDeleteSection()");

            break;
        case "deleteComment":
            var commento = JSON.parse($("#" + target_id).data("item").content);

            pu_content = JSON.parse(JSON.stringify(popup.deleteComment));
            pu_content = pu_content.replace("$titolo", commento.titolo);
            pu_content = pu_content.replace("$sottotitolo", commento.sottotitolo);
            pu_content = pu_content.replace("$data", commento.data);
            pu_content = pu_content.replace("menu", "menu hidden");

            pu = pu.replace("$title", "Cancella");
            pu = pu.replace("$onclick", "applyDeleteComment()");

            break;
        case "permissions":
            permissions = new Permissions();
            _title = $("<span>" + $("#card_" + target_id).find(".toolbar .title").html() + "</span>")
            _title.find("i").remove() //Rimuove l'icona prima del testo. Esiste un icona solo per le cartelle riservate.
            _title = $(_title).text().trim();

            pu_content = JSON.parse(JSON.stringify(popup.permissions));
            pu_content = pu_content.replace("$nomeSezione", _title);

            pu = pu.replace("$title", "Modifica Permessi");
            pu = pu.replace("$onclick", "permissions.applyPermissions()");

            permissions.loadTemplateData(target_id);

            break;
        case "editComment":
            var commento = JSON.parse($("#" + target_id).data("item").content);

            pu_content = JSON.parse(JSON.stringify(popup.edit));

            pu = pu.replace("$title", "Modifica");
            pu = pu.replace("$onclick", "");

            break;
    }

    pu = pu.replace("$content", pu_content);

    $("body").append(pu);
};

/**
 * Rinomina il file selezionato 
 */
applyRename = function () {
    var newName = $("#renameInput").val();
    var target_id = $("#puContainer").attr("target");

    if (newName != "") {
        if (newName.search(/.pdf$/ig) == -1) {
            newName += ".pdf";
        }

        setPuLoadingState();

        var body = {'title': newName};
        var request = gapiclient.files.patch({
            'fileId': target_id,
            'resource': body
        });
        request.execute(function (resp) {
            if (!resp.code) {
                var _f = $("#entry_" + target_id + "");
                _f.attr("title", resp.title);
                _f.find(".footer .text").text(resp.title);

                closePopUp();
                //closeMenu();
            } else {
                showDriveError(resp);
            }
        });
    }
};

/**
 * Rinomina la Sezione selezionata
 */
applyRenameSection = function () {
    var newName = $("#renameInput").val();
    var target_id = $("#puContainer").attr("target");

    if (newName != "") {
        setPuLoadingState();

        var body = {'title': $("#card_" + target_id).attr("index") + " - " + newName};
        var request = gapiclient.files.patch({
            'fileId': target_id,
            'resource': body
        });

        //Invia la richiesta ai server Google ed aspetta la risposta
        request.execute(function (resp) {
            if (!resp.code) {
                var _f = $("#card_" + target_id + "");
                _i = _f.find(".toolbar .title i")

                //Verifica se il titolo è preceduto da un icona.
                if (_i.length > 0) {
                    _f.find(".toolbar .title").html(_i[0].outerHTML + resp.title.split("-")[1].trim());
                } else {
                    _f.find(".toolbar .title").text(resp.title.split("-")[1].trim());
                }

                closePopUp();
                //closeMenu();
            } else {
                showDriveError(resp);
            }
        });
    }
}

/**
 * Elimina il file selezionato 
 */
applyDelete = function () {
    setPuLoadingState();

    var target_id = $("#puContainer").attr("target");
    var _file = $("#entry_" + target_id + "");
    var _folder = _file.attr("parent").replace("parent_", "");

    var request = gapiclient.children.delete({
        'folderId': _folder,
        'childId': target_id
    });

    request.execute(function (resp) {
        if (!resp.code) {
            $("#" + _file.attr("id") + " + .file_spacer").remove();
            _file.remove();

            closePopUp();
            //closeMenu();
            //resizeList(_file.parents(".list"));
        } else {
            showDriveError(resp);
        }
    });
};

/**
 * Elimina la Sezione selezionata
 */
applyDeleteSection = function () {
    setPuLoadingState();

    var target_id = $("#puContainer").attr("target");
    var _folder = $("#card_" + target_id + "");

    var request = gapiclient.files.delete({
        'fileId': target_id
    });

    request.execute(function (resp) {
        if (!resp.code) {
            _folder.remove();

            closePopUp();
            //closeMenu();
        } else {
            showDriveError(resp);
        }
    });
}

/**
 * Elimina l'annuncio selezionato 
 */
applyDeleteComment = function () {
    setPuLoadingState();

    var commentId = $("#puContainer").attr("target");
    var _file = $("#" + commentId + "");

    var request = gapi.client.drive.comments.delete({
        'fileId': mainFolderId,
        'commentId': commentId
    });

    request.execute(function (resp) {
        if (!resp.code) {
            _file.remove();

            closePopUp();
        } else {
            showDriveError(resp);
        }
    });
};

/**
 * Applica i cambiamenti ai permessi della sezione
 */
applyPermissions = function () {

}

/**
 * Aggiunge il file selezionato. lo aggiunge anche alla pagina corrente oltre che in Google Drive 
 */
applyInsert = function () {
    var newName = $("#addInputTitle").val();
    var errors = [];

    if (newName == "")
        errors.push("empty name");
    if (!_fileData)
        errors.push("no file selected");
    if (_fileData && _fileData.type != "application/pdf")
        errors.push("wrong file type");

    if (errors.length == 0) {
        setPuLoadingState();

        var _pFolder = $("#puContainer").attr("target");
        _fileData.newName = validateNewFileName(newName, _fileData);

        startFileUpload(_fileData, _pFolder, function () {
            var _file = arguments[0];
            var _page;
            var _data;
            var newEntry;
            _file.thumbnailLink = "assets/loading.gif";
            _data = {id: _file.parents[0].id, items: [_file]};
            
            var _entry = $("#card_" + _data.id);
            var role = _entry.attr("permission");
            
            appendFiles(_data);
            
            newEntry = _entry.find("#entry_" + _file.id);
            newEntry.find(".thumbnail").addClass("waiting");

            updateEditButtonsState(_entry, role);

            //resizeList(_entry.find(".list"));

            getFileThumbnail(_file.id, function () {
                setAsFavorite(newEntry); // Imposta l'elemento corrente come "In Evidenza"
            });

            closePopUp();
        });
    } else {
        var errMessage;

        $("#addInputTitle").addClass("error");

        for (var a = 0; a < errors.length; a++)
        {
            var mSpan = "<span class='errorMessage'>";

            if (errors[a] == "empty name")
                mSpan += "- Il nome del file non può essere lasciato vuoto.";
            if (errors[a] == "wrong file type")
                mSpan += "- Il file selezionato non è valido. Si possono caricare solo file <b>PDF</b>.";
            if (errors[a] == "no file selected")
                mSpan += "- Non è stato selezionato alcun file.";

            mSpan += "</span>";

            $(".popUpBody").append(mSpan);
        }
    }
};

/**
 *Verifica i dati inseriti quando si tenta di aggiungere un file. 
 * @param {String} _text
 * @param {Object} _file
 */
validateNewFileName = function (_text, _file) {
    var toReturn = _text;

    if (_text.length == 0) {
        toReturn = null;
    } else if (_text.search(/.pdf/i) == -1) {
        toReturn += "." + _file.mtype;
    }

    return toReturn;
};


/**
 * Carica il  file selezionato sul server di Google Drive.<br>
 * Una volta finito il caricamento attivare una funzione di callback.<br><br>
 * Funzione presa da internet, non scritta da me, quindi il funzionamento non mi è del tutto chiaro,
 * però si ottiene il risultato desiderato.
 * @param {File} fileData
 * @param {String} parentFolder
 * @param {Function} callback
 */
startFileUpload = function (fileData, parentFolder, callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': fileData.newName || fileData.name,
            'mimeType': contentType,
            "parents": [{
                    "kind": "drive#file",
                    "id": parentFolder
                }]
        };

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        if (!callback) {
            callback = function (file) {
                console.log(file);
            };
        }
        request.execute(callback);
    };
};

/**
 * Mostra l'errore generato dal erver Google quando non riescea rispondere ad una  richiesta fatta tramite API
 * @param {Google Response} resp 
 */
showDriveError = function (resp) {
    var erMessage = "Errore: " + resp.code + "<br>" + resp.error.message;

    $("#puContainer").find(".pBody").html("<label>" + erMessage + "</label>");
    $(".pFooter .cancel").text("Chiudi");
    $(".pFooter .apply").css("display", "none");
};
/**
 * Causa la chiusura del Popup 
 */
closePopUp = function () {
    $("#puContainer").remove();

    currentFileId = "";
    _fileData = null;
    currentFolderId = "";
};

/**
 * Attiva la modalita caricamento del popup, necessaria quando si è in attesa di una risposta da parte del server Google,
 * dopo aver aggiunto, rinominato o cancellato un file 
 */
setPuLoadingState = function () {
    $("#addInputTitle").removeClass("error");
    $(".pFooter .apply").attr("disabled", "true");
    $(".pFooter .apply").addClass("loading");
    $(".pFooter .apply").text("");

};

/**
 * Ritorna allo stato normale del popup, dopo aver aspettato una risposta da parte del server Google,
 * dopo aver aggiunto, rinominato o cancellato un file  
 */
setPuNormalState = function () {
    $("#addInputTitle").removeClass("error");
    $(".pFooter .apply").attr("disabled", "false");
    $(".pFooter .apply").removeClass("loading");
    $(".pFooter .apply").text("OK");
};

/**
 * Funzione asincrona che carica l'immagine del file appena aggiunti.<br>
 * Deve essere asincrona in quanto, appena creato un file, il server Google non genera subito l'anteprima, 
 * quindi si deve provare a prendere l'anteprima fino a quando non è stata generata e non si riesce a caricare.
 * @param {String} _fileId
 */
getFileThumbnail = function (_fileId, callback) {
    var request = gapiclient.files.get({
        'fileId': _fileId,
        'fields': 'thumbnailLink, id'
    });

    request.execute(function (resp) {
        if (resp.thumbnailLink) {
            console.log("File has Thumbnail? TRUE");

            var pl = $("#entry_" + resp.id + "").find(".thumbnail");
            pl.attr("src", resp.thumbnailLink);
            pl.removeClass("waiting");

            callback();
        } else {
            console.log("File has Thumbnail? FALSE");

            getFileThumbnail(_fileId, callback);
        }
    });
};