
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

    if(request.message == "sendCommand"){
      var s = new SerialFunctionRequest(APP.connectionID)
      s.doRequest(request.data.functionName, [request.data.arg1, request.data.arg2, request.data.arg3, request.data.arg4])
    }

    if(request.message == "listenSerial"){
      chrome.serial.onReceive.addListener(function(info){
        if (info.connectionId == APP.connectionID && info.data) {
          var str = ArrayBufferHelper.convertArrayBufferToString(info.data);
          APP.serialMessager.postMessage({serialString: str});
        }
      });
      sendResponse()
    }


    if(request.message == "connectSerial"){
      connectOptions = {
        bitrate: request.bitRate
      }

      APP.serialMessager = chrome.runtime.connect({name: "serialConnection"});
      
      chrome.serial.connect(request.port, connectOptions, function(connectionInfo){
        console.log(connectionInfo);
        APP.connectionID = connectionInfo.connectionId;
        sendResponse(APP.connectionID)
      })
    }

    return true; // for async messages
  }
);


        

