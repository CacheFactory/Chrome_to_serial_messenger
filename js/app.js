

chrome.runtime.onConnect.addListener(function(port) {
  if(port.name == "serialConnection"){
    port.onMessage.addListener(function(msg) {
      var row = document.createElement("div");
      row.innerHTML = msg.serialString.replace(/(?:\r\n|\r|\n)/g, '<br />');
      var main = document.querySelector('.main')
      main.insertBefore(row, main.firstChild )
    });
  }
});

FRONT_END_APP = {}

document.addEventListener("DOMContentLoaded", function() {
  chrome.runtime.sendMessage({message: "getSerialPorts"}, function(ports) {
    var portsArray = ports.map(function(port){ 
      return port.path; 
    });
    FRONT_END_APP.ports = portsArray;
    
    var selectedCallback = function(port){
      chrome.runtime.sendMessage({message: "connectSerial", port:  port, bitRate: 9600} ,function() {
        chrome.runtime.sendMessage({message: "listenSerial" } ,function(msg) {
          
        });
      })
    }
    
    var sendCallback = function(state){
      chrome.runtime.sendMessage({message: "sendCommand", data: state} ,function() { 
        // Done
      })
    }

    React.render(React.createElement(DropDown, {items: FRONT_END_APP.ports, selectedCallback: selectedCallback, sendCallback: sendCallback}), document.getElementById("ports"));

    
  });
});
