FROM node:16  
WORKDIR /
COPY package*.json ./  
COPY tsconfig.json ./  
COPY .env ./  
RUN npm install
COPY . .  

RUN npx prisma generate
RUN npm run build


CMD [ "npm", "start" ]