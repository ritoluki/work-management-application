# 🚀 Hướng dẫn Deploy Work Management Backend lên Render

## Chuẩn bị trước khi deploy

### 1. Push code lên GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Tạo Database trên Render
1. Đăng nhập vào [Render.com](https://render.com)
2. Tạo PostgreSQL Database:
   - Chọn "New PostgreSQL"
   - Database Name: `work-management-db`
   - User: `workuser`
   - Region: Singapore (gần VN nhất)
   - Plan: Free

### 3. Deploy Backend Service
1. Chọn "New Web Service"
2. Connect GitHub repository
3. Chọn repository: `work-management-backend`
4. Cấu hình:
   - Name: `work-management-backend`
   - Environment: `Docker`
   - Plan: `Free`
   - Dockerfile Path: `./Dockerfile`

### 4. Cấu hình Environment Variables
Trong phần Environment Variables, thêm:

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://workuser:3EUKYPqSa4PH2cE5tcLvcOqt8M8kr8ar@dpg-d2ek3i2dbo4c738hcpv0-a/work_management_5g47
DB_USERNAME=workuser
DB_PASSWORD=3EUKYPqSa4PH2cE5tcLvcOqt8M8kr8ar
FRONTEND_URL=https://your-frontend-app.onrender.com
```

**Lưu ý:** Cập nhật `FRONTEND_URL` với domain thực tế của frontend app khi deploy.

## Cấu hình Database Connection

### Option 1: Sử dụng PostgreSQL (Khuyến nghị cho Render)
Thêm dependency PostgreSQL vào `pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Cập nhật `application-prod.properties`:
```properties
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### Option 2: Sử dụng External MySQL
Sử dụng PlanetScale hoặc Railway MySQL và cập nhật `DATABASE_URL`.

## Kiểm tra Deploy

### 1. Build Status
- Kiểm tra logs trong Render Dashboard
- Đảm bảo build thành công

### 2. Health Check
- Truy cập: `https://your-app-name.onrender.com/actuator/health`
- Kiểm tra API endpoints: `https://your-app-name.onrender.com/api/users`

### 3. Database Connection
- Kiểm tra logs xem có kết nối database thành công không
- Test API endpoints để đảm bảo CRUD operations hoạt động

## Troubleshooting

### Build Failed
- Kiểm tra Dockerfile syntax
- Đảm bảo Java version 17
- Kiểm tra Maven dependencies

### Database Connection Error
- Xác minh Database URL và credentials
- Kiểm tra network connectivity
- Đảm bảo database đã được tạo

### CORS Issues
- Cập nhật `FRONTEND_URL` với domain chính xác
- Kiểm tra CORS configuration trong `application-prod.properties`

## Production Optimizations

### 1. Caching
Thêm Redis cho caching (optional):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 2. Monitoring
- Enable Actuator endpoints
- Set up logging aggregation
- Monitor memory usage

### 3. Security
- Use HTTPS only
- Configure proper CORS
- Set up rate limiting

---

## 📞 Support
Nếu gặp vấn đề, kiểm tra:
1. Render logs
2. Database connection
3. Environment variables
4. GitHub repository access
