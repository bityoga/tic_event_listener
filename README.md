# Articonf TIC SMART Api App


# Requirements

1. Bityoga fabric sdk should be up and running (**Hyperledger Explorer service should be running. This app relies on hyperledger explorer api to get transction details**).
2. Node version
   - Supports node version >=v11.0.0
   - Tested with v11.0.0

# Run Instructions

1. ## Clone this repository

   - `git clone https://github.com/bityoga/tic_event_listener.git`

2. ## Run npm install

   - cd tic_event_listener/
   - **Set node version :** `nvm use node v11.0.0` (using nvm)
   - **Execute Command :** `npm install`

3. ## Start App

   - `cd tic_event_listener/`
   - **Execute Command :** `node app.js`
   - app will be running in **'localhost' at port 3004**
   - **open in browser:** http://localhost:3004/

   ### [fabric_as_code](https://github.com/bityoga/fabric_as_code) deployment

   - This is deployed along with the cli service playbook[103.deploy_cli.yml](https://github.com/bityoga/fabric_as_code/blob/master/103.deploy_cli.yml)
   - Deployment happens throuh [CLI.sh](https://github.com/bityoga/fabric_as_code/blob/master/roles/hlf/cli/cli/files/CLI.sh)

## Dockerisation

### 1) Build Docker Image

```sh
$ git clone https://github.com/bityoga/tic_event_listener.git
$ cd tic_event_listener
$ npm i # Run this to generate package-lock.json which will be required for creating docker image
```

Do step 3 as said above if running locally

```sh
$ docker build --tag tic-smart-api .
```

### 2a) Run as a docker container

```sh
$ docker run -d --name tic-smart-api -p 3004:3004 tic-smart-api:latest
```

### 2b) Run as a docker service with replicas

```sh
$ docker service create --name tic-smart-api-service --replicas 1 -p 3004:3004 tic-smart-api:latest
```
