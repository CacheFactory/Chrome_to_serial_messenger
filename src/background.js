function convertArrayBufferToString(buf){
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(encodedString);
}

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'outerBounds': {
      'width': 500,
      'height': 500
    }
  });
});

var APP = {};


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.message == "getSerialPorts"){
      chrome.serial.getDevices(function(ports){
        
        sendResponse(ports)
      });
    }

    if(request.message == "sendSerial"){
      var buf=new ArrayBuffer(4);
      var bufView=new Uint8Array(buf);
      
      bufView[0]= 255
      bufView[1]= (request.red > 255) ? 254 : request.red
      bufView[2]= (request.green > 255) ? 254 : request.green
      bufView[3]= (request.blue > 255) ? 254 : request.blue

      chrome.serial.send(APP.connectionID, buf, function(){
        // on send
      });
    }

    if(request.message == "listenSerial"){
      chrome.serial.onReceive.addListener(function(info){
        if (info.connectionId == APP.connectionID && info.data) {
          var str = convertArrayBufferToString(info.data);
          console.log(str);
          APP.serialMessager.postMessage({serialString: str});
        }
      });
    }


    if(request.message == "connectSerial"){
      connectOptions = {
        bitrate: request.bitRate
      }

      APP.serialMessager = chrome.runtime.connect({name: "serialConnection"});
      
      chrome.serial.connect(request.port, connectOptions, function(connectionInfo){
        APP.connectionID = connectionInfo.connectionId;

      })
    }

    return true;
  }
);


        

