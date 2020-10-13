<?php
ob_start();
?>

<div class="commento">
    <div class="body">
        <div class="titolo">$titolo</div>
        <div class="sottotitolo">$sottotitolo</div>
        <div class="data">$data</div>
    </div>

    <div class="menu">
        <button class="material-button extra">
            <i class="material-icons" title="Menù">&#xE5D4;</i>
        </button>
    </div>
</div>

<?php
return ob_get_clean();
?>
