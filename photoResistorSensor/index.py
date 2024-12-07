import RPi.GPIO as GPIO
import time
import requests
import json

PR1 = 7
LIGHT_MAX_TIME=500

PARKOMPASS_URL="http:192.168.1.2:3000/api/parkingLots"
UPDATE_FREQUENCY=60
parkLot={
  "id": 10,
  "name": "test",
  "updateDateTime": time.time(),
  "totalParkings": 1,
  "availableParkings": 1,
  "occupiedParkings":0,
  "coordinate": {
    "latitude":44.48761404106161,
    "longitude": 11.32700949374767
  }
}

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)

while True:
    GPIO.setup(PR1,GPIO.OUT)
    GPIO.output(PR1,GPIO.LOW)
    time.sleep(0.1)
    
    GPIO.setup(PR1,GPIO.IN)
    currentTime=time.time()
    diff=0
    while(GPIO.input(PR1)==GPIO.LOW):
        diff=time.time()-currentTime
        
    if diff<LIGHT_MAX_TIME:
        parkLot["occupiedParkings"]=0
        parkLot["availableParkings"]=1
    else:
        parkLot["occupiedParkings"]=1
        parkLot["availableParkings"]=0
    
    parkLot["updateDateTime"]=time.time()
    requests.put(PARKOMPASS_URL,json=parkLot)
    
    time.sleep(UPDATE_FREQUENCY)
