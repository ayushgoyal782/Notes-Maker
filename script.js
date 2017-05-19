(function($){
	
	var db;

	var openRequest = indexedDB.open("list",1);
	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(!thisDB.objectStoreNames.contains("liststore")) {
			thisDB.createObjectStore("liststore", { autoIncrement : true });
		}
	}
	openRequest.onsuccess = function(e) {
		console.log("Open Success!");
		db = e.target.result;
        renderList();
	}
	openRequest.onerror = function(e) {
		console.log("Open Error!");
		console.dir(e);
	}
	console.log(document.getElementsByClassName('addbtn'));
	
	$('.addbtn').click(function(){
		
			$('#text').css("display", "block");
			
        });

	$('#ok').click(function(){

		$('#text').css("display", "none");
			var subject = check(document.getElementById('subject').value);
			var message = check(document.getElementById('message').value);
			var author = check(document.getElementById('author').value);
			
			if (!subject.trim()||!message.trim()||!author.trim()) {
        		//empty
        	} else {
        		addWord(subject,message,author);
        	}
			
        });

	function check(text){
				text=text.replace(/</g, '&lt;');
				text=text.replace(/>/g, '&gt;');
				text=text.replace(/&/g, '&amp;');
				return text;
	}
	
	function addWord(t1,t2,t3) {
		var currentdate = new Date(); 
		var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() +" "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
		
		var transaction = db.transaction(["liststore"],"readwrite");
		var store = transaction.objectStore("liststore");
		var request = store.add({subject: t1, message: t2, author: t3, datetime: datetime});
		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
	    }
	    request.onsuccess = function(e) {
	    	
	    	renderList();
	    	document.getElementById('subject').value = '';
			document.getElementById('message').value = '';
			document.getElementById('author').value = '';
	    }
	}

	function renderList(){
	
		$('#details').empty();
		$('#list-wrapper').empty();
		$('#rowcount').empty();
		$('#list-wrapper').html('<table id="listtable"><tr><th>Subject</th><th>Date</th><th>Count</th></tr></table>');

		//Count Objects

		var transaction = db.transaction(['liststore'], 'readonly');
		var store = transaction.objectStore('liststore');
		var countRequest = store.count();

			countRequest.onsuccess = function(){ 
			$('#notenum').empty();
		
		var $num = $('<h3> Number of Notes:  ' + countRequest.result + '</h3>');
		$('#notenum').append($num); 

			
		};
	
		

		// Get all Objects
		var objectStore = db.transaction("liststore").objectStore("liststore");
		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {

				var datetime=cursor.value.datetime;
				
				var count=cursor.value.message.length;
				var $link = $('<a href="#" data-key="' + cursor.key + '">' + cursor.value.subject + '</a>');
				$link.click(function(){
					loadTextByKey(parseInt($(this).attr('data-key')));
				});
				
				var $row = $('<tr>');
				var $subjectCell = $('<td></td>').append($link);
				var $dateCell = $('<td>' + datetime + '</td>');
				var $count = $('<td>' + count + '</td>');
				$row.append($subjectCell);
				$row.append($dateCell);
				$row.append($count);
				$('#list-wrapper table').append($row);
				cursor.continue();
			}
			else {
			    //no more entries
			}
		};

		var Store = db.transaction("liststore").objectStore("liststore");
		var $count = store.count();
		$count.onsuccess = function() {
	    console.log($count.result);
	   	var $rwcount= $('<h3>Number of Notes: ' + $count.result + '</h3>');

	    $('#rowcount').append($rwcount);

}
	}

	function loadTextByKey(key){
					$('#details').empty();

		var transaction = db.transaction(['liststore'], 'readonly');
		var store = transaction.objectStore('liststore');
		var request = store.get(key);
		request.onerror = function(event) {
		  // Handle errors!
		};
		request.onsuccess = function(event) {
			console.log(request.result.subject);
		  // Do something with the request.result!
		  var $detailmsg= $('<h2>Detailed Message</h2>');
		  var $subject= $('<h2> Subject: ' + request.result.subject + '</h2>');
		  var $message= $('<p> Message: <br><h2>' + request.result.message + '</h2></p>');
		  var $author= $('<h3>Author Name: ' + request.result.author + '</h3>');
		  var $datetime= $('<h4>Date: ' + request.result.datetime + '</h4>');
		  var $delBtn = $('<button id="deletebtn">Delete me</button>');
		  var $upBtn = $('<button id="updatebtn">Update</button>');
		  var $okBtn = $('<button id="okbtn">Ok</button>');

		  $upBtn.click(function(){
		  updateword(key);
		  });

		  $delBtn.click(function(){
		  	console.log('Delete ' + key);
		  	deleteWord(key);
		  });

		 $okBtn.click(function(){
		  	ok();
		    });
		  $('#details').append($detailmsg);
		  $('#details').append($subject);
		  $('#details').append($message);
		  $('#details').append($author);
		  $('#details').append($datetime);
		  $('#details').append($delBtn);
		  $('#details').append($upBtn);
		  $('#details').append($okBtn);
		  
		};
	}

	function ok(){

		$('#details').empty();
	}
	function deleteWord(key) {
		var transaction = db.transaction(['liststore'], 'readwrite');
		var store = transaction.objectStore('liststore');
		var request = store.delete(key);
		request.onsuccess = function(evt){
			renderList();
			$('#details').empty();
		};
	}
function updateword(key) {
	document.getElementById('addbtn').style.display = 'none';
	document.getElementById('text').style.display = 'block';
	document.getElementById('ok').style.display = 'none';
	document.getElementById('update').style.display = 'block';
	document.getElementById('cancelupdate').style.display = 'block';


	var transaction = db.transaction(['liststore'], 'readonly');
	var store = transaction.objectStore('liststore');
	var request = store.get(key);
	request.onerror = function (event) {
		// Handle errors!
	};
	request.onsuccess = function () {
		var s = request.result.subject;
		var m = request.result.message;
		var a = request.result.author;
		$('#subject').val(s);
		$('#message').val(m);
		$('#author').val(a);

		$('#update').click(function () {
			updateIt(key, s, m, a);
		});

		$('#cancelupdate').click(function () {
					renderList();
					document.getElementById('subject').value = '';
					document.getElementById('message').value = '';
					document.getElementById('author').value = '';
					document.getElementById('add').style.display = 'block';
					document.getElementById('update').style.display = 'none';
					document.getElementById('cancelupdate').style.display = 'none';
					document.getElementById('text').style.display = 'none';
					document.getElementById('addbtn').style.display = 'block';
					document.getElementById('ok').style.display = 'block';
		});


	};
}

function updateIt(key, s, m, a) {
	var transaction = db.transaction(['liststore'], 'readwrite');
	var store = transaction.objectStore('liststore');

	store.openCursor().onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			if (cursor.key == key) {
				var currentdate = new Date(); 
				var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() +" "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
				var udata = cursor.value;
				udata.subject = check($('#subject').val());
				udata.message = check($('#message').val());
				udata.author = check($('#author').val());
				udata.datetime = datetime;
				var request1 = cursor.update(udata);
				request1.onerror = function () {

				};
				request1.onsuccess = function () {
					renderList();
					document.getElementById('subject').value = '';
					document.getElementById('message').value = '';
					document.getElementById('author').value = '';
					document.getElementById('add').style.display = 'block';
					document.getElementById('update').style.display = 'none';
					document.getElementById('text').style.display = 'none';
					document.getElementById('addbtn').style.display = 'block';
					document.getElementById('cancelupdate').style.display = 'none';
					document.getElementById('ok').style.display = 'block';
				};
			}
			cursor.continue();
		}
		else {

		}
	};
}


})(jQuery);