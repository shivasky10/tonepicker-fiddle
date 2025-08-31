import React, { useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const EditorContainer = styled(motion.div)`
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

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const EditorTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CharacterCount = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  resize: none;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const SelectionInfo = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;
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
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 12px;
  color: #667eea;
  font-weight: 500;
  font-size: 14px;
`;

const TextEditor = ({ 
  text, 
  onTextChange, 
  onTextSelection, 
  loading = false 
}) => {
  const textareaRef = useRef(null);

  const handleSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end && start >= 0 && end >= 0) {
      const selectedText = text.substring(start, end);
      if (selectedText.trim().length > 0) {
        onTextSelection(selectedText);
      } else {
        onTextSelection('');
      }
    } else {
      onTextSelection('');
    }
  }, [text, onTextSelection]);

  const handleChange = useCallback((e) => {
    const newText = e.target.value;
    onTextChange(newText);
    
    setTimeout(handleSelection, 10);
  }, [onTextChange, handleSelection]);

  const handleSelectionEvent = useCallback(() => {
    requestAnimationFrame(handleSelection);
  }, [handleSelection]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <EditorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'relative' }}
    >
      <EditorHeader>
        <EditorTitle>Text Editor</EditorTitle>
        <CharacterCount>
          {characterCount} chars • {wordCount} words
        </CharacterCount>
      </EditorHeader>

      <TextArea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onMouseUp={handleSelectionEvent}
        onKeyUp={handleSelectionEvent}
        placeholder="Start typing your text here... Select any portion to adjust its tone using the picker on the right."
        disabled={loading}
      />

      <SelectionInfo>
        {text && (
          <>
            <span>💡</span>
            <span>
              {text.length > 0 
                ? "Select text and use the tone picker to adjust its style" 
                : "Start typing to begin"}
            </span>
          </>
        )}
      </SelectionInfo>

      {loading && (
        <LoadingOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner />
            <LoadingText>Adjusting tone...</LoadingText>
          </div>
        </LoadingOverlay>
      )}
    </EditorContainer>
  );
};

export default TextEditor;
