| Cụm chức năng | Tên trang          | Mô tả                                         | URL FE                                 | Method | API BE                                    |
| ------------- | ------------------ | --------------------------------------------- | -------------------------------------- | ------ | ----------------------------------------- |
| Blog          | Topic              | Danh sách các chủ đề                          | `herdays.io.vn/blog`                   | GET    | `/herdays-api/blog/topics`                |
| Blog          | Danh sách bài viết | Bấm vào 1 chủ đề, hiển thị danh sách bài viết | `herdays.io.vn/blog/:id/posts`         | GET    | `/herdays-api/blog/topics/:topicId/posts` |
| Blog          | Chi tiết bài viết  | Chi tiết bài viết                             | `herdays.io.vn/blog/:id/posts/:postId` | GET    | `/herdays-api/blog/posts/:postId`         |
Blog| admin posts dashboard| Thêm và chỉnh sửa bài viết| `/herdays.io/admin/posts`| POST/PUT |`/herdays-api/admin/posts`

## Các topic bao gồm:
Chia làm các nhánh: (Mỗi nhánh 4-5 bài)
- Chu Kỳ Kinh Nguyệt (Cycle Health)
- Chuẩn bị mang thai & Thụ Thai (Fertility)
- Thai Kỳ (Pregnancy)
- IVF & Hỗ Trợ Sinh Sản
- Khác

Sẽ được thêm trực tiếp vào trong DB với các trường:
```json
{
  "_id": ObjectId("60d5ec49f1b2c8b1f8e4b303"),
  "name": "Chuẩn bị mang thai",
  "slug": "chuan-bi-mang-thai",
  "imgThumbnail": "https://cloudinary.com/herdays/topic_chuanbi.png",
  "description": "Các bước chuẩn bị để đón thiên thần nhỏ",
  "createdAt": "2026-05-03T00:00:00.000Z",
  "updatedAt": "2026-05-03T00:00:00.000Z"
}
```

## Các bàu viết sẽ có các trường dữ liệu như:

```json
{
  "_id": ObjectId("60d5ec49f1b2c8b1f8e4b401"),
  "postTopicId": "60d5ec49f1b2c8b1f8e4b301",
  "title": "5 Điều cần biết trước khi làm IVF",
  "content": "<p>IVF là một hành trình dài...</p><img src='https://cloudinary.com/img1.png'/>",
  "authorId": "60d5ec49f1b2c8b1f8e4b101",
  "images": [
    "https://cloudinary.com/img1.png"
  ],
  "thumbnail": "https://cloudinary.com/herdays/post_ivf_thumb.png",
  "status": "Published",
  "createdAt": "2026-06-01T08:00:00.000Z",
  "updatedAt": "2026-06-01T08:00:00.000Z"
}
```

**Lưu ý** : Các nội dung hình ảnh sẽ được lưu trên cloudinary