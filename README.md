## 文件存储

文件存储统一使用 minio, 通过 docker 部署在 macmini 上，这个也许可以好一点吧

```zsh
docker run -d --name minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=secretpassword -v ~/minio-data:/data minio/minio server /data --console-address ":9001"
```
