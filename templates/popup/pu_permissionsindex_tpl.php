<?php
ob_start();
?>
<label for="renameInput" id="subtitle">Imposta i permessi per la sezione <b>"$nomeSezione"</b></label>
<br><br>
<div class="puPermissionsContainer loading">
</div>

<div class="puAddPermission">
    <span class="small">Aggiungi Persone:</span>

    <div class="horizontalDiv" id="puAddPermission_inputDiv">
        <input type="text" id="puAddPermission_email">
        <button class="material-button flat small" id="puAddPermission_addbutton" title="Aggiungi Persona">
            <i class="material-icons">&#xE7FE;</i>
        </button>
    </div>

    <div class="horizontalDiv" id="puAddPermission_checkboxDiv">
        <input type="checkbox" id="puAddPermission_anyonewithlink">
        <span class="small">Chiunque visita il sito può <b>visualizzare</b></span>
    </div>

</div>
<?php
return ob_get_clean();
?>