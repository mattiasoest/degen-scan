# degen-scan

## Connect with a browser or cli.

www.degenscan.net

Example using wscat for local dev. test without tls

```npm install -g wscat```

``wscat -c ws://localhost:<PORT>``


Start backend
- ```docker build .```
- ```docker run -d -p 1001:4000 --restart always <imageId>```
