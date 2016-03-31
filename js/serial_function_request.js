var SerialFunctionRequest = function(connectionId){
  this.serialConnectionId = connectionId;
}

SerialFunctionRequest.prototype.doRequest = function(functionName, args){
  var buf = this.makeRequestBuffer(functionName, args);
  chrome.serial.send(this.serialConnectionId, buf, function(){
    // on send
  });
} 

SerialFunctionRequest.prototype.makeRequestBuffer = function(functionName, args){
  
  args.unshift(functionName)

  var bodyBuffer = new ArrayBuffer();

  for(var i in args){
    var value = args[i];
    var type = typeof value;
    var typePrefix = "";
    var payload = "";

    if(type == "string"){
      typePrefix = "S";
      payload = value;
      var payloadBuffer = ArrayBufferHelper.ascii2AB(payload);
    }
    if(type == "number"){
      typePrefix = "I";
      payload = parseInt(value) ;
      var payloadBuffer = byteToAb(payload);
    }

    var headerBuffer = ArrayBufferHelper.appendBuffer(ArrayBufferHelper.ascii2AB( typePrefix), ArrayBufferHelper.byteToAb(payloadBuffer.byteLength)) ;
    var argBuffer = ArrayBufferHelper.appendBuffer(headerBuffer, payloadBuffer);

    bodyBuffer = ArrayBufferHelper.appendBuffer(bodyBuffer, argBuffer);
  }

  requestBuffer = ArrayBufferHelper.appendBuffer(ArrayBufferHelper.byteToAb(args.length), bodyBuffer)

  return requestBuffer;
} 

