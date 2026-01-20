FROM python:3.12-slim

WORKDIR /app

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 仅在 requirements.txt 变化时才重新安装（利用 Docker 缓存，避免重复下载）
# 建议在内网环境配置好私有 PyPI 源，例如：
# RUN pip config set global.index-url http://your-internal-pypi/simple
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY . .
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
