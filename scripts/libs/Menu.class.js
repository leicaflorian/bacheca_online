/**
 * data = Array di oggetti o singolo oggetto contenente:
 * text: String,
 * icon: String(materialdesign icon name or code),
 * action: Function,
 * id: String
 * 
 * mouseEvent = evento click - viene usato per recuperare l'oggetto sul quale si clicka.
 * 
 * settings = Object contente "yPosition": String(top, bottom), "xPosition": String(left, right)
 * 
 * target = riferimento all'oggetto che verrà Blurrato (meglio in jQuery). Necessita di una classe css "blur" che attivi il blur.
 * 
 * Necessita della librerira TImeLineMax
 * Necessita della librerira jQuery per far funzionare TimeLineMax
 */
function  Menu(data, mouseEvent, settings, target) {
    var entrys = []; //Array contenente oggetti: Voci - text; icon; action, id
    var caller;
    var oldButtonFunction;

    /**
     * <b>Initialize the Menu</b>
     * Crea la sua struttura ed associa i suoi eventi
     * e poi lo aggiunge alla pagina corrente
     */
    function init(data) {
        /**
         * Popola l'array <b>entrys</b> con le relative voci
         */
        function populateEntrys(data) {
            entrys.push(data);
        }

        /**
         * Salva i dati relativi al caller (pulsante che ha chiamato il menu)
         * e all'OldButtonFunction (funzione originale del pulsante che ha chiamato il menu)
         */
        function saveOldData() {
            oldButtonFunction = mouseEvent.currentTarget.onclick;
            caller = mouseEvent.currentTarget;
        }

        /**
         * Disegna sulla pagina il menu creato
         */
        function drawMenu() {
            var container = document.createElement("div");
            container.className = "extra_menu";
            container.innerHTML = "<ul></ul>"

            for (entry in entrys) {
                entry = entrys[entry]
                var li = document.createElement("li");
                li.className = entry.id;
                li.id = entry.id;
                li.innerHTML = entry.text;
                li.onclick = entry.action;

                // Determina se aggiungere o meno un icona
                if (entry.icon != "" && entry.icon != null) {
                    var icon = document.createElement("i");
                    icon.className = "material-icons";
                    icon.innerHTML = entry.icon;

                    li.prepend(icon);
                }

                //Aggiunge le voci al container
                container.getElementsByTagName("ul")[0].appendChild(li)
            }
            container = $(container);
            container.css("opacity", 0);

            //Aggiunge il menu completo alla pagina
            $("body").append(container)

            //Imposta la posizione del container dopo che è stato aggiunto alla pagina.
            setPosition(container);

            //Mostra l'elemento con un fadeIn ed aggiunge una funzione che cattura il click del mouse, così che il menù venga chiuso quando si clicka fuori dal menu.
            var tl = new TimelineMax();
            tl.to(container, .50, {opacity: 1, onComplete: function () {
                    changeButtonsFunction("new");

                    document.body.onmousedown = function (e) {
                        if (($(e.target).parents(".extra_menu").length == 0 && e.target.className != "extra_menu")) {
                            closeMenu();
                            document.body.onmousedown = null;
                        }
                    }
                }}, "start");

            //Applica l'effetto blur
            if (target != null) {
                var blurElement = {a: 0};
                var t = $(target);

                tl.to(blurElement, .50, {a: 3, onUpdate: function (e) {
                        TweenMax.set(t, {'-webkit-filter':'blur('+(this.target.a)+'px)', 'filter':'blur('+(this.target.a)+'px)'});
                    }}, "start");
            }
            ;
        }

        // Se data è un Array, per ogni elemento lo aggiunge al menu,
        // altrimenti se esiste un solo elemento, lo aggiunge direttamente al menu.
        if (data.constructor === Array) {
            for (entry in data) {
                populateEntrys(data[entry]);
            }
        } else {
            populateEntrys(data);
        }
        ;

        //Salva il caller (pulsante che attiva il menu) ed il mouseEvent (evento avvenuto con il click sul pulsante)
        saveOldData();

        //Se il caller, che è il pulsante che attiva il menu ha la class "opened", allora indica che il menù è già stato aperto per quel pulsante. Così lo chiude senza attivare la funzione di default del pulsante stesso.
        if ($(caller).hasClass("opened")) {
            closeMenu();
        } else {
            drawMenu();
        }
    }
    ;

    /**
     * Imposta la posizione sulla pagina del Container rappresentante il menu
     */
    function setPosition(container) {
        var x, y;

        // Imposta la posizione della coordinata Y
        switch (settings.yPosition) {
            case "top":
                y = ($(mouseEvent.currentTarget).offset().top + mouseEvent.currentTarget.clientHeight) - container[0].clientHeight
                break;
            case "bottom":
                y = $(mouseEvent.currentTarget).offset().top
                break;
            case "under":
                y = $(mouseEvent.currentTarget).offset().top + mouseEvent.currentTarget.clientHeight
                break;
        }
        // Imposta la posizione della coordinata X
        switch (settings.xPosition) {
            case "left":
                x = ($(mouseEvent.currentTarget).offset().left) - container[0].clientWidth - Number($(mouseEvent.currentTarget).css("margin-left").replace("px", ""));
                break;
            case "right":
                x = ($(mouseEvent.currentTarget).offset().left) + mouseEvent.currentTarget.clientWidth + Number($(mouseEvent.currentTarget).css("margin-left").replace("px", ""));
                break
            case "underLeft":
                x = ($(mouseEvent.currentTarget).offset().left + mouseEvent.currentTarget.clientWidth) - container[0].clientWidth;
                break;
        }

        // Applica le coordinate X e Y
        if (mouseEvent != null) {
            container.css("left", x + "px");
            container.css("top", y + "px");
        }
        ;
    }

    /**
     * Chiude il menu aperto
     */
    function closeMenu() {
        var menu = document.getElementsByClassName("extra_menu");
        menu = $(menu);

        // Constrolla se ci sono menu aperti così li chiude
        if (menu.length > 0) {
            var blurElement = {a: 3};
            var t = $(target);


            var tl = new TimelineMax();
            tl.to(menu, .35, {opacity: 0, onComplete: function () {
                    menu.remove();
                    changeButtonsFunction("old");
                }}, "start");
            tl.to(blurElement, .50, {a: 0, onUpdate: function (e) {
                    TweenMax.set(t, {'-webkit-filter':'blur('+(this.target.a)+'px)', 'filter':'blur('+(this.target.a)+'px)'});
                }}, "start");
        }
    }

    /**
     * type: "new" - Cambia la funzione del pulsante che ha attivato il menu, così che riclickandolo, chiude il menu.
     * type: "old" - Ripristina la funzione originale del pulsante che ha attivato il menu.
     */
    function changeButtonsFunction(type) {
        if (type == "new") {
            $(caller).addClass("opened");
        } else if (type == "old") {
            $(caller).removeClass("opened");
        }
    }

    this.getCaller = function () {
        return $(caller);
    }

    this.close = function () {
        closeMenu();
    }

    /**
     * Da il via alla creazione del menu
     */
    init(data)
}
;
