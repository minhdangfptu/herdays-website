const numberOptions = Array.from({ length: 100 }, (_, index) => String(index + 1));

const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  DATE: 'date',
  SHORT_ANSWER: 'short_answer'
};

const withDefaultQuestionType = (questions) => questions.map((question) => ({
  question_type: QUESTION_TYPES.SINGLE_CHOICE,
  ...question
}));

const quizQuestions = withDefaultQuestionType([
  {
    tag: 'general',
    index: 1,
    content: 'Độ tuổi của bạn?',
    question_type: QUESTION_TYPES.DATE,
    options: ['Nhập ngày tháng năm sinh']
  },
  {
    tag: 'general',
    index: 2,
    content: 'Bạn đang ở giai đoạn nào trong hành trình của mình?',
    options: [
      'Theo dõi chu kỳ kinh nguyệt',
      'Đang muốn có thai',
      'Đang mang thai',
      'Đang điều trị IVF'
    ]
  },
  {
    tag: 'period',
    index: 1,
    content: 'Chu kỳ của bạn thường kéo dài bao nhiêu ngày?',
    options: numberOptions
  },
  {
    tag: 'period',
    index: 2,
    content: 'Kinh nguyệt của bạn có đều không?',
    options: [
      'Rất không đều (dao động trên 14 ngày hoặc thường xuyên không đến)',
      'Không đều (dao động 8-14 ngày)',
      'Tương đối đều (dao động 4-7 ngày)',
      'Đều (dao động 1-3 ngày)',
      'Rất đều (hầu như không thay đổi, đúng ngày hoặc lệch tối đa 1 ngày)'
    ]
  },
  {
    tag: 'period',
    index: 3,
    content: 'Mức độ đau bụng kinh?',
    options: ['Không đau', 'Nhẹ', 'Trung bình', 'Nặng', 'Rất nặng']
  },
  {
    tag: 'period',
    index: 4,
    content: 'Bạn thường gặp triệu chứng nào trước kỳ kinh?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Cáu gắt', 'Buồn bã', 'Thèm ăn', 'Buồn nôn', 'Đau lưng', 'Đau ngực', 'Khác/Không có']
  },
  {
    tag: 'period',
    index: 5,
    content: 'Điều khiến bạn cảm thấy bất tiện nhất trong kỳ kinh nguyệt là gì?',
    options: [
      'Khó theo dõi và ghi nhớ chu kỳ kinh nguyệt',
      'Phải tự chuẩn bị nhiều vật dụng cho kỳ kinh (băng vệ sinh, thuốc giảm đau, đồ ăn nhẹ,...)',
      'Khó lựa chọn sản phẩm phù hợp với nhu cầu của bản thân',
      'Thường xuyên gặp các triệu chứng khó chịu như đau bụng kinh, mệt mỏi hoặc thay đổi tâm trạng',
      'Không gặp bất tiện đáng kể'
    ]
  },
  {
    tag: 'period',
    index: 6,
    content: 'Bạn mong muốn ứng dụng hỗ trợ bạn theo cách nào?',
    options: [
      'Chỉ theo dõi chu kỳ cơ bản',
      'Nhắc nhở và gợi ý theo thời điểm',
      'Gợi ý giải pháp chăm sóc phù hợp',
      'Tự động hóa tối đa theo nhu cầu cá nhân'
    ]
  },
  {
    tag: 'period',
    index: 7,
    content: 'Bạn có thích ăn đồ ngọt mỗi khi đến tháng không?',
    options: ['Có', 'Không', 'Khác']
  },
  {
    tag: 'period',
    index: 8,
    content: 'Bạn đã thử dùng trà nóng mỗi khi đến tháng chưa?',
    options: ['Có', 'Không', 'Khác']
  },
  {
    tag: 'fertility',
    index: 1,
    content: 'Bạn dự định mang thai trong:',
    options: ['3 tháng tới', '6 tháng tới', '12 tháng tới', 'Chưa xác định']
  },
  {
    tag: 'fertility',
    index: 2,
    content: 'Bạn đã khám sức khỏe tiền thai sản chưa?',
    options: ['Có', 'Chưa']
  },
  {
    tag: 'fertility',
    index: 3,
    content: 'Bạn đã cố gắng mang thai trong bao lâu?',
    options: ['Vừa mới bắt đầu', '0 - 3 tháng', '4 - 6 tháng', '7 - 12 tháng', 'Trên 1 năm']
  },
  {
    tag: 'fertility',
    index: 4,
    content: 'Đây có phải lần đầu tiên bạn cố gắng thụ thai không?',
    options: [
      'Đây là lần đầu tiên tôi cố gắng mang thai',
      'Tôi đã từng mang thai và sinh con',
      'Tôi đã từng bị sảy thai',
      'Tôi đã cố gắng mang thai trước đây nhưng chưa thành công',
      'Không muốn trả lời'
    ]
  },
  {
    tag: 'fertility',
    index: 5,
    content: 'Chu kỳ của bạn thường kéo dài bao nhiêu ngày?',
    options: numberOptions
  },
  {
    tag: 'fertility',
    index: 6,
    content: 'Bạn có bệnh lý nền nào không?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Tiểu đường', 'Tuyến giáp', 'Huyết áp', 'Khác/Không có']
  },
  {
    tag: 'fertility',
    index: 7,
    content: 'Bạn có nhận thấy bất kỳ triệu chứng nào liên quan đến chu kỳ của mình không?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: [
      'Đau bụng kinh', 'Mụn', 'Đầy bụng', 'Biến đổi tâm trạng', 'Đau đầu',
      'Mệt', 'Khó ngủ', 'Lo âu và căng thẳng', 'Không có triệu chứng đáng kể'
    ]
  },
  {
    tag: 'fertility',
    index: 8,
    content: 'Bạn nhận thấy dịch tiết âm đạo của mình gần đây như thế nào?',
    options: [
      'Ít hoặc khô hầu hết thời gian',
      'Dính hoặc đặc',
      'Dạng kem, màu trắng đục',
      'Trong, dai và giống lòng trắng trứng',
      'Thay đổi thường xuyên trong chu kỳ',
      'Tôi không chắc'
    ]
  },
  {
    tag: 'fertility',
    index: 9,
    content: 'Điều gì khiến bạn lo lắng nhất trong hành trình mang thai hiện tại?',
    options: [
      'Khó thụ thai',
      'Tuổi tác ảnh hưởng đến khả năng sinh sản',
      'Từng sảy thai hoặc thai lưu',
      'Căng thẳng và áp lực tâm lý',
      'Chi phí điều trị hiếm muộn',
      'Tôi chưa có lo lắng đặc biệt'
    ]
  },
  {
    tag: 'pregnancy-care',
    index: 1,
    content: 'Bạn đang ở tuần thai thứ bao nhiêu?',
    question_type: QUESTION_TYPES.SHORT_ANSWER,
    options: ['Nhập số tuần và ngày (ngày từ 0-31)']
  },
  {
    tag: 'pregnancy-care',
    index: 2,
    content: 'Đây là lần mang thai thứ mấy của bạn?',
    options: ['Lần đầu', 'Lần hai', 'Lần ba', 'Trên ba lần']
  },
  {
    tag: 'pregnancy-care',
    index: 3,
    content: 'Bạn có đang gặp triệu chứng nào?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: [
      'Phù chân', 'Nghén', 'Buồn nôn', 'Mệt mỏi, thiếu năng lượng', 'Táo bón',
      'Khó tiêu', 'Đau lưng', 'Chuột rút', 'Khó ngủ', 'Ít hoặc không có triệu chứng đáng kể'
    ]
  },
  {
    tag: 'pregnancy-care',
    index: 4,
    content: 'Bạn muốn theo dõi nội dung nào nhất?',
    options: [
      'Sự phát triển của thai nhi theo tuần',
      'Bổ sung vitamin & vi chất cần thiết',
      'Vận động, tập luyện và chăm sóc thể chất phù hợp',
      'Theo dõi các thay đổi của cơ thể mẹ',
      'Theo dõi tổng hợp theo mục tiêu cá nhân'
    ]
  },
  {
    tag: 'pregnancy-care',
    index: 5,
    content: 'Bạn có bệnh lý nền nào không?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Tiểu đường', 'Tuyến giáp', 'Huyết áp', 'Khác/Không có']
  },
  {
    tag: 'ivf',
    index: 1,
    content: 'Hiện tại bạn đang ở giai đoạn nào trong hành trình IVF?',
    options: [
      'Tìm hiểu và chuẩn bị IVF', 'Kích thích buồng trứng', 'Chọc hút trứng',
      'Nuôi phôi', 'Chuyển phôi', 'Chờ kết quả Beta hCG'
    ]
  },
  {
    tag: 'ivf',
    index: 2,
    content: 'Đây là lần IVF thứ mấy của bạn?',
    options: ['Lần đầu tiên', 'Lần thứ 2', 'Lần thứ 3', 'Trên 3 lần']
  },
  {
    tag: 'ivf',
    index: 3,
    content: 'Nguyên nhân chính khiến bạn thực hiện IVF là gì?',
    options: [
      'Vô sinh không rõ nguyên nhân', 'Tắc vòi trứng', 'Suy giảm dự trữ buồng trứng',
      'Hội chứng buồng trứng đa nang (PCOS)', 'Lạc nội mạc tử cung',
      'Chất lượng tinh trùng thấp', 'Tuổi sinh sản cao', 'Khác'
    ]
  },
  {
    tag: 'ivf',
    index: 4,
    content: 'Bạn có biết chỉ số AMH của mình không?',
    options: ['Dưới 1 ng/mL', '1–3 ng/mL', 'Trên 3 ng/mL', 'Không biết']
  },
  {
    tag: 'ivf',
    index: 5,
    content: 'Bạn đã từng mang thai trước đây chưa?',
    options: ['Chưa từng', 'Đã từng sinh con', 'Đã từng sảy thai', 'Đã từng thai lưu', 'Đã từng mang thai ngoài tử cung']
  },
  {
    tag: 'ivf',
    index: 6,
    content: 'Bạn đang gặp triệu chứng nào?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Đầy bụng', 'Căng tức ngực', 'Mệt mỏi', 'Khó ngủ', 'Thay đổi cảm xúc', 'Không có triệu chứng đáng kể']
  },
  {
    tag: 'ivf',
    index: 7,
    content: 'Bạn tự đánh giá mức độ hiểu biết về IVF của mình như thế nào?',
    options: ['Rất thấp (mới bắt đầu tìm hiểu)', 'Thấp', 'Trung bình', 'Khá hiểu', 'Rất hiểu (có thể giải thích cho người khác)']
  },
  {
    tag: 'ivf',
    index: 8,
    content: 'Bạn muốn được hỗ trợ điều gì nhất trong giai đoạn này?',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Hướng dẫn tiêm thuốc', 'Theo dõi triệu chứng', 'Dinh dưỡng tăng chất lượng trứng', 'Nhắc lịch khám và xét nghiệm']
  },
  {
    tag: 'ivf',
    index: 9,
    content: 'Sau chuyển phôi, điều gì khiến bạn lo lắng nhất?',
    options: ['Phôi không làm tổ', 'Sảy thai sớm', 'Không có triệu chứng', 'Có triệu chứng bất thường', 'Không biết nên sinh hoạt như thế nào']
  },
  {
    tag: 'ivf',
    index: 10,
    content: 'Trong quá trình IVF, bạn cần thông tin nhất về điều gì? (chọn tối đa 3)',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: [
      'Quy trình từng giai đoạn', 'Thuốc và tác dụng phụ', 'Tỷ lệ thành công',
      'Dinh dưỡng', 'Cách tăng chất lượng trứng/phôi',
      'Dấu hiệu bất thường cần đi khám', 'Chi phí và lộ trình'
    ]
  }
]);

export default quizQuestions;
