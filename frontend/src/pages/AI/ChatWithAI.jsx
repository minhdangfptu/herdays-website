import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiBookOpen,
  FiExternalLink,
  FiMenu,
  FiShoppingBag,
  FiSearch,
  FiSettings,
  FiSmile,
  FiSend,
  FiTrash2,
  FiThumbsUp,
  FiThumbsDown,
  FiX,
} from "react-icons/fi";

import {
  blogApi,
  chatApi,
  hasAuthSession,
  profileApi,
} from "../../services/apiService.js";
import { Skeleton } from "../../components/Skeleton.jsx";
import LogoutModal from "../../components/LogoutModal.jsx";
import avatarDefault from "../../assets/avatar_default.png";
import "./ChatWithAI.scss";

const BLOG_SUGGESTION_LIMIT = 3;
const BLOG_POSTS_PER_TOPIC_LIMIT = 4;
const BLOG_STOP_WORDS = new Set([
  "ban",
  "bai",
  "biet",
  "cho",
  "co",
  "cua",
  "duoc",
  "gi",
  "giup",
  "hoi",
  "khong",
  "la",
  "mot",
  "nay",
  "nhu",
  "toi",
  "trong",
  "va",
  "ve",
]);

const formatMessageTime = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHistoryTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
};

const formatCurrency = (value, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getAiResponseBlocks = (value = "") => {
  const lines = String(value)
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (!currentList) return;
    blocks.push(currentList);
    currentList = null;
  };

  const addListItem = (text, ordered = false) => {
    if (!currentList || currentList.ordered !== ordered) {
      flushList();
      currentList = { type: "list", ordered, items: [] };
    }
    currentList.items.push(text.trim());
  };

  lines.forEach((line) => {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);

    if (headingMatch) {
      flushList();
      blocks.push({ type: "heading", text: headingMatch[1] });
      return;
    }

    if (bulletMatch) {
      addListItem(bulletMatch[1]);
      return;
    }

    if (numberedMatch) {
      addListItem(numberedMatch[1], true);
      return;
    }

    const inlineBulletParts = line.split(/\s+-\s+/);
    if (inlineBulletParts.length > 1) {
      flushList();
      const introduction = inlineBulletParts.shift()?.trim();
      if (introduction) blocks.push({ type: "paragraph", text: introduction });
      inlineBulletParts
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => addListItem(part));
      return;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  });

  flushList();
  return blocks;
};

const renderAiInlineText = (text) =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );

function AiResponseContent({ text }) {
  const blocks = getAiResponseBlocks(text);

  return (
    <div className="chat-ai-rich-text">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`heading-${index}`} className="chat-ai-rich-text__heading">
              {renderAiInlineText(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={`list-${index}`} className="chat-ai-rich-text__list">
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderAiInlineText(item)}</li>
              ))}
            </ListTag>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="chat-ai-rich-text__paragraph"
          >
            {renderAiInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();

const tokenize = (value) =>
  normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !BLOG_STOP_WORDS.has(word));

const toInternalHref = (url) => {
  if (!url) return "/blog";

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url;
  }
};

const getPostHref = (post, topic) => {
  const topicId =
    topic?._id ||
    post.postTopicId?._id ||
    post.postTopicId ||
    post.topicId?._id ||
    post.topicId;
  if (!topicId || !post._id) return "/blog";
  return `/blog/${topicId}/posts/${post._id}`;
};

const mapBlogCitations = (citations = []) => {
  const seen = new Set();

  return citations
    .filter((citation) => citation?.sourceType === "blog" && citation.title)
    .map((citation) => ({
      id: citation.sourceId || citation.url || citation.title,
      title: citation.title,
      excerpt: citation.excerpt || "",
      href: toInternalHref(citation.url),
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
      reason: product.reason || "",
      benefits: product.benefits || [],
      price: product.price,
      currency: product.currency || "VND",
      thumbnail: product.thumbnail || "",
      detailHref:
        product.detailUrl || `/product-detail/box/${product.productId}`,
      customizeHref:
        product.customizeUrl || `/box-customize/${product.productId}`,
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
    type: message.role === "assistant" ? "ai" : "user",
    text: message.content,
    time: formatMessageTime(message.createdAt),
    blogSuggestions:
      recommendedBoxes.length > 0 ? [] : mapBlogCitations(message.citations),
    recommendedBoxes,
  };
};

export default function ChatWithAI() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "ai",
      text: "Chào mừng bạn đến với HerBotAI!\nMình là trợ lý ảo của HERDAYS. Bạn cần mình giúp gì hôm nay?",
      time: formatMessageTime(),
      recommendedBoxes: [],
      blogSuggestions: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const blogSuggestionPoolRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isLoggedIn = useMemo(() => hasAuthSession(), []);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
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
    if (!isMobileSidebarOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let isActive = true;

    const fetchHistory = async () => {
      setIsLoadingConversations(true);

      try {
        const result = await chatApi.getConversations();
        if (isActive) setConversationHistory(result.conversations || []);
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoadingConversations(false);
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
      const withoutCurrent = items.filter(
        (item) => item.id !== conversation.id,
      );
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
      topics.map((topic) =>
        blogApi.getTopicPosts(topic._id, 1, BLOG_POSTS_PER_TOPIC_LIMIT),
      ),
    );

    const pool = topicPostResults.flatMap((result, index) => {
      const topic = result.topic || topics[index];
      return (result.posts || []).map((post) => ({
        id: post._id,
        title: post.title,
        excerpt: topic?.name
          ? `Bài viết thuộc chủ đề ${topic.name}`
          : "Bài viết HERDAYs liên quan",
        href: getPostHref(post, topic),
        searchableText: [post.title, topic?.name, topic?.slug]
          .filter(Boolean)
          .join(" "),
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
          href: post.href,
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
      type: "user",
      text: userMessage,
      time: formatMessageTime(),
    };

    setMessages((items) => [...items, optimisticMessage]);
    setInputValue("");
    setErrorMessage("");
    setIsSending(true);

    try {
      const nextConversationId = await ensureConversation(userMessage);
      const result = await chatApi.sendMessage(nextConversationId, userMessage);
      upsertConversation(result.conversation);
      const assistantMessage = mapApiMessage(result.assistantMessage);
      if (
        assistantMessage.recommendedBoxes.length === 0 &&
        assistantMessage.blogSuggestions.length === 0
      ) {
        assistantMessage.blogSuggestions =
          await getFallbackBlogSuggestions(userMessage);
      }
      setMessages((items) => [...items, assistantMessage]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = async (selectedConversationId) => {
    setIsMobileSidebarOpen(false);
    setConversationId(selectedConversationId);
    setErrorMessage("");
    setIsLoadingMessages(true);

    try {
      const result = await chatApi.getMessages(selectedConversationId);
      setMessages((result.messages || []).map(mapApiMessage));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleRequestDeleteConversation = (event, conversation) => {
    event.stopPropagation();
    setConversationToDelete(conversation);
  };

  const handleConfirmDeleteConversation = async () => {
    if (!conversationToDelete || isDeletingConversation) return;

    const selectedConversationId = conversationToDelete.id;
    setIsDeletingConversation(true);

    try {
      await chatApi.deleteConversation(selectedConversationId);
      setConversationHistory((items) =>
        items.filter((item) => item.id !== selectedConversationId),
      );
      if (conversationId === selectedConversationId) {
        setConversationId(null);
        setMessages([]);
      }
      toast.success("Đã xóa cuộc trò chuyện.");
      setConversationToDelete(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setIsDeletingConversation(false);
  };

  const handleNewChat = () => {
    setIsMobileSidebarOpen(false);
    setIsLoadingMessages(false);
    setConversationId(null);
    setMessages([
      {
        id: "welcome",
        type: "ai",
        text: "Chào mừng bạn đến với HerBotAI!\nMình là trợ lý ảo của HERDAYS. Bạn cần mình giúp gì hôm nay?",
        time: formatMessageTime(),
        recommendedBoxes: [],
        blogSuggestions: [],
      },
    ]);
    setInputValue("");
    setErrorMessage("");
  };

  const userDisplayName = isLoggedIn
    ? userProfile?.fullName || userProfile?.email || "Tài khoản HERDAYS"
    : "Khách";

  return (
    <div
      className={`chat-ai-container ${isMobileSidebarOpen ? "mobile-sidebar-open" : ""}`}
    >
      <button
        className="chat-ai-mobile-backdrop"
        type="button"
        aria-label="Đóng danh sách cuộc trò chuyện"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={`chat-ai-sidebar ${isMobileSidebarOpen ? "is-open" : ""}`}
        data-lenis-prevent
      >
        <div className="chat-ai-sidebar-mobile-header">
          <strong>Cuộc trò chuyện</strong>
          <button
            className="chat-ai-sidebar-close-btn"
            type="button"
            aria-label="Đóng danh sách cuộc trò chuyện"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <div className="chat-ai-user-profile">
          <img
            className="chat-ai-user-avatar"
            src={avatarDefault}
            alt={userDisplayName}
          />
          <div className="chat-ai-user-info">
            <h3>{userDisplayName}</h3>
            <p>
              {isLoggedIn
                ? "Lịch sử hội thoại được lưu"
                : "Hội thoại khách trong 24 giờ"}
            </p>
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
              {isLoadingConversations && (
                <div
                  className="space-y-2"
                  role="status"
                  aria-label="Đang tải lịch sử hội thoại"
                >
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
              {!isLoadingConversations && conversationHistory.length === 0 && (
                <p className="chat-ai-history-empty">Chưa có hội thoại.</p>
              )}
              {!isLoadingConversations &&
                conversationHistory.map((item) => (
                  <button
                    key={item.id}
                    className={`chat-ai-history-item ${
                      item.id === conversationId ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => handleSelectConversation(item.id)}
                  >
                    <div className="chat-ai-history-content">
                      <p>{item.title}</p>
                      <span>
                        {formatHistoryTime(
                          item.lastMessageAt || item.createdAt,
                        )}
                      </span>
                    </div>
                    <FiTrash2
                      className="chat-ai-history-action"
                      onClick={(event) =>
                        handleRequestDeleteConversation(event, item)
                      }
                    />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-ai-main">
        <div className="chat-ai-header">
          <button
            className="chat-ai-mobile-menu-btn"
            type="button"
            aria-label="Mở danh sách cuộc trò chuyện"
            aria-expanded={isMobileSidebarOpen}
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <FiMenu />
          </button>
          <h2 style={{ color: "#F176A9" }}>HerBotAI</h2>
          <div className="chat-ai-header-actions">
            <FiSearch className="chat-ai-icon" />
            <FiSettings className="chat-ai-icon" />
            <button
              className="chat-ai-new-chat-btn"
              type="button"
              onClick={handleNewChat}
            >
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
          {isLoadingMessages && (
            <div
              className="chat-ai-message-loading"
              role="status"
              aria-label="Đang tải tin nhắn"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {!isLoadingMessages &&
            messages.map((message) => (
              <div
                key={message.id}
                className={`chat-ai-message-group ${message.type}`}
              >
                {message.type === "ai" && (
                  <div className="chat-ai-ai-badge">HBI</div>
                )}
                <div className={`chat-ai-message ${message.type}`}>
                  <div className="chat-ai-message-body">
                    {message.type === "ai" ? (
                      <AiResponseContent text={message.text} />
                    ) : (
                      <p>{message.text}</p>
                    )}

                    {message.type === "ai" &&
                      message.blogSuggestions?.length > 0 && (
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
                                <span className="chat-ai-blog-card__title">
                                  {blog.title}
                                </span>
                                {blog.excerpt && (
                                  <span className="chat-ai-blog-card__excerpt">
                                    {blog.excerpt}
                                  </span>
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

                    {message.type === "ai" &&
                      message.recommendedBoxes?.length > 0 && (
                        <div className="chat-ai-product-suggestions">
                          <div className="chat-ai-product-suggestions__header">
                            <FiShoppingBag />
                            <span>Box HERDAYs phu hop</span>
                          </div>
                          <div className="chat-ai-product-suggestions__list">
                            {message.recommendedBoxes.map((box) => (
                              <div
                                key={box.id}
                                className="chat-ai-product-card"
                              >
                                <a
                                  className="chat-ai-product-card__main"
                                  href={box.detailHref}
                                >
                                  <div className="chat-ai-product-card__image">
                                    {box.thumbnail ? (
                                      <img
                                        src={box.thumbnail}
                                        alt={box.title}
                                      />
                                    ) : (
                                      <FiShoppingBag />
                                    )}
                                  </div>
                                  <div className="chat-ai-product-card__content">
                                    <span className="chat-ai-product-card__title">
                                      {box.title}
                                    </span>
                                    {box.reason && (
                                      <span className="chat-ai-product-card__reason">
                                        {box.reason}
                                      </span>
                                    )}
                                    {box.price !== null &&
                                      box.price !== undefined && (
                                        <strong className="chat-ai-product-card__price">
                                          {formatCurrency(
                                            box.price,
                                            box.currency,
                                          )}
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
                    {message.type === "ai" && (
                      <div className="chat-ai-message-footer-actions">
                        <FiThumbsUp className="chat-ai-action-icon" />
                        <FiThumbsDown className="chat-ai-action-icon" />
                      </div>
                    )}
                    <span className="chat-ai-message-time">{message.time}</span>
                  </div>
                </div>
                {message.type === "user" && (
                  <div className="chat-ai-message-avatar">H</div>
                )}
              </div>
            ))}
          {!isLoadingMessages && isSending && (
            <div
              className="chat-ai-typing"
              role="status"
              aria-label="HerBotAI đang trả lời"
            >
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
              onKeyDown={(event) =>
                event.key === "Enter" && handleSendMessage()
              }
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

      <LogoutModal
        isOpen={Boolean(conversationToDelete)}
        onClose={() => {
          if (!isDeletingConversation) setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDeleteConversation}
        title="Xóa cuộc trò chuyện?"
        description={
          <>
            Bạn có chắc muốn xóa cuộc trò chuyện
            <br />
            <strong>“{conversationToDelete?.title || "này"}”</strong> không?
          </>
        }
        cancelLabel="Hủy"
        confirmLabel={
          isDeletingConversation ? "Đang xóa..." : "Xóa cuộc trò chuyện"
        }
        cardClassName="chat-ai-delete-modal"
      />
    </div>
  );
}
