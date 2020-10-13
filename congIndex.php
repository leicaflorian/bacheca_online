<?php

require_once("functions/congregazione.class.php");

$titolo = "";
$congregazione = "";
$congId = "";
$versione = "2.1.504";
$pagina = "congIndex";
$showCongregationName = true;
$showFooterContent = true;

// c = nome della congregazione passato nell'url. Non viene visto perchè viene cambiato tramite il file htaccess
if (isset($_GET["c"])) {
    $congregazione = preg_replace("/[^A-Za-z0-9_-]/", '', $_GET["c"]);
    $congId = $congregazione;
    $cong = new Congregazione($congregazione);

    $titolo = $cong->getTitolo();
    $congregazione = $cong->getFullCongregazione();
}

include("templates/main_header.php");
include("templates/main_body.php");
include("templates/main_footer.php");
?>