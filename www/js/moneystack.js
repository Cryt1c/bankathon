(function ( $ ) {
 
    var sum = "";
    function neededPiecesForAmount(amount) {
    	var allPieces = [500,200,100,50,20,10,5, 2, 1]; // a list of available pieces
    	var neededPieces = {}; // the needed number of pieces per piece 
    	amount = parseFloat(amount);
    	index = 0;
    	var remainder = amount; 
    	while (remainder >= 1) {
    		if (remainder / allPieces[index] >= 1) {
    			remainder -= allPieces[index];
    			if (neededPieces[allPieces[index]]) {
    				neededPieces[allPieces[index]] ++;
    			}
    			else {
    				neededPieces[allPieces[index]] = 1;
    			}
    		} 
    		else {
    			index++;
    		}
    	}
    	
    	var str = "";
    	for (var key in neededPieces) {
    		if (neededPieces.hasOwnProperty(key)) {
    			str += (key +": " + neededPieces[key] + "\n");
    		}
    	}
    	
    	return neededPieces;
    };
    var reshufflePieces = function($this) {
    	// rearrange remaining pieces so they're neatly in line
    	var y = 0;
    	data = $this.data("moneystack");
    	var yShift = data.yShift;
    	
    	var $pieces = $(".moneystack-piece").not(".moneystack-reserved");
    	
    	
    	$pieces.each(function(index) {
    		$(this).css("top", y + "px");
    		y += yShift;
    		
    	});
    };
    var animateChangePieceToPieces = function($this, originalPiece, neededNewPieces) {
    	var data = $this.data("moneystack");
    	var y = originalPiece.offset().top;
    	var neededMoney = neededNewPieces;
    	var yShift = data.yShift;
    	var returnedNewPieces = [];
    	for (key in neededMoney) {
    		if (neededMoney.hasOwnProperty(key)) {
    			var prototypeElement = data.moneyPrototypes[key];
    			if (prototypeElement) {
    				for (var i = 0; i < neededMoney[key]; i++) {
    					
    					var clonedElement = prototypeElement.clone();
    					clonedElement.css("top", y + "px");
    					
    					$this.append(clonedElement);
    					clonedElement.css("left", (($this.width() /2) - (clonedElement.width() / 2)) + "px");
    					clonedElement.addClass("moneystack-value-" + key);
    					y+=yShift;	
    					returnedNewPieces.push(clonedElement);
    				}
    			}
    		}
    	}
    	
    	//originalPiece.remove();
    	return returnedNewPieces;
    };
    var sendPieceToPosition = function($this, piece, targetPosition) {
	    var $piece = $(piece);
	    
	    // figure out the offset of targetPosition from the piece
	    var offsetX = targetPosition.x - ($piece.offset().left) ; 
	    var offsetY = targetPosition.y - ($piece.offset().top) ; 
	    
	    $piece.transition({x: offsetX, y:offsetY});
	    
    };
    var sendPieceToPositionAndDisappear = function($this, piece, targetPosition) {
    	// sends the given (money) piece to the specified target position ({x, y}) - GLOBAL coordinates
    	var $piece = $(piece);
    	var targetScale= 0.1; // the value the piece will be scaled to on its path
    	
    	// figure out the offset of targetPosition from the piece
    	var offsetX = targetPosition.x - ($piece.offset().left) ; 
    	var offsetY = targetPosition.y - ($piece.offset().top) ; 
    	
    	// see if a transition is already applied
    	var style = window.getComputedStyle($piece.get(0));  // Need the DOM object
    	var matrix = new WebKitCSSMatrix(style.webkitTransform);
    	offsetX +=  matrix.m41;
    	offsetY +=  matrix.m42;
    	
    	// 
    	var currentSize = {width: $piece.width(), height: $piece.height()};
    	var targetSize = {width: currentSize.width * targetScale, height: currentSize.height * targetScale};
    	
    	var transformX = ((currentSize.width /2) -( targetSize.width / 2)) + offsetX;
    	var transformY = ((currentSize.height /2) -( targetSize.height / 2)) + offsetY;
    	
    	
    	var topLeftToCenterDistance = {x: currentSize.width/2, y:currentSize.height/2};
    	$piece.transition({x: offsetX-topLeftToCenterDistance.x, y:offsetY-topLeftToCenterDistance.y, scale: targetScale, opacity: 0});
    	
    	setTimeout(function() { $piece.remove() }, 1000);
    };
    
    var loadMoneyPieces = function($this, denominationFilenameDict) {
    	// denominationFilenameDictionary: map of denominations (500, 200,100...) to image filenames)
    	var prefix = "img/money/";
    	var data = $this.data("moneystack");
    	var moneyPrototypes = {}; // a dictionary that will hold the money element prototypes
    	for (var key in denominationFilenameDict) {
    		if (denominationFilenameDict.hasOwnProperty(key)) {
    			// load the prototypical element for this banknote
    			var img = $("<img class='moneystack-piece' src='" + (prefix + denominationFilenameDict[key])  + "'/>");
    			moneyPrototypes[key] = img;
    		}
    	}
    	
    	data.moneyPrototypes = moneyPrototypes;
    };
    var renderMoney = function($this, neededMoney) { // neededMoney is a dictionary with the denominations as keys, the amount of them needed as values
    	// render the money
    	var data = $this.data("moneystack");
    	
    	$this.empty();
    	
    	var y = 0;
    	var yShift = data.yShift; 
    	//var y = 0;
    	
    	for (key in neededMoney) {
    		if (neededMoney.hasOwnProperty(key)) {
    			var prototypeElement = data.moneyPrototypes[key];
    			if (prototypeElement) {
    				for (var i = 0; i < neededMoney[key]; i++) {
    					
    					var clonedElement = prototypeElement.clone();
    					clonedElement.css("top", y + "px");
    					
    					$this.append(clonedElement);
    					clonedElement.css("left", (($this.width() /2) - (clonedElement.width() / 2)) + "px");
    					clonedElement.addClass("moneystack-value-" + key);
    					y+=yShift;	
    				}
    			}
    		}
    	}
  	};
    var methods = {
    	deductAndSendAmountToLocation: function(amount, targetPosition) {
    		var $this = $(this);
    		var data = $this.data('moneystack');
    		
    		// deduct the specified amound and send it to this (absolute) location
    		allMatchedPieces = [];
    		
    		// first, figure out what pieces we would need
    		
    		var neededPieces = neededPiecesForAmount(amount); // this is a dictionary "500": 2 etc if 1000 Euros needed
    		
    		// do we have these pieces? 
    		var remainder = amount;
    		for (key in neededPieces) {
    			if (neededPieces.hasOwnProperty(key)) {
    				$matchingPieces = $(".moneystack-value-" + key);
    				$matchingPieces.each(function(index) {
    					allMatchedPieces.push($(this));
    					$(this).addClass("moneystack-reserved");
    					remainder -= parseFloat(key);
    				});
    			}
    		}
    		
    		// now for the remainder
    		// find one banknote that has at least this value before splitting it up
    		var allPieces = [500,200,100,50,20,10,5, 2, 1];
    		var neededPiecesForRemainder = neededPiecesForAmount(remainder);
    		
    		
    		for (var i = 0; i < allPieces.length; i++) {
    			$matchingPiece = $(".moneystack-value-" + allPieces[i]).not(".moneystack-reserved");
    			if ($matchingPiece.length > 0) {
    				// we found a matching piece
    				// this will now be split up 
    				var newPieces = animateChangePieceToPieces($this, $matchingPiece.eq(0), neededPiecesForRemainder);
    				for (var i = 0; i < newPieces.length; i++) {
    					$(newPieces[i]).addClass("moneystack-reserved");
    				}
    				break;
    			}
    		}
    		
    		
    		
    		// TODO do rest
    		
    		
    		var $matchedPieces = $(".moneystack-reserved");
    		setTimeout(function() {
    			$matchedPieces.each( function(index) {
    				// gather everything in the center of the screen first
    				sendPieceToPosition($this, $(this), 
    				
    					{x: $("body").width() / 2 - $(this).width()/2,
    					 y: $("body").width() / 2 - $(this).width()/2});
    				
    				var $thisPiece = $(this);
    				setTimeout(function() {sendPieceToPositionAndDisappear($this, $thisPiece, targetPosition);}, 1000);
    				setTimeout(function() {reshufflePieces($this);} , 500);
    			});
    		}, 1000);
    		
    		
    	},
    	init: function(options) {
    		var $this = $(this);
    		var data = $this.data('moneystack');
    		if (!data) {
    			// initial run
    			$( window ).resize(function() {
    				reshufflePieces($this);
    			});
	    		data = $.extend(options, {
	    		                    mainDiv : null,
	    		                    denominationFilenameDict: {
	    		                    	"500": "500.png",
	    		                    	"200": "200.png",
	    		                    	"100": "100.png",
	    		                    	"50": "50.png",
	    		                    	"20": "20.png",
	    		                    	"10": "10.png",
	    		                    	"5": "5.png",
	    		                    	"2": "2.png", 
	    		                    	"1": "1.png"
	    		                    
	    		                    },
	    		                    moneyPrototypes: null,
	    		                    yShift: 100
	    		                    
	    		                    
    		               	 });
    		               	 
    		    
    		    // create mainDiv 
    		    $this.addClass("moneystack-container");
    		    
    		    
    		    
    		    
    		    $this.data("moneystack", data);
    		    
    		    loadMoneyPieces($this, data.denominationFilenameDict);
    		}
    	},
    	
    	setMoney: function(amount) {
    		var $this= $(this);
    		var neededPieces = neededPiecesForAmount(amount);
    		
    		renderMoney($(this), neededPieces);
    	},
    	deductMoney: function(amount, target) {
    	
    	},
    	addMoney: function(amount, source) {
    	
    	}
    };
    
 	$.fn.moneystack = function( method ) {
 	
 	    if ( method  && methods[method]) {
 	    	return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
 	    }
 		else if (!method || (typeof method === "object")) {
 			return methods.init.apply(this, Array.prototype.slice.call(arguments, 1));
 		}
 	
	};
    
 
}( jQuery ));