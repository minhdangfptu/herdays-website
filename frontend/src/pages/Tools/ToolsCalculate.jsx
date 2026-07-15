'use client';

import React, { useState } from 'react';
import { FiPlus, FiMinus, FiCalendar } from 'react-icons/fi';
import './ToolsCalculate.scss';

export default function ToolsCalculate() {
  const [lastPeriodDate, setLastPeriodDate] = useState('14 July 2026');
  const [cycleLength, setCycleLength] = useState(28);

  const updateCycleLength = (newLength) => {
    if (newLength < 21 || newLength > 35) return;
    setCycleLength(newLength);
  };

  const handleCalculate = () => {
    // Handle calculation logic
  };

  const articleSections = [
    { id: 1, title: 'Key takeaways on calculating your fertile window' },
    { id: 2, title: 'How are your fertile days calculated in the ovulation calculator?' },
    { id: 3, title: "What's the average length of a menstrual cycle?" },
    { id: 4, title: 'What are the signs of ovulation?' },
    { id: 5, title: 'Can ovulation tracking increase your chances of pregnancy?' },
  ];

  return (
    <div className="tools-calculate-page">
      {/* Breadcrumb */}
      <div className="tools-calculate-breadcrumb">
        <a href="/" className="tools-calculate-breadcrumb-link">
          🏠
        </a>
        <span className="tools-calculate-breadcrumb-separator">›</span>
        <a href="/health-library" className="tools-calculate-breadcrumb-link">
          HEALTH LIBRARY
        </a>
        <span className="tools-calculate-breadcrumb-separator">›</span>
        <a href="/tools" className="tools-calculate-breadcrumb-link">
          TOOLS
        </a>
        <span className="tools-calculate-breadcrumb-separator">›</span>
        <span className="tools-calculate-breadcrumb-active">OVULATION CALCULATOR</span>
      </div>

      {/* Hero Section */}
      <div className="tools-calculate-hero">
        <div className="tools-calculate-hero-content">
          <h1 className="tools-calculate-hero-title">
            Ovulation calculator: Figure out your most fertile days
          </h1>
          <p className="tools-calculate-hero-description">
            Knowing when you ovulate helps you better understand your{' '}
            <a href="#" className="tools-calculate-link">
              fertile window
            </a>{' '}
            (and when you have a high chance of getting pregnant). Find out when that might be with Flo's
            easy-to-use ovulation calculator.
          </p>
        </div>

        <div className="tools-calculate-hero-illustration">
          <div className="tools-calculate-illustration-placeholder">
            <p>Illustration</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="tools-calculate-container">
        <div className="tools-calculate-main">
          {/* Article Info */}
          <div className="tools-calculate-article-info">
            <p className="tools-calculate-update-date">Updated 10 February 2025</p>
            
            <div className="tools-calculate-reviewer">
              <div className="tools-calculate-reviewer-avatar"></div>
              <div>
                <p className="tools-calculate-reviewer-text">
                  Medically reviewed by{' '}
                  <a href="#" className="tools-calculate-reviewer-link">
                    Dr. Jenna Flanagan
                  </a>
                  , Assistant professor of obstetrics and gynecology, University of Utah, US
                </p>
              </div>
            </div>

            <p className="tools-calculate-written-by">
              Written by{' '}
              <a href="#" className="tools-calculate-reviewer-link">
                Natalie Healey
              </a>
            </p>
          </div>

          {/* Calculator Form */}
          <div className="tools-calculate-form">
            <div className="tools-calculate-form-group">
              <label className="tools-calculate-form-label">The first day of your last period</label>
              <div className="tools-calculate-date-input">
                <input
                  type="text"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="tools-calculate-input"
                />
                <button className="tools-calculate-date-btn">
                  <FiCalendar />
                </button>
              </div>
            </div>

            <div className="tools-calculate-form-group">
              <label className="tools-calculate-form-label">Average cycle length (days)</label>
              <div className="tools-calculate-number-input">
                <button
                  onClick={() => updateCycleLength(cycleLength - 1)}
                  className="tools-calculate-number-btn"
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  value={cycleLength}
                  readOnly
                  className="tools-calculate-input tools-calculate-input-number"
                />
                <button
                  onClick={() => updateCycleLength(cycleLength + 1)}
                  className="tools-calculate-number-btn"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <button onClick={handleCalculate} className="tools-calculate-button">
              See results
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="tools-calculate-sidebar">
          <h3 className="tools-calculate-sidebar-title">IN THIS ARTICLE</h3>
          <ul className="tools-calculate-sidebar-list">
            {articleSections.map((section) => (
              <li key={section.id} className="tools-calculate-sidebar-item">
                <a href={`#section-${section.id}`} className="tools-calculate-sidebar-link">
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
