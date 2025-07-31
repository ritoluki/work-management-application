# GitHub Push Script
# Thay thế YOUR_USERNAME và YOUR_REPOSITORY_NAME bằng thông tin GitHub của bạn

# Ví dụ: 
# $githubUsername = "johndoe"
# $repositoryName = "work-management-application"

$githubUsername = "ritoluki"
$repositoryName = "work-management-application"

# Kết nối với remote repository
git remote add origin "https://github.com/$githubUsername/$repositoryName.git"

# Push code lên GitHub
git push -u origin main

Write-Host "Dự án đã được push lên GitHub thành công!"
Write-Host "Repository URL: https://github.com/$githubUsername/$repositoryName"
