FROM node:16  
WORKDIR /
COPY package*.json ./  
COPY tsconfig.json ./  
COPY .env ./  
COPY /src/swagger.json ./dist/src/
RUN npm install
COPY . .  

RUN npx prisma generate
RUN npm run build


CMD [ "npm", "start" ]