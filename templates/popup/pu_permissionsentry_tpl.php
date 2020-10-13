<?php
ob_start();
?>
<div class="permissionsEntry" pId="$pId" role="$pRole">
    <img id="pImg" src="$pPhoto">

    <div class="permissionsEntryNames">
        <label id="pName" class="pEntryText">$pName</label>
        <label id="pEmail" class="pEntryText">$pEmail</label>
    </div>	

    <button class="material-button flat dropDown" id="pRole" prole="$pRole">$pRoleContent</button>

    <button class="material-button flat small deleteUser" title="Cancella Persona">
        <i class="material-icons">&#xE14C;</i>
    </button>

</div>
<?php
return ob_get_clean();
?>