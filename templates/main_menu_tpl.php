
<?php
ob_start();
?>
	<!-- Sezione che adrà a contenere la lista dei file -->
<div class="card favcard" id="favParent">
	<!-- Toolbar della sezione che adrà a contenere la lista dei file -->
	<div class="toolbar">
		<span class="title">In Primo Piano</span>
	</div>
	
	<div class="list loading" id='favFolder'>
	</div>

	<div class="box_shadow_overlay">
		<div class="left_shadow box_shadow"></div>
		<div class="right_shadow box_shadow"></div>
	</div>
</div>
<?php
return ob_get_clean();
?>