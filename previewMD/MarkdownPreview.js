// TODO For some reason, this doesn't quite work, yet.. ;)
//   may be it's just a Q of -H "Content-Type:text/plain" ?
//   or cross-domain isn't possible, needs JSON-P, see http://developer.github.com/v3/ ?

$(function() {
	$(document).ajaxError(function(event, jqxhr, settings, exception) {
	  $( "#msg" ).append( "Error requesting page " + settings.url + "<br>" + JSON.stringify(settings) );
	});

	$.get('README.md', function(data) {
  	  //alert('Load was performed: ' + data);
	  //$('#md').html(data);

	  $.post('https://api.github.com/markdown/raw', "_Hi_"/*data*/, function(postdata) {
		alert('POST was performed: ' + postdata);
		$('.result').html(postdata);
	  });
	});
});

