import { useState } from 'react';
import { FiSearch, FiSettings, FiSmile, FiSend, FiTrash2, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import './ChatWithAI.scss';

export default function ChatWithAI() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'user', text: 'Em bé tuần thứ 5 thì kích thước khoảng bao nhiêu rồi hả bạn?', time: '01:25', avatar: 'https://via.placeholder.com/40' },
    { id: 2, type: 'ai', text: 'Chào bạn, mình là HerbotAI, là trợ lý sức khoẻ phụ nữ của bạn.', time: '10:25' },
    { id: 3, type: 'ai', text: 'Chúc mừng mọm nhân! 👶 Tuần thứ 5 nay, em bé của chúng ta đang được xây xữu, kích thước chỉ ngang tầm một hạt chia thôi (khoảng 2mm và nâng 2mg). Tuy nhỏ xiu nhưng hệ thống kích hoạt ở trong thai đang bắt đầu hình thành rồi đó!', time: '12:25' },
    { id: 4, type: 'ai', text: 'Để hành trình này suôn sẻ nhất, hệ thống liên hệ sản lộc trình định dưỡng và các mốc khám thai quan trọng cho Tâm cả nguyệt thứ nhất. Bạn check ngay ở mục "Bài viết để xuat" nha!', time: '12:25' },
    { id: 5, type: 'user', text: 'Oki nhà bó, cảm ơn để tái lộc tôi cư thế nha', time: '01:25', avatar: 'https://via.placeholder.com/40' },
    { id: 6, type: 'ai', text: 'Hehe, tôi rất sẵn lòng giúp độ bạn. Nếu có câu hỏi gì thêm về bé hạt chia, cứ nói cho mình biết nhé', time: '02:25' },
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputValue,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://via.placeholder.com/40'
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const conversationHistory = [
    { id: 1, title: 'Chuyên phối 5 Ngày Beta HCG', time: '2m ago' },
    { id: 2, title: 'Kịch thước bé hàng 0 tuần', time: '2m ago', starred: true },
    { id: 3, title: 'Chu kỳ bị trễ 3 - 5 ngày', time: '2m ago' },
    { id: 4, title: 'Chuyên phối 5 Ngày Beta HCG', time: '2m ago' },
    { id: 5, title: 'Chuyên phối 5 Ngày Beta HCG', time: '2m ago' },
    { id: 6, title: 'Chuyên phối 5 Ngày Beta HCG', time: '2m ago' },
  ];

  return (
    <div className="chat-ai-container">
      <div className="chat-ai-sidebar">
        <div className="chat-ai-user-profile">
          <img src="https://via.placeholder.com/50" alt="User" className="chat-ai-user-avatar" />
          <div className="chat-ai-user-info">
            <h3>Nguyễn Diệu Linh</h3>
            <p>36 lần còn lại</p>
          </div>
        </div>

        <div className="chat-ai-sections">
          <div className="chat-ai-section">
            <h4 >HerbotAI</h4>
            <ul>
              <li>Thông tin chung</li>
              <li>Tư vấn sức khoẻ</li>
              <li>Gợi thiệu sản phẩm</li>
            </ul>
          </div>

          <div className="chat-ai-section">
            <h4 className="chat-ai-section-title">
              Trò chuyện gần đây
            </h4>
            <div className="chat-ai-history-list">
              {conversationHistory.map((item) => (
                <div key={item.id} className="chat-ai-history-item">
                  <div className="chat-ai-history-content">
                    <p>{item.title}</p>
                    <span>{item.time}</span>
                  </div>
                  <FiTrash2 className="chat-ai-history-action" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`chat-ai-main${messages.length === 0 ? ' chat-ai-main--empty' : ''}`}>
        <div className="chat-ai-header">
          <h2 style={{color: '#F176A9'}}>HerbotAI</h2>
          <div className="chat-ai-header-actions">
            <FiSearch className="chat-ai-icon" />
            <FiSettings className="chat-ai-icon" />
            <button className="chat-ai-new-chat-btn" onClick={handleNewChat}>
              <span>+</span> Đoạn chat mới
            </button>
          </div>
        </div>

        <div className="chat-ai-messages">
          {messages.length === 0 ? null : (
            messages.map((message) => (
              <div key={message.id} className={`chat-ai-message-group ${message.type}`}>
                {message.type === 'ai' && (
                  <div className="chat-ai-ai-badge">HAI</div>
                )}
                <div className={`chat-ai-message ${message.type}`}>
                  <div className="chat-ai-message-body">
                    <p>{message.text}</p>
                  </div>
                  <div className="chat-ai-message-footer">
                    {message.type === 'ai' && (
                      <div className="chat-ai-message-footer-actions">
                        <FiThumbsUp className="chat-ai-action-icon" />
                        <FiThumbsDown className="chat-ai-action-icon" />
                      </div>
                    )}
                    <span className="chat-ai-message-time">{message.time}</span>
                    {message.type === 'user' && (
                      <div className="chat-ai-message-footer-actions">
                        <FiThumbsUp className="chat-ai-action-icon" />
                        <FiThumbsDown className="chat-ai-action-icon" />
                      </div>
                    )}
                  </div>
                </div>
                {message.type === 'user' && message.avatar && (
                  <img src={message.avatar} alt="User" className="chat-ai-message-avatar" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="chat-ai-input-area">
          <div className="chat-ai-input-container">
            <FiSmile className="chat-ai-emoji-icon" />
            <input
              type="text"
              placeholder="Gửi tin nhắn đến HerbotAI"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-ai-input"
            />
            <button className="chat-ai-send-btn" onClick={handleSendMessage}>
              <FiSend />
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
