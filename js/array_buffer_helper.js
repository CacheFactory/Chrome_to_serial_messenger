ArrayBufferHelper = {
  convertArrayBufferToString: function (buf){
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(encodedString);
  },
  appendBuffer: function(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  },
  ascii2AB: function(str){
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
  },
  byteToAb: function(number){
    if(number > 255) {
      throw "Can only encode numbers up to 255"
    }
    var buffer = new ArrayBuffer(1);
    bufView = new Uint8Array(buffer);
    bufView[0] = number;
    return buffer
  }
}

// function int2ab(number){
//   var buf = new ArrayBuffer(4); // 2 bytes for each char
//   var bufView = new Uint16Array(buf);
//   bufView[0] = number

//   var a8 = new Uint8Array(buf)
//   return a8.buffer;
// }  