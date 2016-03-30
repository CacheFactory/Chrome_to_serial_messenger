chrome.runtime.sendMessage({message: "getSerialPorts"}, function(response) {
  console.log(response)
  chrome.runtime.sendMessage({message: "connectSerial", port:  "/dev/tty.wchusbserial1420", bitRate: 9600} ,function() {
    
    chrome.runtime.sendMessage({message: "listenSerial" } ,function(msg) {
  
    });

  
  })
});

chrome.runtime.onConnect.addListener(function(port) {
  if(port.name == "serialConnection"){
    port.onMessage.addListener(function(msg) {
      console.log(msg)
    });
  }
});

FRONT_END_APP = {
  setColors: function(red, green, blue){
    //chrome.runtime.sendMessage({message: "sendSerial", red: red, green: green, blue: blue} ,function() { })
    chrome.runtime.sendMessage({message: "sendCommand"} ,function() { })
  }
}


// document.body.onkeyup = function(){
//   var red = parseInt(document.querySelector('#red').value, 10) || 0;
//   var green = parseInt(document.querySelector('#green').value, 10) || 0;
//   var blue = parseInt(document.querySelector('#blue').value, 10) || 0;
//   console.log(red, green, blue)
//   chrome.runtime.sendMessage({message: "sendSerial", red: red, green: green, blue: blue} ,function() {

//   })
// }
