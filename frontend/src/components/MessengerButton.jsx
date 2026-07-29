import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FaFacebookMessenger, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './MessengerButton.scss';
import logo from '../assets/logo_2.png';

const MESSENGER_POSITION_KEY = 'herdays-messenger-position';
const VIEWPORT_GUTTER = 12;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const readSavedPosition = () => {
  try {
    const savedPosition = JSON.parse(window.localStorage.getItem(MESSENGER_POSITION_KEY));

    if (Number.isFinite(savedPosition?.left) && Number.isFinite(savedPosition?.top)) {
      return savedPosition;
    }
  } catch {
    // Ignore malformed or unavailable local storage data.
  }

  return null;
};

function DraggableMessenger({ children, position, wrapperRef }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'herdays-messenger',
  });

  const handleSetNodeRef = (node) => {
    wrapperRef.current = node;
    setNodeRef(node);
  };

  const style = {
    ...(position
      ? {
        top: `${position.top}px`,
        left: `${position.left}px`,
        right: 'auto',
        bottom: 'auto',
      }
      : {}),
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={handleSetNodeRef}
      className={`messenger-wrapper${isDragging ? ' is-dragging' : ''}`}
      style={style}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

export default function MessengerButton() {
  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  const [isOpen, setIsOpen] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [position, setPosition] = useState(readSavedPosition);
  const wrapperRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  useEffect(() => {
    setIsHintVisible(isHomePage);

    if (!isHomePage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setIsHintVisible(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [isHomePage]);

  const handleDragStart = () => {
    hasDraggedRef.current = true;
  };

  const handleDragEnd = ({ delta }) => {
    const wrapper = wrapperRef.current;

    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const baseLeft = position?.left ?? rect.left;
      const baseTop = position?.top ?? rect.top;
      const nextPosition = {
        left: clamp(baseLeft + delta.x, VIEWPORT_GUTTER, window.innerWidth - rect.width - VIEWPORT_GUTTER),
        top: clamp(baseTop + delta.y, VIEWPORT_GUTTER, window.innerHeight - rect.height - VIEWPORT_GUTTER),
      };

      setPosition(nextPosition);
      try {
        window.localStorage.setItem(MESSENGER_POSITION_KEY, JSON.stringify(nextPosition));
      } catch {
        // Keep the dragged position for the current session if storage is unavailable.
      }
    }

    window.setTimeout(() => {
      hasDraggedRef.current = false;
    }, 0);
  };

  const handleFabClick = () => {
    if (hasDraggedRef.current) return;
    setIsHintVisible(false);
    setIsOpen((value) => !value);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DraggableMessenger position={position} wrapperRef={wrapperRef}>
        {({ attributes, listeners }) => (
          <>
      {isHomePage && isHintVisible && !isOpen && (
        <div className="messenger-hint" role="status">
          <span>Nếu bị khuất nội dung, hãy kéo mình ra vị trí khác nhé</span>
          <button
            type="button"
            className="messenger-hint__close"
            onClick={() => setIsHintVisible(false)}
            aria-label="Đóng hướng dẫn Messenger"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Khung Pop-up chat */}
      {isOpen && (
        <div className="messenger-popup">
          <div className="popup-header">
            <div className="header-info">
              {/* Bồ nhớ thay link ảnh logo của dự án vào đây nha */}
              <img src={logo} alt="HerDays" className="page-avatar" />
              <div className="page-details">
                <h4>HerDays</h4>
                <p>Thường trả lời ngay lập tức</p>
              </div>
            </div>
          </div>
          
          <div className="popup-body">
            <div className="chat-bubble">
              Xin chào! <br/>
              HerDays có thể giúp gì cho bạn hôm nay?
            </div>
          </div>
          
          <div className="popup-footer">
            <a 
              href="https://m.me/herdaysvn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="start-chat-btn"
            >
              <FaFacebookMessenger className="btn-icon" />
              Chat trên Messenger
            </a>
          </div>
        </div>
      )}

      {/* Nút bấm tròn lơ lửng */}
      <button 
        className="messenger-fab" 
        onClick={handleFabClick}
        {...listeners}
        {...attributes}
        aria-label="Mở khung chat"
      >
        {isOpen ? <FaTimes /> : <FaFacebookMessenger />}
      </button>
          </>
        )}
      </DraggableMessenger>
    </DndContext>
  );
}
