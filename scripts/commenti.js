/*
  * Tutti i commenti che aggiungerò, saranno posizionati sulla cartella principale della bacheca,
  * quindi sarà indipendente da tutte le altre cartelle.
  * Questo permetterà di leggere i commenti imemdiatamente in un colpo solo. 
  * I commenti saranno visibili solo a chi esegue l'accesso.'
  */

appendCommentsFolder = function(){
	var folderTmpl = JSON.parse(JSON.stringify(folder_template));
	var firstSection = $(".card").get(0);
	
	folderTmpl = folderTmpl.replace("$title", "Annunci");
	folderTmpl = folderTmpl.replace(/\$id/g, "annunci");
	folderTmpl = $(folderTmpl);
	folderTmpl.find(".list").addClass("verticale");
	folderTmpl.addClass("annunci");
	folderTmpl.attr("permission", "writer");
	
	folderTmpl.insertBefore(firstSection);
	
	addBoxShadow($("#favFolder"));
};
function abc(e){
	var cde = "ddkjghk"
}

appendComments = function(data){
	if (!data.code && data.items.length > 0){
		if ($("#list_annunci").length == 0){
			appendCommentsFolder();
		}
		
		$.each(data.items, function(index, item){
			var commento = JSON.parse(JSON.stringify(commento_template));
			var content = JSON.parse(item.content);
			
			commento = commento.replace("$titolo", content.titolo);
			commento = commento.replace("$sottotitolo", content.sottotitolo);
			commento = commento.replace("$data", content.data);
			commento = $(commento);
			commento.find(".material-button.extra").click(showExtraMenu);
			commento.attr("id", item.commentId);
			commento.data("item", item);
			
			$("#list_annunci").append(commento);
			
			if (index == data.items.length -1){
				$("#list_annunci").removeClass("loading");
				$("#list_annunci .mdl-spinner").remove();
			}
		});
	}else{
		console.warn(data);
	}
};


getComments = function(callback){
	var request = gapiclient.comments.list({
			'fileId' : mainFolderId
		});
		
	request.execute(function(resp){		
		if (callback)
			callback(resp);
	});
};

showExtraMenu = function(e){
	var extraButton = $(e.currentTarget);
	var extraButtonParent = extraButton.parents(".menu");
	var eMenu = $(JSON.parse(JSON.stringify(extra_menu)));
	var parentBody = extraButtonParent.parent(".commento").find(".body");
	var tl = new TimelineMax();	
	
	if (!extraButton.hasClass("active")){
		closeExtraMenu();
		var card = parentBody.parents(".card");
		
		switch(card.attr("permission")){
			case "writer":
			case "owner":
				// Imposta gli eventi per ogni singolo elemento del menu
				
				eMenu.find(".delete").click(deleteComment);
				eMenu.find(".edit").click(editComment);
				
				eMenu.find(".rename").remove();
				eMenu.find(".download").remove();
			break;
		}
		
		if (extraButton.parents(".commento").position().top <= 90){
			eMenu.addClass("under");
		}
		
		extraButton.find(".material-icons").html("&#xE5CD;");
		extraButton.addClass("active");
		extraButtonParent.append(eMenu);
		
		tl.to(eMenu, .3, {opacity: 1});		
		parentBody.addClass("blur");
	}else{
		closeExtraMenu();
	}
};

deleteComment = function(e){
	var cEntry = $(e.currentTarget).parents(".commento");
	var cData = cEntry.data();
	
	showPopup("deleteComment", cEntry.attr("id"), e);
	
};

editComment = function(e){
	var cEntry = $(e.currentTarget).parents(".commento");
	var cData = cEntry.data();
	
	showPopup("editComment", cEntry.attr("id"), e);
	
};

closeExtraMenu = function(){
	var menu = $(".extra_menu");
	var target = menu.parents(".list").find(".active");
	var parentBody = menu.parents(".list").find(".blur");
	var tl = new TimelineMax();

	target.find(".material-icons").html("&#xE5D4;");
	target.removeClass("active");
	parentBody.removeClass("blur");
	
	tl.to(menu, .3, {opacity: 0, onComplete:function(){
		menu.remove();
	}});
};

startCommentsLoading = function(){
	//getComments(appendComments);
};



