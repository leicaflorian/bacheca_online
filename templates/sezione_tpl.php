<?php
if (isset($item) == false) {
    $item['id'] = '$id';
    $item['title'] = '$title';
    $str[0] = '$index';
    $str[1] = '$title';
    $item["userPermission"]["role"] = "reader";

    ob_start();
} else {
    $str = explode(" - ", $item['title']);
}
?>

<!-- Sezione che adrà a contenere la lista dei file -->
<div class="card" id="card_<?php echo $item["id"] ?>" permission="<?php echo $item["userPermission"]["role"] ?>" index="<?php echo $str[0] ?>" type="normal">

    <!-- Toolbar della sezione che adrà a contenere la lista dei file -->
    <div class="toolbar">
        <span class="title"><?php echo $str[1] ?></span>
        <div class="spacer"></div>
        <button class="material-button raised add">
            <i class="material-icons" title="Aggiungi File">&#xE2C6;</i>
        </button>
        <button class="material-button raised extraFolder">
            <i class="material-icons" title="Extra">&#xE5D4;</i>
        </button>
    </div>

    <div class="list loading" id='list_<?php echo $item["id"] ?>'></div>

    <div class="noFileMessage">
        <p >Questa sezione non contiene ancora nessun file. Fail click sul pulsante <b>"Aggiungi File"</b> per iniziare ad aggiungere un nuovo file.</p>
    </div>
    <div class="loadingSpinner ">
        <img class="spinner" src="assets/puff.svg">
    </div>


    <div class="box_shadow_overlay">
        <div class="left_shadow box_shadow"></div>
        <div class="right_shadow box_shadow"></div>
    </div>
</div>

<?php
if ($item['id'] == '$id') {
    $item = null;
    return ob_get_clean();
}
?>