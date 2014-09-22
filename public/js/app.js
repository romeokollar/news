$(document).ready(function(){
   var retrieveNews = function() {
      $.getJSON('/news', {maxItems: 10}, function(result, status, xhr) {
         $('#content').empty();
         if ( status === 'success' ) {
            $.each(result, function(index, value) {
               if ( typeof value.meta !== 'undefined' ) {
                  $('#content').append("<h1>" + value.meta.description + "</h1>");
                  
               } else {
                  $('#content').append("<h1>" + index + "</h1>");
               }
               
               if ( typeof value.error !== 'undefined' ) {
                  $('#content').append("<div class='item'><div class='error'>" + value.error + "</div></div>");
                  
               } else {
                  $.each(value.data, function(index, value) {
                     $('#content').append("<div class='item'><a href='" + value.link + "' target='_blank'><div class='title'>[" + value.time + "] " + value.title + "</div><div class='description'>" + value.description + "</div></a></div>");
                  });            
               }
            });
         } else {
            $('#content').html("<div class='error'>Failed to retrieve news!</div>");
         }
      }); 

      setTimeout(retrieveNews, 60 * 1000);
   };
   
   retrieveNews();
});