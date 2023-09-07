# <a href="" target="_blank">SereneJourney Tours</a>
A backend part of the project<br/>

# 🛠️ Stack 

### Tech stack
Node.js, Express.js, MongoDB

# 🔧 How to run a project localy
### Dependencies recovery
Recover dependencies with `npm i`
### To start application
Start with `npm run dev`
### Environment variable that you have to provide
Create `.env` file and provide following variables :
MONGO_URL : url to your mongo cluster
JWT_ACCESS_SECRET : secret for jwt (you can put random symbols)
JWT_REFRESH_SECRET : same here
SMTP_PORT : can be found in your smpt settings
SMTP_USER : email you using for verefication
SMTP_PASSWORD : password for this email


# Project decomposition
1.  ### Authorization
    
    - [x] Auth service setup
    - [X] Mail verification service setup
    - [x] Registration , login , logout functionality in auth service
    - [x] Auth routes on server
    - [ ] Unactivated account handle
    - [ ] Unactivated account limitation
    - [ ] OAuth(Google)


2. ### Database
   
    - [x] ORM setup
    - [x] DB connection
    - [X] Schemas for users
    - [ ] Schemas for Travel packages, Hotels, Order , Products ...
    
6. ### Tests
   
  - [ ] Soon...

# Contacts :<br/>
📨 <a href="mailto:zhovanukolexander@gmail.com">Email</a><br/>
📱 <a href="https://t.me/sashazhov" target="_blank">Telegram</a>




