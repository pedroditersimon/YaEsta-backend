import requests

session = requests.Session()

x = session.get("http://localhost:3000/login/664067234dfba48f2ca9888e")
print(x.text)

x = session.get('http://localhost:3000/user_channels/66406fd24dfba48f2ca9889a')
print(x.text)
