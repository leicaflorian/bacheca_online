/**
 * Classe che contiene tutte le funzioni eseguibili sui file e le cartelle,
 * come aggiungere, cancellare, rinominare.
 * @returns {GapiFiles}
 */
function GapiFiles() {
    //
    // Funzioni relative alle FOLDER
    //


    /**
     * Crea una cartella in google drive con il titolo passato e con il parent indicato.
     * Accetta una funzione di callback che si verifica quando il server Google risponde al request.
     * @param {String} parentId
     * @param {String} folderTitle
     * @param {Function} callback
     * @returns {none}
     */
    this.addFolder = function (parentId, folderTitle, callback) {
        var fileMetadata = {
            'title': folderTitle,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [{id: parentId}]
        };

        var request = gapiclient.files.insert({
            resource: fileMetadata,
            fields: 'id'
        });

        request.execute(function (file) {
            callback(file);
        });
    };

    /**
     * Rinomina una cartella in google drive con il titolo passato e con l'id indicato.
     * Accetta una funzione di callback che si verifica quando il server Google risponde al request.
     * @param {String} folderId
     * @param {String} folderTitle
     * @param {Function} callback
     * @returns {none}
     */
    this.renameFolder = function (folderId, folderTitle, callback) {
        var body = {
            'title': folderTitle
        };

        var request = gapiclient.files.patch({
            'fileId': folderId,
            'resource': body
        });

        //Invia la richiesta ai server Google ed aspetta la risposta
        request.execute(function (resp) {
            callback(resp);
        });
    };

    /**
     * Elimina la cartella con l'id passato. 
     * Accetta una funzione di callback che si verifica quando il server Google risponde al request.
     * @param {String} folderId
     * @param {Function} callback
     * @returns {none}
     */
    this.deleteFolder = function (folderId, callback) {
        var request = gapiclient.files.delete({
            'fileId': folderId
        });

        request.execute(callback);
    };


    //
    // Funzioni relative ai FILE
    //


    /**
     * Carica sul server Google il file passato in formato file, ricevuto dal controller "input" "type=file"
     * @param {String} parentId
     * @param {File} fileToUpload
     * @param {Function} callback
     * @returns {none}
     */
    this.addFile = function (parentId, fileToUpload, callback) {
        var newName = $("#addInputTitle").val();

        fileToUpload.newName = newName;

        /**
         * Carica il  file selezionato sul server di Google Drive.<br>
         * Una volta finito il caricamento attiva una funzione di callback.<br><br>
         * Funzione presa da internet, non scritta da me, quindi il funzionamento non mi è del tutto chiaro,
         * però si ottiene il risultato desiderato.
         * @param {File} fileData
         * @param {String} parentFolder
         * @param {Function} callback
         */
        function startFileUpload(fileData, parentFolder, callback) {
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
        }
        ;

        startFileUpload(fileToUpload, parentId, callback);
    };

    /**
     * Rinomina un file passando il suo ID
     * @param {String} fileId
     * @param {String} fileTitle
     * @param {Function} callback
     * @returns {none}
     */
    this.renameFile = function (fileId, fileTitle, callback) {
        var body = {
            'title': fileTitle
        };

        var request = gapiclient.files.patch({
            'fileId': fileId,
            'resource': body
        });

        //Invia la richiesta ai server Google ed aspetta la risposta
        request.execute(function (resp) {
            callback(resp);
        });
    };

    /**
     * Elimina un file passando il suo ID
     * @param {String} fileId
     * @param {Function} callback
     * @returns {none}
     */
    this.deleteFile = function (fileId, callback) {
        var request = gapiclient.files.delete({
            'fileId': fileId
        });

        request.execute(callback);
    };

    /**
     * Recupera il contenuto di una cartella, cercando anche le cartelle private e riservate.<br>
     * Questa funzione necessita che l'utente abbia effettuato l'accesso tramite oAuth2. 
     *
     * @param {String} id
     * @param {Function} callback
     */
    this.getAccessibleContent = function (id, queryString, callback) {
        var request;

        if (queryString != null) {
            request = gapiclient.files.list({
                'q': queryString
            });
        } else {
            request = gapiclient.files.list({
                'q': "'" + id + "' in parents"
            });
        }

        request.execute(function (resp) {
            resp.id = id;

            if (callback)
                callback(resp);
        });
    };

    /**
     * Recupera dal Drive tutte le Folder dove l'utente ha accesso. 
     * @param {String} id - Main Folder Id
     * @param {function} callback
     * @returns {none}
     */
    this.getPropertyFolders = function (id, callback) {
        var request = gapiclient.files.list({
            'q': "('me' in writers and '" + id + "' in parents) or ('me' in readers and '" + id + "' in parents)"
                    //'q': "('me' in writers and '" + id + "' in parents) or ('me' in readers  and '" + id + "' in parents and fullText contains 'riservato')"
        });

        request.execute(function (resp) {
            if (callback)
                callback(resp);
        });
    };

    /**
     * Recupera le informazioni di un singolo file.
     * Funzione utile quando si cerca di vedere se un file ha o meno l'immagine di anteprima.
     * @param {String} fileId
     * @param {Function} callback
     * @returns {none}
     */
    this.getFileInfo = function (fileId, callback) {
        var request = gapiclient.files.get({
            'fileId': fileId
        });

        request.execute(function (resp) {
            if (callback)
                callback(resp);
        });
    };
}

function gGapiPermissions() {
    var permissionsToDelete,
            permissionsToChange,
            permissionsToAdd,
            waitingCount = 3,
            callback;


    /**
     * Aspetta che il counter "waitingCount" arrivi a 0. 
     * Questo indica che tutti gli aggiornamenti dei permessi sono andati a termine e quindi 
     * può chiamare la funzione di callback.
     * @returns {none}
     */
    function dispatchWaitingDone() {
        if (waitingCount === 0) {
            callback();
        }
    }

    /**
     * Aggiorna il counter "waitingCount".
     * @param {Number} index
     * @param {Array} target
     * @returns {nonme}
     */
    function updateWiatingCounter(index, target) {
        if (index === target.length - 1) {
            waitingCount -= 1;

            dispatchWaitingDone();
        }
    }

    /**
     * Manda al server google la richiesta di cancellazione per ogni singolo permesso
     * che si trova nell'array "permissionsToDelete".
     * @returns {none}
     */
    function deletePendingUsers() {
        if (permissionsToDelete.length > 0) {
            $.each(permissionsToDelete, function (index, p) {
                var request = gapiclient.permissions.delete({
                    'fileId': p.fileId,
                    'permissionId': p.permissionId
                });
                request.execute(function (resp) {
                    console.log(resp);

                    updateWiatingCounter(index, permissionsToDelete);
                });
            });
        } else {
            updateWiatingCounter(-1, permissionsToDelete);
        }
    }

    /**
     * Manda al server google la richiesta di aggiornamento per ogni singolo permesso
     * che si trova nell'array "permissionsToChange".
     * @returns {none}
     */
    function updatePendingUsers() {
        if (permissionsToChange.length > 0) {
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
                        console.log(resp);

                        updateWiatingCounter(index, permissionsToChange);
                    });
                });
            });
        } else {
            updateWiatingCounter(-1, permissionsToChange);
        }
    }

    /**
     * Manda al server google la richiesta di aggiunta per ogni singolo permesso
     * che si trova nell'array "permissionsToAdd".
     * @returns {none}
     */
    function addPendingUsers() {
        if (permissionsToAdd.length > 0) {
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

                    updateWiatingCounter(index, permissionsToAdd);
                });
            });
        } else {
            updateWiatingCounter(-1, permissionsToAdd);
        }
    }

    //
    // FUNZIONI PUBBLICHE
    //

    /**
     * Funzione che manda al server google tutte le richieste per l'aggiornamento dei 
     * permessi relativi al file corrente.
     * Si appoggia alla classe "Permissions" che si occupa di gestire la creazione, cancellazione e
     * modifica dei permessi in base alla finestra popup.
     * @param {Permissions} permissions
     * @param {function} _callback
     * @returns {none}
     */
    this.updateFolderPermissions = function (permissions, _callback) {
        changesList = permissions.getChangesLists();
        permissionsToDelete = changesList.permissionsToDelete;
        permissionsToChange = changesList.permissionsToChange;
        permissionsToAdd = changesList.permissionsToAdd;

        callback = _callback;

        deletePendingUsers();
        updatePendingUsers();
        addPendingUsers();
    };

    this.getFolderPermissions = function (folderId, callback) {
        var request = gapi.client.drive.permissions.list({
            'fileId': folderId
        });

        request.execute(function (resp) {
            resp.id = folderId;

            if (callback)
                callback(resp);
        });
    };

    this.getIdFromEmail = function (email, callback) {
        var request = gapi.client.drive.permissions.getIdForEmail({
            'email': email
        });
        request.execute(function (resp) {
            if (callback) {
                callback(resp.id);
            }
        });
    };
}

function GapiProperties() {
    this.setFavParameter = function (fileId, value, callback) {
        var body = {'value': value,
            'key': 'fav',
            'visibility': 'PUBLIC'};
        var request = gapiclient.properties.insert({
            'fileId': fileId,
            'resource': body
        });

        request.execute(function (resp) {
            if (callback)
                callback(resp);
        });
    };
}