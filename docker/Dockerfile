FROM node:14.17.3

RUN mkdir -p /usr/src/near-accounting-report/app
WORKDIR /usr/src/near-accounting-report

COPY frontend.js /usr/src/near-accounting-report/
COPY package.json /usr/src/near-accounting-report/

COPY modules/favicon.*.ico /usr/src/near-accounting-report/app/
COPY modules/index.html /usr/src/near-accounting-report/app/
COPY modules/logo*.svg /usr/src/near-accounting-report/app/
COPY modules/src.*.css /usr/src/near-accounting-report/app/
COPY modules/src.*.js /usr/src/near-accounting-report/app/
COPY modules/src.*.map /usr/src/near-accounting-report/app/



RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
