import requests
import shutil 
import random
import time
body = requests.get("https://fortnite-api.com/v2/cosmetics").json()["data"]

#print(body)
for key, value in body.items() :
    print (key)

time.sleep(100000)

lenght = len(body)

print(lenght)

for i in range(400):
    pos = random.randint(0, lenght - 10)
    url = ""
    try:
        url = body[pos]["albumArt"]
    except:
        continue
    print(url)
    res = requests.get(url, stream=True)
    with open("img/ " + str(i) + ".png",'wb') as f:
        shutil.copyfileobj(res.raw, f)


