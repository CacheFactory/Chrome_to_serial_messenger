#define SERIAL_READ_DELAY 30
#define SERIAL_DEBUG_MODE false

char arg1[255];
char arg2[255];
char arg3[255];
char arg4[255];

void setup() {
  Serial.begin(9600);

}

void messageEvent(){

  

}

void loop() {
  if(Serial.available() > 0){
    unsigned char numArgs =readSerial();
    //char *args[numArgs];
    arg1[0] = NULL;
    arg2[0] = NULL;
    arg3[0] = NULL;
    arg4[0] = NULL;
  
    
    for(int i = 0; i < numArgs; i++){
      char varType = readSerial();
      byte varLength = readSerial();
      
      char arg[varLength + 1];
      arg[varLength] = 0;
      
      Serial.readBytes(arg, varLength);
      
      if(SERIAL_DEBUG_MODE){
        Serial.print("length ");
        Serial.println(varLength); 
        
        Serial.print("arg size "); 
        Serial.println(sizeof(arg)); 
        
        Serial.print("arg ");
        Serial.println(arg); 
      }
      
       if(i == 0){
         strncpy(arg1, arg, varLength + 1);
       }
       if(i == 1){
         strncpy(arg2, arg, varLength + 1);
       }
       if(i == 2){
         strncpy(arg3, arg, varLength + 1);
       }
       if(i == 3){
         strncpy(arg4, arg, varLength + 1);
       }
      
      //args[i]= &arg[0];
    }
    messageEvent();
  }
  
    
}

 unsigned char readSerial(){
   delay(SERIAL_READ_DELAY); // wait for next char
   unsigned char c = Serial.read();
   
   return c;
   
 }

