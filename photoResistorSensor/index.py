import RPi.GPIO as GPIO
import time
import requests


prs=[7,15]
light_max_time=500

PARKOMPASS_URL="http://192.168.9.235:3000/api/parkingLots"
UPDATE_FREQUENCY=5
parkLot={
  "id": 10,
  "name": "test",
  "updateDateTime": time.time(),
  "totalParkings": 2,
  "availableParkings": 0,
  "occupiedParkings":0,
  "coordinate": {
    "latitude":44.48761404106161,
    "longitude": 11.32700949374767
  }
}

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)

while True:
    occupied=0;
    for pr in prs:
      print(pr)
      GPIO.setup(pr,GPIO.OUT)
      GPIO.output(pr,GPIO.LOW)
      time.sleep(0.1)
      
      GPIO.setup(pr,GPIO.IN)
      currentTime=time.time()
      diff=0
      while(GPIO.input(pr)==GPIO.LOW):
          diff=(time.time()-currentTime)*1000
      
      print(f"park {pr}: {diff}")    
      if diff>light_max_time:
          occupied+=1
    
    parkLot["occupiedParkings"]=occupied
    parkLot["availableParkings"]=parkLot["totalParkings"]-occupied
    parkLot["updateDateTime"]=time.time()
    requests.put(PARKOMPASS_URL,json=parkLot)
    
    time.sleep(UPDATE_FREQUENCY)