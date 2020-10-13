<?php
ob_start();
?>

<label for="addInput" id="subtitle">Seleziona il file da caricare:</label>

<button class="fileSelect" id="fileSelector">
    <i class="material-icons">&#xE2C6;</i>
    <label class="formLabel" id="addInputOriginalTitle">Scegli file...</label>
</button>
<input type="file" id="addInput" accept=".pdf" style="display:none;" >

<label class="formLabel">Titolo:</label>
<input type="text" id="addInputTitle">

<?php
return ob_get_clean();
?>