
<main class="main" cong="<?php echo $congId ?>">
    <!-- Toolbar principale della pagina -->
    <div class="toolbar" cong="<?php echo $congregazione ?>">
        <button class="material-button flat" id="mainMenu_btn"><!--  // Cambiare l'icona da menu a x-->
            <i class="material-icons">&#xE5D2;</i>
        </button>

        <?php
        if ($showCongregationName == true) {
            ?>

            <span class="text" >Congregazione <?php echo $congregazione ?></span>

            <?php
        }
        ?>
    </div>

    <div class="mainMenuContainer" id="mainMenuContainer">
        <div class="mainMenu" id="mainMenu">
            <div class="topBar">
                <button class="material-button flat round" id="mainMenu_close_btn"><!--  // Cambiare l'icona da menu a x-->
                    <i class="material-icons">&#xE317;</i>
                    <div class="tooltip">Chiudi Menu</div>
                </button>

                <div class="accedi">
                    <button class="material-button flat round" id="mainMenu_accedi">
                        <i class="material-icons">&#xE853;</i>
                        <div class="tooltip">Accedi</div>
                    </button>
                    <button class="material-button flat round hidden" id="mainMenu_esci">
                        <i class="material-icons">&#xE641;</i>
                        <div class="tooltip">Esci</div>
                    </button>
                    <button class="material-button flat round" id="tooltip_btn">
                        <i class="material-icons">&#xE5D3;</i>
                    </button>
                    
                </div>
            </div>

            <div class="userInfo hidden">
                <label class="userName trimText"></label>
                <label class="userEmail trimText"></label>
            </div>

            <div class="menu">
                <div class="genericMessage">
                    <label class="title">Accedi con Gmail</label>
                    <span class="text">Se hai i permessi, potrai modificare, rinominare, aggiungere o cancellare i file e le sezioni della Bacheca.</span>
                </div>
                <div class="noPermissions hidden">
                    <label class="title">Nessun Permesso</label>
                    <span class="text">Non si dispone di alcun permesso speciale, pertanto sarà possibile solo visualizzare e scaricare i file pubblici.</span>
                </div>
                <ul class="menuItems"></ul>
            </div>

        </div>
    </div>

    <?php
    switch ($pagina) {
        case "congIndex":
            include("templates/cong_content.php");
            break;
        case "index":
            include("templates/index_content.php");
            break;
    }
    ?>

</main>