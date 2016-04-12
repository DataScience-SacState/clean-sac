var lock = new Auth0Lock('tMhGths7WYZtiOsXL4C6zi2vOfluNMYO', 'mattmerr47.auth0.com');
var profile = null;
function signin(success) {
	if (profile) {
		success();
		return;
	}
	lock.showSignin(/*{
		callbackURL: 'http://localhost:3000/callback'
		, responseType: 'code'
		, authParams: {
			scope: 'openid profile'
		}},//*/
		function onLogin(err, prof, id_token) {
			if (err) {
				// There was an error logging the user in
				console.error(err);
				return alert(err.message);
			}
			profile = prof;
			console.log(profile);

			// User is logged in
			success();
		}
	);
	/*
	lock.show({
		callbackURL: 'http://localhost:8080/'
		, responseType: 'code'
		, authParams: {
			scope: 'openid profile'
		}
	});*/
}

$(document).ready(function() {
	//var map = L.map('map').setView([38.5, -121.4], 8);
	map = L.map('map').setView([38.5, -121.4]);
	locationMarker = L.marker([38.5, -121.4]).addTo(map);


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data',
	    //maxZoom: 10,
	    accessToken: 'pk.eyJ1IjoiZGF2aWRqdWRpbGxhIiwiYSI6ImNpbXNuMjMwMTAxb2d1cmtrZ3N3bmduamkifQ.as1RkuLlTRWvMsFicckmYw',
	    id: 'mapbox.streets'
	}).addTo(map);

	map.locate({ setView: true, maxZoom: 12 });

	map.on('locationfound', onLocationFound);


	$("#slideupBtn").on("click", function() {
		setFormMarkerLatLng()
		//signin(function() {
			$("#trashReport").toggleClass("open");
		//});
	});

	$("#togglebtn").on("click", function() {
		$("#dropdown").toggleClass("open");
	});

	$("#submitBtn").on("click", function(e) {
		e.preventDefault();

		var $type = $("#type");
		var typeValue = $type[0].options[($type[0].selectedIndex)].innerHTML;
		var $description = $("#description");
		var descriptionValue = $description[0].value.trim();
		var lat = locationMarker.getLatLng().lat;
		var lng = locationMarker.getLatLng().lng;

		signin(function() {
			//var url = `http://159.203.247.240:3000/create?description=${}&latitude=${}&longitude${}`
			//var url = "http://159.203.247.240:3000/reports.json"; //http://10.113.219.153:3000/
			// var url = 'http://localhost:3000/create?reporter='+profile.user_id+'&description=test&latitude=test&longitude=test&type=Graffiti';
			//var url = 'http://159.203.247.240:3000/create?reporter='+profile.user_id+'&description=test&latitude=test&longitude=test&type=Graffiti';
			var url = `http://159.203.247.240:3000/create?reporter=${profile.user_id}&description=${descriptionValue}&latitude=${lat}&longitude=${lng}&type=${typeValue}`;
			console.log(url);

			$.ajax({
				url: url,
				type: 'GET',
				success: function (data) {
					console.log(data);
					$description[0].value = "";
					alert(`Success! Your Report ID is ${data.id}`)
				},
				error: function (err) {
					if (eff.status)
					console.error("Failed ajax")
				}
			})
		});
	});

	$("#cancelBtn").on("click", function() {
		$("#trashReport").toggleClass("open");
	});
	
});

var map,
	locationMarker,
	center,
	pos,
	lat, 
	lng,
	latlng;

function setFormMarkerLatLng() {
	pos = locationMarker.getLatLng();
	lat = pos.lat.toFixed(2);
	lng = pos.lng.toFixed(2);
	console.log(pos);
	latlng = `${lat}, ${lng}`;


	$(".trashForm .form_latlong").text(latlng);
}

function onLocationFound(e) {
		
	console.log("FOUND YOU");

	locationMarker.setLatLng(e.latlng);
    
    map.on('move', function() {
		locationMarker.setLatLng(map.getCenter());

		// $(".app__navbar").hide();
		// $("#slideup").hide();

	})

	map.on('dragend', function() {
		center = map.getCenter();
		setFormMarkerLatLng();

		// $(".app__navbar").show();
		// $("#slideup").show();

	})
};
