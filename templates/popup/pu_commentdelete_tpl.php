<?php
	ob_start();
?>
<label>Sei sicuro di voler cancellare quest'annuncio?</label>

<?php echo include("./template/commento.php"); ?>

<?php
	return ob_get_clean();
?>