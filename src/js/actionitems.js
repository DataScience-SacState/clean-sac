$(document).ready(function() {

  	//var url = "http://159.203.247.240:3000/clusters.json"
  	var url = "http://45.55.231.68:8000/cluster"



	fetch(url)
    .then(function(res) {
      return res.json()
    })
    .then(function(json) {
      console.log("clusters recieved")
      clusters = json;
      console.log(clusters);

      var items = clusters.map(function(cluster){
      	return `<div class="clusterItem">
      				<span>${cluster.type}</span>
      				<div>
      					${cluster.latitude} ${cluster.longitude} 
      				</div>
  				</div>`
      })
      .join('')

      $("#items").html(items)

      $("#togglebtn").on("click", function() {
	    $("#dropdown").toggleClass("open");
	  });

      console.log("cluster items added")
      
    })
});

var clusters;
