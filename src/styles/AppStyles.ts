import styled from 'styled-components';

export const AppContainer = styled.div<{ $isSidebarCollapsed?: boolean }>`
  max-width: 100%;
  margin: 0;
  padding: 20px;
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    padding-top: ${props => props.$isSidebarCollapsed ? '80px' : '10px'};
    margin-top: ${props => props.$isSidebarCollapsed ? '0' : '0'};
  }
`;

export const LogoArea = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  gap: 0px;
  padding-top: 20px;
  
  @media (max-width: 768px) {
    height: 120px;
    margin-bottom: 10px;
    padding-top: 10px;
  }
`;

export const LogoText = styled.div`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(
    to right,
    #6a0dad, #9c27b0, #e91e63, #f44336, #ff9800, #ffc107, #ffeb3b, #cddc39,
    #8bc34a, #4caf50, #009688, #03a9f4, #2196f3, #3f51b5, #6a0dad
  );
  background-size: 1000% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 4px;
  animation: colorFlow 60s linear infinite;
  display: inline-block;

  @keyframes colorFlow {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 1000% center;
    }
  }

  @keyframes waveAnimation {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
  }

  &:hover {
    animation: colorFlow 60s linear infinite;
    text-shadow: 0 0 10px rgba(106, 13, 173, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const LogoLetter = styled.span<{ index: number; $isAnimating: boolean }>`
  display: inline-block;
  animation: ${props => props.$isAnimating ? 'waveAnimation 0.6s ease' : 'none'};
  animation-delay: ${props => props.$isAnimating ? `${props.index * 0.07}s` : '0s'};
  animation-fill-mode: forwards;
  background: inherit;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export const AuthorLink = styled.a`
  font-size: 14px;
  color: rgb(89, 27, 165);
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 0px;
  font-weight: 500;

  &:hover {
    transform: scale(1.05);
    color: #7b1fa2;
    text-shadow: 0 0 5px rgba(74, 20, 140, 0.3);
  }
`;

export const SidebarContainer = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '48px' : '280px'};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  background: white;
  border-radius: 12px;
  padding: ${props => props.$collapsed ? '12px 6px' : '12px'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 40px);

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '0' : '100%'};
    height: ${props => props.$collapsed ? '0' : 'auto'};
    max-height: ${props => props.$collapsed ? '0' : '300px'};
    opacity: ${props => props.$collapsed ? '0' : '1'};
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    padding: ${props => props.$collapsed ? '0' : '12px'};
    margin: ${props => props.$collapsed ? '0' : '0 0 10px 0'};
    border-radius: 12px;
    pointer-events: ${props => props.$collapsed ? 'none' : 'auto'};
    visibility: ${props => props.$collapsed ? 'hidden' : 'visible'};
  }
`;

export const SidebarContent = styled.div<{ $collapsed: boolean }>`
  opacity: ${props => props.$collapsed ? 0 : 1};
  transform: ${props => props.$collapsed ? 'translateX(-20px)' : 'translateX(0)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$collapsed ? '0s' : '0.1s'};
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-right: ${props => props.$collapsed ? '0' : '8px'};
  height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
  
  @media (max-width: 768px) {
    transform: ${props => props.$collapsed ? 'translateY(-20px)' : 'translateY(0)'};
    padding-right: 0;
    overflow-y: auto;
    height: 100%;
    width: 100%;
  }
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  width: 100%;
`;

export const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 90%;
    max-width: none;
    padding: 15px;
    max-height: 80vh;
  }
`;

export const ActionButton = styled.button<{ variant: 'primary' | 'success' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  width: 100%;
  background: ${props => props.variant === 'danger' ? '#fff' : '#f8f9fa'};
  color: ${props => 
    props.variant === 'primary' ? '#2196f3' :
    props.variant === 'success' ? '#4CAF50' :
    '#f44336'};
  border: 1px solid;
  border-color: ${props => 
    props.variant === 'primary' ? '#2196f3' :
    props.variant === 'success' ? '#4CAF50' :
    '#f44336'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: ${props => 
      props.variant === 'primary' ? '#e3f2fd' :
      props.variant === 'success' ? '#e8f5e9' :
      '#ffebee'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    color: inherit;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 44px;
    font-size: 16px;
    justify-content: center;
  }
`;

export const SaveNotification = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  z-index: 2000;

  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  background: #f8f9fa;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    color: inherit;
  }
`;

export const ImportDropZone = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#2196f3' : '#e0e0e0'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: ${props => props.$isDragOver ? 'rgba(33, 150, 243, 0.1)' : '#f8f9fa'};
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    border-color: #2196f3;
    background: rgba(33, 150, 243, 0.1);
  }
`;

export const SidebarToggleButton = styled.button<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: ${props => props.$collapsed ? '8px' : '10px 16px'};
  min-height: 36px;
  background: #f8f9fa;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;
  width: ${props => props.$collapsed ? '36px' : '100%'};
  height: ${props => props.$collapsed ? 'calc(100vh - 40px - 24px)' : 'auto'};
  box-sizing: border-box;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => props.$collapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    color: #2196f3;
  }
  
  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '60px' : '100%'};
    height: ${props => props.$collapsed ? '60px' : 'auto'};
    min-height: ${props => props.$collapsed ? '60px' : '44px'};
    min-width: ${props => props.$collapsed ? '60px' : 'auto'};
    padding: ${props => props.$collapsed ? '12px' : '12px'};
    margin: 0;
    
    svg {
      transform: ${props => props.$collapsed ? 'rotate(90deg)' : 'rotate(-90deg)'};
      font-size: ${props => props.$collapsed ? '32px' : '24px'};
    }
    
    .toggle-text {
      display: none;
    }
  }
`;

export const MobileToggleButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 10px;
    width: 70px;
    height: 70px;
    border-radius: 0 0 12px 12px;
    background: white;
    color: #2196f3;
    border: 2px solid #2196f3;
    border-top: none;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    z-index: 100;
    cursor: pointer;
    margin: 0;
    padding: 0;
    transition: all 0.2s ease;
    
    svg {
      font-size: 36px;
    }
    
    &:active {
      background-color: #e3f2fd;
      transform: translateY(2px);
    }
  }
`;

