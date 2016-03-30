var LevelAverager = function(maxLevels, minI, maxI){
  this.maxLevels = maxLevels;
  this.minI = minI;
  this.maxI = maxI;
  this.levels = []
}

LevelAverager.prototype.push = function(value, i){
  
  if(i > this.minI && i < this.maxI){
    this.levels.push(value)
    if(this.levels.length > this.maxLevels){
      this.levels.shift()
    }
  }
}

LevelAverager.prototype.data = function(){
  var average = this.levels.reduce(function(memo, freq){ return memo + freq; },0) / this.levels.length

  var sdSum = this.levels.reduce(function(memo, freq){ 
    return memo + Math.pow(freq - average, 2); 
  },0) 
  var sd = Math.pow(sdSum / this.levels.length, 0.5)
  this.sd = sd
  this.average = average
  
  return {average: average, sd: sd, level: this.levels[0]};
}

LevelAverager.prototype.getTempo = function(){
  var self = this
  
  var peaks = this.getPeaksAtThreshold(this.levels, this.sd * 4)
  console.log(peaks)

  var intervalCounts = this.countIntervalsBetweenNearbyPeaks(peaks)

  var tempoCounts = this.groupNeighborsByTempo(intervalCounts)

  var sortedTempos = tempoCounts.sort(function(a, b){
    if (a.count > b.count)
      return -1;
    else if (a.count < b.count)
      return 1;
    else 
      return 0;
  })
  
  return sortedTempos[0]
}

LevelAverager.prototype.getPeaksAtThreshold = function(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 1000;
    }
    i++;
  }
  return peaksArray;
}

LevelAverager.prototype.countIntervalsBetweenNearbyPeaks = function(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;

      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

LevelAverager.prototype.groupNeighborsByTempo = function(intervalCounts) {
  var tempoCounts = []

  for(var i in intervalCounts){
    var intervalCount = intervalCounts[i]

    var theoreticalTempo = 60 / (intervalCount.interval / 44100 );
    if( !isNaN(theoreticalTempo) && theoreticalTempo != Infinity ){
      
        // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;

      theoreticalTempo = Math.floor(theoreticalTempo)

      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return tempoCount.count += intervalCount.count;
      });

      if (!foundTempo) {
        tempoCounts.push({
          tempo: theoreticalTempo,
          count: intervalCount.count
        });
      }
    }

  }

  return tempoCounts;
}


var AudioVisualizer = function(url, audioContext, onAudioData){
  this.url = url
  this.fftSamples = 1024
  this.onAudioData = onAudioData
  this.audioContext = audioContext

  this.filter = this.audioContext.createBiquadFilter();
  this.filter.type = "lowpass";
  
  this.analyser = this.audioContext.createAnalyser();
  this.analyser.smoothingTimeConstant = 0;
  this.analyser.fftSize = this.fftSamples;

  this.splitter = this.audioContext.createChannelSplitter();
  this.processor = this.audioContext.createScriptProcessor(this.fftSamples, 1, 1);
  
  this.connectNodes();
  this.runs = 0
  this.trackRunningAverage = 0
  
  this.runLevels = new LevelAverager(3 * 10000, 0, this.fftSamples)

  this.lowLevels = new LevelAverager(3 * 10000, 0, this.fftSamples * .1)
  this.midLevels = new LevelAverager(3 * 10000, this.fftSamples * .5, this.fftSamples *.6)
  this.highLevels = new LevelAverager(3 * 10000,  this.fftSamples *.6, this.fftSamples)


}

AudioVisualizer.prototype.connectNodes = function(){
  this.source = this.audioContext.createBufferSource();
  this.source.connect(this.splitter);

  this.source.connect(this.filter);
  this.filter.connect(this.audioContext.destination);

  if(this.audioBuffer){
    this.source.buffer = this.audioBuffer
    this.source.connect(this.audioContext.destination);
  }
  
  this.splitter.connect(this.analyser,0,0);
  this.processor.connect(this.audioContext.destination);

  
}

AudioVisualizer.prototype.pause =function(){
  this.source.stop(0);
  this.paused = true
}

AudioVisualizer.prototype.resume =function(){
  this.connectNodes()
  this.source.start(0);
  this.paused = false
}

AudioVisualizer.prototype.onError = function(){
  alert('error')
}

AudioVisualizer.prototype.processAudio = function(e){
  var self = this
  var data =  new Uint8Array(self.analyser.frequencyBinCount);
  self.analyser.getByteFrequencyData(data);

  var avg = data.reduce(function(memo, freq){ return memo + freq; },0) / data.length

  for(var i in data){
    var level = data[i]
    this.runLevels.push(level, i)
    this.lowLevels.push(level, i)
    this.midLevels.push(level, i)
    this.highLevels.push(level, i)
  }

  levelData = {
    runLevels: this.runLevels.data(),
    lowLevels: this.lowLevels.data(),
    midLevels: this.midLevels.data(),
    highLevels: this.highLevels.data(),
  }

  // if(this.runs % 100 == 0){
  //   console.log(this.runLevels.getTempo())
  // }
  
  self.onAudioData.call(self, data, levelData)
  this.runs++
}

AudioVisualizer.prototype.calculateStandardDeviation = function(){
  var self = this
  var num = this.runLevels.reduce(function(memo, freq){ 
    return memo + Math.pow(freq - self.trackRunningAverage, 2); 
  },0) 
  return Math.pow(num / this.runLevels.length, 0.5)
}

AudioVisualizer.prototype.loadAudio = function(){
  var self = this;
  var request = new XMLHttpRequest();
  request.open('GET', this.url, true);
  request.responseType = 'arraybuffer';
  request.onload = function(){
      self.audioContext.decodeAudioData(request.response, function(audioBuffer) {
        self.audioBuffer = audioBuffer
        self.processor.onaudioprocess = function(e){ self.processAudio(e) }

        self.source.buffer = audioBuffer;
        self.source.connect(self.audioContext.destination);
        self.source.start(0);
      }, self.onError);
  }
  request.send();
}


var canvas = document.querySelector('.visualizer');
var canvasContext = canvas.getContext('2d')

var onAudioData = function(data, runLevels){

  canvasContext.fillStyle= 'rgb(' + 0 + ',' + 0 + ',' + 0 + ')';
  canvasContext.fillRect(0,0,canvas.width,canvas.height);

  var bgColorLeft = 0;

  if(runLevels.lowLevels.level > runLevels.lowLevels.sd * 2.5){
    bgColorLeft = 255;
  }

  canvasContext.fillStyle= 'rgb(' + bgColorLeft + ',' + 0 + ',' + 50 + ')';
  canvasContext.fillRect(0,0,canvas.width/2,canvas.height);


  var bgColorRight = 0;
  if(runLevels.midLevels.level > runLevels.midLevels.sd *3){
    bgColorRight = 255;
  }

  canvasContext.fillStyle= 'rgb(' + 0 + ',' + bgColorRight + ',' + 50 + ')';
  canvasContext.fillRect(canvas.width/2,0,canvas.width/2,canvas.height);


  for(var d in data){
    canvasContext.fillStyle= 'rgb(' + 200 + ',' + 0 + ',' + 50 + ')';
    canvasContext.fillRect(d,canvas.height-data[d],2,canvas.height);
  }

  // if(FRONT_END_APP){
  //   FRONT_END_APP.setColors(bgColorLeft, bgColorRight, 0 );
  // }
}

// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// var vis = new AudioVisualizer("media/deadmau5.mp3",audioCtx, onAudioData);

// vis.loadAudio()


// document.querySelector('.pause').addEventListener('click', function(){
//   if(vis.paused){
//     vis.resume();
//   }else{
//     vis.pause();
//   }
  
// });

FRONT_END_APP.setColors()
