<?php

class Congregazione {
    var $congExists = false;
    var $cong;
    var $mainFolderId;
    var $mainUrl;
    var $apiKey;

    function __construct($c) {
        if (file_exists("extra/" . $c . "_data.php")) {
            include "extra/main_data.php";
            include "extra/" . $c . "_data.php";

            $this->congExists = true;
            $this->cong = NAME;
            $this->mainFolderId = MAIN_FOLDER_ID;
            $this->mainUrl = MAIN_URL;
            $this->apiKey = API_KEY;
        } 
        else 
        {
            $this->cong = "";

            // Se non trova la congregazione passata, fa tornare alla pagina principale del sito.
            $http_host = $_SERVER['HTTP_HOST'];

            header('Location: http://bachecaonline.altervista.org');
        }
    }

    /**
     * Recupera la lista delle cartelle dal server DRIVE.
     */
    function getJsonUrl($orderBy, $folderId) {
        $jsonUrl = $this->mainUrl . "?orderBy=" . $orderBy . "&q=%22" . $folderId . "%22+in+parents&key=" . $this->apiKey;

        return $jsonUrl;
    }

    /**
     * Aggiunge alla pagina corrente le cartelle della bachecaonline
     */
    function getFolders() {
        if ($this->congExists == true) {
            $jsonUrl = $this->getJsonUrl("title", $this->mainFolderId);

            $json = file_get_contents($jsonUrl);
            $data = json_decode($json, true);
            $data = $data['items'];

            // controllare eventuali errori. Mi � capitato l'errore 500 dal server google.

            foreach ($data as $item) {
                include ("templates/sezione_tpl.php");
            };
        }
    }

    /**
     * Recupera il nome completo della congregazione. Lo formatta con la parola "Bacheca" davanti per essere usato come titolo della pagina.
     */
    function getTitolo() {
        if ($this->congExists == true) {
            return "Bacheca " . $this->cong;
        } else {
            return "Bacheca Online";
        }
    }

    /**
     * Recupera il nome completo della congregazione
     */
    function getFullCongregazione() {
        return $this->cong;
    }
}

?>