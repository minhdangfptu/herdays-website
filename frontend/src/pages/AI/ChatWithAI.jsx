import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBookOpen,
  FiExternalLink,
  FiShoppingBag,
  FiSearch,
  FiSettings,
  FiSmile,
  FiSend,
  FiTrash2,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';

import { blogApi, chatApi, hasAuthSession, profileApi } from '../../services/apiService.js';
import { Skeleton } from '../../components/Skeleton.jsx';
import avatarDefault from '../../assets/avatar_default.png';
import './ChatWithAI.scss';

const BLOG_SUGGESTION_LIMIT = 3;
const BLOG_POSTS_PER_TOPIC_LIMIT = 4;
const BLOG_STOP_WORDS = new Set([
  'ban',
  'bai',
  'biet',
  'cho',
  'co',
  'cua',
  'duoc',
  'gi',
  'giup',
  'hoi',
  'khong',
  'la',
  'mot',
  'nay',
  'nhu',
  'toi',
  'trong',
  'va',
  've'
]);

const formatMessageTime = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatHistoryTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const formatCurrency = (value, currency = 'VND') => (
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value) || 0)
);

const normalizeText = (value = '') => (
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
);

const tokenize = (value) => (
  normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !BLOG_STOP_WORDS.has(word))
);

const toInternalHref = (url) => {
  if (!url) return '/blog';

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url;
  }
};

const getPostHref = (post, topic) => {
  const topicId = topic?._id || post.postTopicId?._id || post.postTopicId || post.topicId?._id || post.topicId;
  if (!topicId || !post._id) return '/blog';
  return `/blog/${topicId}/posts/${post._id}`;
};

const mapBlogCitations = (citations = []) => {
  const seen = new Set();

  return citations
    .filter((citation) => citation?.sourceType === 'blog' && citation.title)
    .map((citation) => ({
      id: citation.sourceId || citation.url || citation.title,
      title: citation.title,
      excerpt: citation.excerpt || '',
      href: toInternalHref(citation.url)
    }))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, BLOG_SUGGESTION_LIMIT);
};

const mapRecommendedBoxes = (products = []) => {
  const seen = new Set();

  return products
    .filter((product) => product?.productId && product?.title)
    .map((product) => ({
      id: product.productId,
      title: product.title,
      reason: product.reason || '',
      benefits: product.benefits || [],
      price: product.price,
      currency: product.currency || 'VND',
      thumbnail: product.thumbnail || '',
      detailHref: product.detailUrl || `/product-detail/box/${product.productId}`,
      customizeHref: product.customizeUrl || `/box-customize/${product.productId}`
    }))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
};

const mapApiMessage = (message) => {
  const recommendedBoxes = mapRecommendedBoxes(message.recommendedProducts);

  return {
    id: message.id,
    type: message.role === 'assistant' ? 'ai' : 'user',
    text: message.content,
    time: formatMessageTime(message.createdAt),
    blogSuggestions: recommendedBoxes.length > 0 ? [] : mapBlogCitations(message.citations),
    recommendedBoxes,
  };
};

export default function ChatWithAI() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: 'Chào mừng bạn đến với HerBotAI!\nMình là trợ lý ảo của HERDAYS. Bạn cần mình giúp gì hôm nay?',
      time: formatMessageTime(),
      recommendedBoxes: [],
      blogSuggestions: [],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const blogSuggestionPoolRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isLoggedIn = useMemo(() => hasAuthSession(), []);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [messages, isSending]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let isActive = true;

    const fetchProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (isActive) setUserProfile(profile);
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let isActive = true;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);

      try {
        const result = await chatApi.getConversations();
        if (isActive) setConversationHistory(result.conversations || []);
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoadingHistory(false);
      }
    };

    fetchHistory();

    return () => {
      isActive = false;
    };
  }, [isLoggedIn]);

  const upsertConversation = (conversation) => {
    if (!conversation) return;
    setConversationHistory((items) => {
      const withoutCurrent = items.filter((item) => item.id !== conversation.id);
      return [conversation, ...withoutCurrent];
    });
  };

  const ensureConversation = async (firstMessage) => {
    if (conversationId) return conversationId;

    const result = await chatApi.createConversation({
      title: firstMessage.slice(0, 80),
      personalizationConsent: isLoggedIn,
    });
    const nextConversationId = result.conversation.id;
    setConversationId(nextConversationId);
    upsertConversation(result.conversation);
    return nextConversationId;
  };

  const getBlogSuggestionPool = async () => {
    if (blogSuggestionPoolRef.current) return blogSuggestionPoolRef.current;

    const topicResult = await blogApi.getTopics();
    const topics = topicResult.topics || [];
    const topicPostResults = await Promise.all(
      topics.map((topic) => blogApi.getTopicPosts(topic._id, 1, BLOG_POSTS_PER_TOPIC_LIMIT)),
    );

    const pool = topicPostResults.flatMap((result, index) => {
      const topic = result.topic || topics[index];
      return (result.posts || []).map((post) => ({
        id: post._id,
        title: post.title,
        excerpt: topic?.name ? `Bài viết thuộc chủ đề ${topic.name}` : 'Bài viết HERDAYs liên quan',
        href: getPostHref(post, topic),
        searchableText: [post.title, topic?.name, topic?.slug].filter(Boolean).join(' ')
      }));
    });

    blogSuggestionPoolRef.current = pool;
    return pool;
  };

  const getFallbackBlogSuggestions = async (query) => {
    try {
      const queryTokens = tokenize(query);
      if (queryTokens.length === 0) return [];

      const pool = await getBlogSuggestionPool();
      return pool
        .map((post) => {
          const searchableTokens = new Set(tokenize(post.searchableText));
          const score = queryTokens.reduce(
            (total, token) => total + (searchableTokens.has(token) ? 1 : 0),
            0,
          );
          return { ...post, score };
        })
        .filter((post) => post.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, BLOG_SUGGESTION_LIMIT)
        .map((post) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          href: post.href
        }));
    } catch {
      return [];
    }
  };

  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isSending) return;

    const optimisticMessage = {
      id: `local-${Date.now()}`,
      type: 'user',
      text: userMessage,
      time: formatMessageTime(),
    };

    setMessages((items) => [...items, optimisticMessage]);
    setInputValue('');
    setErrorMessage('');
    setIsSending(true);

    try {
      const nextConversationId = await ensureConversation(userMessage);
      const result = await chatApi.sendMessage(nextConversationId, userMessage);
      upsertConversation(result.conversation);
      const assistantMessage = mapApiMessage(result.assistantMessage);
      if (
        assistantMessage.recommendedBoxes.length === 0
        && assistantMessage.blogSuggestions.length === 0
      ) {
        assistantMessage.blogSuggestions = await getFallbackBlogSuggestions(userMessage);
      }
      setMessages((items) => [
        ...items,
        assistantMessage,
      ]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = async (selectedConversationId) => {
    setConversationId(selectedConversationId);
    setErrorMessage('');
    setIsLoadingHistory(true);

    try {
      const result = await chatApi.getMessages(selectedConversationId);
      setMessages((result.messages || []).map(mapApiMessage));
      upsertConversation(result.conversation);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteConversation = async (event, selectedConversationId) => {
    event.stopPropagation();
    try {
      await chatApi.deleteConversation(selectedConversationId);
      setConversationHistory((items) => items.filter((item) => item.id !== selectedConversationId));
      if (conversationId === selectedConversationId) {
        setConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        text: 'Chào mừng bạn đến với HerBotAI!\nMình là trợ lý ảo của HERDAYS. Bạn cần mình giúp gì hôm nay?',
        time: formatMessageTime(),
        recommendedBoxes: [],
        blogSuggestions: [],
      },
    ]);
    setInputValue('');
    setErrorMessage('');
  };

  const userDisplayName = isLoggedIn
    ? userProfile?.fullName || userProfile?.email || 'Tài khoản HERDAYS'
    : 'Khách';

  return (
    <div className="chat-ai-container">
      <div className="chat-ai-sidebar" data-lenis-prevent>
        <div className="chat-ai-user-profile">
          <img className="chat-ai-user-avatar" src={avatarDefault} alt={userDisplayName} />
          <div className="chat-ai-user-info">
            <h3>{userDisplayName}</h3>
            <p>{isLoggedIn ? 'Lịch sử hội thoại được lưu' : 'Hội thoại khách trong 24 giờ'}</p>
          </div>
        </div>

        <div className="chat-ai-sections">
          <div className="chat-ai-section">
            <h4>HerBotAI</h4>
            <ul>
              <li>Thông tin chung</li>
              <li>Tư vấn sức khỏe</li>
              <li>Gợi ý sản phẩm</li>
            </ul>
          </div>

          <div className="chat-ai-section">
            <h4 className="chat-ai-section-title">Trò chuyện gần đây</h4>
            <div className="chat-ai-history-list">
              {isLoadingHistory && (
                <div className="space-y-2" role="status" aria-label="Đang tải lịch sử hội thoại">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
              {!isLoadingHistory && conversationHistory.length === 0 && (
                <p className="chat-ai-history-empty">Chưa có hội thoại.</p>
              )}
              {!isLoadingHistory && conversationHistory.map((item) => (
                <button
                  key={item.id}
                  className={`chat-ai-history-item ${
                    item.id === conversationId ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => handleSelectConversation(item.id)}
                >
                  <div className="chat-ai-history-content">
                    <p>{item.title}</p>
                    <span>{formatHistoryTime(item.lastMessageAt || item.createdAt)}</span>
                  </div>
                  <FiTrash2
                    className="chat-ai-history-action"
                    onClick={(event) => handleDeleteConversation(event, item.id)}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-ai-main">
        <div className="chat-ai-header">
          <h2 style={{ color: '#F176A9' }}>HerBotAI</h2>
          <div className="chat-ai-header-actions">
            <FiSearch className="chat-ai-icon" />
            <FiSettings className="chat-ai-icon" />
            <button className="chat-ai-new-chat-btn" type="button" onClick={handleNewChat}>
              <span>+</span> Đoạn chat mới
            </button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="chat-ai-messages"
          data-lenis-prevent
        >
          {errorMessage && <div className="chat-ai-error">{errorMessage}</div>}
          {messages.map((message) => (
            <div key={message.id} className={`chat-ai-message-group ${message.type}`}>
              {message.type === 'ai' && <div className="chat-ai-ai-badge">HBI</div>}
              <div className={`chat-ai-message ${message.type}`}>
                <div className="chat-ai-message-body">
                  <p>{message.text}</p>

                  {message.type === 'ai' && message.blogSuggestions?.length > 0 && (
                    <div className="chat-ai-blog-suggestions">
                      <div className="chat-ai-blog-suggestions__header">
                        <FiBookOpen />
                        <span>Bài viết HERDAYs liên quan</span>
                      </div>
                      <div className="chat-ai-blog-suggestions__list">
                        {message.blogSuggestions.map((blog) => (
                          <a
                            key={blog.id}
                            className="chat-ai-blog-card"
                            href={blog.href}
                          >
                            <span className="chat-ai-blog-card__title">{blog.title}</span>
                            {blog.excerpt && (
                              <span className="chat-ai-blog-card__excerpt">{blog.excerpt}</span>
                            )}
                            <span className="chat-ai-blog-card__action">
                              Đọc bài viết
                              <FiExternalLink />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.type === 'ai' && message.recommendedBoxes?.length > 0 && (
                    <div className="chat-ai-product-suggestions">
                      <div className="chat-ai-product-suggestions__header">
                        <FiShoppingBag />
                        <span>Box HERDAYs phu hop</span>
                      </div>
                      <div className="chat-ai-product-suggestions__list">
                        {message.recommendedBoxes.map((box) => (
                          <div key={box.id} className="chat-ai-product-card">
                            <a className="chat-ai-product-card__main" href={box.detailHref}>
                              <div className="chat-ai-product-card__image">
                                {box.thumbnail ? (
                                  <img src={box.thumbnail} alt={box.title} />
                                ) : (
                                  <FiShoppingBag />
                                )}
                              </div>
                              <div className="chat-ai-product-card__content">
                                <span className="chat-ai-product-card__title">{box.title}</span>
                                {box.reason && (
                                  <span className="chat-ai-product-card__reason">{box.reason}</span>
                                )}
                                {box.price !== null && box.price !== undefined && (
                                  <strong className="chat-ai-product-card__price">
                                    {formatCurrency(box.price, box.currency)}
                                  </strong>
                                )}
                              </div>
                            </a>
                            <div className="chat-ai-product-card__actions">
                              <a href={box.detailHref}>
                                Xem box
                                <FiExternalLink />
                              </a>
                              <a href={box.customizeHref}>Tuy chinh box</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-ai-message-footer">
                  {message.type === 'ai' && (
                    <div className="chat-ai-message-footer-actions">
                      <FiThumbsUp className="chat-ai-action-icon" />
                      <FiThumbsDown className="chat-ai-action-icon" />
                    </div>
                  )}
                  <span className="chat-ai-message-time">{message.time}</span>
                </div>
              </div>
              {message.type === 'user' && <div className="chat-ai-message-avatar">H</div>}
            </div>
          ))}
          {isSending && (
            <div className="chat-ai-typing" role="status" aria-label="HerBotAI đang trả lời">
              <Skeleton className="h-4 w-32" />
            </div>
          )}
        </div>

        <div className="chat-ai-input-area">
          <div className="chat-ai-input-container">
            <FiSmile className="chat-ai-emoji-icon" />
            <input
              type="text"
              placeholder="Gửi tin nhắn đến HerBotAI"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
              className="chat-ai-input"
              disabled={isSending}
            />
            <button
              className="chat-ai-send-btn"
              type="button"
              onClick={handleSendMessage}
              disabled={isSending || !inputValue.trim()}
            >
              <FiSend />
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
