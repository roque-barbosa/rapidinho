FROM node:16

COPY . /mnt/api/

WORKDIR /mnt/api/

RUN yarn init -y && yarn install && yarn build

# RUN npm init -y 

# RUN npm config set registry http://registry.npmjs.org/  

# RUN npm install && npm build

CMD node dist/index.js
