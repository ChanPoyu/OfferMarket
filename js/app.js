var mainApp = {};
(function(){
  // current Login State
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var uid = user.uid;

      // sync user database
      var UserDatabase = firebase.database().ref('user');
      UserDatabase.child(uid).on('value', snap =>{
        if(snap.val() === null){
          firebase.database().ref('user/' + uid).set({
            name: user.displayName,
            photo: "",
            contact: user.email,
            skills:"",
            wallet:""
          });
        }
      });
      // sync offer database
      var OfferDatabase = firebase.database().ref();
      OfferDatabase.child('offer').on('value', snap =>{
        for(var id in snap.val()){
          var from = snap.val()[id].from;
          var to = snap.val()[id].to;
          var reward = snap.val()[id].reward;
          var details = snap.val()[id].details;
          var state = snap.val()[id].state;
          // display sent offers
          if(snap.val()[id].from_id === uid){
            var disp = "";
            disp += "<div class=\"offer_recieve\">";
            disp += "<h3>To: </h3>";
            disp += "<p>" + to + "</p>";
            disp += "<h3>Reward: </h3>"
            disp += "<p>" + reward + "</p>";
            disp += "<h3>Details: </h3>";
            disp += "<p>" + details + "</p>";
            disp += "<h3> Offer State: </h3>"
            disp += "<p>" + state + "</p>";
            if(state === "complete"){
                disp += "<input type=\"button\" value=\"check\" onclick=\"mainApp.checkDone()\" class=\"check_btn\" id =\""+ id + "\">";
            }
            disp += "</div>";
            $("#sent_display").append(disp);
          }
          // display recieved offers
          if(snap.val()[id].to_id === uid){
            var disp = "";
            disp += "<div class=\"offer_recieve\">";
            disp += "<h3>From: </h3>";
            disp += "<p>" + from + "</p>";
            disp += "<h3>Reward: </h3>"
            disp += "<p>" + reward + "</p>";
            disp += "<h3>Details: </h3>";
            disp += "<p>" + details + "</p>";
            if(state === "await"){
              disp += "<input type=\"button\" value=\"reject\" onclick=\"mainApp.rejectOffer()\" class=\"reject_btn\" id =\""+ id + "\">";
              disp += "<input type=\"button\" value=\"confirm\" onclick=\"mainApp.confirmOffer()\" class=\"confirm_btn\" id =\""+ id + "\">";
            }else if(state === "confirmed"){
              disp += "<input type=\"button\" value=\"complete\" onclick=\"mainApp.completeOffer()\" class=\"complete_btn\" id =\""+ id + "\">";
            }
            disp += "</div>";
            $("#recieved_display").append(disp);
          }
        }
      });

      // display profile form database
      $("#name_input").val(user.displayName);
      $("#contact_input").val(user.email);
      firebase.database().ref('user').child(uid).on('value', snap =>{
        var img_tag = "<img src=\"" + snap.val().photo + "\">";
        $("#profile_photo_display").html(img_tag);
        $("#photo_url").val(snap.val().photo);
        $("#skills_input").val(snap.val().skills);
        $("#wallet_input").val(snap.val().wallet);
      });

    }else{
      uid = null;
      window.location.replace("login.html");
    }
  });

  // Define function

  // logOut
  function logOut(){
    firebase.auth().signOut();
  }
  mainApp.logOut = logOut;

  // update user's profile
  function updateUserProfile(){
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: "Ovin Chan"
    }).then(() => {
      console.log("update seccess");
    }).catch((err) => {
      console.log(err);
    });
  }
  mainApp.updateUserProfile = updateUserProfile;

  // search database
  function searchDatabase(_keyword){
    var Database = firebase.database().ref().child('user');
    var id = [];
    Database.on('value', snap => {
      var users = snap.val();
      for(var prop in users){
        var profile = users[prop];
        var skills = profile.skills.split(', ');
        console.log(skills);
        for(var i = 0; i < skills.length; i++){
          if(skills[i] === _keyword){
            id.push(prop);
          }
        }
      }
    });
    return id;
  }

  // display search results
  function displaySearchResults(_id){
    var Database = firebase.database().ref();
    var display_str = [];
    for(var i = 0; i < _id.length; i++){
      var resultId = _id[i];
      var user = Database.child('user/' + resultId);
      user.on('value', snap =>{
        // console.log(snap.val());
        var disp = "";
        disp += "<div class=\"results_display\" onclick=\"mainApp.getResultData()\" id=\"" +resultId+ "\">";
        disp += "<img src=\"" + snap.val().photo + "\">";
        disp += "<div>";
        disp += "<h2>";
        disp += snap.val().name;
        disp += "</h2>";
        disp += "<p>";
        disp += "I am good at: " + snap.val().skills;
        disp += "</p>";
        disp += "</div>";
        disp += "</div>";
        display_str.push(disp);
      });
    }
    return display_str;
  }

  function sendOffer(){
    var user = firebase.auth().currentUser;
    firebase.database().ref().child('offer').push({
      from: $("#from").val(),
      from_id: $("#from_id").val(),
      to: $("#to").val(),
      to_id: $("#to_id").val(),
      details: $("#details").val(),
      reward: $("#offer_reward").val(),
      state: "await" // await confirmation, confirmed and proccessing, mission complete, closed
    });
  }

  // function getBlockData(){
  //   $(document).click(function(event){
  //     var target = $(event.target).html;
  //     console.log(target);
  //   });
  // }
  // mainApp.getBlockData = getBlockData;

  function getResultData(){
      var id = event.target.id;
      console.log(id);
      $(".offer_form").css('display', 'block');
      overlay.className += ' open';
      firebase.database().ref().child('user/' + id).on('value', snap =>{
        var user = firebase.auth().currentUser;
        var from = user.displayName;
        var from_id = user.uid;
        var to = snap.val().name;
        var to_id = id;
        $("#from").val(from);
        $("#from_id").val(from_id);
        $("#to").val(to);
        $("#to_id").val(to_id);
      });
  }
  mainApp.getResultData = getResultData;

  function confirmOffer(){
      var id = event.target.id;
      console.log(id);
      firebase.database().ref('offer').child(id).on('value', snap =>{
        firebase.database().ref('offer/' + id).set({
          from: snap.val().from,
          from_id: snap.val().from_id,
          to: snap.val().to,
          to_id: snap.val().to_id,
          reward: snap.val().reward,
          state: "confirmed",
          details: snap.val().details
        });
      });
      $("#" + id).attr('value', 'complete');
      $("#" + id).attr('class', 'complete_btn')
      $("#" + id).attr('onclick', 'mainApp.completeOffer()');
      location.reload();
  }
  mainApp.confirmOffer = confirmOffer;

  function rejectOffer(){
    var id = event.target.id;
    console.log(id);
    firebase.database().ref('offer').child(id).on('value', snap =>{
      firebase.database().ref('offer/' + id).set({
        from: snap.val().from,
        from_id: snap.val().from_id,
        to: snap.val().to,
        to_id: snap.val().to_id,
        reward: snap.val().reward,
        state: "rejected",
        details: snap.val().details
      });
    });
    $("#" + id).css('display', 'none');
    location.reload();
  }
  mainApp.rejectOffer = rejectOffer;

  function completeOffer(){
      var id = event.target.id;
      firebase.database().ref('offer').child(id).on('value', snap =>{
        firebase.database().ref('offer/' + id).set({
          from: snap.val().from,
          from_id: snap.val().from_id,
          to: snap.val().to,
          to_id: snap.val().to_id,
          reward: snap.val().reward,
          state: "complete",
          details: snap.val().details
        });
      });
      $("#" + id).css('display', 'none');
      location.reload();
      console.log(id);
  }
  mainApp.completeOffer = completeOffer;

  function checkDone(){
      var id = event.target.id;
      console.log(id);
      firebase.database().ref('offer').child(id).on('value', snap =>{
        var send_to = snap.val().to_id;
        var value = snap.val().reward;
        firebase.database().ref('user').child(send_to).on('value', snap =>{
          var send_address = snap.val().wallet;
          web3.eth.sendTransaction({to: send_address, value: web3.toWei(value ,"ether")}, function(e, r){
            if(e){
              console.log(e);
            }else if(r){
              console.log(r);
            }
          });
        });
        firebase.database().ref('offer/' + id).set({
          from: snap.val().from,
          from_id: snap.val().from_id,
          to: snap.val().to,
          to_id: snap.val().to_id,
          reward: snap.val().reward,
          state: "closed",
          details: snap.val().details
        });
      });
      $("#" + id).css("display", "none");
      location.reload();
      console.log("clicked");
  }
  mainApp.checkDone = checkDone;

  $("#update_profile").on("click", function(){
   var user = firebase.auth().currentUser;
   firebase.database().ref('user/' + user.uid).set({
     name: $("#name_input").val(),
     photo: $("#photo_url").val(),
     contact: $("#contact_input").val(),
     skills: $("#skills_input").val(),
     wallet: $("#wallet_input").val()
   });
   setTimeout(function(){
     $("#update_success").fadeIn(200);
     $("#update_success").fadeOut(800);
   } ,200);
 });

 $('input[name="offer_display_select"').on('click', function(){
   if($(this).val() === "recieved"){
     // console.log("recieved");
     $("#sent_display").css('display', 'none');
     $("#recieved_display").css('display', 'block');
     $("#selector_recieved").css('background', '#fff');
     $("#selector_sent").css('background', '#ccc');
   }
   if($(this).val() === "sent"){
     // console.log("sent");
     $("#sent_display").css('display', 'block');
     $("#recieved_display").css('display', 'none');
     $("#selector_recieved").css('background', '#ccc');
     $("#selector_sent").css('background', '#fff');
   }
 });
 $("#search_database").on('click', function(){
   var keyword = $('#keyword_input').val();
   var id = searchDatabase(keyword);
   console.log(id);
   var results = displaySearchResults(id);
   console.log(results);
   $("#serach_results").html("");
   setTimeout(function(){
     for(var i = 0; i < results.length; i++){
       $("#serach_results").append(results[i]);
     }
   },500);
 });

 $("#keyword_input").keydown((e) => {
   if(e.keyCode === 13){
     var keyword = $('#keyword_input').val();
     var id = searchDatabase(keyword);
     console.log(id);
     var results = displaySearchResults(id);
     console.log(results);
     $("#serach_results").html("");
     setTimeout(function(){
       for(var i = 0; i < results.length; i++){
         $("#serach_results").append(results[i]);
       }
     },500);
   }
 });
 $("#offer_send_btn").on('click', function(){
   sendOffer();
   $("#offer_reward").val("");
   $("#details").val("");
   $(".offer_form").css('display', 'none');
   overlay.className = 'overlay';
 });

})();
