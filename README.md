NIEM - Movement: Backend
====================

The other code repositories include the [Movement - Webapp](https://github.com/NIEM/movement-frontend) and the [Movement - Solr](https://github.com/NIEM/movement-solr).

Prior to coming to this repo, did you happen to catch our [Movement overview](https://github.com/NIEM/Movement)?

## Got feedback? 
In the spirit of open-source tooling, we have provided a [Scrum board](https://github.com/NIEM/Movement/projects/1) that allows users to keep track of Movement’s issues and enhancements. Anyone can [submit a new issue](https://github.com/NIEM/Movement/issues) for the tool for something they would like to see added or a bug. Once reviewed by the program office, issues will be added to the Scrum board's backlog. Developers and tool contributors can then address issues from the backlog and track their status using the Scrum board—providing an Agile approach to development and complete transparency to users.

# Running the App with Docker

The backend can be run via Docker. To run the node app locally with Docker, first make sure you have installed and setup the NIEM Movement Docker config:
```
docker network create niem-network
```

To generate a new list of nonparentTypes and subGroupHeadIds for the Solr data import, run: `node writeSolrIngestFiles`.

Note: Also build and run the Solr container. Then build and run the backend container, from the repo's root directory:
```
docker build -t movement-backend .
docker run -dti -p 7000:7000 --name movement-backend --net niem-network movement-backend
```

# Node App Features

An Express project with the following features:

* Authentication and Session Storage via passport
* Data persistence with MongoDB using the Mongoose ODM
* Example CRUD HTTP endpoints
* Code coverage, unit tests and documentation

## Requirements
- [Node.js](http://nodejs.org/): 6.9.1 LTS or greater is required

## Dependencies
`npm install` To install the following:
#### Dependencies
  - [body-parser](https://github.com/expressjs/body-parser) - Parses incoming request bodies
  - [dotenv](https://github.com/bkeepers/dotenv) - Shim to load environment variables from .env into ENV
  - [express](https://expressjs.com/) - Web application framework for Node.js
  - [helmet](https://github.com/helmetjs/helmet) -  Secure Express apps with various HTTP headers
  - [locreq](https://github.com/sealcode/locreq) -  Local Require - use relative paths with require for unit tests

#### Development Dependencies
  - [nsp](https://github.com/nodesecurity/nsp) - Node security platform, check for known vulnerabilities

## Run
Configure the environmental parameters via the `.env` file or config them via the command line when running.
Run the application with `npm start` or with optional parameters `PORT=7001 NODE_ENV=development npm start`
