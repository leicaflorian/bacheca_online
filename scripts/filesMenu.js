/**
 * Evento quando si preme sul pulsante "Mostra Extra Menu" su ogni sìingolo file.
 * @param {Event} e
 */
var extra_click = function (e) {
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
        var fId = caller.parents(".entry").attr("id").replace("entry_", "");

        showPopup("rename", fId);

        menu.close();
    };

    /**
     * Evento quando si preme sul pulsante "Delete" del menu di un file..
     * @param {Event} e
     */
    var delete_click = function (e) {
        var caller = menu.getCaller();
        var fId = caller.parents(".entry").attr("id").replace("entry_", "");

        showPopup("delete", fId);

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
            ]
            break;
        default:
            menuButtons = [
                {text: "Scarica", action: download_click, icon: "&#xE2C4;", id: "download"}
            ]
            break;
    }

    //Crea effettivamente il menu e lo mostra
    menu = new Menu(menuButtons, e,
            {yPosition: "top", xPosition: "left"},
            $(e.currentTarget).parents(".entry").find(".body"))


    /*
     var extraButton = $(e.currentTarget);
     var extraButtonParent = extraButton.parent();
     var eMenu = $(JSON.parse(JSON.stringify(extra_menu)));
     var parentBody = extraButtonParent.parent(".entry").find(".content");
     var tl = new TimelineMax();	
     
     if (!extraButton.hasClass("active")){
     closeMenu();
     var card = parentBody.parents(".card");
     
     switch(card.attr("permission")){
     case "writer":
     case "owner":
     // Imposta gli eventi per ogni singolo elemento del menu
     eMenu.find(".rename").click(rename_click);
     eMenu.find(".delete").click(delete_click);
     eMenu.find(".download").click(download_click);
     break;
     default:
     eMenu.find(".rename").remove();
     eMenu.find(".delete").remove();
     
     eMenu.find(".download").click(download_click);
     break;
     }
     extraButton.find(".material-icons").html("&#xE5CD;");
     extraButton.addClass("active");
     extraButtonParent.append(eMenu);
     
     tl.to(eMenu, .3, {opacity: 1});		
     parentBody.addClass("blur");
     }else{
     closeMenu();
     }
     */
};

/**
 * Evento quando si preme sul pulsante "Aggingi", vicino al nome della cartella
 * @param {Event} e
 */
var add_click = function (e) {
    var fId = $(e.currentTarget).parents(".card").find(".list").attr("id").replace("list_", "");

    showPopup("insert", fId, e);
};

/**
 * Chiude tutti i menu "Extra", e ripristina l'icona del pulsante che lo fa mostrare.
 */
var closeMenu = function () {
    var menu = $(".extra_menu");
    var target = menu.parents(".footer").find(".active");
    var parentBody = menu.parents(".entry").find(".content");
    var tl = new TimelineMax();

    target.find(".material-icons").html("&#xE5D4;");
    target.removeClass("active");
    parentBody.removeClass("blur");

    tl.to(menu, .3, {opacity: 0, onComplete: function () {
            menu.remove();
        }});
};
