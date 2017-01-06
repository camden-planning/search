function processForm()
  {
    var parameters = location.search.substring(1).split("&");
	
	// get query string
    var tempterm = parameters[0].split("=");
    searchterm = unescape(tempterm[1]);
	readsearchterm = searchterm.split('+').join(' ');
	readsearchtermurl = readsearchterm.replace(/ /g, '+');
	if(readsearchterm !== "undefined") {
    document.forms['searchbox'].elements['q'].value = readsearchterm;
	document.title = readsearchterm + " - Planning search";
	}
	
	// get results page
	if (typeof parameters[1] == 'undefined') {
	page = 1;
	} else {
	temppage = parameters[1].split("=");
	page = unescape(temppage[1]);
	}
	
	// get type filter
	if (typeof parameters[2] == 'undefined') {
	type = "all";
	} else {
	temptype = parameters[2].split("=");
	type = unescape(temptype[1]);
	}
	
	// get exact match
	if (typeof parameters[3] == 'undefined') {
	exact = "no";
	} else {
	tempexact = parameters[3].split("=");
	exact = unescape(tempexact[1]);
	}
    }
processForm();

// check that the user has made a search
if(readsearchterm !== "undefined") {

//check for blanks
if (readsearchterm == "") {
window.location.href = "index.html";
}

// loader while awaiting response from Socrata
$('#loading').show();
document.getElementById('loading').style.height = '110px';
var xmlhttp = new XMLHttpRequest();

var urldefault = "https://opendata.camden.gov.uk/resource/mcgw-i4rx.json?$q="+searchterm+"&$limit=10000&$order=system_status_change_date DESC";

// catch any apostrophes in case of using exact search query
exactreadsearchterm = readsearchterm.replace(/'/g, '');
var urlexact = "https://opendata.camden.gov.uk/resource/mcgw-i4rx.json?$where=upper(application_number)%20like%20upper(%27%25" + exactreadsearchterm + "%25%27)%20OR%20upper(development_address)%20like%20upper(%27%25" + exactreadsearchterm + "%25%27)%20OR%20upper(development_description)%20like%20upper(%27%25" + exactreadsearchterm + "%25%27)&$limit=10000&$order=system_status_change_date DESC";

// regular search or exact phrase
if (exact == "yes") {
url = urlexact;
document.getElementById("checkboxexact").checked = true;
} else {
url = urldefault;
}

xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        myFunction(xmlhttp.responseText);
    }
}
xmlhttp.open("GET", url, true);
xmlhttp.send();

function myFunction(response) {
    var arr_all = JSON.parse(response);
	
	// create different sets of results for different system statuses
	arr_new = arr_all.filter(function (filterresultsbytype) {
	return filterresultsbytype.system_status == "Registered";
	});
	
	arr_decision = arr_all.filter(function (filterresultsbytype) {
	return filterresultsbytype.system_status == 'Final Decision' || filterresultsbytype.system_status == 'Withdrawn';
	});
	
	arr_appeal = arr_all.filter(function (filterresultsbytype) {
	return filterresultsbytype.system_status == 'Appeal Lodged' || filterresultsbytype.system_status == 'Appeal Decided';
	});
	
	//select which set of results to display
	if (type == "new") {
	arr = arr_new;
	} else if (type == "decision") {
	arr = arr_decision;
	} else if (type == "appeal") {
	arr = arr_appeal;
	} else {
	arr = arr_all;
	}
	
	//create a typefragment for use as a url parameter
	if (type == "new") {
	typefragment = "&type=new";
	} else if (type == "decision") {
	typefragment = "&type=decision";
	} else if (type == "appeal") {
	typefragment = "&type=appeal";
	} else {
	typefragment = "&type=all";
	}
	
	//create exact fragment for use as a url parameter
	exactfragment = "";
	if (exact == "yes") {
	exactfragment = "&exact=yes";
	}

    var i;
	var out = "";
	
	// number of results found
    if (arr.length == 1) {
	out += "<p><strong>"+arr.length+"</strong> result found</p>";
	} else {
	out += "<p><strong>"+arr.length+"</strong> results found</p>";
	}
	
	// build type selector (if there are any results in total)
	if (arr_all.length > 0) {
	
	// mobile display of type selector
	if (type == "all") {
    typedisplay	= "All";
	} else if (type == "new") {
	typedisplay = "New applications";
	} else if (type == "decision") {
	typedisplay = "Decisions";
	} else if (type == "appeal") {
	typedisplay = "Appeals";
	}
	
	// type selector display and buttons
	out += "<div class='row' id = 'expand-type-selector'> <div class = 'col-md-12'> <p>Showing: <strong>" + typedisplay + "</strong> <a id='expandfilter' tabindex='0'> (Change)</a> </p> </div> </div>"
	out += "<div class='row' id = 'type-selector'> <div class='col-sm-12 col-md-12'> <ul class='nav nav-pills'>";
	if (type == "all") {
	out += "<li class='active disabled'><a class='no-cursor'>All (" + arr_all.length + ")</a></li>";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=1&type=all" + exactfragment + "'>All (" + arr_all.length + ")</a></li>";
	}
	if (type == "new") {
	out += "<li class='active disabled'><a class='no-cursor'>New applications (" + arr_new.length + ")</a></li>";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=1&type=new" + exactfragment + "'>New applications (" + arr_new.length + ")</a></li>";
	}
	if (type == "decision") {
	out += "<li class='active disabled'><a class='no-cursor'>Decisions (" + arr_decision.length + ")</a></li>";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=1&type=decision" + exactfragment + "'>Decisions (" + arr_decision.length + ")</a></li>";
	}
	if (type == "appeal") {
	out += "<li class='active disabled'><a class='no-cursor'>Appeals (" + arr_appeal.length + ")</a></li>";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=1&type=appeal" + exactfragment + "'>Appeals (" + arr_appeal.length + ")</a></li>";
	}
	out += "</ul> </div> </div>";
	}

	// calculate total number of pages for pagination
	totalpages = Math.ceil((arr.length / 10));
	resultsonlastpage = (arr.length % 10);
	if (resultsonlastpage == "0" && totalpages > 0) {
	resultsonlastpage = 10;
	}

	//output results
	if (arr.length > 0) {
	out += "<hr/>";
	out += "<div class='row'><div class='col-sm-12 col-md-12'>";
	}
	
	//number of results on current page
	resultsonthispage = 10;
	if (page == totalpages) {
	resultsonthispage = resultsonlastpage;
	}
	if (arr.length == 0) {
	resultsonthispage = 0;
	}

	//start of results on current page
	startresultsfrom = ((page - 1) * 10);
	endresultsat = startresultsfrom + resultsonthispage;
		
    for(i = startresultsfrom; i < endresultsat; i++) {
	// format the date object
	    var systemchangedateasdate = new Date(arr[i].system_status_change_date);
        var changedate = systemchangedateasdate.toDateString();
		var changedate = changedate.slice(4);
		
		// reword the status format
		var status;
		if (arr[i].system_status == "Registered") {
		status = "New application";
        } else if (arr[i].system_status == "Withdrawn") {
		status = "Withdrawn";
		} else if (arr[i].system_status == "Final Decision") {
		status = "Final Decision";
		} else if (arr[i].system_status == "Appeal Lodged") {
		status = "Awaiting appeal";
		} else if (arr[i].system_status == "Appeal Decided") {
		status = "Appeal Decided";
		}
		if (status == "Final Decision") {
		status = arr[i].decision_type;
		}
		// truncate the overlong descriptions
		description = arr[i].development_description.slice(0,250);
		if (arr[i].development_description.length > 253) {
		description = description + "...";
		}
		
		// build the results list
        out += "<div><h3>" +
        "<a href=" + arr[i].full_application + ">" + arr[i].development_address + " (" + arr[i].application_number + ")</a>" +
        "</h3><p><strong>" +
		status + "</strong> (" + changedate + ") - " + arr[i].application_type + "</p><p>" + 
		description +
		"</p></div><hr/>";
    }
	out += "</div></div>";

	//check how many pages there are (and therefore whether a pager is needed)
	if (totalpages > 1) {
	
	//start the pager
	out += "<div class='row'><div class='col-sm-12 col-md-12'><nav><ul class='pager'><li class='previous'><ul>";
	
	// build the previous buttons
	if (page > 1) {
	out += " <li> <a href='index.html?q=" + readsearchtermurl + "&page=1" + typefragment + exactfragment + "'> <span aria-hidden='true'> <img src='images/firstActive.png' width='16px' height='16px' alt='First page' /> </span> <span class='sr-only'>First page</span> </a> </li> <li> <a href='index.html?q=" + readsearchtermurl + "&page=" + (page - 1) + typefragment + exactfragment + "'> <span aria-hidden='true'> <img src='images/previousActive.png' width='16px' height='16px' alt='Previous page' /> </span> <span class='sr-only'>Previous page</span> </a> </li> </ul> </li>";
	} else {
	out += "<li class='disabled'> <a> <span aria-hidden='true'> <img src='images/firstInactive.png' width='16px' height='16px' alt='First page' /> </span> <span class='sr-only'>First page</span> </a> </li> <li class='disabled'> <a> <span aria-hidden='true'> <img src='images/previousInactive.png' width='16px' height='16px' alt='Previous page' /> </span> <span class='sr-only'>Previous page</span> </a> </li> </ul> </li>";
	}
	
	// build the page numbers
	out += "<li><ul>";
	maxpages = totalpages;
	if (maxpages > 10) {
	maxpages = 10;
	}
	for (j=0; j < maxpages; j++) {
	if ((j+1) == page) {
	out += "<li class='active'>" + (j+1) + "</li> ";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=" + (j + 1) + typefragment + exactfragment + "'>" + (j+1) + "</a></li> ";
	}
	}
	out += "</ul></li>";
	
	// build the next buttons
	out += "<li class='next'><ul>";
	if (page == totalpages) {
	out += "<li class='disabled'><a><span aria-hidden='true'><img src='images/nextInactive.png' width='16px' height='16px' alt='Next page' /></span><span class='sr-only'>Next page</span></a></li><li class='disabled'><a><span aria-hidden='true'><img src='images/lastInactive.png' width='16px' height='16px' alt='Final page' /></span><span class='sr-only'>Final page</span></a></li>";
	} else {
	out += "<li><a href='index.html?q=" + readsearchtermurl + "&page=" + (parseInt(page,10) + 1) + typefragment + exactfragment + "'><span aria-hidden='true'><img src='images/nextActive.png' width='16px' height='16px' alt='Next page' /></span><span class='sr-only'>Next page</span></a></li><li><a href='index.html?q=" + readsearchtermurl + "&page=" + totalpages + typefragment + exactfragment + "'><span aria-hidden='true'><img src='images/lastActive.png' width='16px' height='16px' alt='Final page' /></span><span class='sr-only'>Final page</span></a></li>";
	}
	out += "</ul></li>";
	
	// end the pager
	out += "</ul></nav></div></div>";
	}

	// loader
	$('#loading').hide();
	document.getElementById('loading').style.height = '100%';
	
	//amend heading from search instruction to results description
	document.getElementById('heading').innerHTML = "Search results for";
	$('#instructiontext').hide();
	
	// display the results
    document.getElementById("results").innerHTML = out;
	
	//display checkbox
	$('#exactcheckbox').show();
	
	//click handler to expand status filter options on mobile
	$("#expandfilter").click(function() {
	$("#expand-type-selector").css({"visibility":"hidden"});
    $('#type-selector').show();
    });
	
	//event handler to expand status filter options for keyboard users
	$('#expandfilter').keypress(function (e) { 
	var key = e.which;
	if(key == 13)  // the enter key code
	{
    $("#expand-type-selector").css({"visibility":"hidden"});
    $('#type-selector').show();
    return false;
  }
});  
}
} else {
$("#q").focus();
}

// toggle the checkbox for exact phrase matches
function checkboxtoggle() {
	if (document.getElementById('checkboxexact').checked == true) {
	window.location.href="index.html?q=" + readsearchtermurl + "&page=1" + typefragment + "&exact=yes";
	} else {
	window.location.href="index.html?q=" + readsearchtermurl + "&page=1" + typefragment;
	}
	}
