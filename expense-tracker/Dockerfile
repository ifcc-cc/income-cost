# 构建阶段
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:stable-alpine
# 从构建阶段拷贝编译后的产物
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 拷贝自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8090
CMD ["nginx", "-g", "daemon off;"]
