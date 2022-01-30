# jksb.js
## Introduction
**A JavaScript program for you to have a good sleep!**
<br><br>
## Features
- Automatically clock in for you every day.
- ~~Automatically check whether the health QR code needs to be uploaded~~.
- A variety of notification methods to let you know the result.
- Available on almost all platforms.
## History
>2022-01-30 optimized the logic when executing

>2022-01-20 added specific version for Quantumult X and Nodejs, the universal version may be deprecated

>2021-09-18 update vaccinationState & QR Code

>2021-09-07 optimized the loop function

>2021-08-23 
synchronously update these options: health code color & location

>2021-08-22 custom notify & Update env.   

>2021-08-20 added support for random time & optimize the login process. 

>2021-08-03 added support for persistence store

>2021-07-30 released v1.0

## Different Versions
### Universial
This version can be used in all platforms due to the env file created by a master.
- deprecated/index.js (optional)
- deprecated/notify.js
- deprecated/package.json (got iconv-lite tough-cookie)
- deprecated/persistence.js (optional)

### Nodejs
Only those platforms have nodejs environment can run this program.
- node.js
- package.json (axios)

### Quantumult X
Only Quantumult X can run this script.
- quantumultx.js