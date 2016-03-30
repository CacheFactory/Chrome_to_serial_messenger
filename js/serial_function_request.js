

function convertArrayBufferToString(buf){
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(encodedString);
}

var appendBuffer = function(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

function ascii2AB(str) {
  var buf = new ArrayBuffer(str.length); 
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    var charCode = str.charCodeAt(i);
    if(charCode > 256) {
      throw "Can only encode UT8 chars"
    }
    bufView[i] = charCode;
  }
  return buf;
}

function byteToAb(number){
  if(number > 256) {
    throw "Can only encode numbers up to 256"
  }
  var buffer = new ArrayBuffer(1);
  bufView = new Uint8Array(buffer);
  bufView[0] = number;
  return buffer
}

// function int2ab(number){
//   var buf = new ArrayBuffer(4); // 2 bytes for each char
//   var bufView = new Uint16Array(buf);
//   bufView[0] = number

//   var a8 = new Uint8Array(buf)
//   return a8.buffer;
// }

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
      var payloadBuffer = ascii2AB(payload);
    }
    if(type == "number"){
      typePrefix = "I";
      payload = parseInt(value) ;
      var payloadBuffer = byteToAb(payload);
    }

    var headerBuffer = appendBuffer(ascii2AB( typePrefix), byteToAb(payloadBuffer.byteLength)) ;
    var argBuffer = appendBuffer(headerBuffer, payloadBuffer);

    bodyBuffer = appendBuffer(bodyBuffer, argBuffer);
  }

  requestBuffer = appendBuffer(byteToAb(args.length), bodyBuffer)

  var d = new Uint8Array(requestBuffer)
  console.log(d);

  return requestBuffer;
} 

