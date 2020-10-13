<?php
	ob_start();
?>
<form method="post" class="comment_form">
  <div class="form_item">
    <label class="form_label">Tipo annuncio:</label>
    <div class="item_content">
    	<input type="text" class="select_label">
	    <select id="commentType">
	      <option value="portamicrofoni">Portamicrofoni</option>
	      <option value="acustica">Acustica</option>
	      <option value="usciere">Usciere</option>
	      <option value="lettore_tdg">Lettore TdG</option>
	      <option value="espositore_mobile">Espositore Mobile</option>
	      <option value="adu_servizio_di_campo">Adunanza Servizio di Campo</option>
	      <option value="accomp_paolina">Accompagnamento Paolina</option>
	      <option value="adu_infrasettimanale">Adunanza Infrasettimanale</option>
	      <option value="altro">Altro</option>
	    </select>
    </div>
  </div>
  
  <div class="form_item">
    <label class="form_label">Contenuto:</label>
     <div class="item_content">
    	<textarea></textarea>
    </div>
  </div>
  
  <div class="form_item">
    <label class="form_label">Data:</label>
     <div class="item_content">
	    <input type="date"/>
	    <div class="checkbox">
	    	<input type="checkbox" id="all_week">
	    	<label class="checkbox_label" for="all_week">Per tutta la settimana</label>
	    </div>
    </div>
    
  </div>
</form>
<?php
	return ob_get_clean();
?>