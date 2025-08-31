import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  RotateCcw, 
  RotateCw, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import TextEditor from './components/TextEditor';
import TonePicker from './components/TonePicker';
import { adjustTone } from './services/api';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
`;

const MainContent = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 20px;
  color: white;
  font-size: 14px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
`;

function App() {
  const [text, setText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTone, setCurrentTone] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setText(savedData.text || '');
      setHistory(savedData.history || []);
      setCurrentIndex(savedData.currentIndex || -1);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage({
      text,
      history,
      currentIndex
    });
  }, [text, history, currentIndex]);

  const addToHistory = useCallback((newText) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const handleTextSelection = useCallback((selected) => {
    setSelectedText(selected);
  }, []);

  const handleToneAdjustment = useCallback(async (x, y) => {
    if (!selectedText.trim()) {
      toast.error('Please select some text first');
      return;
    }

    if (loading) {
      toast.error('Please wait for the current request to complete');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentTone({ x, y });

    try {
      const result = await adjustTone(selectedText, x, y);
      
      if (!result || !result.adjustedText) {
        throw new Error('Invalid response from server');
      }
      
      const newText = text.replace(selectedText, result.adjustedText);
      setText(newText);
      addToHistory(newText);
      
      setSuccess(`Text adjusted to ${result.tone.description} tone`);
      toast.success('Tone adjusted successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to adjust tone';
      setError(errorMessage);
      toast.error(errorMessage);
      
      console.error('Tone adjustment error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedText, text, addToHistory, loading]);

  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setText(history[newIndex]);
      toast.success('Undone');
    }
  }, [currentIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setText(history[newIndex]);
      toast.success('Redone');
    }
  }, [currentIndex, history]);

  const handleReset = useCallback(() => {
    setText('');
    setHistory([]);
    setCurrentIndex(-1);
    setSelectedText('');
    setCurrentTone({ x: 1, y: 1 });
    setError('');
    setSuccess('');
    toast.success('Reset completed');
  }, []);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    addToHistory(newText);
  }, [addToHistory]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) handleUndo();
      }
      
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
      
      if (e.key === 'Escape') {
        setSelectedText('');
        setError('');
        setSuccess('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (text.trim() && history.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [text, history.length]);

  return (
    <AppContainer>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header>
        <Title>Tone Picker Text Tool</Title>
        <Subtitle>Adjust your text tone with AI-powered precision</Subtitle>
      </Header>

      <ControlPanel>
        <Button
          onClick={handleUndo}
          disabled={!canUndo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={16} />
          Undo
        </Button>
        
        <Button
          onClick={handleRedo}
          disabled={!canRedo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCw size={16} />
          Redo
        </Button>
        
        <Button
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={16} />
          Reset
        </Button>
      </ControlPanel>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle size={16} />
            {success}
          </SuccessMessage>
        )}
      </AnimatePresence>

      <StatusBar>
        <StatusItem>
          <Info size={16} />
          {history.length} revisions
        </StatusItem>
        
        <StatusItem>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Adjusting tone...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Ready
            </>
          )}
        </StatusItem>
        
        {selectedText && (
          <StatusItem>
            <Info size={16} />
            {selectedText.length} characters selected
          </StatusItem>
        )}
      </StatusBar>

      <MainContent>
        <TextEditor
          text={text}
          onTextChange={handleTextChange}
          onTextSelection={handleTextSelection}
          loading={loading}
        />
        
        <TonePicker
          onToneAdjustment={handleToneAdjustment}
          currentTone={currentTone}
          loading={loading}
          hasSelectedText={!!selectedText.trim()}
        />
      </MainContent>
    </AppContainer>
  );
}

export default App;
