# FROM 配置 NodeJS 环境
FROM node:16
# ADD 复制代码
# ADD <本地路径> <docker 中的路径>
# 复制 Dockerfile 所在路径的文件到 docker 的 app 文件夹下
# 或者使用 COPY 也行
ADD . ./app

# WORKDIR 设置容器启动后的默认工作路径
# 也就是会在这个路径下去执行下面的命令
WORKDIR /app

# RUN 运行命令，可以有多个，是创建容器的时候使用的
# 例如 RUN npm install && cd /app && mkdir logs
# 安装依赖
RUN npm install --registry=https://registry.npm.taobao.org

# CMD 指令只能一个，是容器启动后执行的命令，算是程序的入口。
# 如果还需要运行其他命令可以用 && 连接，也可以写成一个shell脚本去执行。
# 例如 CMD cd /app && ./start.sh
CMD npm start