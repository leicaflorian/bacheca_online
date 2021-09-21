# Bacheca Online

To work properly a folder "**extra**" must be added in the root.

Inside we must create a file "**main_data.php**" with the folowing code:

``` php
<?php
	define("API_KEY",  "custom api key");
	define("OAUTH_KEY",  "custom oauth key");
	define("SCOPES",  "https://www.googleapis.com/auth/drive profile");
	define("MAIN_URL",  "https://www.googleapis.com/drive/v2/files");
?>
```

For each congregationm we want to add a new file inside the folder "extra" must be added, called "**name_data.php**".
This file must contain: 

```php 
<?php
	define("NAME", "Schio Pasubio"); 
	define("ID", "schiopasubio");
	define("MAIN_FOLDER_ID", "drive folder id");
?>
```