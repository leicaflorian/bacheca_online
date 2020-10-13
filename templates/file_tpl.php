<?php
if (isset($item) == false) {
    $item['id'] = '$id';
    $item['title'] = '$title';
    $item['webContentLink'] = '$webContentLink';
    $item['alternateLink'] = '$alternateLink';
    $item['thumbnailLink'] = '$thumbnailLink';

    $parent = '$parent';

    ob_start();
}
?>
<!-- Elemento della lista -->
<div class="entry" id="entry_<?php echo $item['id'] ?>" role="link" parent="parent_<?php echo $parent ?>" title="<?php echo $item['title'] ?>" fav="$fav">
    <!-- Body dell'Entry della lista -->
    <div class="body" link="<?php echo $item['alternateLink'] ?>" download_link="<?php echo $item['webContentLink'] ?>">
        <div class="content">
            <img src="<?php echo $item['thumbnailLink'] ?>" alt="pdf" class="thumbnail">	
            <button class="material-button fav-star">
                <i class="material-icons">&#xE838;</i> 	
            </button>
        </div>
    </div>

    <!-- Footer dell'Entry della lista -->
    <div class="footer">
        <span class="text"><?php echo $item['title'] ?></span>

        <button class="material-button flat extra">
            <i class="material-icons" title="Modifica">&#xE5D4;</i>
        </button>
    </div>
</div>

<?php
if ($item['id'] == '$id') {
    $item = null;
    return ob_get_clean();
}
?>
