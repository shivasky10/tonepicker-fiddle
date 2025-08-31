import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';

const PickerContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 600px;
  display: flex;
  flex-direction: column;
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const PickerTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResetButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const MatrixContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

const MatrixGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 280px;
  height: 280px;
  position: relative;
`;

const MatrixCell = styled(motion.div)`
  background: ${props => props.isActive ? '#667eea' : 'rgba(102, 126, 234, 0.1)'};
  border: 2px solid ${props => props.isActive ? '#667eea' : 'rgba(102, 126, 234, 0.2)'};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.isActive ? 'white' : '#667eea'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => props.isActive ? '#5a67d8' : 'rgba(102, 126, 234, 0.15)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const AxisLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 280px;
  margin-bottom: 8px;
`;

const YAxisLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 280px;
  margin-right: 8px;
  align-items: flex-end;
`;

const AxisLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ToneDescription = styled(motion.div)`
  margin-top: 20px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  text-align: center;
`;

const ToneTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const ToneText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const Instructions = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  font-size: 0.85rem;
  color: #856404;
  text-align: center;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const toneDescriptions = {
  '0,0': { title: 'Very Formal & Professional', description: 'Academic, corporate, or legal writing style' },
  '0,1': { title: 'Formal & Neutral', description: 'Professional but approachable tone' },
  '0,2': { title: 'Formal & Casual', description: 'Respectful but friendly communication' },
  '1,0': { title: 'Neutral & Professional', description: 'Balanced professional tone' },
  '1,1': { title: 'Balanced & Neutral', description: 'Standard, clear communication' },
  '1,2': { title: 'Neutral & Casual', description: 'Relaxed but clear tone' },
  '2,0': { title: 'Casual & Professional', description: 'Friendly professional style' },
  '2,1': { title: 'Casual & Neutral', description: 'Informal but clear communication' },
  '2,2': { title: 'Very Casual & Friendly', description: 'Conversational, relaxed tone' }
};

const TonePicker = ({ 
  onToneAdjustment, 
  currentTone, 
  loading = false, 
  hasSelectedText = false 
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleCellClick = useCallback((x, y) => {
    if (!hasSelectedText) return;
    onToneAdjustment(x, y);
  }, [hasSelectedText, onToneAdjustment]);

  const handleReset = useCallback(() => {
    onToneAdjustment(1, 1);
  }, [onToneAdjustment]);

  const getCurrentToneDescription = () => {
    const key = `${currentTone.x},${currentTone.y}`;
    return toneDescriptions[key] || toneDescriptions['1,1'];
  };

  const renderCell = (x, y) => {
    const isActive = currentTone.x === x && currentTone.y === y;
    const isHovered = hoveredCell && hoveredCell.x === x && hoveredCell.y === y;
    const key = `${x},${y}`;
    const description = toneDescriptions[key];

    return (
      <MatrixCell
        key={key}
        isActive={isActive}
        onClick={() => handleCellClick(x, y)}
        onMouseEnter={() => setHoveredCell({ x, y })}
        onMouseLeave={() => setHoveredCell(null)}
        disabled={loading || !hasSelectedText}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && (
          <ActiveIndicator
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span style={{ fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.2 }}>
          {description.title.split(' ').slice(0, 2).join('\n')}
        </span>
      </MatrixCell>
    );
  };

  return (
    <PickerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{ position: 'relative' }}
    >
      <PickerHeader>
        <PickerTitle>
          <Sparkles size={20} />
          Tone Picker
        </PickerTitle>
        <ResetButton
          onClick={handleReset}
          disabled={loading || !hasSelectedText}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={14} />
          Reset
        </ResetButton>
      </PickerHeader>

      <MatrixContainer>
        <AxisLabels>
          <AxisLabel>Casual</AxisLabel>
          <AxisLabel>Neutral</AxisLabel>
          <AxisLabel>Formal</AxisLabel>
        </AxisLabels>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <YAxisLabels>
            <AxisLabel>Professional</AxisLabel>
            <AxisLabel>Neutral</AxisLabel>
            <AxisLabel>Casual</AxisLabel>
          </YAxisLabels>

          <MatrixGrid>
            {renderCell(0, 0)}
            {renderCell(0, 1)}
            {renderCell(0, 2)}
            {renderCell(1, 0)}
            {renderCell(1, 1)}
            {renderCell(1, 2)}
            {renderCell(2, 0)}
            {renderCell(2, 1)}
            {renderCell(2, 2)}
          </MatrixGrid>
        </div>

        <AnimatePresence mode="wait">
          {hoveredCell && (
            <ToneDescription
              key={`hover-${hoveredCell.x}-${hoveredCell.y}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ToneTitle>
                {toneDescriptions[`${hoveredCell.x},${hoveredCell.y}`].title}
              </ToneTitle>
              <ToneText>
                {toneDescriptions[`${hoveredCell.x},${hoveredCell.y}`].description}
              </ToneText>
            </ToneDescription>
          )}
        </AnimatePresence>

        {!hoveredCell && (
          <ToneDescription
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ToneTitle>
              {getCurrentToneDescription().title}
            </ToneTitle>
            <ToneText>
              {getCurrentToneDescription().description}
            </ToneText>
          </ToneDescription>
        )}

        <Instructions>
          {hasSelectedText 
            ? "Click any cell to adjust the tone of your selected text"
            : "Select text in the editor to enable tone adjustment"
          }
        </Instructions>
      </MatrixContainer>

      {loading && (
        <LoadingOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingSpinner />
        </LoadingOverlay>
      )}
    </PickerContainer>
  );
};

export default TonePicker;
