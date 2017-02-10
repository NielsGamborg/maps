var app = angular.module('maps', []);

app.directive('gameBox', function() {
  return {
    restrict: 'E', //E = element, A = attribute
    scope: {},
	templateUrl: 'js/gamebox.html',
    controller: function($scope, $rootScope) {				
		$scope.countries = [{
						'country':'Denmark',
						'lat': 56.1374618,
						'lng': 8.9626239
						},{
						'country':'Netherlands',
						'lat': 52.9617992,
						'lng': 5.9212204 
						},{
						'country':'Sweden',
						'lat': 58.3924891,
						'lng': 13.8527402
						},{
						'country':'France',
						'lat': 49.4205534,
						'lng': 2.8174235
						},{
						'country':'Poland',
						'lat': 52.8786238,
						'lng': 20.6122144
						},{
						'country':'Hungary',
						'lat': 47.1900696,
						'lng': 20.0166872
						},{
						'country':'Italy',
						'lat': 44.8335474,
						'lng': 11.1296147 
						},{
						'country':'Germany',
						'lat': 51.4755394,
						'lng': 7.321255
						}];
											
						
		/* Randomizing */
		var lastRandomNumbers = [];
		var randomizer = function() {
			var random = Math.floor(Math.random() * $scope.countries.length);
			if(lastRandomNumbers.indexOf(random) > -1){ // checking for repeat random numbers and if so run function again.
				randomizer();
				return;
			}			
			lastRandomNumbers.push(random);
			if(lastRandomNumbers.length > 5){ //keppeing the random array at max 5 numbers
				lastRandomNumbers.shift();
			}
		
			$scope.shownCountry = $scope.countries[random].country;
			$scope.lat = $scope.countries[random].lat; 
			$scope.lng = $scope.countries[random].lng;
		}
		randomizer();
		
		/* Google maps init */
		$scope.initMap = function(){
			// Create a map object and specify the DOM element for display.				
			var map = new google.maps.Map(document.getElementById('mapBox'), {
			center: {lat: $scope.lat, lng: $scope.lng},
			//center: {lat: 56.2607868, lng: 9.8619532},
			scrollwheel: false,
			zoom: 14,
			mapTypeId: 'satellite',
			mapTypeControl: false,
			draggable: false, 
			zoomControl: false, 
			disableDoubleClickZoom: true,
			disableDefaultUI: true,
			streetViewControl: true
			});	
			// Create a map object and specify the DOM element for display.	
			var thePanorama = map.getStreetView();
			google.maps.event.addListener(thePanorama, 'visible_changed', function() {
				if (thePanorama.getVisible()) {
					thePanorama.setOptions({
					zoomControl: false,
					enableCloseButton: false,
					clickToGo: false,
					showRoadLabels: false,
					addressControl: false,
					linksControl: false,
					panControl: true,
					styles:[{
						featureType:"poi",
						elementType:"labels",
						stylers:[{
							visibility:"off"
						}]
					}]
					});
					//console.log('Streetview');
				}
			});	
		}
		$scope.$watchCollection("[lat, lng]", $scope.initMap); // updating google map when lattitutde or longitude is changed
		
		
		/* Setting and getting score from local storage */
		$scope.userAnswer = "null";
		if( sessionStorage.getItem('correct') == null){
			sessionStorage.setItem('correct', '0');
		}
		if( sessionStorage.getItem('wrong') == null){
			sessionStorage.setItem('wrong', '0');
		}
	
		var getSessionStorage = function() {
			$scope.correct = parseInt(sessionStorage.getItem('correct'));
			$scope.wrong = parseInt(sessionStorage.getItem('wrong'));
		}
		getSessionStorage();
		
		/* Calculating score */
		$scope.firstAnswer = true;
		$scope.onQuizBoxAnswer = function(answer) {
			$scope.selectedCountry = answer;
			if($scope.firstAnswer){
				if($scope.selectedCountry === $scope.shownCountry){
					$scope.correct = $scope.correct + 1;
					sessionStorage.setItem('correct', $scope.correct );
					$scope.userAnswer = "true";
				}else{
					$scope.wrong = $scope.wrong + 1;
					sessionStorage.setItem('wrong', $scope.wrong );
					$scope.userAnswer = "false";	
				}
				$scope.firstAnswer = false;
			}
			
		}
		
		/* Resetting score and everything */ 
		$scope.resetScore = function() {
			$scope.correct = '0';
			$scope.wrong = '0';					
			sessionStorage.setItem('correct', '0');			
			sessionStorage.setItem('wrong', '0');
			getSessionStorage();
			$scope.shownCountry = "";
			$scope.selectedCountry = "";
			$scope.reloadMap();
		}
		
		/* Reload map */
		$scope.reloadMap = function() {
			randomizer();
			$scope.userAnswer = "null";
			$scope.firstAnswer = true;
		}
		
		
		/* Reload page */		
		$scope.reloadPage = function() {
			window.location.reload();			
		}	
    }
  }
});


app.directive('mapBox', function() {
  return {
    restrict: 'E', 
    scope: {
		lat: '@',
		lng: '@',
		initMap: '&'
	},
	template: '<div id="mapBox"></div>'
  }
});



app.directive('quizBox', function() {
  return {
    restrict: 'E', //E = element, A = attribute
    scope: {
		shownCountry: '@',
		countries: '<countriesObj', // one way binding, linked to property 'countries-obj'
		onCountrySelect: '&',
		firstAnswer: '@'	
    },
	templateUrl: 'js/quizbox.html',
    link: function($scope, element, attrs) {
		var elem = angular.element(document.querySelector('#quizChoices'));	
		elem.on('click', function(e){
			//elem.addAttr('inactive');
			//elem.toggleClass('active');
			//console.log(elem);
		});
    },
    controller: function($scope) {				
		$scope.userReply = function(countryName) {
			$scope.onCountrySelect({ answer: countryName });
		}

		$scope.propertyName = 'country';
		$scope.reverse = false;
		$scope.sortBy = function(propertyName) {
			//$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			if($scope.propertyName === propertyName){
				if($scope.reverse == true){
					$scope.reverse = false
				}else{
					$scope.reverse = true
				}				
			}else{
				$scope.reverse = false;
			}
			$scope.propertyName = propertyName;
		};	
		
    }
  }
});

app.directive('scoreBox', function() {
  return {
    restrict: 'E', 
    scope: {
		correct: '@',
		wrong: '@',
		total: '@'		
    },
	templateUrl: 'js/scorebox.html',
    link: function($scope, element, attrs) {
    }
  }
});


app.directive('resultBox', function() {
  return {
    restrict: 'E', 
    scope: {
		shownCountry: '@',
		userAnswer: '@'	
    },
	templateUrl: 'js/resultbox.html',
    link: function($scope, element, attrs) {
    }
  }
});

app.directive('gameButtons', function(){
	return{
		restrict: 'E',
		scope:{
			resetScore: '&',
			reloadPage: '&',
			reloadMap: '&'
		},
		templateUrl: 'js/gamebuttons.html'		
	}	
});


/* Adding stuff to rootscope */
/*
app.run(function($rootScope){
	$rootScope.globalVar = "testing global variable";
	console.log('$rootScope',$rootScope)
});
*/





/* Example Clock */
/*
app.controller('ClockController',function($scope,$timeout) {
	$scope.clock = {};
	var updateClock = function() {
		$scope.clock.seconds = Math.floor(new Date().getTime()/1000);
		$scope.clock.time = new Date().getTime();
		//$scope.clock.now = new Date($scope.clock.time);
		$scope.clock.now = new Date($scope.clock.time).toLocaleString();
		//$scope.clock.now = new Date($scope.clock.time).toLocaleDateString();
		$timeout(function() {
			updateClock();
		},1000);
	};
updateClock();
});
*/
