(function ( $ ) {

    var sum = "";
    var coinRowDiv = function (){
    	// retrieve or create coin row div
    	var coinRowDiv = $("#moneystack-coinrow");
    	if (coinRowDiv.length <= 0) coinRowDiv = $("<div id='moneystack-coinrow' style='position:absolute;bottom:0; left:0; right:0;height:30px'>").appendTo($(this));
    	return coinRowDiv;
    }
    
    // add coin
    var addCoinFromPrototype = function(prototypeElement) {
        var clonedElement = prototypeElement.clone(true);
		var coinRow = coinRowDiv.call(this);
		coinRowDiv.call(this).append(clonedElement);

		//TODO no no don't do this!!!
		var coinRowCenter = coinRow.width() / 2;
		var allCoinsLength = (coinRow.children().length + 1) * 20; // in px
		var newCoinIndex = coinRow.children().length;
		
		clonedElement.css("left", (coinRowCenter - allCoinsLength) + newCoinIndex * 20);
		//clonedElement.css("left", coinRowDiv.call(this).children().length * 20 + 20);
		clonedElement.css("height", "30px");
		clonedElement.addClass("moneystack-value-" + key);
	};
    var addBanknoteFromPrototype = function(prototypeElement) {
    	var $this = $(this);
    	var clonedElement = prototypeElement.clone(true);
		clonedElement.css("top", 10 + "px");
		
		$this.append(clonedElement);
		var targetLeft = 
			(clonedElement[0].complete ? 
			(($this.width() /2) - (clonedElement[0].width / 2)) :
			0);
		clonedElement.css("left", targetLeft + "px").css("visibility", "hidden").one("load", function() {
			// reposition myself when I'm loaded
			$(this).css("left", (($this.width() /2) - (this.width / 2)));
			// and appear
			$(this).css("visibility", "visible");
		}); 
		clonedElement.addClass("moneystack-value-" + key);

    };
    var sortMoney = function(shouldAnimate) {
        	// sort the money that is currently visible
        	var $this, data;
        	$this = $(this);
        	data = $this.data("moneystack");
        	var allPieces = [1, 2, 5,10,20,50,100,200,500]; // a list of available pieces
        	   
        	allPieces.reverse(); // start with higher denominations
        	
        	var y = 0;
        	var yShift = data.yShift;
    
    
    		var zIndex = 1000;
    		for (var denominationI = 0; denominationI< allPieces.length; denominationI++) {
    			var denomination = allPieces[denominationI];
    			var $pieces = $(".moneystack-value-" + denomination).not(".moneystack-reserved");
    			for (var pieceI = 0; pieceI < $pieces.length; pieceI++) 
    			{
    				var thisPiece = $pieces.eq(pieceI);
    				if (thisPiece.data("moneystack-value") >= 5) {
    				// only sort banknotes here
    					thisPiece.css("z-index", zIndex);
    					if (!shouldAnimate) {
    						// do not animate
    						thisPiece.css("top", y + "px");
    					}
    					else {
    						// should animate
    						var offset = 
    							{x: 0,
    							y: y -thisPiece.position().top}; // offset we need to move this by
    							
    						var targetPosition = {top: y, 
    						left:  (($this.width() /2) - (thisPiece[0].width / 2))};
    						//inject this info so it's available after the transform is complete
    						thisPiece.data("anim_targetPosition", targetPosition);
    						thisPiece.transition(offset,
    						function() {
    							// called once the transition is complete.
    							var targetPos = $(this).data("anim_targetPosition");
    							$(this).css(
    								{"transform": "none",
    								"top": targetPos.top + "px",
    								"left": (($this.width() /2) - ((this[0]||this).width / 2)) + "px"}
    							);
    						});
    						// make sure that once 
    					}
    					
    					
    					y += yShift;
    					zIndex++;
    					
    				}
    			
    			}
    			
    			
    		}
    
        	
        };
    
    // add the specified money pieces
    var addMoneyPieces = function(amountDictionary) {
    	// input amountDictionary: a dictionary with denominations and the respective amount needed
    	var y = 0;
    	
    	var $this = $(this);
    	var data = $this.data("moneystack");
    	var yShift = data.yShift;
    	var neededChange = amountDictionary;
    	for (key in neededChange) {
    	  if (neededChange.hasOwnProperty(key)) {
    	    var prototypeElement = data.moneyPrototypes[key];
    	    if (prototypeElement) {
    	      for (var i = 0; i < neededChange[key]; i++) {
    				if (parseFloat(prototypeElement.data("moneystack-value")) < 5) {
    					// this is a coin
    					addCoinFromPrototype.call($this, prototypeElement);
    				}
    				else {
    		              addBanknoteFromPrototype.call($this, prototypeElement);    		              
    		              y+=yShift;
    		        }
    	      }
    	    }
    	  }
    	}
    	// sort everything into place
    	sortMoney.call(this, true);
    };
    
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
    //var removeAmount = function($this, shouldAnimateChange) {
    	
    //};
    var relayout = function($this) {
    	// rearrange remaining pieces so they're neatly in line
    	//var allPieces = [500,200,100,50,20,10,5, 2, 1]; // a list of available pieces
    	var allPieces = [1, 2, 5,10,20,50,100,200,500]; // a list of available pieces
    	
    	var y = 0;
    	data = $this.data("moneystack");
    	var yShift = data.yShift;


		var zIndex = 1000;
		for (denomination in allPieces) {
			var $pieces = $(".moneystack-value-" + denomination).not(".moneystack-reserved");
			$pieces.each(function(index) {
						if ($(this).data("moneystack-value") >= 5) {
							$(this).css("top", y + "px");
							$(this).css("z-index", zIndex);
							y += yShift;
							zIndex--;
							
						}
			    		
			    	});
			
		}

    	
    };
   var changePieceToPieces = function(originalPiece, neededNewPiecesDict, shouldAnimate) {
   		var $this, data, neededPieces, returnedNewPieces, remainder;
   		$this = $(this);
   		data = $this.data("moneystack");
   		returnedNewPieces = [];
   		
   		remainder = originalPiece.data("moneystack-value"); // how much value remains from the original moneypiece
   		for (key in neededMoney) {
   			if (neededMoney.hasOwnProperty(key)) {
   				var prototypeElement = data.moneyPrototypes[key];
   				if (prototypeElement) {
   				
   				}
   			}
   		}
   		
   }; 
    var animateChangePieceToPieces = function($this, originalPiece, neededNewPieces) {
    	var data = $this.data("moneystack");
    	var y = originalPiece.offset().top;
    	var neededMoney = neededNewPieces;
    	var yShift = data.yShift;
    	var returnedNewPieces = [];
      var remainder = originalPiece.data("moneystack-value");

    	for (key in neededMoney) {
    		if (neededMoney.hasOwnProperty(key)) {
    			var prototypeElement = data.moneyPrototypes[key];
    			if (prototypeElement) {
    				for (var i = 0; i < neededMoney[key]; i++) {

    					var clonedElement = prototypeElement.clone(true);
    					clonedElement.css("top", y + "px");
              remainder -= parseFloat(key);
    					$this.append(clonedElement);
    					
    					
    					
    					
    					var targetLeft = 
    						(clonedElement[0].complete ? 
    						(($this.width() /2) - (clonedElement[0].width / 2)) :
    						0);
    					clonedElement.css("left", targetLeft + "px").css("visibility", "hidden").one("load", function() {
    						// reposition myself when I'm loaded
    						$(this).css("left", (($this.width() /2) - (this.width / 2)));
    						// and appear
    						$(this).css("visibility", "visible");
    					}); 
    					    					//clonedElement.css("left", "0px");
    					clonedElement.addClass("moneystack-value-" + key);
    					y+=yShift;
    					returnedNewPieces.push(clonedElement);
    				}
    			}
    		}
    	}

      // add change back to the wallet

      var neededChange = neededPiecesForAmount(remainder);
      for (key in neededChange) {
        if (neededChange.hasOwnProperty(key)) {
          var prototypeElement = data.moneyPrototypes[key];
          if (prototypeElement) {
            for (var i = 0; i < neededChange[key]; i++) {
				if (parseFloat(prototypeElement.data("moneystack-value")) < 5) {
					// this is a coin
					clonePrototypeAndAddCoin.call($this, prototypeElement);
				}
				else {
		              var clonedElement = prototypeElement.clone(true);
		              clonedElement.css("top", y + "px");
		
		              $this.append(clonedElement);
		              var targetLeft = 
		              	(clonedElement[0].complete ? 
		              	(($this.width() /2) - (clonedElement[0].width / 2)) :
		              	0);
		              clonedElement.css("left", targetLeft + "px").css("visibility", "hidden").one("load", function() {
		              	// reposition myself when I'm loaded
		              	$(this).css("left", (($this.width() /2) - (this.width / 2)));
		              	// and appear
		              	$(this).css("visibility", "visible");
		              }); 
		              clonedElement.addClass("moneystack-value-" + key);
		              
		              y+=yShift;
		        }
            }
          }
        }
      }


    	originalPiece.remove();
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
    	//var matrix = new WebKitCSSMatrix(style.transform);
    	var splitStyle= style.transform.split(",");
    	
    	var xTransform = parseFloat(splitStyle[4]);
    	var yTransform = parseFloat(splitStyle[5].substr(0, 1));
    	
    	offsetX +=  xTransform;
    	offsetY +=  yTransform;

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
          img.data("moneystack-value", key);
          moneyPrototypes[key] = img;
    		}
    	}

    	data.moneyPrototypes = moneyPrototypes;
    };
    var relayout = function() {
    //alert("HALLO");
    	var $this = $(this);
    	var moneyPieces = $(".moneystack-piece");
    	moneyPieces.each(function() {
    		//$(this).css("left", (($this.width() /2) - ($(this).width() / 2)) + "px");
    	});
    };
    
    var renderMoney = function($this, neededMoney) { // neededMoney is a dictionary with the denominations as keys, the amount of them needed as values
    	// render the money
    	var data = $this.data("moneystack");

    	$this.empty();

    	var y = 0;
    	// get total count of banknotes
    	var totalCount = 0;
    	for (key in neededMoney) {
    		if (parseFloat(key) >= 5 && neededMoney.hasOwnProperty(key)) {
    			for (var i = 0; i < neededMoney[key]; i++) {
    				totalCount++;
    			}
    		}
    	}
    	var yShift = data.yShift;
    	var drawingHeight =  (( ($this.height() - coinRowDiv.call($this).height()) ) - yShift*totalCount) / totalCount;
    	
    	
    	//var y = 0;

    	for (key in neededMoney) {
    		if (neededMoney.hasOwnProperty(key)) {
    			var prototypeElement = data.moneyPrototypes[key];
    			if (prototypeElement) {
    				for (var i = 0; i < neededMoney[key]; i++) {
						if (parseFloat(prototypeElement.data("moneystack-value")) < 5) {
							// this is a coin
							clonePrototypeAndAddCoin.call($this, prototypeElement);
						}
						else {
							var clonedElement = prototypeElement.clone(true);
	    					clonedElement.css("top", y + "px");
							clonedElement.css("height", drawingHeight + "px");
	    					$this.append(clonedElement);
	    					
	    					//TODO no no don't do this!!!
	    					var targetLeft = 
	    						(clonedElement[0].complete ? 
	    						(($this.width() /2) - (clonedElement[0].width / 2)) :
	    						0);
	    					clonedElement.css("left", targetLeft + "px").css("visibility", "hidden").one("load", function() {
	    						// reposition myself when I'm loaded
	    						$(this).css("left", (($this.width() /2) - (this.width / 2)));
	    						// and appear
	    						$(this).css("visibility", "visible");
	    					}); 
	    					//clonedElement.css("left", "0px");
	    					clonedElement.addClass("moneystack-value-" + key);
	    					y+=(drawingHeight+yShift);
						}
    					
    					
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
    		var $unmatchedPieces = $(".moneystack-piece").not(".moneystack-reserved");
    		$unmatchedPieces.transition({opacity: 0.3});
    		
    		setTimeout(function() {
    			$matchedPieces.each( function(index) {
    				// gather everything in the center of the screen first
    				sendPieceToPosition($this, $(this),

    					{x: $("body").width() / 2 - $(this).width()/2,
    					 y: $("body").width() / 2 - $(this).width()/2});

    				var $thisPiece = $(this);
    				setTimeout(function() {sendPieceToPositionAndDisappear($this, $thisPiece, targetPosition);}, 1000);
    				
    			});
    		}, 1000);
			setTimeout(function() {
			
				reshufflePieces($this); 
				$unmatchedPieces.transition({opacity: 1});
				
		} , 2500);

    	},
    	init: function(options) {
    		var $this = $(this);
    		var data = $this.data('moneystack');
    		if (!data) {
    			// initial run
    			$( window ).resize(function() {
    				//reshufflePieces($this);
    				relayout.call($this);
    			});
    			// create mainDiv
    			$this.addClass("moneystack-container");
    			// add coin row div
    			//setTimeout(function() {
    			//	var coinRowDiv = $('<div id="moneystack-coinrow">Hallo</div>').appendTo($this);
    			//}, 100);
    			
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
	    		                    yShift: 30,
	    		                    amount: 40


    		               	 });


    		   




    		    $this.data("moneystack", data);

    		    loadMoneyPieces($this, data.denominationFilenameDict);
    		    addMoneyPieces.call($this, neededPiecesForAmount(data.amount));
    		}
    	},

    	setMoney: function(amt) {
    		var amount = parseFloat(amt);
    		var $this,
    			neededPieces,
    			data,
    			currentAmount;
    		$this =  $(this);
    		//neededPieces = neededPiecesForAmount(amount),
    		data = $this.data("moneystack");
    		currentAmount = data.amount;
    		
			// see if we need to add or remove money
			if (amount == currentAmount) return; // no change needed
			else if (amount < currentAmount) {
				// remove money
				// TODO
				//removeAmount.call($this, (currentAmount-amount) );	
				data.amount = amount;
				// clear
				$this.empty();
				var neededNewMoney = neededPiecesForAmount(amount);
				addMoneyPieces.call($this, neededNewMoney);
				
			}
			else if (amount > currentAmount) {
				// add money
				var difference = amount - currentAmount;
				var neededNewMoney = neededPiecesForAmount(difference);
				addMoneyPieces.call($this, neededNewMoney);
				
				data.amount = amount;
			}
    		//renderMoney($(this), neededPieces);
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
