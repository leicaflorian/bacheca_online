<?php

if (isset($_GET["cong"])) {
    include "extra/main_data.php";
    include "extra/" . $_GET["cong"] . "_data.php";

    $tmpl = array();
    $tmpl['folder'] = include "templates/sezione_tpl.php";
    $tmpl['file']   = include "templates/file_tpl.php";
    $tmpl['popup']  = include "templates/popup/pu_index_tpl.php";
    $tmpl['popup_delete'] = include "templates/popup/pu_delete_tpl.php";
    $tmpl['popup_rename'] = include "templates/popup/pu_rename_tpl.php";
    $tmpl['popup_insert'] = include "templates/popup/pu_addfile_tpl.php";
    $tmpl['popup_commentdelete'] = include "templates/popup/pu_commentdelete_tpl.php";
    $tmpl['popup_commentedit']   = include "templates/popup/pu_commentedit_tpl.php";
    $tmpl['popup_permissions']      = include "templates/popup/pu_permissionsindex_tpl.php";
    $tmpl['popup_permissionsentry'] = include "templates/popup/pu_permissionsentry_tpl.php";
    $tmpl['popup_mainfolderrename'] = include "templates/popup/pu_mainfolderrename_tpl.php";
    $tmpl['mainFolderId'] = MAIN_FOLDER_ID;
    $tmpl['api_key'] = API_KEY;
    $tmpl['main_url'] = MAIN_URL;
    $tmpl['fav_folder'] = include "templates/sezione_fav_tpl.php";
    $tmpl['commento']   = include "templates/commento_tpl.php";

    echo json_encode($tmpl);
}
?>