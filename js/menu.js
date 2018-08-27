var mobile_btn = document.querySelector('.mobile-btn');
var menu = document.querySelector('.menu');
var close_btn = document.querySelector('.close');
var overlay = document.querySelector('.overlay');
mobile_btn.addEventListener('click', function(){
  menu.className += ' open';
  overlay.className += ' open';
});
close_btn.addEventListener('click', function(){
  menu.className = 'menu';
  overlay.className = 'overlay';
});
window.addEventListener('click', function(event){
  if(event.target === overlay){
    menu.className = 'menu';
    overlay.className = 'overlay';
    $(".offer_form").css('display', 'none');
  }
});
