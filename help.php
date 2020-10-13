<?php 
	$title = "Bacheca Online";
	ob_start();
?>
	<link rel="stylesheet" href="/styles/index.css">
	
	<h1>Guida all'utilizzo</h1>
	<p class="subPar">Ogni congregazione ha a disposizione una sua area riervata dove caricare i propri programmi, come ad esempio, il programma dei Discorsi Pubblici o dell'Adunanza Infrasettimanale.<br>
		Questi programmi saranno consultabili liberalmente da chiunque abbia l'indirizzo del sito, quindi è preferibile evitare di inserire nei programmi numeri di telefono o altri dati sensibili. <br>
	</p>

	<br>
	
	<h2>Come aggiungere un collegamento rapido sul desktop?</h2>
	<h3 class="subPar"><i>PC Windows o Mac</i></h3>
	<p class="subPar">Dipenderà da quale Browser Internet state usando, cioè da quale programma usate per navigare in internet.<br>
		<b>Google Chrome:</b><br>
		<div class="sezione_guida">
			<img src="/assets/guida/chrome_preferiti.jpg"/><br>
			<p>Sulla barra in alto, dove c'è l'indirizzo del sito internet, nella parte destra, troverete un icona a forma di stella</p><br>
		</div>
		
		<div class="sezione_guida">
			<div>
				<img src="/assets/guida/chrome_preferiti_popup.jpg"/><br>
				
			</div>
			<p><img src="/assets/guida/chrome_preferiti_aggiunto.jpg"/><br>Fate click sulla stellina, la quale diventerà di colore giallo e vi comparirà una finestrella che vi chiederà dove salvare il collegamento. Alla voce "Cartella", selezionare "Barra dei Preferiti", così che vi comparirà il collegamento al sito sulla barra sotto l'indirizzo del sito.</p><br>
		</div>
		<b>Firefox:</b><br>
		<b>Microsoft Edge:</b><br>
	</p>
<?php
	$content = ob_get_clean();
?>

<?php include "template/single.php" ?>
