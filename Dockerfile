FROM mhart/alpine-node:4.4.6

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY *.js /usr/src/app/

RUN npm install

CMD [ "npm", "start" ]
