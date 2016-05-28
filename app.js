// Variables de galeria y mapa
var galeria;
var map;

$(window).load(function() { // Ejecutar cuando la web esté ya cargada
	$("#cargando").delay(2000).hide(0);
});

$(function() {
	
	$.getJSON('https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' 
		 + api_key + '&user_id=' +user_id + 
		'&format=json&nojsoncallback=1',
		function(json){

			galeria = new crearGaleria(); //Creamos la galeria
			galeria.actualizar(json); // Actualizamos
		
			asignarClic(); // Asignamos la funcion de click a las imagenes	
		}
	);
	
	$('#buscadorMenu').click(function(e) { // Enlace para abrir el buscador
		e.preventDefault(); // Para bloquear el normal funcionamiento del enlace
		$('#buscador').toggle('slow');
	});	
	
	$('#buscar').click(function(e) { // Boton de buscar
		e.preventDefault();
		$('#buscador').toggle('slow'); // ocultamos
		
		// primer paso, leer lo que hay puesto
		var min_take_date; // Fecha mínima de captura
		if ($("#minTakeDate").datepicker('getDate') != null) {
			min_take_date = $("#minTakeDate").datepicker('getDate').getTime() / 1000;
		}
		
		var max_taken_date; // Fecha máxima de captura
		if ($("#maxTakeDate").datepicker('getDate') != null) {
			max_taken_date = $("#maxTakeDate").datepicker('getDate').getTime() / 1000;
		}
		
		var tags; // tags
		if ($("#tags").val() != "") {
			tags = $("#tags").val();
		}

		var contenido = $("#contenido").val(); // tipo de contenido
			
		var geo; // las coordenadas de la geolocalizacion
		if ($("#geolocalizacion").val() != "") {
			geo = $("#geolocalizacion").val();
			geo = geo.split(", ");
		}
		
		var safe = $("#busquedaSegura").val(); // tipo de busqueda
		
		// Ahora vamos a generar la consulta
		var jsonTmp = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=" + api_key + "&user_id=" +user_id;

		if (typeof min_take_date != "undefined") {
			jsonTmp = jsonTmp + "&min_taken_date=" + min_take_date;
		}

		if (typeof max_taken_date != "undefined") {
			jsonTmp = jsonTmp + "&max_taken_date=" + max_taken_date;
		}

		if (typeof tags != "undefined") {
			jsonTmp = jsonTmp + "&tags=" + tags;
		}

		if (typeof geo != "undefined") {
			jsonTmp = jsonTmp + "&lat=" + geo[0] + "&lon=" + geo[1] + "&radius=32";
		}

		jsonTmp = jsonTmp + "&content_type=" + contenido;
		jsonTmp = jsonTmp + "&safe_search=" + safe;
		jsonTmp = jsonTmp + "&format=json&nojsoncallback=1";
		
		// Ya tenemos la consulta lista, la llamamos mediante AJAX		
		$.getJSON(jsonTmp,
			function(json){
				galeria.clear(); // Limpiamos las imagenes, miniatura y mostramos el cargar
				galeria.actualizar(json); // Regeneramos la galeria con el nuevo json
				asignarClic(); // Asignamos las funciones de click a las imagenes
			});
		
		$('body, html').animate({ // Subimos a la parte superior de la galeria
        	scrollTop: $('#vista-grande').offset().top 
    	}, 600);
	});	
	
	
	inicializarDatapicker(); // Para generar los datapicker y sus funciones
	inicializarGeolocalizacion(); // Para generar el mapa de Google Maps y sus funciones

});

function inicializarGeolocalizacion() {

	$("#geolocalizacion").focusin(function (e) { // Si hacemos focus sobre el input geolocalizacion, se muestra el mapa
		$("#map").show();
		iniciarMapa();
	});
	
	$("#geolocalizacion").focusout(function (e) { // Si perdemos el focus, ocultamos el mapa
    	$("#map").toggle('slow');
	});
	
	$("#geolocalizacion").keypress(function(e) { // Para permitir únicamente borrar las coordenadas
		e.preventDefault();
		if(e.keyCode == 46 || e.keyCode == 8) {
        	$("#geolocalizacion").val("");
    	}
	});	
}

function inicializarDatapicker() {
	$.datepicker.regional['es'] = {
		closeText: 'Cerrar',
		prevText: '<Ant',
		nextText: 'Sig>',
		currentText: 'Hoy',
		monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
		dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
		dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
		weekHeader: 'Sm',
		dateFormat: 'dd/mm/yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
	};

	$.datepicker.setDefaults($.datepicker.regional["es"]);
	$("#locale").change(function() {
		$("#minTakeDate").datepicker("option",
			$.datepicker.regional[$(this).val()]);
		$("#maxTakeDate").datepicker("option",
			$.datepicker.regional[$(this).val()]);
    });
	
	$("#minTakeDate").datepicker();
	$("#maxTakeDate").datepicker();
}

function iniciarMapa() {
	var mapAux = $("#map");
	map = new google.maps.Map(mapAux[0], {
		//center: {lat: 37.753, lng: -122.447}, San Francisco
		center: {lat: 40.400, lng: -3.683},
		zoom: 8
	});

	// Creamos el listener del clic, para recoger las coordenadas
	map.addListener("click", function(event) {
		var latitude = event.latLng.lat();
		var longitude = event.latLng.lng();
		$('#geolocalizacion').val(latitude + ", " + longitude);
	});
}

function asignarClic() {
	$("img").click(function(e) {
		if ($(this).attr('id') != 'imagen-grande') {
    		$('#imagen-grande').attr('src', galeria.url[this.id]);
			$("#titulo").text(galeria.title[this.id]);
			$('body, html').animate({ 
        		scrollTop: $('#vista-grande').offset().top 
    		}, 600);
		}
	});
}

function crearGaleria() {

	// Para actualizar la galeria con un json dado como parametro
	this.actualizar = function(json) {
		this.info = json;
		this.item = new Array();
		this.url = new Array();
		this.url_m = new Array();
		this.title = new Array();

		if (this.info.photos.photo.length == 0) { // Si no hay fotos con esa busqueda, mostramos el error
			$("#titulo").text("No existen imágenes con esos criterios de búsqueda.");
		} else {
			var i;
			for (i = 0; i < this.info.photos.photo.length; i++) {
				this.item[i] = this.info.photos.photo[i];
				this.url[i] = 'https://farm' + this.item[i].farm + ".staticflickr.com/" + this.item[i].server + '/' + this.item[i].id + '_' + this.item[i].secret + '.jpg';
				this.url_m[i] = 'https://farm' + this.item[i].farm + ".staticflickr.com/" + this.item[i].server + '/' + this.item[i].id + '_' + this.item[i].secret + '_m.jpg';
				this.title[i] = this.item[i].title;
			}

			for (i = 0; i < galeria.item.length; i++) {
				$("#miniaturas").append($('<li><img class="miniaturas" src="' + galeria.url_m[i] + '" title="' + galeria.title[i] + '" alt="' + galeria.title[i] + '" id = "' + i + '"></li>'));
			}
			$("#vista-grande").append($('<img src="' + this.url[0] + '" title="' + galeria.title[0] + '" alt="' + galeria.title[0] + '" id="imagen-grande">'));
			$("#titulo").text(galeria.title[0]);
		}
		
		$("#cargando").delay(2000).hide(0); // Ocultamos el cargar pasados 2 segundos
	}
	
	// Para limpiar la galeria
	this.clear = function() {
		$("#miniaturas").empty();
		$("#vista-grande").empty();
		$("#cargando").show();
	}

}