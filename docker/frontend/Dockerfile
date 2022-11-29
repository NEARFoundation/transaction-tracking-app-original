#frontend
FROM node:18
#FROM 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/node:18

MAINTAINER na

RUN mkdir -p /usr/src/frontend/
RUN mkdir -p /usr/src/shared/

WORKDIR /usr/src/frontend/

ENV PORT=8085
EXPOSE 8085

COPY ./frontend /usr/src/frontend/
COPY ./shared /usr/src/shared/

WORKDIR /usr/src/shared/

#RUN npm install --force
RUN yarn install


WORKDIR /usr/src/frontend/

#RUN npm install --force
RUN yarn install
#RUN yarn build:local
RUN yarn buildgeneric

CMD ["npm", "run", "rungeneric"]

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
