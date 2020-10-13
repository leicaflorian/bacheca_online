<?php
	ob_start();
?>
<div id="puContainer" target="$targetId">
	<div class="bkgOverlay" id="bkgOverlay"></div>
	
	<div class="puBack">
		<div class="popUp" id="popUp">
			<!-- header -->
			<div class="pHeader">
				<h3 class="pTitle">$title</h3>
			</div>
			
			<!-- body -->
			<div class="pBody">
				$content
			</div>
			
			<!-- footer -->
			<div class="pFooter">
				<button class="cancel" onclick="closePopUp()">ANNULLA</button>
				<button class="apply" onclick="$onclick">OK</button>
			</div>
		</div>
	</div>
</div>
<?php
	return ob_get_clean();
?>