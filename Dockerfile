FROM node:16  
WORKDIR /
COPY package*.json ./  
COPY tsconfig.json ./  
RUN npm install
COPY . .  

RUN npm run build
RUN npx prisma generate

CMD [ "npm", "start" ]