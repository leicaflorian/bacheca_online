/**
 * Dati da passare nell'object data:
 * 
 * title - Titolo del popup
 * subtitle - Testo da scrivere come istruzioni per la finsetra popup.
 * referenceId - Id della cartella di riferimento di Google Drive
 * applyEvent - Evento per il pulsante "OK" del popup
 * type - Tipologia del popup. Il parametro deve essere uguale a una delle proprietà della variabile globale "popup". 
 * inputs - Array di object degli input da compilare con vari dati. - {"iddell'object" : "valore da impostare"}
 * 
 * @param {Object} data
 * @returns {Popup}
 */
function Popup(data) {
    var _pu;
    var _data;
    var that;
    var fileData;

    /**
     * Trasforma un elemento, come in questo caso la stringa contente il template, in un nuovo elemento.
     * Praticamente crea una copia su cui poter lavorare e modificare.
     * @param {String} text
     * @returns {none}
     */
    function JSONparse(text) {
        return JSON.parse(JSON.stringify(text))
    }
    ;

    /**
     * Carica il layout base del template, composto dal titolo e dai pulsanti "Annulla" e "OK"
     * @returns {none}
     */
    function loadPuIndex() {
        _pu = JSONparse(popup.index);
        _pu = _pu.replace("$targetId", data.referenceId || "");

        _pu = $(_pu);

        _pu.find(".pTitle").text(data.title || "");

        _pu.find(".cancel").removeAttr("onclick");
        _pu.find(".cancel").click(close);

        _pu.find(".apply").removeAttr("onclick");
        _pu.find(".apply").click(function () {
            that.toogleLoadingState(true);

            if (data.applyEvent)
                data.applyEvent();
        });

        _pu.find(".pBody").ready(data.onLoad || null);
    }

    /**
     * Carica il contenuto del popup
     * @returns {none}
     */
    function loadPuContent() {
        var _content = JSONparse(popup[data.type || ""]);

        _pu.find(".pBody").html(_content);

        _pu.find("#subtitle").html(data.subtitle || "");

        $.each(data.inputs || [], function (key, obj) {
            _pu.find("#" + obj.id).val(obj.value);
        });

        if (data.type === "insert") {
            _pu.find("#addInput").change(function (e) {
                fileData = new File().fileInputSelection(that);
            });

            _pu.find("#fileSelector").click(function () {
                _pu.find("#addInput").trigger("click");
            });
        }
    }

    /**
     * Chiude la finestra Popup
     * @returns {undefined}
     */
    function close() {
        new TimelineMax().to(
                _pu.find(".popUp"), .35, {opacity: 0})
                .to(_pu.find(".bkgOverlay"), .35, {opacity: 0, onComplete: function () {
                        $("#puContainer").remove();
                    }}, "-=0.20");


    }

    /**
     * Inizializza il popup, il suo contenuto e gli eventi dei pulsanti.
     * @returns {none}
     */
    function init() {
        _data = data;

        loadPuIndex();
        loadPuContent();

    }

    /**************************************************************************
     * Funzioni Pubbliche
     **************************************************************************/



    /**
     * Funzione pubblica che mostra effettivamente la finestra popup.
     * @returns {undefined}
     */
    this.show = function () {
        _pu.find(".bkgOverlay").css("opacity", 0);
        _pu.find(".popUp").css("opacity", 0);

        $("body").append(_pu);

        new TimelineMax().to(
                _pu.find(".bkgOverlay"), .35, {opacity: .5})
                .to(_pu.find(".popUp"), .35, {opacity: 1}, "-=0.20");

    };

    /**
     * Funzione pubblica che chiude la finestra Popup
     * @returns {undefined}
     */
    this.close = function () {
        close();
    };


    /**
     * Funzione pubblica che imposta lo stato del popup su "Loading".
     * Neccessita del parametro Boolean "true".
     * @param {Boolean} value
     * @returns {undefined}
     */
    this.toogleLoadingState = function (value) {
        if (value === true) {
            $("#addInputTitle").removeClass("error");
            $(".pFooter .apply").attr("disabled", "true");
            $(".pFooter .apply").addClass("loading");
            $(".pFooter .apply").text("");
            $(".pFooter .apply").off();
        } else {
            $("#addInputTitle").removeClass("error");
            $(".pFooter .apply").attr("disabled", "false");
            $(".pFooter .apply").removeClass("loading");
            $(".pFooter .apply").text("OK");
        }
    };

    /**
     * Mostra l'errore generato dal erver Google quando non riescea rispondere ad una  richiesta fatta tramite API
     * @param {Google Response} resp 
     */
    this.showErrors = function (resp) {
        var erMessage = "Errore: " + resp.code + "<br>" + resp.error.message;

        $("#puContainer").find(".pBody").html("<label>" + erMessage + "</label>");
        $(".pFooter .cancel").text("Chiudi");
        $(".pFooter .apply").css("display", "none");
    };

    /**
     * Recupera il valore di un certo input passando il suo id.
     * @param {String} inputId
     * @returns {String}
     */
    this.getInputValue = function (inputId) {
        var input = $("#" + inputId);

        return input.val();
    };

    this.getFileToUpload = function () {
        return fileData;
    };

    init();

    that = this;
}