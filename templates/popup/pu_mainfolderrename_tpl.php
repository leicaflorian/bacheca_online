<?php
ob_start();
?>

<label for="renameInput" id="subtitle">Immetti un nuovo nome per la congregazione:</label>
<br><br>
<input type="text" id="renameInput" value="$renameValue">

<?php
return ob_get_clean();
?>