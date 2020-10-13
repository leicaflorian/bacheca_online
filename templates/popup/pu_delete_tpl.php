<?php
	ob_start();
?>
<label id="subtitle">Sei sicuro di voler cancellare: <br><b>"$fileTitle"</b>?</label>
<br><br>
<?php
	return ob_get_clean();
?>