'use client';

import React from 'react';
import './Tools.scss';

export default function Tools() {
  const tools = [
    {
      id: 1,
      name: 'Ovulation calculator',
      description: 'Figure out your most fertile days',
      image: '/images/tool-1.jpg',
    },
    {
      id: 2,
      name: 'Beta hCG doubling time calculator',
      description: 'Beta hCG doubling time calculator and charts',
      image: '/images/tool-2.jpg',
    },
    {
      id: 3,
      name: 'Pregnancy test calculator',
      description: 'Pregnancy test calculator',
      image: '/images/tool-3.jpg',
    },
    {
      id: 4,
      name: 'Menstrual cycle calculator',
      description: 'Menstrual cycle calculator',
      image: '/images/tool-4.jpg',
    },
    {
      id: 5,
      name: 'Period calculator',
      description: 'Period calculator: Predict when your',
      image: '/images/tool-5.jpg',
    },
    {
      id: 6,
      name: 'Implantation calculator',
      description: 'Implantation calculator: When does',
      image: '/images/tool-6.jpg',
    },
  ];

  return (
    <div className="tools-page">
      <div className="tools-container">
        <h1 className="tools-title">Công cụ</h1>

        <div className="tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="tools-card">
              <div className="tools-card-image">
                <img src={tool.image} alt={tool.name} />
              </div>
              <h3 className="tools-card-name">{tool.name}</h3>
              <p className="tools-card-description">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
