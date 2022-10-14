#frontend
FROM node:18

MAINTAINER andyopstein@near.foundation

RUN mkdir -p /usr/src/frontend/
RUN mkdir -p /usr/src/shared/

WORKDIR /usr/src/frontend/

ENV PORT=8085
EXPOSE 8085

COPY ./frontend/package.json /usr/src/frontend/package.json
RUN npm install

COPY ./frontend/ /usr/src/frontend/
COPY ../shared/ /usr/src/shared/

RUN yarn install
RUN yarn build:local

CMD ["npm", "start"]

#COPY ../docker_ui/frontend.js /usr/src/txtracking/
#COPY ../docker_ui/package_frontend.json /usr/src/txtracking/package.json

#RUN mkdir -p /usr/src/near-accounting-report/app
#RUN mkdir -p /usr/src/txtracking


#WORKDIR /app

# BUILD the UI.




#COPY dist/favicon.*.ico /usr/src/near-accounting-report/app/
#COPY dist/index.html /usr/src/near-accounting-report/app/
#COPY dist/logo*.svg /usr/src/near-accounting-report/app/
#COPY dist/src.*.css /usr/src/near-accounting-report/app/
#COPY dist/src.*.js /usr/src/near-accounting-report/app/
#COPY dist/src.*.map /usr/src/near-accounting-report/app/

# SERVE the UI.



#RUN npm install
