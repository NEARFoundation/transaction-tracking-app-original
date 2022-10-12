FROM node:14.17.3

RUN mkdir -p /usr/src/near-accounting-report/app
WORKDIR /usr/src/near-accounting-report
COPY ./app /usr/src/near-accounting-report/

RUN npm install


CMD ["npm", "start"]
