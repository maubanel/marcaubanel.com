
$(document).ready(function () {
    //Disable copy and paste
    $('.highlight').bind('cut copy paste', function (e) {
        e.preventDefault();
    });
    //Disable right click
      $('.highlight').on("contextmenu",function(e){
        return false;
    });
});
