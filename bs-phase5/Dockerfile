# ---- Base image ----
FROM node:20-alpine

# ---- Create app directory ----
WORKDIR /usr/src/app

# ---- Copy package files first (better caching) ----
COPY package*.json ./

# ---- Install dependencies (including dev for watch mode) ----
RUN npm install

# ---- Copy the rest of the project ----
COPY . .

# ---- Default command ----
CMD ["npm", "run", "dev"]
