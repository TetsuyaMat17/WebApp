/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false, REDIPS: true */

/* enable strict mode */
"use strict";

// define redips_init variable
var redipsInit;

// redips initialization
redipsInit = function () {
	
	// reference to the REDIPS.drag library and message line
	var	rd = REDIPS.drag,
		msg = document.getElementById('message');
	// how to display disabled elements
	rd.style.borderDisabled = 'solid';	// border style for disabled element will not be changed (default is dotted)
	rd.style.opacityDisabled = 60;		// disabled elements will have opacity effect
	// initialization
	rd.init();
	// only "smile" can be placed to the marked cell
	rd.mark.exception.d8 = 'smile';
	// prepare handlers
	rd.event.clicked = function () {
		msg.innerHTML = 'Clicked';
	};
	rd.event.dblClicked = function () {
		msg.innerHTML = 'Dblclicked';
	};
	rd.event.moved  = function () {
		msg.innerHTML = 'Moved';
	};
	rd.event.notMoved = function () {
		msg.innerHTML = 'Not moved';
	};
	rd.event.dropped = function () {
		msg.innerHTML = 'Dropped';
	};
	rd.event.switched = function () {
		msg.innerHTML = 'Switched';
	};
	rd.event.clonedEnd1 = function () {
		msg.innerHTML = 'Cloned end1';
	};
	rd.event.clonedEnd2 = function () {
		msg.innerHTML = 'Cloned end2';
	};
	rd.event.notCloned = function () {
		msg.innerHTML = 'Not cloned';
	};
	rd.event.deleted = function (cloned) {
		// if cloned element is directly moved to the trash
		if (cloned) {
			// set id of original element (read from redips property)
			// var id_original = rd.obj.redips.id_original;
			msg.innerHTML = 'Deleted (c)';
		}
		else {
			msg.innerHTML = 'Deleted';
		}
	};
	rd.event.undeleted = function () {
		msg.innerHTML = 'Undeleted';
	};
	rd.event.cloned = function () {
		// display message
		msg.innerHTML = 'Cloned';
		// append 'd' to the element text (Clone -> Cloned)
		rd.obj.innerHTML += 'd';
	};
	rd.event.changed = function () {
		// get target and source position (method returns positions as array)
		var pos = rd.getPosition();
		// display current row and current cell
		msg.innerHTML = 'Changed: ' + pos[1] + ' ' + pos[2];
	};
	
	
	REDIPS.drag.dropMode = "single";
	
	REDIPS.drag.enableDrag(true);
};



//////////////////////////////
//LOAD FUNCTION
/////////////////////////////
var redips = {};
// redips initialization
redips.init = function () {
	// reference to the REDIPS.drag library
	var	rd = REDIPS.drag;
	// initialization
	rd.init();
	// error handler called if error occured during loading table content
	rd.error.loadContent = function (obj) {
		// display error message (non blocking alert)
		setTimeout(function () {
			alert(obj.message + ' (error type ' + obj.type + ')');
		}, 100);
		// return false on first error and stop further processing
		//return false;
	};
	// set reference to the target table
	redips.targetTable = document.getElementById('table1');
};


// method called on button1 click
// JSON data is retrieved from server
redips.button1 = function () {
		
					/*$.ajax({
						url: "/get2/tabledata",
						success: function(json) {
						var tabledata;
						var parsed2 = JSON.parse(tabledata);
						REDIPS.drag.loadContent(redips.targetTable, parsed2);
						}	
					});*/
	
	REDIPS.drag.loadContent(redips.targetTable, 'test.json');
};


// method called on button2 click
// JSON data is put as second parameter
redips.button2 = function () {
		
	var tabletest = $('#table1').tableToJSON();
	/*var table_content;
	// prepare table content of first table in JSON format or as plain query string (depends on value of "type" variable)
	table_content = REDIPS.drag.saveContent('table1');*/
	console.log(tabletest);
	alert(JSON.stringify(tabletest)); 
	
	REDIPS.drag.loadContent('myTable', JSON.stringify(tabletest));
	//REDIPS.drag.loadContent('myTable', [["d6", 0, 1, "green", "B1"], ["d6", 6, 2, "green", "B2"], ["d7", 7, 4, "green", "B3"]]);
};


redips.button3 = function () {
	// prepare JSON data to place to the HTML table
	var data = document.getElementById('textField').value;
	// place content to the table
	REDIPS.drag.loadContent(redips.targetTable, data);
};

// method deletes all DIV elements with redips-drag class name from table with id=myTable
redips.clearTable = function () {
	REDIPS.drag.clearTable('table1');
};

////////////////////////////////////////////////////////////////////////

// toggles trash_ask parameter defined at the top
function toggleConfirm(chk) {
	if (chk.checked === true) {
		REDIPS.drag.trash.question = 'Are you sure you want to delete?';
	}
	else {
		REDIPS.drag.trash.question = null;
	}
}

// toggles delete_cloned parameter defined at the top
function toggleDeleteCloned(chk) {
	REDIPS.drag.clone.drop = !chk.checked;
}

// enables / disables dragging
/* CHANGED FROM FUNCTION, TO RUN AT START OF SCRIPT - ALWAYS ON 
function toggleDragging(chk) {
	REDIPS.drag.enableDrag(chk.checked);
} */

// function sets drop_option parameter defined at the top
/* CHANGED FROM FUNCTION, TO RUN AT START OF SCRIPT
function setMode(radioButton) {
	REDIPS.drag.dropMode = "single";
}*/	


// show prepared content for saving
function save(type) {
	// define table_content variable
	var table_content;
	// prepare table content of first table in JSON format or as plain query string (depends on value of "type" variable)
	table_content = REDIPS.drag.saveContent('table1', type);

	// if content doesn't exist
	if (!table_content) {
		alert('Table is empty!');
	}
	// display query string
	else if (type === 'json') {

		$.ajax({
				type: "POST",
				url:"post6/json",
				data: {table_content: JSON.stringify(table_content)},
				dataType:'json',
				contentType: "application/x-www-form-urlencoded",
	   		success: function(data) {
        		alert('Data was succesfully captured');
      	}
			});
		alert('Data was succesfully captured');
	}
}



//add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redips.init, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redips.init);
}

if (window.addEventListener) {
	window.addEventListener('load', redipsInit, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redipsInit);
}


