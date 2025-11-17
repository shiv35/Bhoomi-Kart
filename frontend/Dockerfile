# Stage 1: Build the React application
FROM node:18-alpine as builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
# Use the new port in the build environment variable
ENV PORT=3111
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# When using React Router, Nginx needs to be configured to redirect all requests to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]