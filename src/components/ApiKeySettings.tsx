import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdVisibility, MdVisibilityOff, MdClose } from 'react-icons/md';

const API_KEY_STORAGE_KEY = 'googleAiApiKey';

interface ApiKeySettingsProps {
    onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const VisibilityButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: #2196f3;
    color: white;
    
    &:hover {
      background: #1976d2;
    }
  ` : `
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:active {
    transform: scale(0.98);
  }
`;

const Link = styled.a`
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
            alert('API ключ сохранен успешно!');
            onClose();
        } else {
            alert('Пожалуйста, введите API ключ');
        }
    };

    const handleClear = () => {
        if (window.confirm('Вы уверены, что хотите удалить сохраненный API ключ?')) {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            setApiKey('');
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>Настройки API</Title>
                    <CloseButton onClick={onClose}>
                        <MdClose />
                    </CloseButton>
                </Header>

                <Description>
                    Для импорта PDF-файлов требуется API ключ Google AI.
                    Получите бесплатный ключ на{' '}
                    <Link href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                        Google AI Studio
                    </Link>
                </Description>

                <InputContainer>
                    <Label htmlFor="api-key-input">Google AI API Key</Label>
                    <Input
                        id="api-key-input"
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите ваш API ключ"
                    />
                    <VisibilityButton
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={showApiKey ? 'Скрыть API ключ' : 'Показать API ключ'}
                    >
                        {showApiKey ? <MdVisibilityOff /> : <MdVisibility />}
                    </VisibilityButton>
                </InputContainer>

                <ButtonContainer>
                    <Button variant="secondary" onClick={handleClear}>
                        Очистить
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Сохранить
                    </Button>
                </ButtonContainer>
            </ModalContainer>
        </ModalOverlay>
    );
};

export const getStoredApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
};

