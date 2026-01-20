FROM python:3.12-slim

WORKDIR /app

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 拷贝代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 3000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
