FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./ 

RUN npm install

COPY . .

ARG NEXT_PUBLIC_BACKEND_PUBLIC_URL
ENV NEXT_PUBLIC_BACKEND_PUBLIC_URL=$NEXT_PUBLIC_BACKEND_PUBLIC_URL
RUN npm run build

CMD ["npm", "start"]
