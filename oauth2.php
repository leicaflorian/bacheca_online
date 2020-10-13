<?php
	include "extra/main_data.php";
	
	if (isset($_POST["fields"]) && isset($_POST["cong"])){
		$toreturn = (object) "";
		
		foreach ($_POST["fields"] as $par){
			switch ($par){
				case "oauthid":
						$toreturn->$par = getOauthId();
					break;
				case "scopes":
						$toreturn->$par = getScopes();
					break;
			}
		};
		
		echo json_encode($toreturn);
	};
	
	function getOauthId(){
		return OAUTH_KEY;
	}
	function getScopes(){
		return SCOPES;
	}
?>